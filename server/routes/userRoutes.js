const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const authenticateJWT = require("./authenticateJWT");
const CodeforcesAPI = require("../CodeforcesAPI");

const USER_INCLUDES = {
    problems: true, 
    submissions: { include: { problem: true } },
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

router.get("/keygen", authenticateJWT, async (req, res) => {
    let key = "";
    for (let i = 0; i < KEY_LEN; i++) {
        key += KEYGEN_CHARS.charAt(Math.floor(Math.random() * KEYGEN_CHARS.length));
    }

    await prisma.User.update({
        where: { username: req.user.username },
        data: { cfLinkKey: key }
    })

    return res.json({key});
});

router.post("/linkCF", authenticateJWT, async (req, res) => {
    // check if handle is already linked
    const potentialUser = await prisma.User.findUnique({
        where: { handle: req.body.handle }
    });

    if (potentialUser !== null) {
        return res.status(403).json({"error": "Handle already linked"})
    }

    let data = {};
    try {
        data = await CodeforcesAPI.getUserInfo(req.body.handle);
        if (data.status === "FAILED") {
            return res.status(403).json({"error": "No user with handle found"});
        }
    }
    catch (error) {
        return res.status(403).json({"error" : "Fetch error"});
    }

    const userToLink = await prisma.User.findUnique({
        where: { username: req.user.username }
    });

    if (userToLink.cfLinkKey != data.result[0].firstName) {
        return res.status(403).json({"error": "First name does not match key"});
    }

    // good match, remove link key and update handle
    const user = await prisma.User.update({
        where: { username: req.user.username },
        data: {
            handle: req.body.handle,
            cfLinkKey: "",
        }
    });

    return res.json(user);
});

// TESTING STUFF (IGNORE)
router.get("/test", async (req, res) => {
    CodeforcesAPI.updateProblems();
    return res.json({});
});

router.get("/test2", async (req, res) => {
    CodeforcesAPI.updateUserStats("Eric-exe");
    return res.json({});
})

module.exports = router;
