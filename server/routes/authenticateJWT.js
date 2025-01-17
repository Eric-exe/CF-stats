require("dotenv").config();
const jwt = require("jsonwebtoken");

/*
Decrypts the JWT and stores the user info inside the request.
If JWT doesn't exist or is bad, send respective JWT error.
*/
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        return res.status(401).json({ "JWT Error": "No token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req["user"] = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ "JWT Error": "Bad token, refresh and re-login" });
    }   
}

module.exports = authenticateJWT;
