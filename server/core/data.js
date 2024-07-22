const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CodeforcesAPI = require("./CodeforcesAPI");

// estimated rating consts
const SCORES = [1, 0.75, 0.5, 0.25, 0];
const K = 20;
const BASE_OF_EXPONENT = 10;
const RATING_DIFFERENCE_SCALE = 150;

const PAST_PROBLEMS_COUNT = 200;

class Data {
    /*
    SHOULD NOT CALLED DIRECTLY EXCEPT FROM A CF LIMITER QUEUE

    Updates the latest user data by fetching and writing relevant data via CodeforcesAPI.js
    and then processes said data, writing results to database.

    Processes:
    - UserProblemStatus (prisma model) for each problem:
        - lastAttempted: the most recent submission time of problem
        - submissions: total submission count of a problem
        - AC: total AC count of a problem
    - total problems ACed
    - total submissions count
    - total AC count (a problem can have multiple ACs)
    - tagsFrequency: number of problems a user has attempted under a certain tag (Ex: { "dp": 24 })
    - tagsDifficulty: sum of user rated difficulty under a certain tag. 
        (Users can rate difficulty of problems and the rating would be summed up and grouped via problem tag)
    - past 60 day submissions: submissions activity over the last 60 days
    - past 60 day AC: AC activity over the last 60 days
    - time of last update
    */
    static async updateUserData(username) {
        await CodeforcesAPI.fetchUserData(username);

        try {
            // reset submissions & AC count to 0 so count is accurate
            await prisma.UserProblemStatus.updateMany({
                where: { username },
                data: {
                    submissions: 0,
                    AC: 0
                }
            });

            const submissions = await prisma.Submission.findMany({
                where: { authorUsername: username },
                orderBy: { id: "desc" },
            });

            for (const submission of submissions) {
                await prisma.UserProblemStatus.upsert({
                    where: {
                        username_problemId: { username, problemId: submission.problemId },
                    },
                    create: {
                        user: { connect: { username } },
                        problem: { connect: { id: submission.problemId } },
                        lastAttempted: new Date(submission.timeCreated).toISOString(),
                        submissions: 1,
                        AC: submission.verdict === "OK" ? 1 : 0,
                    },
                    update: {
                        submissions: { increment: 1 },
                        AC: { increment: submission.verdict === "OK" ? 1 : 0 },
                    },
                });
            }
        } catch (error) {
            console.error("[Error updating user problem status]: ", error);
        }

        try {
            // count problems AC'ed
            const totalProblemsAC = await prisma.UserProblemStatus.count({
                where: {
                    username,
                    AC: { gt: 0 },
                },
            });

            // count submission + AC for AC rate, and avg for average rating of problem solved
            const totalSubmissionsAndAC = await prisma.UserProblemStatus.aggregate({
                where: { username },
                _sum: {
                    submissions: true,
                    AC: true,
                },
            });

            const problemStatuses = await prisma.UserProblemStatus.findMany({
                where: { username },
                include: {
                    problem: { include: { submissions: { orderBy: { timeCreated: "asc" } } } },
                },
            });
            // count the frequency of a question tag and tag difficulty
            const tagsFrequency = {};
            const tagsDifficulty = {};
            for (const problemStatus of problemStatuses) {
                // calculate the difficulty of this problem if user didn't submit
                // based on submissions before AC (not accurate but gets the job done)
                let userDifficultyRating = problemStatus.userDifficultyRating;
                if (userDifficultyRating == -1) {
                    let submissionsBeforeAC = 0;
                    let ACed = false;
                    for (const submission of problemStatus.problem.submissions) {
                        if (submission.verdict === "OK") {
                            ACed = true;
                            break;
                        }
                        submissionsBeforeAC++;
                    }
                    userDifficultyRating = ACed ? Math.min(1 + submissionsBeforeAC, 5) : 5;
                    await prisma.UserProblemStatus.update({
                        where: { username_problemId: { username, problemId: problemStatus.problemId } },
                        data: { userDifficultyRating },
                    });
                }

                for (const tag of problemStatus.problem.tags) {
                    if (!tagsFrequency[tag]) {
                        tagsFrequency[tag] = 0;
                    }
                    tagsFrequency[tag]++;
                    if (!tagsDifficulty[tag]) {
                        tagsDifficulty[tag] = 0;
                    }
                    tagsDifficulty[tag] += userDifficultyRating;
                }
            }

            // count the number of submissions and AC over the last 60 days
            const past60DaySubmissions = Array(60).fill(0),
                past60DayAC = Array(60).fill(0);
            const sortedSubmissions = await prisma.Submission.findMany({
                where: {
                    authorUsername: username,
                    timeCreated: { gte: new Date(new Date().setDate(new Date().getDate() - 60)) },
                },
                orderBy: { timeCreated: "desc" },
            });

            const timeNow = new Date();
            for (const submission of sortedSubmissions) {
                const dayDiff = Math.floor((timeNow - new Date(submission.timeCreated)) / (1000 * 60 * 60 * 24));
                past60DaySubmissions[dayDiff]++;
                if (submission.verdict === "OK") {
                    past60DayAC[dayDiff]++;
                }
            }

            await prisma.User.update({
                where: { username },
                data: {
                    problemsAC: totalProblemsAC,
                    totalSubmissions: totalSubmissionsAndAC._sum.submissions || 0,
                    totalAC: totalSubmissionsAndAC._sum.AC || 0,
                    tagsFrequency,
                    tagsDifficulty,
                    recentSubmissions: past60DaySubmissions,
                    recentAC: past60DayAC,
                    lastUpdated: new Date().toISOString(),
                },
            });
        } catch (error) {
            console.error("[Error updating user stats]: ", error);
        }
    }

