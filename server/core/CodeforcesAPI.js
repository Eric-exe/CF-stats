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
            const problemId = `${submission.problem.contestId}-${submission.problem.index}`;

            try {
                await prisma.Submission.upsert({
                    where: { id: submission.id },
                    create: {
                        id: submission.id,
                        authorUsername: username,
                        problemId,
                        timeCreated: new Date(submission.creationTimeSeconds * 1000),
                        programmingLang: submission.programmingLanguage,
                        verdict: submission.verdict,
                        timeUsed: submission.timeConsumedMillis,
                        memoryUsed: submission.memoryConsumedBytes,
                    },
                    update: {
                        verdict: submission.verdict,
                        timeUsed: submission.timeConsumedMillis,
                        memoryUsed: submission.memoryConsumedBytes,
                    }
                });
            } catch (error) {
                console.error("[Update submission error]: ", error); // most likely the problem doesn't exist in problems API
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
                    const id = `${problem.contestId}-${problem.index}`;

                    await prisma.Problem.upsert({
                        where: { id },
                        create: {
                            id,
                            contestId: problem.contestId,
                            index: problem.index,
                            name: problem.name,
                            rating: problem.rating,
                            tags: problem.tags,
                        },
                        update: {
                            rating: problem.rating,
                            tags: problem.tags,
                        }
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
