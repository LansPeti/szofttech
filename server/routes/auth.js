// routes/auth.js
// ================================================================
// Autentikációs végpontok: login és regisztráció.
//
// Mindkét endpoint JWT tokent generál és küld vissza,
// amit a frontend localStorage-ben tárol és minden
// további kéréshez Bearer tokenként mellékel.
// ================================================================

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { findByUsername, findById, addUser, DuplicateUserError } = require("../data/users");

// JWT titkos kulcs — produkciós környezetben .env-ből jönne
const JWT_SECRET = process.env.JWT_SECRET || "szoftech-secret-key";

// ────────────────────────────────────────────────────
// POST /api/login — Bejelentkezés
// ────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Validáció: mindkét mező kötelező
    if (!username || !password) {
        return res.status(400).json({ error: "Felhasználónév és jelszó kötelező" });
    }

    // Felhasználó keresése username alapján
    const user = findByUsername(username);

    if (!user) {
        // Biztonsági best practice: ne áruljuk el melyik mező rossz
        return res.status(401).json({ error: "Hibás felhasználónév vagy jelszó" });
    }

    // Jelszó ellenőrzés — bcrypt hash összehasonlítás
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
        return res.status(401).json({ error: "Hibás felhasználónév vagy jelszó" });
    }

    // JWT token generálás (24 óra lejárattal)
    const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "24h" }
    );

    // Válasz: user adatok + token (passwordHash SOHA nem megy ki!)
    res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatarColor: user.avatarColor || "#C2B280",
        token,
    });
});

// ────────────────────────────────────────────────────
// POST /api/register — Regisztráció
// ────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    // Validáció: minden mező kötelező
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Minden mező kitöltése kötelező" });
    }

    // Jelszó hashelés bcrypt-tel (10 round salt)
    const passwordHash = await bcrypt.hash(password, 10);

    // Egyedi azonosítók generálása
    const id = uuidv4();
    const inviteToken = uuidv4();

    try {
        // User mentése az adatbázisba (JSON fájl)
        addUser({
            id,
            username,
            email,
            passwordHash,
            avatarColor: "#C2B280",
            inviteToken,
            createdAt: new Date().toISOString(),
        });
    } catch (err) {
        if (err instanceof DuplicateUserError) {
            return res.status(409).json({ error: err.message });
        }
        console.error("Failed to write users file:", err);
        return res.status(500).json({ error: "Belső szerverhiba" });
    }

    // JWT token generálás — regisztráció után azonnal be is jelentkeztetjük
    const token = jwt.sign(
        { id, username },
        JWT_SECRET,
        { expiresIn: "24h" }
    );

    // Válasz: user adatok + token
    res.status(201).json({
        id,
        username,
        email,
        token,
    });
});

module.exports = router;