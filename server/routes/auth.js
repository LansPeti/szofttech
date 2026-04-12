const express = require("express");
const router = express.Router();
const { findByUsername, addUser, DuplicateUserError } = require("../data/users");

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required!" });
    }

    const user = findByUsername(username);

    if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful" });
})

router.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Minden mező kitöltése kötelező" });
    }

    try {
        addUser({ username, email, password });
    } catch (err) {
        if (err instanceof DuplicateUserError) {
            return res.status(409).json({ message: err.message });
        }

        console.error("Failed to write users file:", err);
        return res.status(500).json({ message: "Belső kiszolgálóhiba" });
    }

    res.status(201).json({ message: "User registered" });
})

module.exports = router;