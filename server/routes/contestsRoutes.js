const express = require("express");
const router = express.Router();
const CodeforcesAPI = require("../core/CodeforcesAPI");

router.get("/update", async (req, res) => {
    CodeforcesAPI.fetchContestsInfo();
});

module.exports = router;