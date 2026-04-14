// middleware/auth.js
// ================================================================
// JWT token ellenőrző middleware.
// Emma verziója: config.js-ből importálja a JWT_SECRET-et.
// ================================================================

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

function authMiddleware(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Nincs token megadva" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        req.username = decoded.username;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Érvénytelen vagy lejárt token" });
    }
}

module.exports = authMiddleware;