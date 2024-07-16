const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/getData", async (req, res) => {
    const problems = await prisma.problem.findMany();
    return res.json(problems);
});

module.exports = router;