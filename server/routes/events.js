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

  // Cím és kezdő dátum kötelező
  if (!title || !start) {
    return res
      .status(400)
      .json({ error: "A 'title' és 'start' mező kötelező" });
  }

  // Dátum validáció — megakadályozzuk az Invalid Date crash-t
  const startDate = new Date(start);
  if (isNaN(startDate.getTime())) {
    return res.status(400).json({ error: "Érvénytelen kezdő dátum formátum" });
  }

  let endDate = null;
  if (end) {
    endDate = new Date(end);
    if (isNaN(endDate.getTime())) {
      return res.status(400).json({ error: "Érvénytelen befejező dátum formátum" });
    }
  }

  const events = readEvents();

  const newEvent = {
    id: uuidv4(),
    userId: req.userId,
    title,
    description: description || "",
    start: startDate.toISOString(),
    end: endDate ? endDate.toISOString() : null,
    allDay: allDay || false,
    color: color || "#C2B280",
  };

  events.push(newEvent);
  writeEvents(events);

  // userId-t nem küldjük vissza a frontendnek
  const { userId, ...responseEvent } = newEvent;

  res.status(201).json(responseEvent);
});




//////////////////////////////////////////////////////
// PUT /api/events/:id
// Esemény módosítása
//////////////////////////////////////////////////////
router.put("/:id", (req, res) => {
  const events = readEvents();
  const eventIndex = events.findIndex((e) => e.id === req.params.id);

  if (eventIndex === -1) {
    return res.status(404).json({ error: "Esemény nem található" });
  }

  const event = events[eventIndex];

  if (event.userId !== req.userId) {
    return res
      .status(403)
      .json({ error: "Nincs jogosultságod ehhez az eseményhez" });
  }

  const { title, description, start, end, allDay, color } = req.body;

  // Dátum validáció — ha küldték, ellenőrizzük, hogy érvényesek-e
  if (title !== undefined) event.title = title;
  if (description !== undefined) event.description = description;
  if (start !== undefined) {
    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ error: "Érvénytelen kezdő dátum formátum" });
    }
    event.start = startDate.toISOString();
  }
  if (end !== undefined) {
    if (end) {
      const endDate = new Date(end);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Érvénytelen befejező dátum formátum" });
      }
      event.end = endDate.toISOString();
    } else {
      event.end = null;
    }
  }
  if (allDay !== undefined) event.allDay = allDay;
  if (color !== undefined) event.color = color;

  events[eventIndex] = event;
  writeEvents(events);

  const { userId, ...responseEvent } = event;

  res.status(200).json(responseEvent);
});


//////////////////////////////////////////////////////
// DELETE /api/events/:id
// Esemény törlése
//////////////////////////////////////////////////////
router.delete("/:id", (req, res) => {
  const events = readEvents();
  const eventIndex = events.findIndex((e) => e.id === req.params.id);

  if (eventIndex === -1) {
    return res.status(404).json({ error: "Esemény nem található" });
  }

  const event = events[eventIndex];

  if (event.userId !== req.userId) {
    return res
      .status(403)
      .json({ error: "Nincs jogosultságod ehhez az eseményhez" });
  }

  events.splice(eventIndex, 1);
  writeEvents(events);

  res.status(204).send();
});

module.exports = router;