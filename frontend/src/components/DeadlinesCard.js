import React, { useState, useEffect } from "react";
import "./Cards.css";

export default function DeadlinesCard({ API }) {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/data/academics/deadlines")
      .then((r) => setDeadlines(r.data.deadlines || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API]);

  function daysLeft(dateStr) {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function daysClass(days) {
    if (days <= 2) return "days-urgent";
    if (days <= 5) return "days-soon";
    return "days-ok";
  }

  const typeColors = {
    Project: "pill-blue", Assignment: "pill-orange", Lab: "pill-green", Internal: "pill-red",
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">⏰ Deadlines</span>
        {deadlines.length > 0 && (
          <span className="pill pill-orange">{deadlines.length} upcoming</span>
        )}
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /> Loading...</div>
      ) : deadlines.length === 0 ? (
        <div className="empty-msg">No deadlines! Enjoy 🎉</div>
      ) : (
        <div className="deadline-list">
          {deadlines.map((d, i) => {
            const days = daysLeft(d.date);
            return (
              <div key={i} className="deadline-item">
                <div className="deadline-info">
                  <div className="deadline-title">{d.title}</div>
                  <div className="deadline-subject">
                    <span className={`pill ${typeColors[d.type] || "pill-blue"}`}>{d.type}</span>
                    {" "}{d.subject !== "All" && d.subject}
                  </div>
                </div>
                <div className="deadline-right">
                  <div className="deadline-date">
                    {new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </div>
                  <div className={`deadline-days ${daysClass(days)}`}>
                    {days === 0 ? "Today!" : days === 1 ? "Tomorrow!" : `${days}d left`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
