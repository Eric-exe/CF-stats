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

    /*
    Fetches user's submission data from CF API and writes it to the database.
    */
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
                    },
                });
            } catch (error) {
                console.error("[Update submission error]: ", error); // most likely the problem doesn't exist in problems API
            }
        }
    }

    /*
    Fetches all of the problems from CF API's problemset and writes it to database.
    */
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

    /*
    Fetches user info (firstname, lastname, rating, etc...) from CF API and returns it as a object.
    */
    static async fetchUserInfo(handle) {
        try {
            const data = await this.get(`https://codeforces.com/api/user.info?handles=${handle}`).then((response) => response.json());
            return data;
        } catch (error) {
            throw new Error("Failed to fetch user info");
        }
    }

    /*
    Fetches all contests info { id, name, durationTime, etc... } and write to db
    */
    static async fetchContestsInfo() {
        try {
            const data = await this.get("https://codeforces.com/api/contest.list").then((response) => response.json());
            if (data.status !== "OK") {
                throw new Error(`status not ok: ${JSON.stringify(data)}`);
            }

            const contests = data.result;

            for (const contestData of contests) {
                await prisma.Contest.upsert({
                    where: { id: contestData.id },
                    create: {
                        id: contestData.id,
                        name: contestData.name,
                        type: contestData.type,
                        phase: contestData.phase,
                        durationSeconds: contestData.durationSeconds,
                        startTime: new Date(contestData.startTimeSeconds * 1000),
                    },
                    update: {
                        phase: contestData.phase
                    }
                });
            }
        } catch (error) {
            console.error("[Failed to fetch contests info]: ", error);
        }
    }
}

module.exports = CodeforcesAPI;
