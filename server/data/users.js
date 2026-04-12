const fs = require("fs");
const { v4: uuid } = require("uuid");

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

class DuplicateUserError extends Error { }

function addUser({username, email, password}) {
    if (users.find(u => u.email === email)) {
        throw new DuplicateUserError("Email already registered");
    }
    if (users.find(u => u.username === username)) {
        throw new DuplicateUserError("Username already taken");
    }
    const newUser = {id : uuid(), username, email, password};
    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf8');
    const { password: _ , ...publicUser } = newUser;
    return publicUser;
}

module.exports = { findByUsername, addUser, DuplicateUserError };