// routes/settings.js
// ================================================================
// Felhasználói beállítások végpontok.
//
// Minden végpont védett (authMiddleware szükséges).
// A beállítások userId szerint vannak tárolva a settings.json-ben.
//
// Végpontok:
//   GET  /api/settings  — Saját beállítások lekérése
//   PUT  /api/settings  — Beállítások módosítása
// ================================================================

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// A beállítások fájl útvonala — userId-k szerint tároljuk az objektumokat
const SETTINGS_FILE = path.join(__dirname, "../data/settings.json");

// Alapértelmezett beállítások — ha a usernek még nincs elmentett beállítása
const DEFAULT_SETTINGS = {
    language: "magyar",
    timezone: "Budapest (GMT+1)",
    defaultEventColor: "#C2B280",
};

/**
 * Beállítások fájl beolvasása.
 * A fájl egy objektum, ahol a kulcsok userId-k: { "userId1": { ... }, "userId2": { ... } }
 * @returns {Object} - Az összes user beállítása
 */
function readSettings() {
    try {
        const data = fs.readFileSync(SETTINGS_FILE, "utf8");
        return JSON.parse(data);
    } catch {
        return {};
    }
}

/**
 * Beállítások fájl mentése.
 * @param {Object} settings - Az összes user beállítása
 */
function writeSettings(settings) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
}

// ────────────────────────────────────────────────────
// GET /api/settings — Saját beállítások lekérése
// ────────────────────────────────────────────────────
router.get("/", (req, res) => {
    const allSettings = readSettings();

    // Ha nincs mentett beállítása a usernek, az alapértelmezetteket adjuk
    const userSettings = allSettings[req.userId] || { ...DEFAULT_SETTINGS };

    res.status(200).json(userSettings);
});

// ────────────────────────────────────────────────────
// PUT /api/settings — Beállítások módosítása
// ────────────────────────────────────────────────────
router.put("/", (req, res) => {
    const allSettings = readSettings();

    // Meglévő beállítások vagy üres objektum
    const current = allSettings[req.userId] || { ...DEFAULT_SETTINGS };

    // Csak a küldött mezőket frissítjük (partial update)
    const { language, timezone, defaultEventColor } = req.body;

    if (language !== undefined) current.language = language;
    if (timezone !== undefined) current.timezone = timezone;
    if (defaultEventColor !== undefined) current.defaultEventColor = defaultEventColor;

    // Mentés az adott userId kulcs alá
    allSettings[req.userId] = current;
    writeSettings(allSettings);

    res.status(200).json(current);
});

module.exports = router;
