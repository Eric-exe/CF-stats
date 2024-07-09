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

    static async fetchUserData(username) {
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

    static async fetchProblemsData() {
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

    // not the same as user data as this stores general user info like name, not submissions
    static async fetchUserInfo(handle) {
        try {
            const data = await this.get(`https://codeforces.com/api/user.info?handles=${handle}`).then((response) => response.json());
            return data;
        } catch (error) {
            throw new Error("Failed to fetch user info");
        }
    }
}

module.exports = CodeforcesAPI;
