const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const authenticateJWT = require("./authenticateJWT");

const USER_INCLUDES = {
    problems: true, 
    submissions: { include: { problem: true } },
};

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

// personal info forces an entry to be created if entry doesn't exist.
router.get("/personalInfo", authenticateJWT, async (req, res) => {
    let userInfo = await prisma.User.upsert({
        where: { username: req.user.username },
        create: { username: req.user.username },
        update: {},
        include: USER_INCLUDES,
    });
    userInfo["state"] = "personal";
    return res.json(userInfo);
});

router.post("/publicInfo", async (req, res) => {
    let username = req.body.username || "";
    let userInfo = await prisma.User.findUnique({
        where: { username },
        include: USER_INCLUDES
    });
    if (userInfo !== null) {
        userInfo["state"] = "public";
    }
    return res.json(userInfo);
});

// TESTING STUFF (IGNORE)
const CodeforcesAPI = require("../CodeforcesAPI");
router.get("/test", async (req, res) => {
    CodeforcesAPI.updateProblems();
    return res.json({});
});

router.get("/test2", async (req, res) => {
    CodeforcesAPI.updateUserStats("Eric-exe");
    return res.json({});
})

module.exports = router;
