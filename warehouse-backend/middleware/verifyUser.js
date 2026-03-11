const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
    console.warn("[AUTH] WARNING: JWT_SECRET not set, using fallback key. Set this in production!");
}

const JWT_SECRET = process.env.JWT_SECRET || "nexus-fallback-secret-key";

function verifyUser(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ success: false, error: "Unauthorized — no token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        console.error("[AUTH] Invalid user token:", err.message);
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, error: "Session expired — please log in again" });
        }
        return res.status(401).json({ success: false, error: "Invalid token — please log in again" });
    }
}

module.exports = verifyUser;