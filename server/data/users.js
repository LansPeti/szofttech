// data/users.js
// ================================================================
// Emma által véglegesített user adatkezelő modul.
// Felhasználókat olvas/ír a users.json fájlból.
// Az addUser uuid-vel generál ID-t, bcrypt-tel hash-el jelszót,
// és inviteToken-t is generál minden új regisztrációnál.
// ================================================================

const fs = require("fs");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcrypt");

const USERS_FILE = 'data/users.json';

const users = loadUsers();

function loadUsers() {
    console.log("Loading users from ", USERS_FILE);
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        const parsed = JSON.parse(data).users;
        console.log("Users loaded");
        return parsed;
    } catch (err) {
        console.warn("users.json not found or invalid, returning empty list");
        return [];
    }
}

function findByUsername(username) {
    return users.find(u => u.username === username);
}

// Keresés ID alapján — a user.js route használja (profil, meghívó link)
function findById(id) {
    return users.find(u => u.id === id);
}

function findByInviteToken(token) {
    return users.find(u => u.inviteToken === token);
}

class DuplicateUserError extends Error { }

function addUser({username, email, password, securityQuestion, securityAnswer}) {
    if (users.find(u => u.email === email)) {
        throw new DuplicateUserError("Ezzel az e-mail címmel már létezik felhasználó");
    }
    if (users.find(u => u.username === username)) {
        throw new DuplicateUserError("Ez a felhasználónév már foglalt");
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    const securityAnswerHash = bcrypt.hashSync(securityAnswer.toLowerCase().trim(), 10);

    const newUser = {
        id : uuid(),
        username,
        email,
        passwordHash,
        securityQuestion,
        securityAnswerHash,
        avatarColor : "#C2B280",
        inviteToken : uuid(),
        createdAt : new Date().toISOString()
    };
    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf8');
    return { id: newUser.id, username: newUser.username, email: newUser.email };
}

function updateUserProfile(id, { username, avatarColor }) {
    const user = users.find(u => u.id === id);
    if (!user) return null;
    
    // Ellenőrizzük, hogy a kívánt felhasználónév nem foglalt-e egy MÁSIK felhasználónál
    if (username !== undefined && username !== user.username) {
        const taken = users.find(u => u.username === username && u.id !== id);
        if (taken) {
            throw new DuplicateUserError("Ez a felhasználónév már foglalt!");
        }
        user.username = username;
    }
    if (avatarColor !== undefined) user.avatarColor = avatarColor;
    
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf8');
    return user;
}

function updateUserPassword(username, newPasswordHash) {
    const user = users.find(u => u.username === username);
    if (user) {
        user.passwordHash = newPasswordHash;
        fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf8');
    }
}

module.exports = { findByUsername, findById, findByInviteToken, addUser, updateUserPassword, updateUserProfile, DuplicateUserError };