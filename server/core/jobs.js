const { Queue, Worker } = require('bullmq');
const redisConnection = require('./redisConnection');
const Data = require("./data");

const cfQueue = new Queue("codeforces queue", {
    connection: redisConnection
});

// update problems at 12 AM
cfQueue.add("update problems", {fn: "UPDATE_PROBLEM" }, {repeat: {cron: "0 0 * * *"}, priority: 1});

const cfWorker = new Worker("codeforces queue",
    async job => {
        switch (job.fn) {
            case "UPDATE_PROBLEM":
                Data.updateProblemsData();
                break;
            case "UPDATE_USER":
                Data.updateUserData(job.username);
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
            duration: 2000
        }
    }
);

module.exports = { cfQueue, cfWorker };
