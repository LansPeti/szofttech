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



//////////////////////////////////////////////////////
// POST /api/sharing/invite
//////////////////////////////////////////////////////

router.post("/invite", (req, res) => {
  const { inviteToken } = req.body;

  const users = readJson(usersFilePath);
  const shares = readJson(sharesFilePath);

  const owner = users.find((u) => u.inviteToken === inviteToken);

  if (!owner) {
    return res.status(404).json({ error: "Érvénytelen meghívó token" });
  }

  if (owner.id === req.userId) {
    return res.status(400).json({ error: "Saját magadat nem hívhatod meg" });
  }

  const existingShare = shares.find(
    (s) =>
      s.ownerId === owner.id &&
      s.sharedWithId === req.userId
  );

  if (existingShare) {
    return res.status(409).json({ error: "Már létezik megosztás köztetek" });
  }

  const newShare = {
    id: uuidv4(),
    ownerId: owner.id,
    sharedWithId: req.userId,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  shares.push(newShare);
  writeJson(sharesFilePath, shares);

  res.status(201).json({
    id: newShare.id,
    ownerId: newShare.ownerId,
    sharedWithId: newShare.sharedWithId,
    status: newShare.status,
  });
});



//////////////////////////////////////////////////////
// PUT /api/sharing/invites/:id/accept
//////////////////////////////////////////////////////

router.put("/invites/:id/accept", (req, res) => {
  updateInviteStatus(req, res, "ACCEPTED");
});

//////////////////////////////////////////////////////
// PUT /api/sharing/invites/:id/reject
//////////////////////////////////////////////////////

router.put("/invites/:id/reject", (req, res) => {
  updateInviteStatus(req, res, "REJECTED");
});

function updateInviteStatus(req, res, newStatus) {
  const shares = readJson(sharesFilePath);
  const share = shares.find((s) => s.id === req.params.id);

  if (!share) {
    return res.status(404).json({ error: "Meghívó nem található" });
  }

  if (share.sharedWithId !== req.userId) {
    return res.status(403).json({ error: "Nincs jogosultságod" });
  }

  share.status = newStatus;
  writeJson(sharesFilePath, shares);

  res.status(200).json({
    id: share.id,
    status: share.status,
  });
}


//////////////////////////////////////////////////////
// GET /api/sharing/calendars
//////////////////////////////////////////////////////

router.get("/calendars", (req, res) => {
  const shares = readJson(sharesFilePath);
  const users = readJson(usersFilePath);

  const calendars = shares
    .filter(
      (s) =>
        s.sharedWithId === req.userId &&
        s.status === "ACCEPTED"
    )
    .map((share) => {
      const owner = users.find((u) => u.id === share.ownerId);

      return {
        id: share.id,
        owner: {
          id: owner?.id,
          username: owner?.username,
        },
        sharedSince: share.createdAt,
      };
    });

  res.status(200).json(calendars);
});