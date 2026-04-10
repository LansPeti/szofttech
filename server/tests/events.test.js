const request = require("supertest");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const app = require("../index");

const eventsFilePath = path.join(__dirname, "../data/events.json");
const JWT_SECRET = process.env.JWT_SECRET || "szoftech-secret-key";

let token;
let createdEventId;

// Teszt user token generálása
beforeAll(() => {
  token = jwt.sign(
    { id: "test-user-1", username: "testuser" },
    JWT_SECRET
  );
});

// Minden teszt előtt ürítjük a JSON fájlt
beforeEach(() => {
  fs.writeFileSync(eventsFilePath, JSON.stringify([]));
});

//////////////////////////////////////////////////////
// POST /api/events
//////////////////////////////////////////////////////

test("POST /api/events - létrehoz eseményt", async () => {
  const res = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Teszt esemény",
      start: "2026-04-10T09:00:00Z",
    });

  expect(res.statusCode).toBe(201);
  expect(res.body.title).toBe("Teszt esemény");
  expect(res.body.id).toBeDefined();

  createdEventId = res.body.id;
});

test("POST /api/events - hiányzó mező", async () => {
  const res = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${token}`)
    .send({});

  expect(res.statusCode).toBe(400);
});

//////////////////////////////////////////////////////
// GET /api/events
//////////////////////////////////////////////////////

test("GET /api/events - visszaadja a saját eseményeket", async () => {
  // először létrehozunk egy eseményt
  await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Lista teszt",
      start: "2026-04-10T09:00:00Z",
    });

  const res = await request(app)
    .get("/api/events")
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.length).toBe(1);
  expect(res.body[0].title).toBe("Lista teszt");
});

//////////////////////////////////////////////////////
// PUT /api/events/:id
//////////////////////////////////////////////////////

test("PUT /api/events/:id - módosítja az eseményt", async () => {
  const createRes = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Eredeti cím",
      start: "2026-04-10T09:00:00Z",
    });

  const id = createRes.body.id;

  const updateRes = await request(app)
    .put(`/api/events/${id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Módosított cím",
    });

  expect(updateRes.statusCode).toBe(200);
  expect(updateRes.body.title).toBe("Módosított cím");
});

test("PUT /api/events/:id - 404 ha nem létezik", async () => {
  const res = await request(app)
    .put("/api/events/nemletezo")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Valami" });

  expect(res.statusCode).toBe(404);
});

//////////////////////////////////////////////////////
// DELETE /api/events/:id
//////////////////////////////////////////////////////

test("DELETE /api/events/:id - törli az eseményt", async () => {
  const createRes = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Törlendő",
      start: "2026-04-10T09:00:00Z",
    });

  const id = createRes.body.id;

  const deleteRes = await request(app)
    .delete(`/api/events/${id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(deleteRes.statusCode).toBe(204);

  const getRes = await request(app)
    .get("/api/events")
    .set("Authorization", `Bearer ${token}`);

  expect(getRes.body.length).toBe(0);
});