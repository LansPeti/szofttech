const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const sharesFilePath = path.join(__dirname, "../data/shares.json");
const usersFilePath = path.join(__dirname, "../data/users.json");
const eventsFilePath = path.join(__dirname, "../data/events.json");

//////////////////////////////////////////////////////
// Segédfüggvények
//////////////////////////////////////////////////////

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(filePath));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}


//////////////////////////////////////////////////////
// GET /api/sharing/invites
// Bejövő PENDING meghívók
//////////////////////////////////////////////////////

router.get("/invites", (req, res) => {
  const shares = readJson(sharesFilePath);
  const users = readJson(usersFilePath);

  const invites = shares
    .filter(
      (s) =>
        s.sharedWithId === req.userId &&
        s.status === "PENDING"
    )
    .map((share) => {
      const owner = users.find((u) => u.id === share.ownerId);

      return {
        id: share.id,
        owner: {
          id: owner?.id,
          username: owner?.username,
        },
        status: share.status,
        createdAt: share.createdAt,
      };
    });

  res.status(200).json(invites);
});
