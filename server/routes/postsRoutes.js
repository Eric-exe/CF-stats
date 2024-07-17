const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authenticateJWT = require("./authenticateJWT");

router.post("/get", async (req, res) => {
    try {
        const sort = req.body.sortBy;
        const sortType = sort.split("-")[0]; // timeCreated/votes
        const sortMode = sort.split("-")[1]; // asc/desc
        const posts = await prisma.Post.findMany({
            where: {
                title: {
                    contains: req.body.title,
                    mode: "insensitive"
                },
                ...(req.body.tags.length > 0 && {
                    tags: {
                        hasSome: req.body.tags
                    },
                }),
            },
            orderBy: {
                [sortType]: sortMode
            },
            include: {
                upvotes: true,
                downvotes: true,
            }
        });
        return res.status(200).json({ status: "OK", posts });
    } catch (error) {
        console.error("[Get posts error]: ", error);
        return res.status(409).json({ status: "FAILED" });
    }
});

router.post("/create", authenticateJWT, async (req, res) => {
    try {
        await prisma.Post.create({
            data: {
                authorUsername: req.user.username,
                title: req.body.title,
                body: req.body.body,
                tags: req.body.tags,
            },
        });

        return res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error("[Create post error]: ", error);
        return res.status(409).json({ status: "FAILED" });
    }
});

module.exports = router;
