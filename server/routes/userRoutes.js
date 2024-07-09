const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const authenticateJWT = require("./authenticateJWT");
const CodeforcesAPI = require("../core/CodeforcesAPI");
const Data = require("../core/data");

const USER_INCLUDES = {
    problemStatuses: {
        include: { problem: true },
        orderBy: { lastAttempted: "desc" }
    }, 
    submissions: { 
        include: { problem: true },
        orderBy: { timeCreated: "desc" }
    },
};

const KEYGEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
const KEY_LEN = 30;

const DEFAULT_RATING = 800;

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

router.post("/info", async (req, res) => {
    let username = req.body.username || "";
    let userInfo = await prisma.User.findUnique({
        where: { username },
        include: USER_INCLUDES
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
        data: { cfLinkKey: key }
    })

    return res.json({key});
});

router.post("/linkCF", authenticateJWT, async (req, res) => {
    // check if user is already linked
    const potentialUserHasHandle = await prisma.User.findUnique({
        where: { username: req.user.username }
    });
    if (potentialUserHasHandle.handle !== null) {
        return res.status(403).json({"error": "User already linked to a handle. Refresh the page."});
    }
    // check if handle is already linked
    const potentialUserWithHandle = await prisma.User.findUnique({
        where: { handle: req.body.handle }
    });
    if (potentialUserWithHandle !== null) {
        return res.status(403).json({"error": "Handle already linked"})
    }

    let data = {};
    try {
        data = await CodeforcesAPI.fetchUserInfo(req.body.handle);
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
            rating: data.result[0].rating || 0,
            estimatedRating: data.result[0].rating || 0,
        }
    });
    
    return res.json(user);
});

router.post("/updateInfo", async (req, res) => {
    try {
        await Data.updateUserData(req.body.username);

        const user = await prisma.User.findUnique({
            where: { username: req.body.username }
        });

        await prisma.User.update({
            where: { username: req.body.username },
            data: { 
                estimatedRating: await Data.calculateEstimatedRating(req.body.username, user.rating),
            }
        });

        return res.status(200).json({ "status": "OK" });
    }
    catch (error) {
        console.error("[Error updating info]: ", error);
        return res.status(409).json({ "status": "FAILED", error });
    }
})

router.post("/updateDifficultyRating", authenticateJWT, async (req, res) => {
    try {
        const oldUserInfo = await prisma.User.findUnique({
            where: { username : req.user.username }
        });
        const oldProblemStatus = await prisma.userProblemStatus.findUnique({
            where: { username_problemId: { username: req.user.username, problemId: req.body.problemId }},
            include: { problem: true }
        });
        
        await prisma.userProblemStatus.update({
            where: { username_problemId: { username: req.user.username, problemId: req.body.problemId }},
            data: { userDifficultyRating: parseInt(req.body.newDifficultyRating) }
        });

        const newTagsDifficulty = oldUserInfo.tagsDifficulty;
        const difficultyRatingDelta = req.body.newDifficultyRating - oldProblemStatus.userDifficultyRating;
        for (const tag of oldProblemStatus.problem.tags) {
            newTagsDifficulty[tag] += difficultyRatingDelta;
        }

        const user = await prisma.User.findUnique({
            where: { username: req.user.username }
        });

        const updatedUserInfo = await prisma.User.update({
            where: { username: req.user.username },
            data: { 
                tagsDifficulty: newTagsDifficulty,
                estimatedRating: await Data.calculateEstimatedRating(req.body.username, user.rating)
            },
            include: USER_INCLUDES
        })

        return res.json(updatedUserInfo);
    } catch (error) {
        console.error("[Error updating difficulty rating]: ", error);
    }
});

// TESTING STUFF (IGNORE)
router.get("/test", async (req, res) => {
    await Data.updateProblemsData();
    return res.json({});
});

router.get("/test2", async (req, res) => {
    Data.updateUserData("Eric-exe");
    return res.json({});
})

module.exports = router;
