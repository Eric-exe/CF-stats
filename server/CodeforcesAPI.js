const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class CodeforcesAPI {
    static get(URL) {
        return fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    static async updateUserStats(username) {
        const user = await prisma.User.findUnique({ where: { username } });
        if (!user || !user.handle) {
            return console.error("No valid user or user handle");
        }
        let data = {};
        try {
            data = await this.get(`https://codeforces.com/api/user.status?handle=${user.handle}`).then((response) => response.json());
        } catch (error) {
            return console.error("[Failed to fetch user stats: ", error);
        }
        await this.processUserSubmissions(data, username);
        await this.processUserStats(username, user.handle);
    }

    static async processUserSubmissions(data, username) {
        for (const submission of data.result) {
            // check if submission exists, if it does, that means everything after it also exists
            const existingSubmission = await prisma.Submission.findUnique({
                where: { id: submission.id },
            });

            if (existingSubmission !== null) {
                break;
            }

            const problemId = `${submission.problem.contestId}-${submission.problem.index}`;

            try {
                await prisma.Submission.create({
                    data: {
                        id: submission.id,
                        authorUsername: username,
                        problemId,
                        timeCreated: new Date(submission.creationTimeSeconds * 1000),
                        programmingLang: submission.programmingLanguage,
                        verdict: submission.verdict,
                        timeUsed: submission.timeConsumedMillis,
                        memoryUsed: submission.memoryConsumedBytes,
                    },
                });
            } catch (error) {
                console.error("[Update submission error]: ", error); // most likely the problem doesn't exist in problems API
            }

            // Update the user's problem status
            try {
                // create a status if it doesn't exist and update submission + AC count
                await prisma.UserProblemStatus.upsert({
                    where: {
                        username_problemId: { username, problemId },
                    },
                    create: {
                        user: { connect: { username } },
                        problem: { connect: { id: problemId } },
                        lastAttempted: new Date(submission.creationTimeSeconds * 1000),
                        submissions: 1,
                        AC: submission.verdict === "OK" ? 1 : 0,
                    },
                    update: {
                        submissions: { increment: 1 },
                        AC: { increment: submission.verdict === "OK" ? 1 : 0 },
                    },
                });
            } catch (error) {
                console.error("[Update user problem status error]: ", error); // most likely the problem doesn't exist in problems API
            }
        }
    }

    static async processUserStats(username) {
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
            },
        });
    }

    static async updateProblems() {
        try {
            const data = await this.get("https://codeforces.com/api/problemset.problems").then((response) => response.json());
            if (data.status != "OK") {
                throw new Error("Codeforces Problem API status: not ok");
            }

            // update database with info
            for (const problem of data.result.problems) {
                try {
                    const problemId = `${problem.contestId}-${problem.index}`;
                    // check if question exists quit if it does, as API lists in descending order
                    const existingProblem = await prisma.Problem.findUnique({
                        where: { id: problemId },
                    });

                    if (existingProblem !== null) {
                        continue;
                    }

                    await prisma.Problem.create({
                        data: {
                            id: problemId,
                            contestId: problem.contestId,
                            index: problem.index,
                            name: problem.name,
                            rating: problem.rating,
                            tags: problem.tags,
                        },
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        } catch (error) {
            console.error("[Update problem error]: ", error);
        }
    }

    static async getUserInfo(handle) {
        try {
            const data = await this.get(`https://codeforces.com/api/user.info?handles=${handle}`).then((response) => response.json());
            return data;
        } catch (error) {
            throw new Error("Failed to fetch user info");
        }
    }
}

module.exports = CodeforcesAPI;
