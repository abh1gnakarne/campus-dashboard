import React, { useState, useEffect } from "react";
import "./Cards.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getCurrentDay() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function isCurrentClass(timeStr) {
  const now = new Date();
  const [start, end] = timeStr.split(" - ");
  const toMin = (t) => {
    const [h, m] = t.replace(/[^\d:]/g, "").split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= toMin(start) && nowMin <= toMin(end);
}

export default function TimetableCard({ API, full, preview }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());

  useEffect(() => {
    const endpoint =
      selectedDay === getCurrentDay()
        ? "/data/academics/timetable/today"
        : `/data/academics/timetable/today?day=${selectedDay}`;

    // For a specific day other than today, use the AI data endpoint
    if (selectedDay !== getCurrentDay()) {
      API.post("/ai/chat", {
        message: `get timetable for ${selectedDay}`,
      })
        .then(() => {})
        .catch(() => {});
      // For non-today we use mock from the day tabs (just re-fetch with same endpoint noting the day)
    }

    API.get("/data/academics/timetable/today")
      .then((r) => {
        if (selectedDay === getCurrentDay()) {
          setClasses(r.data.classes || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API, selectedDay]);

  // For non-today days, use the data from the MCP server via a separate fetch
  useEffect(() => {
    setLoading(true);
    const today = getCurrentDay();
    if (selectedDay === today) {
      API.get("/data/academics/timetable/today")
        .then((r) => setClasses(r.data.classes || []))
        .catch(() => setClasses([]))
        .finally(() => setLoading(false));
    } else {
      // Call the timetable for other days via the backend
      fetch(`/api/data/academics/timetable/today?day=${selectedDay}`)
        .then((r) => r.json())
        .then((d) => setClasses(d.classes || []))
        .catch(() => {
          // Fallback: show empty for other days since we need backend route
          setClasses([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedDay, API]);

  const display = preview ? classes.slice(0, 3) : classes;
  const today = getCurrentDay();

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">🗓️ Timetable</span>
        <span className="pill pill-blue">{classes.length} classes</span>
      </div>

      {full && (
        <div className="day-selector">
          {DAYS.map((day) => (
            <button
              key={day}
              className={`day-btn ${selectedDay === day ? "active" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              {day.slice(0, 3)}
              {day === today && <span className="current-badge">●</span>}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loader"><div className="spinner" /> Loading classes...</div>
      ) : display.length === 0 ? (
        <div className="empty-msg">No classes {selectedDay === today ? "today" : `on ${selectedDay}`}! 🎉</div>
      ) : (
        <div className="class-list">
          {display.map((cls, i) => (
            <div key={i} className={`class-item ${isCurrentClass(cls.time) ? "current" : ""}`}>
              <div className="class-time">{cls.time}</div>
              <div className="class-info">
                <div className="class-subject">
                  {cls.subject}
                  {isCurrentClass(cls.time) && (
                    <span className="pill pill-green" style={{ marginLeft: 8 }}>Now</span>
                  )}
                </div>
                <div className="class-details">{cls.faculty}</div>
              </div>
              <div className="class-room">{cls.room}</div>
            </div>
          ))}
          {preview && classes.length > 3 && (
            <div className="more-hint">+{classes.length - 3} more classes →</div>
          )}
        </div>
      )}
    </div>
  );
}
