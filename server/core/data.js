const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CodeforcesAPI = require("./CodeforcesAPI");

const SCORES = [1, 0.75, 0.5, 0.25, 0];
const K = 20;

class Data {
    static async updateUserData(username) {
        await CodeforcesAPI.fetchUserData(username);
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
                totalSubmissions: totalSubmissionsAndAC._sum.submissions,
                totalAC: totalSubmissionsAndAC._sum.AC,
                tagsFrequency,
                tagsDifficulty,
                recentSubmissions: past60DaySubmissions,
                recentAC: past60DayAC,
                lastUpdated: new Date().toISOString(),
            },
        });
    }

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

    static async calculateEstimatedRating(username, rating) {
        let estimatedRating = rating;
        let recentProblemStatuses = await prisma.UserProblemStatus.findMany({
            where: { username },
            orderBy: { lastAttempted: "desc" },
            include: { problem: true },
            take: 200,
        }).then(data => data.reverse());
        
        for (const problemStatus of recentProblemStatuses) {
            if (problemStatus.problem.rating == -1) {
                continue;
            }
            const probabilityOfSolving = 1 / (1 + Math.pow(10, (problemStatus.problem.rating - estimatedRating) / 400));
            estimatedRating = estimatedRating + K * (SCORES[problemStatus.userDifficultyRating - 1] - probabilityOfSolving);
        }

        return estimatedRating;
    }

    static async generateSuggestedProblem(username, ratingStart, ratingEnd, tagsChosen) {
        const metadata = await prisma.Metadata.findUnique({
            where: { key: "meta" }
        });

        const userInfo = await prisma.User.findUnique({
            where: { username }
        });
        
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
        let tagChosen= "";
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
                    has: tagChosen
                }
            }
        });

        return possibleProblems[Math.floor(Math.random() * possibleProblems.length)];
    }

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
