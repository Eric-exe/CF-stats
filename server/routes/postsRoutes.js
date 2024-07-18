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

/*
Updates the upvotes in a post after someone has upvoted by disconnecting user from their old vote in db and 
connect them to their new vote (if not neutral), and updates votes (# of upvotes - # of downvotes) to reflect that.

Note: neutral voteType occurs when the user uses the same vote twice, effectively removing their vote.

REQUIRES the JWT in auth header.
Request Body: 
{
    id: post id
    voteType: one of "upvote", "neutral", "downvote"
}

Response:
{ status: OK } if it succeeds
*/
router.post("/vote", authenticateJWT, async (req, res) => {
    try {
        const post = await prisma.Post.findUnique({
            where: { id: req.body.id },
            include: {
                upvotes: true,
                downvotes: true
            }
        });

        let voteDelta = 0;
        let disconnectField = null;
        let connectField = null;

        const oldVote = post.upvotes.some(user => user.username === req.user.username) ? "upvotes" :
                        post.downvotes.some(user => user.username === req.user.username) ? "downvotes" : 
                        null;

        if (oldVote !== null) {
            disconnectField = oldVote;
            voteDelta += (oldVote === "upvotes" ? -1 : 1);
        }

        const newVote = req.body.voteType === "neutral" ? null : 
                        req.body.voteType == "upvote" ? "upvotes" : "downvotes";
        
        if (newVote !== null) {
            connectField = newVote;
            voteDelta += (newVote == "upvotes" ? 1 : -1);
        }

        await prisma.Post.update({
            where: { id: req.body.id },
            data: {
                ...(disconnectField !== null && { 
                    [disconnectField]: {
                        disconnect: [{ username: req.user.username }]
                    }
                }),
                ...(connectField !== null && {
                    [connectField]: {
                        connect: [{ username: req.user.username }]
                    }
                }),
                votes: post.votes + voteDelta,
            }
        });

        return res.status(200).json({ status: "OK" });
    } catch (error) {
        console.error("[Vote post error]: ", error);
        return res.status(409).json({ status: "FAILED" });
    }
});

module.exports = router;
