// config.js
// ================================================================
// Központi konfiguráció — Emma által létrehozva.
// A JWT_SECRET-et a .env-ből olvassa, fallback-kel.
// ================================================================

const JWT_SECRET = process.env.JWT_SECRET || "szoftech-secret-key";

module.exports = { JWT_SECRET };
