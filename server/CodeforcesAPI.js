const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class CodeForcesAPI {
    static get(URL) {
        return fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    static async updateUserStats(userHandle) {
        return this.get("https://codeforces.com/api/user.status?handle=" + userHandle);
    }

    static async updateProblems() {
        try {
            const data = await this.get("https://codeforces.com/api/problemset.problems").then((response) =>
                response.json()
            );
            if (data.status != "OK") {
                throw new Error("Codeforces Problem API status: not ok");
            }

            // update database with info
            for (const problem of data.result.problems) {
                const problemId = `${problem.contestId}-${problem.index}`;
                // check if question exists and don't write if it does
                const existingProblem = await prisma.Problem.findUnique({
                    where: { id: problemId },
                });

                if (existingProblem === null) {
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
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = CodeForcesAPI;
