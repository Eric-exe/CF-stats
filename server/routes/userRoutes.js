const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const authenticateJWT = require("./authenticateJWT");
const CodeforcesAPI = require("../core/CodeforcesAPI");
const Data = require("../core/data");
const SSE = require("../core/sse");
const { cfQueue } = require("../core/jobs");

const USER_INCLUDES = {
    assignedProblem: true,
    problemStatuses: {
        include: { problem: true },
        orderBy: { lastAttempted: "desc" },
    },
    submissions: {
        include: { problem: true },
        orderBy: { timeCreated: "desc" },
    },
};

const KEYGEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
const KEY_LEN = 30;

// takes in GitHub code from OAuth and generates a JWT based on github username
router.post("/createJWT", async (req, res) => {
    const { code } = req.body;
    if (code == undefined) return res.status(401).json({ error: "No code" });

    let username = undefined;
    // get the username to encode into the JWT
    try {
        const accessResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        }).then((response) => response.json());
        const accessToken = accessResponse.access_token;

        const userResponse = await fetch("https://api.github.com/user", {
            method: "GET",
            headers: {
                Authorization: "token " + accessToken,
            },
        }).then((response) => response.json());
        username = userResponse.login;
    } catch (error) {
        console.error("Error while fetching GitHub username: ", error);
    }

    return res.json({ encoded: jwt.sign({ username }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" }) });
});

router.get("/getOrCreateInfo", authenticateJWT, async (req, res) => {
    let userInfo = await prisma.User.upsert({
        where: { username: req.user.username },
        create: { username: req.user.username },
        update: {},
        include: USER_INCLUDES,
    });

    return res.json(userInfo);
});

router.post("/getInfo", async (req, res) => {
    let username = req.body.username || "";
    let userInfo = await prisma.User.findUnique({
        where: { username },
        include: USER_INCLUDES,
    });
    return res.json(userInfo);
});

router.get("/keygen", authenticateJWT, async (req, res) => {
    let key = "";
    for (let i = 0; i < KEY_LEN; i++) {
        key += KEYGEN_CHARS.charAt(Math.floor(Math.random() * KEYGEN_CHARS.length));
    }

    await prisma.User.update({
        where: { username: req.user.username },
        data: { cfLinkKey: key },
    });

    return res.json({ key });
});

router.post("/linkCF", authenticateJWT, async (req, res) => {
    // requires CF, needs to be in a queue
    cfQueue.add("link user", { fn: "LINK_USER", username: req.user.username, handle: req.body.handle }, { priority: 3 });
    return res.status(200).json({ status: "OK" });
});

router.post("/updateInfo", async (req, res) => {
    // requires CF, needs to be in a queue
    try {
        // inform user that data is updating
        await prisma.User.update({
            where: { username: req.body.username },
            data: { isUpdating: true },
        });
        SSE.sendUsernameUpdate(req.body.username, { job: "UPDATE_USER", status: "OK" });

        cfQueue.add("update user", { fn: "UPDATE_USER", username: req.body.username }, { priority: 2 });
        return res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error("[Error updating info]: ", error);
        return res.status(409).json({ status: "FAILED", error });
    }
});

router.post("/updateDifficultyRating", authenticateJWT, async (req, res) => {
    try {
        await Data.updateUserRatingDifficulty(req.user.username, req.body.problemId, req.body.newDifficultyRating);
        SSE.sendUsernameUpdate(req.user.username, { job: "UPDATE_USER", status: "OK" });
        return res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error("[Error updating difficulty rating]: ", error);
        return res.status(409).json({ status: "FAILED" });
    }
});

router.post("/generateSuggestedProblem", authenticateJWT, async (req, res) => {
    try {
        await Data.generateSuggestedProblem(req.user.username, req.body.ratingStart, req.body.ratingEnd, req.body.tags || []);
        SSE.sendUsernameUpdate(req.user.username, { job: "UPDATE_USER", status: "OK" });
        return res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error(error);
        return res.status(409).json({ status: "FAILED" });
    }
});

router.get("/sse/:username", (req, res) => {
    const username = req.params.username;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    SSE.addUserClient(username, res);
    res.on("close", () => {
        SSE.removeUserClient(username, res);
        res.end();
    });
});

module.exports = router;
