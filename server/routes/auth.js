const express = require("express");
const router = express.Router();
const users = require("../data/users");

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required!" });
    }

    const user = users.find(u => u.username === username);

    if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful" });
})

module.exports = router;