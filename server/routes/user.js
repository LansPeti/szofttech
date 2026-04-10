// routes/user.js
// ================================================================
// Felhasználói profil végpontok.
//
// Minden végpont védett (authMiddleware szükséges).
// A req.userId-ból tudjuk ki a bejelentkezett felhasználó.
//
// Végpontok:
//   GET  /api/user/profile     — Saját profil adatok lekérése
//   PUT  /api/user/profile     — Profil módosítása (username, avatarColor)
//   PUT  /api/user/password    — Jelszó megváltoztatása
//   GET  /api/user/invite-link — Meghívó token lekérése
// ================================================================

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { findById } = require("../data/users");
const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(__dirname, "../data/users.json");

/**
 * Users.json közvetlen beolvasása/írása a módosító végpontokhoz.
 * (A findById a memóriában keres, de a mentéshez a fájlt kell frissíteni.)
 */
function readUsersFile() {
    try {
        const data = fs.readFileSync(USERS_FILE, "utf8");
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : (parsed.users || []);
    } catch {
        return [];
    }
}

function writeUsersFile(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

// ────────────────────────────────────────────────────
// GET /api/user/profile — Saját profil lekérése
// ────────────────────────────────────────────────────
router.get("/profile", (req, res) => {
    const user = findById(req.userId);

    if (!user) {
        return res.status(404).json({ error: "Felhasználó nem található" });
    }

    // Publikus adatok visszaküldése — passwordHash SOHA nem megy ki!
    res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatarColor: user.avatarColor || "#C2B280",
        inviteToken: user.inviteToken,
        createdAt: user.createdAt,
    });
});

// ────────────────────────────────────────────────────
// PUT /api/user/profile — Profil módosítása
// ────────────────────────────────────────────────────
router.put("/profile", (req, res) => {
    const users = readUsersFile();
    const index = users.findIndex((u) => u.id === req.userId);

    if (index === -1) {
        return res.status(404).json({ error: "Felhasználó nem található" });
    }

    const { username, avatarColor } = req.body;

    // Csak a küldött mezőket frissítjük
    if (username !== undefined) users[index].username = username;
    if (avatarColor !== undefined) users[index].avatarColor = avatarColor;

    writeUsersFile(users);

    // Frissített profil visszaküldése (passwordHash nélkül)
    const updated = users[index];
    res.status(200).json({
        id: updated.id,
        username: updated.username,
        email: updated.email,
        avatarColor: updated.avatarColor || "#C2B280",
        inviteToken: updated.inviteToken,
        createdAt: updated.createdAt,
    });
});

// ────────────────────────────────────────────────────
// PUT /api/user/password — Jelszó megváltoztatása
// ────────────────────────────────────────────────────
router.put("/password", async (req, res) => {
    const users = readUsersFile();
    const index = users.findIndex((u) => u.id === req.userId);

    if (index === -1) {
        return res.status(404).json({ error: "Felhasználó nem található" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Régi és új jelszó kötelező" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: "Az új jelszó legalább 6 karakter legyen" });
    }

    // Régi jelszó ellenőrzése
    const passwordMatch = await bcrypt.compare(currentPassword, users[index].passwordHash);
    if (!passwordMatch) {
        return res.status(401).json({ error: "A régi jelszó nem helyes" });
    }

    // Új jelszó hashelése és mentése
    users[index].passwordHash = await bcrypt.hash(newPassword, 10);
    writeUsersFile(users);

    res.status(200).json({ message: "Jelszó sikeresen megváltoztatva" });
});

// ────────────────────────────────────────────────────
// GET /api/user/invite-link — Meghívó token lekérése
// ────────────────────────────────────────────────────
router.get("/invite-link", (req, res) => {
    const user = findById(req.userId);

    if (!user) {
        return res.status(404).json({ error: "Felhasználó nem található" });
    }

    res.status(200).json({
        inviteToken: user.inviteToken,
    });
});

module.exports = router;
