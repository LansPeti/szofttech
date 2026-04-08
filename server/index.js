const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const eventRoutes = require("./routes/events");



const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/events", authMiddleware, eventRoutes);


app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express backend!" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;