import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import Emergency from "./models/Emergency.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ===================================
   CORS CONFIGURATION (IMPORTANT)
=================================== */

const allowedOrigin = "https://raksha-one.netlify.app";

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());

/* ===================================
   SOCKET.IO WITH CORS
=================================== */

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

/* ===================================
   MongoDB Connection
=================================== */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

/* ===================================
   Routes
=================================== */

app.get("/", (req, res) => {
  res.send("Raksha Backend Running 🚑");
});

/* Create Emergency */
app.post("/emergency", async (req, res) => {
  try {
    const emergency = await Emergency.create(req.body);

    // Emit real-time update
    io.emit("newEmergency", emergency);

    res.status(201).json(emergency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Get All Emergencies */
app.get("/emergency", async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({
      createdAt: -1,
    });
    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Update Emergency */
app.put("/emergency/:id", async (req, res) => {
  try {
    const updated = await Emergency.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    io.emit("updateEmergency", updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================================
   Socket Connection
=================================== */

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

/* ===================================
   Start Server
=================================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});