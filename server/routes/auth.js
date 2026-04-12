// routes/auth.js
// ================================================================
// Emma által véglegesített auth végpontok.
// POST /login  — Bejelentkezés (bcrypt + JWT)
// POST /register — Regisztráció (uuid + bcrypt hash + JWT)
// ================================================================

const express = require("express");
const router = express.Router();
const { findByUsername, addUser, updateUserPassword, DuplicateUserError } = require("../data/users");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Felhasználónév és jelszó megadása kötelező!" });
    }

    const user = findByUsername(username);

    // bcrypt.compare async — await kell, különben a Promise mindig truthy!
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
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
    const { username, email, password, securityQuestion, securityAnswer } = req.body;

    if (!username || !email || !password || !securityQuestion || !securityAnswer) {
        return res.status(400).json({ error: "Minden mező kitöltése kötelező (biztonsági kérdés és válasz is)!" });
    }

    try {
        const user = addUser({ username, email, password, securityQuestion, securityAnswer });
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

// --------------------------------------------------------
// Jelszó-visszaállítás (Elfelejtett jelszó) folyamata
// --------------------------------------------------------

// 1. lépés: Lekérjük a felhasználóhoz tartozó biztonsági kérdést
router.post("/forgot-password", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Felhasználónév megadása kötelező!" });
    }

    const user = findByUsername(username);

    if (!user) {
        return res.status(404).json({ error: "Nem található ilyen felhasználó." });
    }

    if (!user.securityQuestion) {
        return res.status(400).json({ error: "Ehhez a fiókhoz nincs beállítva biztonsági kérdés." });
    }

    res.status(200).json({ securityQuestion: user.securityQuestion });
});

// 2. lépés: Ellenőrizzük a választ és lecseréljük a jelszót
router.post("/reset-password", async (req, res) => {
    const { username, answer, newPassword } = req.body;

    if (!username || !answer || !newPassword) {
        return res.status(400).json({ error: "Minden mező kitöltése kötelező!" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: "Az új jelszó legalább 6 karakter hosszú kell hogy legyen!" });
    }

    const user = findByUsername(username);

    if (!user) {
        return res.status(404).json({ error: "Nem található ilyen felhasználó." });
    }

    // A beírt válasz (csupa kisbetűvel, trimmelve) összehasonlítása a mentett hash-sel
    const answerMatch = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswerHash);

    if (!answerMatch) {
        return res.status(400).json({ error: "A megadott válasz helytelen." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    updateUserPassword(username, newPasswordHash);

    res.status(200).json({ message: "A jelszó sikeresen megváltoztatva." });
});

module.exports = router;