const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Data {
    static async processUserData(username) {
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

    static async processProblemsData() {
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
}

module.exports = Data;