    /*
    SHOULD NOT BE CALLED DIRECTLY EXCEPT FROM A CF LIMITER QUEUE

    Updates the latest problems data by fetching and writing relevant data via CodeforcesAPI.js
    and then processes said data, writing results to database.

    Processes: 
    - ratings spread: number of problems in each rating. 
        - Example: { "1000": 247, "1100": 456 }
    - tags spread: number of problems in each tag in each rating range. 
        - Example: { "1000": { "dp": 2, "greedy": 10 }, "1100": { "dp": 5, "greedy": 12 }}
    */
    static async updateProblemsData() {
        await CodeforcesAPI.fetchProblemsData();
        const problemsRatingSpread = {};
        const problemsTagsSpread = {};
        const allProblems = await prisma.Problem.findMany();
        for (const problem of allProblems) {
            if (!problemsRatingSpread[problem.rating]) {
                problemsRatingSpread[problem.rating] = 0;
            }
            problemsRatingSpread[problem.rating]++;

            if (!problemsTagsSpread[problem.rating]) {
                problemsTagsSpread[problem.rating] = {};
            }

            for (const tag of problem.tags) {
                if (!problemsTagsSpread[problem.rating][tag]) {
                    problemsTagsSpread[problem.rating][tag] = 0;
                }
                problemsTagsSpread[problem.rating][tag]++;
            }
        }

        await prisma.Metadata.update({
            where: { key: "meta" },
            data: {
                problemsRatingSpread,
                problemsTagsSpread,
                problemsLastUpdated: new Date().toISOString(),
            },
        });
    }

    /*
    Updates the rating difficulty change of a problem and user's estimated rating 
    based on the new rating difficulty.

    Updates:
    - tagsDifficulty, adding the difficulty rating delta (new difficulty rating - old difficulty rating) 
      to relevant tags
    - the difficulty rating on user's problem status
    - the user's new estimated rating via calculateEstimatedRating
    */
    static async updateUserRatingDifficulty(username, problemId, newDifficultyRating) {
        try {
            const oldUserInfo = await prisma.User.findUnique({
                where: { username },
            });
            const oldProblemStatus = await prisma.userProblemStatus.findUnique({
                where: { username_problemId: { username, problemId } },
                include: { problem: true },
            });

            await prisma.userProblemStatus.update({
                where: { username_problemId: { username, problemId } },
                data: { userDifficultyRating: parseInt(newDifficultyRating) },
            });

            const newTagsDifficulty = oldUserInfo.tagsDifficulty;
            const difficultyRatingDelta = newDifficultyRating - oldProblemStatus.userDifficultyRating;
            for (const tag of oldProblemStatus.problem.tags) {
                newTagsDifficulty[tag] += difficultyRatingDelta;
            }

            const user = await prisma.User.findUnique({
                where: { username },
            });

            await prisma.User.update({
                where: { username },
                data: {
                    tagsDifficulty: newTagsDifficulty,
                    estimatedRating: await this.calculateEstimatedRating(username, user.rating),
                },
            });
        } catch (error) {
            return error;
        }
    }

    /*
    Calculates the user's estimated rating based on the user's recent problem status
    and the user's estimated rating.
    Formula is explained in design doc
    */
    static async calculateEstimatedRating(username, rating) {
        let estimatedRating = rating;
        let recentProblemStatuses = await prisma.UserProblemStatus.findMany({
            where: { username },
            orderBy: { lastAttempted: "desc" },
            include: { problem: true },
            take: PAST_PROBLEMS_COUNT,
        }).then((data) => data.reverse());

        for (const problemStatus of recentProblemStatuses) {
            if (problemStatus.problem.rating == -1) {
                continue;
            }
            const probabilityOfSolving = 1 / (1 + Math.pow(BASE_OF_EXPONENT, (problemStatus.problem.rating - estimatedRating) / RATING_DIFFERENCE_SCALE));
            estimatedRating = estimatedRating + K * (SCORES[problemStatus.userDifficultyRating - 1] - probabilityOfSolving);
        }

        return estimatedRating;
    }

