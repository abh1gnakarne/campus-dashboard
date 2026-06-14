// server.js - Main Express server

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import aiRouter from "./routes/ai.js";
import dataRouter from "./routes/data.js";

// DEBUG: Check if Groq key is loaded (remove this after debugging)
const groqKey = process.env.GROQ_API_KEY || "";
if (!groqKey) {
  console.log("❌ GROQ_API_KEY is NOT set in .env");
} else {
  console.log(
    `✅ GROQ_API_KEY loaded: ${groqKey.slice(0, 6)}...${groqKey.slice(-4)} (length: ${groqKey.length})`
  );
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());

// Rate limiting for AI endpoint
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many requests, slow down a bit!" },
});

// Routes
app.use("/api/ai", aiLimiter, aiRouter);
app.use("/api/data", dataRouter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: ["library", "cafeteria", "events", "academics"],
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Campus Dashboard Backend running on port ${PORT}`);
  console.log(`📚 Library MCP: ready`);
  console.log(`🍽️  Cafeteria MCP: ready`);
  console.log(`📅 Events MCP: ready`);
  console.log(`🎓 Academics MCP: ready`);
  console.log(`\n✅ Health check: http://localhost:${PORT}/api/health\n`);
});
