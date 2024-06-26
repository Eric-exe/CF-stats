const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken")
const authenticateJWT = require("../authenticateJWT");

// takes in GitHub code from OAuth and generates a JWT based on github username
router.post("/createJWT", async (req, res) => {
    const { code } = req.body;
    if (code == undefined) return res.status(401).json({"error": "No code"});

    let username = undefined;
    // get the username to encode into the JWT
    try {
        const accessResponse = await fetch("https://github.com/login/oauth/access_token", {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            "body": JSON.stringify({
                "client_id": process.env.GITHUB_CLIENT_ID,
                "client_secret": process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        }).then(response => response.json());
        const accessToken = accessResponse["access_token"];

        const userResponse = await fetch("https://api.github.com/user", {
            "method": "GET",
            "headers": {
                "Authorization": "token " + accessToken
            }
        }).then(response => response.json());
        username = userResponse["login"];

    } catch (error) {
        console.error("Error while fetching GitHub username: ", error);
    }

    return res.json({"encoded": jwt.sign({"username": username}, process.env.JWT_SECRET_KEY, {expiresIn: "7d"})});
});

router.get("/info", authenticateJWT, async (req, res) => {
    let userInfo = await prisma.User.findUnique({
        "where": {"username": req["user"]["username"]}
    });

    // first time user has signed up, create a new account
    if (userInfo === null) {
        userInfo = await prisma.User.create({
            "data": {
                "username": req["user"]["username"],
            }
        })
    }

    return res.json(userInfo);
})

module.exports = router;
