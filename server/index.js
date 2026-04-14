require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Route importok
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const eventRoutes = require("./routes/events");
const sharingRoutes = require("./routes/sharing");
const userRoutes = require("./routes/user");
const settingsRoutes = require("./routes/settings");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware-ek — CORS engedélyezés és JSON body parsing
app.use(cors());
app.use(express.json());

// Publikus végpontok — Emma: /api/auth prefix (nem kell token)
app.use("/api/auth", authRoutes);

// Védett végpontok (token kötelező — authMiddleware ellenőrzi)
app.use("/api/events", authMiddleware, eventRoutes);
app.use("/api/sharing", authMiddleware, sharingRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/settings", authMiddleware, settingsRoutes);

// Teszt végpont — alap elérhetőség ellenőrzéséhez
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express backend!" });
});

// -- Egyesített (Unified) Deployment a Linux szerverhez --
// Ha létezik a "public" mappa (benne a lefordított React frontenddel), szolgáljuk ki!
const path = require("path");
const fs = require("fs");
const publicPath = path.join(__dirname, "public");

if (fs.existsSync(publicPath)) {
  console.log("Serving static frontend from /public directory");
  app.use(express.static(publicPath));
  
  // SPA Catch-all: ha nem API hívás, és nem konkrét static fájl, akkor az index.html-t adjuk vissza
  // (Kifejezetten Regex-et használunk a '*' string helyett, az Express legújabb verziója miatt)
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Szerver indítása — tesztek alatt NEM indul (supertest kezeli)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export a tesztek számára (supertest igényli)
module.exports = app;