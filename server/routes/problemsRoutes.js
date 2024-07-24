const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/getData", async (req, res) => {
    try {
        const problems = await prisma.Problem.findMany();
        return res.json({ status: "OK", problems });
    } catch (error) {
        console.log("[Error getting problems data]: ", error);
        return res.json({ status: "FAILED" });
    }
});

router.get("/getMetadata", async (req, res) => {
    try {
        const metadata = await prisma.Metadata.findUnique({
            where: { key: "meta" },
        });
        return res.json({ status: "OK", metadata });
    } catch (error) {
        console.error("[Error getting metadata]: ", error);
        return res.json({ status: "FAILED" });
    }
});

module.exports = router;