    /*
    Generates a suggested problem for a user based on estimated rating and difficulty rating of tags,
    updating it in the database.
    
    The algorithm works as follows:
    1. Calculate the probability of a problem being chosen based on user's difficulty rating of certain tags
    2. Calculate the probability of a problem being chosen based on the rating range of the problem
    3. Combine the two probabilities and pick a random tag based on the weighted probabilities
    4. Pick a random problem based on the chosen tag and rating range
    */
    static async generateSuggestedProblem(username, ratingStartRaw, ratingEndRaw, tagsChosen) {
        try {
            const metadata = await prisma.Metadata.findUnique({
                where: { key: "meta" },
            });

            const userInfo = await prisma.User.findUnique({
                where: { username },
            });

            // convert ratings so that they are divisible by 100
            const ratingStart =
                ratingStartRaw === -1 ? Math.floor(userInfo.estimatedRating / 100) * 100 : Math.ceil(ratingStartRaw / 100) * 100;

            const ratingEnd = ratingEndRaw === -1 ? ratingStart + 300 : Math.floor(ratingEndRaw / 100) * 100;

            const problemsProbabilityOnRatingRange = this.getProblemsProbabilityOnRatingRange(metadata, ratingStart, ratingEnd, tagsChosen);
            const problemsProbabilityOnUserDifficulty = this.getProblemsProbabilityOnUserDifficulty(userInfo, tagsChosen);

            const problemsProbability = problemsProbabilityOnRatingRange;

            for (const tag of Object.keys(problemsProbabilityOnUserDifficulty)) {
                if (!problemsProbability[tag]) {
                    problemsProbability[tag] = 0;
                }
                problemsProbability[tag] += problemsProbabilityOnUserDifficulty[tag];
            }

            for (const tag of Object.keys(problemsProbability)) {
                problemsProbability[tag] /= 2;
            }

            // pick a random tag based on their weighted probabilities
            const randomNum = Math.random();
            let prefix = 0;
            let tagChosen = "";
            for (const tag of Object.keys(problemsProbability)) {
                prefix += problemsProbability[tag];
                if (prefix >= randomNum) {
                    tagChosen = tag;
                    break;
                }
            }

            const possibleProblems = await prisma.Problem.findMany({
                where: {
                    rating: {
                        gte: ratingStart,
                        lte: ratingEnd,
                    },
                    tags: {
                        has: tagChosen,
                    },
                },
            });

            await prisma.User.update({
                where: { username },
                data: { assignedProblemId: possibleProblems[Math.floor(Math.random() * possibleProblems.length)].id },
            });
        } catch (error) {
            return error;
        }
    }

    /*
    Generates the probabilities of a tag being chosen based on the rating range of the problem.

    Calculated by taking the number of problems in a certain rating range and tag and 
    dividing it by the total number of problems in that rating range.
    */
    static getProblemsProbabilityOnRatingRange(metadata, ratingStart, ratingEnd, tagsChosen) {
        // inputs into ratingStart and ratingEnd should be divisble by 100
        let problemsProbability = {};
        let sum = 0;
        for (let rating = ratingStart; rating <= ratingEnd; rating += 100) {
            if (!metadata.problemsTagsSpread[rating]) {
                continue;
            }
            for (const tag of Object.keys(metadata.problemsTagsSpread[rating])) {
                if (tagsChosen.length !== 0 && !tagsChosen.includes(tag)) {
                    continue;
                }
                if (!problemsProbability[tag]) {
                    problemsProbability[tag] = 0;
                }
                problemsProbability[tag] += metadata.problemsTagsSpread[rating][tag];
                sum += metadata.problemsTagsSpread[rating][tag];
            }
        }
        for (const tag of Object.keys(problemsProbability)) {
            problemsProbability[tag] /= sum;
        }
        return problemsProbability;
    }

    /*
    Generates the probabilities of a tag being chosen based on the user's difficulty rating of selected tags.

    Calculated by taking the average difficulty rating (tagsDifficulty / tagsFrequency) of a tag 
    and dividing it by the total average difficulty rating.
    */
    static getProblemsProbabilityOnUserDifficulty(userInfo, tagsChosen) {
        let problemsProbability = {};
        let totalDifficulty = 0;
        for (const tag of Object.keys(userInfo.tagsDifficulty)) {
            if (tagsChosen.length !== 0 && !tagsChosen.includes(tag)) {
                continue;
            }
            problemsProbability[tag] = userInfo.tagsDifficulty[tag] / userInfo.tagsFrequency[tag];
            totalDifficulty += problemsProbability[tag];
        }
        for (const tag of Object.keys(problemsProbability)) {
            problemsProbability[tag] /= totalDifficulty;
        }
        return problemsProbability;
    }
}

module.exports = Data;
