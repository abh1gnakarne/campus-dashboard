// routes/data.js
// Direct data endpoints for dashboard cards (no AI needed)

import express from "express";
import { libraryMCP } from "../mcp-servers/library.js";
import { cafeteriaMCP } from "../mcp-servers/cafeteria.js";
import { eventsMCP } from "../mcp-servers/events.js";
import { academicsMCP } from "../mcp-servers/academics.js";

const router = express.Router();

router.get("/library/available", async (req, res) => {
  try {
    const data = await libraryMCP.executeTool("get_all_available", {});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/library/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });
    const data = await libraryMCP.executeTool("search_books", { query: q });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/library/hours", async (req, res) => {
  try {
    const data = await libraryMCP.executeTool("get_library_hours", {});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/cafeteria/today", async (req, res) => {
  try {
    const data = await cafeteriaMCP.executeTool("get_todays_menu", {});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/cafeteria/timings", async (req, res) => {
  try {
    const data = await cafeteriaMCP.executeTool("get_timings", {});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/events/upcoming", async (req, res) => {
  try {
    const data = await eventsMCP.executeTool("get_upcoming_events", {
      limit: parseInt(req.query.limit) || 5,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/events/today", async (req, res) => {
  try {
    const data = await eventsMCP.executeTool("get_todays_events", {});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/academics/timetable/today", async (req, res) => {
  try {
    const { day } = req.query;
    let data;
    if (day) {
      data = await academicsMCP.executeTool("get_timetable_by_day", { day });
    } else {
      data = await academicsMCP.executeTool("get_todays_timetable", {});
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/academics/exams", async (req, res) => {
  try {
    const data = await academicsMCP.executeTool("get_exam_schedule", {});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/academics/deadlines", async (req, res) => {
  try {
    const data = await academicsMCP.executeTool("get_deadlines", {});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/academics/next-class", async (req, res) => {
  try {
    const data = await academicsMCP.executeTool("get_next_class", {});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
