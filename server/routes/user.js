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
const bcrypt = require("bcrypt");
const { findById, updateUserProfile, updateUserPassword, DuplicateUserError } = require("../data/users");

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
router.put("/profile", async (req, res) => {
    const { username, avatarColor, currentPassword } = req.body;

    const user = findById(req.userId);
    if (!user) {
        return res.status(404).json({ error: "Felhasználó nem található" });
    }

    if (!currentPassword) {
        return res.status(400).json({ error: "A módosításhoz a jelenlegi jelszó megadása kötelező!" });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatch) {
        return res.status(400).json({ error: "Helytelen jelenlegi jelszó!" });
    }

    let updated;
    try {
        updated = updateUserProfile(req.userId, { username, avatarColor });
    } catch (err) {
        if (err instanceof DuplicateUserError) {
            return res.status(409).json({ error: err.message });
        }
        throw err;
    }

    if (!updated) {
        return res.status(404).json({ error: "Felhasználó nem található" });
    }

    // Frissített profil visszaküldése (passwordHash nélkül)
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
    const user = findById(req.userId);

    if (!user) {
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
    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatch) {
        return res.status(400).json({ error: "A régi jelszó nem helyes" });
    }

    // Új jelszó hashelése és mentése
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    updateUserPassword(user.username, newPasswordHash);

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
