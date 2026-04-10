// data/users.js
// ================================================================
// Felhasználók kezelése — JSON fájl alapú tárolás.
//
// Funkciók:
//   - loadUsers()     : users.json beolvasása induláskor
//   - findByUsername() : keresés felhasználónév alapján
//   - findById()      : keresés ID alapján (profil lekérés)
//   - addUser()       : új felhasználó mentése (duplikáció ellenőrzéssel)
//
// A users.json formátuma: [ { id, username, email, passwordHash, ... }, ... ]
// ================================================================

const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(__dirname, "users.json");

// Memóriában tartott user lista — induláskor betöltjük a fájlból
let users = loadUsers();

/**
 * Users.json fájl betöltése.
 * Ha nem létezik vagy hibás, üres tömböt ad vissza.
 */
function loadUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, "utf8");
        const parsed = JSON.parse(data);
        // Támogatás a régi { users: [...] } és az új [...] formátumra is
        const userList = Array.isArray(parsed) ? parsed : (parsed.users || []);
        console.log(`Users loaded: ${userList.length} felhasználó`);
        return userList;
    } catch (err) {
        console.warn("users.json not found or invalid, returning empty list");
        return [];
    }
}

/**
 * Felhasználó keresése felhasználónév alapján.
 * @param {string} username
 * @returns {Object|undefined} - A user objektum vagy undefined
 */
function findByUsername(username) {
    return users.find((u) => u.username === username);
}

/**
 * Felhasználó keresése ID alapján (profil lekérdezéshez).
 * @param {string} id
 * @returns {Object|undefined} - A user objektum vagy undefined
 */
function findById(id) {
    return users.find((u) => u.id === id);
}

/**
 * Duplikáció hiba — ha a username vagy email már foglalt.
 */
class DuplicateUserError extends Error {}

/**
 * Új felhasználó hozzáadása és mentése a JSON fájlba.
 * Ellenőrzi, hogy a username és email egyedi-e.
 * @param {Object} user - A teljes user objektum (id, username, email, passwordHash, ...)
 * @throws {DuplicateUserError} - Ha a username vagy email már foglalt
 */
function addUser(user) {
    if (users.find((u) => u.email === user.email)) {
        throw new DuplicateUserError("Ez az email cím már foglalt");
    }
    if (users.find((u) => u.username === user.username)) {
        throw new DuplicateUserError("Ez a felhasználónév már foglalt");
    }
    users.push(user);
    // Mentés: az új formátum sima tömb (nem { users: [...] })
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

module.exports = { findByUsername, findById, addUser, DuplicateUserError };