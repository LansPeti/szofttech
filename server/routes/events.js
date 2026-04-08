const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const eventsFilePath = path.join(__dirname, "../data/events.json");

// Segédfüggvény: fájl beolvasása
function readEvents() {
  if (!fs.existsSync(eventsFilePath)) {
    fs.writeFileSync(eventsFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(eventsFilePath);
  return JSON.parse(data);
}

// Segédfüggvény: fájl mentése
function writeEvents(events) {
  fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2));
}

//////////////////////////////////////////////////////
// GET /api/events
// Saját események listázása + opcionális dátumszűrés
//////////////////////////////////////////////////////
router.get("/", (req, res) => {
  const events = readEvents();

  let userEvents = events.filter(
    (event) => event.userId === req.userId
  );

  const { start, end } = req.query;

  if (start && end) {
    const startDate = new Date(start)
    const endDate = new Date(end)

    userEvents = userEvents.filter((event) => {
      const eventStart = new Date(event.start);
      return eventStart >= startDate && eventStart <= endDate;
    });
  }

  res.status(200).json(
    userEvents.map(({ userId, ...rest }) => rest) // userId-t nem küldjük vissza
  );
});


//////////////////////////////////////////////////////
// POST /api/events
// Új esemény létrehozása
//////////////////////////////////////////////////////
router.post("/", (req, res) => {
  const { title, description, start, end, allDay, color } = req.body;

  if (!title || !start) {
    return res
      .status(400)
      .json({ error: "A 'title' és 'start' mező kötelező" });
  }

  const events = readEvents();

  const newEvent = {
    id: uuidv4(),
    userId: req.userId,
    title,
    description: description || "",
    start: new Date(start).toISOString(),
    end: end ? new Date(end).toISOString() : null,
    allDay: allDay || false,
    color: color || "#C2B280",
  };

  events.push(newEvent);
  writeEvents(events);

  const { userId, ...responseEvent } = newEvent;  //Note: userId tudja a frontend?

  res.status(201).json(responseEvent);
});