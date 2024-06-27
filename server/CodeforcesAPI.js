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
        if (user === null || user.handle === null) {
            return console.error("[Update user stats error]: No valid user or user handle");
        }

        const data = await this.get(`https://codeforces.com/api/user.status?handle=${user.handle}`).then((response) => response.json());

        for (const submission of data.result) {
            // check if submission exists, if it does, that means everything after it also exists
            const existingSubmission = await prisma.Submission.findUnique({
                where: { id: submission.id },
            });

            if (existingSubmission !== null) {
                break;
            }

            const problemId = `${submission.problem.contestId}-${submission.problem.index}`;

            // Update the newest submissions
            try {
                await prisma.Submission.create({
                    data: {
                        id: submission.id,
                        authorHandle: submission.author.members[0].handle,
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
                // create a status if it doesn't exist
                await prisma.userProblemStatus.upsert({
                    where: { username_problemId: { username, problemId } },
                    create: { solved: false, user: { connect: { username } }, problem: { connect: { id: problemId } } },
                    update: {},
                });

                if (submission.verdict == "OK") {
                    await prisma.userProblemStatus.update({
                        where: { username_problemId: { username, problemId } },
                        data: { solved: true },
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }
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
                        break;
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
}

module.exports = CodeforcesAPI;
