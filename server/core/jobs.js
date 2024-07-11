const { Queue, Worker } = require("bullmq");
const redisConnection = require("./redisConnection");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Data = require("./data");
const SSE = require("./sse");

const cfQueue = new Queue("codeforces queue", {
    connection: redisConnection,
});

// update problems at 12 AM
cfQueue.add("update problems", { fn: "UPDATE_PROBLEM" }, { repeat: { cron: "0 0 * * *" }, priority: 1 });

const cfWorker = new Worker(
    "codeforces queue",
    async (job) => {
        console.log(job.data);
        switch (job.data.fn) {
            case "UPDATE_PROBLEM":
                break;
            case "UPDATE_USER":
                await updateUserData(job.data.username);
                break;
            default:
                break;
        }
    },
    {
        connection: redisConnection,
        limiter: {
            // max API call is 1 every 2 seconds
            max: 1,
            duration: 2000,
        },
    }
);

const updateUserData = async (username) => {
    // inform user that data is updating
    await prisma.User.update({
        where: { username },
        data: { isUpdating: true },
    });
    SSE.sendUsernameUpdate(username);

    await Data.updateUserData(username);

    const user = await prisma.User.findUnique({
        where: { username }
    });

    // calculate rating and inform user that user info is done updating
    await prisma.User.update({
        where: { username },
        data: {
            estimatedRating: await Data.calculateEstimatedRating(username, user.rating),
            isUpdating: false,
        },
    });

    SSE.sendUsernameUpdate(username);
};
module.exports = { cfQueue, cfWorker };
