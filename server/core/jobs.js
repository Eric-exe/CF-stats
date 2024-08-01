const { Queue, Worker } = require("bullmq");
const redisConnection = require("./redisConnection");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Data = require("./data");
const CodeforcesAPI = require("./CodeforcesAPI");
const SSE = require("./sse");

const cfQueue = new Queue("codeforces queue", {
    connection: redisConnection,
});

cfQueue.add("update problems", { fn: "UPDATE_PROBLEM" }, { repeat: { cron: "0 0 * * *" }, priority: 1 });
cfQueue.add("update contests", { fn: "UPDATE_CONTEST" }, { repeat: { cron: "0 0 * * *" }, priority: 1 });

const cfWorker = new Worker(
    "codeforces queue",
    async (job) => {
        switch (job.data.fn) {
            case "UPDATE_PROBLEM":
                updateProblemsData();
                break;
            case "UPDATE_CONTEST":
                CodeforcesAPI.fetchContestsInfo();
                break;
            case "UPDATE_USER":
                updateUserData(job.data.username);
                break;
            case "LINK_USER":
                linkCF(job.data.username, job.data.handle);
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

/*
CF Worker jobs:
Any job that uses CF API should be executed through cfWorker due to API limit
*/
const linkCF = async (username, handle) => {
    // Error handling: is username already linked
    const potentialUserHasHandle = await prisma.User.findUnique({
        where: { username },
    });
    if (potentialUserHasHandle.handle !== null) {
        SSE.sendUsernameUpdate(username, {
            job: "LINK_USER",
            status: "FAILED",
            Error: "User already linked to a handle. Refresh the page.",
        });
        return;
    }

    // Error handling: is handle already linked
    const potentialUserWithHandle = await prisma.User.findUnique({
        where: { handle },
    });
    if (potentialUserWithHandle !== null) {
        SSE.sendUsernameUpdate(username, {
            job: "LINK_USER",
            status: "FAILED",
            Error: "Handle already linked.",
        });
        return;
    }

    let data = {};
    try {
        data = await CodeforcesAPI.fetchUserInfo(handle);
        // Error handling: user doesn't exist on CF
        if (data.status === "FAILED") {
            SSE.sendUsernameUpdate(username, {
                job: "LINK_USER",
                status: "FAILED",
                Error: "No user with handle found",
            });
            return;
        }
    } catch (error) {
        // Error handling: fetch request failed
        SSE.sendUsernameUpdate(username, {
            job: "LINK_USER",
            status: "FAILED",
            Error: "Fetch error",
        });
        return;
    }

    // Error handling: cfLinkKey doesn't match firstname
    const userToLink = await prisma.User.findUnique({
        where: { username },
    });

    if (userToLink.cfLinkKey != data.result[0].firstName) {
        SSE.sendUsernameUpdate(username, {
            job: "LINK_USER",
            status: "FAILED",
            Error: "First name does not match key",
        });
        return;
    }

    // good match, remove link key and update handle
    await prisma.User.update({
        where: { username },
        data: {
            handle,
            cfLinkKey: "",
            rating: data.result[0].rating || 0,
            estimatedRating: data.result[0].rating || 0,
        },
    });

    // create a new job to make sure user data is fresh
    cfQueue.add("update user", { fn: "UPDATE_USER", username }, { repeat: { cron: "0 0 * * *" }, priority: 1, jobId: `update-user-${handle}`});

    SSE.sendUsernameUpdate(username, {
        job: "LINK_USER",
        status: "OK",
    });
};

const updateUserData = async (username) => {
    // get latest rating
    try {
        const userInfo = await prisma.User.findUnique({
            where: { username }
        });

        const newHandleInfo = await CodeforcesAPI.fetchUserInfo(userInfo.handle);

        await prisma.User.update({
            where: { username },
            data: {
                rating: newHandleInfo.result[0].rating
            }
        });
    }
    catch (error) {
        console.error("[Error fetching latest rating]: ", error);
    }

    await Data.updateUserData(username);

    const user = await prisma.User.findUnique({
        where: { username },
    });

    // calculate rating and inform user that user info is done updating
    await prisma.User.update({
        where: { username },
        data: {
            estimatedRating: await Data.calculateEstimatedRating(username, user.rating),
            isUpdating: false,
        },
    });

    SSE.sendUsernameUpdate(username, { job: "UPDATE_USER", status: "OK" });
};

const updateProblemsData = async () => {
    await Data.updateProblemsData();
}

module.exports = { cfQueue, cfWorker };
