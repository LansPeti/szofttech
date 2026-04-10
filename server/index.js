const express = require("express");
const cors = require("cors");

// Route importok
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const eventRoutes = require("./routes/events");
const sharingRoutes = require("./routes/sharing");
const userRoutes = require("./routes/user");

const app = express();
const PORT = 5000;

// Middleware-ek — CORS engedélyezés és JSON body parsing
app.use(cors());
app.use(express.json());

// Publikus végpontok (nem kell token)
app.use("/api", authRoutes);

// Védett végpontok (token kötelező — authMiddleware ellenőrzi)
app.use("/api/events", authMiddleware, eventRoutes);
app.use("/api/sharing", authMiddleware, sharingRoutes);
app.use("/api/user", authMiddleware, userRoutes);

// Teszt végpont — alap elérhetőség ellenőrzéséhez
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express backend!" });
});

// Szerver indítása — tesztek alatt NEM indul (supertest kezeli)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export a tesztek számára (supertest igényli)
module.exports = app;