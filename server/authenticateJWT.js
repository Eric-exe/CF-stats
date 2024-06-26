require("dotenv").config();
const jwt = require("jsonwebtoken")

function authenticateJWT(req, res, next) {
    const authHeader = req["headers"]["authorization"];
    console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401).json({"error": "No token"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req["user"] = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({"error": "Bad token"})
    }
}

module.exports = authenticateJWT;