const express = require("express");
const router = express.Router();
const { findByUsername, addUser, DuplicateUserError } = require("../data/users");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const bcrypt = require("bcrypt");

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Felhasználónév és jelszó megadása kötelező!" });
    }

    const user = findByUsername(username);

    if (!user || !bcrypt.compare(password, user.passwordHash)) {
        return res.status(401).json({ error: "Hibás felhasználónév vagy jelszó" });
    }

    res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatarColor: user.avatarColor,
        token: jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" })
    });
})

router.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Minden mező kitöltése kötelező" });
    }

    try {
        const user = addUser({ username, email, password });
        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            token: jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" })
        });
    } catch (err) {
        if (err instanceof DuplicateUserError) {
            return res.status(409).json({ error: err.message });
        }

        console.error("Failed to write users file:", err);
        return res.status(500).json({ error: "Belső kiszolgálóhiba" });
    }
})

module.exports = router;