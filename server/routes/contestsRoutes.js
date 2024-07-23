const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const CodeforcesAPI = require("../core/CodeforcesAPI");

router.get("/update", async (req, res) => {
    CodeforcesAPI.fetchContestsInfo();
});

router.get("/data", async (req, res) => {
    const upcomingContests = await prisma.Contest.findMany({
        where: { phase: { in: ["BEFORE", "CODING"] } },
        orderBy: { startTime: "asc" }
    });

    const pastContests = await prisma.Contest.findMany({
        where: { phase: { in: ["FINISHED", "PENDING_SYSTEM_TEST", "SYSTEM_TEST"] } },
        orderBy: { startTime: "desc" }
    });

    return res.json({ status: "OK", upcomingContests, pastContests });
});

module.exports = router;