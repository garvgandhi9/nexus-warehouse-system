const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
    console.warn("[AUTH] WARNING: JWT_SECRET not set, using fallback key. Set this in production!");
}

const JWT_SECRET = process.env.JWT_SECRET || "nexus-fallback-secret-key";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-token-123";

function verifyAdmin(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ success: false, error: "Unauthorized — no token provided" });
    }

    // Legacy hardcoded token check
    if (token === ADMIN_TOKEN) {
        return next();
    }

    // Proper JWT check
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({ success: false, error: "Admin access required — insufficient permissions" });
        }
        req.userId = decoded.id;
        return next();
    } catch (err) {
        console.error("[AUTH] Invalid admin token:", err.message);
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, error: "Session expired — please log in again" });
        }
        return res.status(401).json({ success: false, error: "Invalid token — please log in again" });
    }
}

module.exports = verifyAdmin;