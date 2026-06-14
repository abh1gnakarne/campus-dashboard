import React, { useState, useEffect } from "react";
import "./Cards.css";

const CATS = ["All", "Technical", "Cultural", "Academic", "Sports", "Placement", "Social"];

export default function EventsCard({ API, full, preview }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    API.get("/data/events/upcoming?limit=20")
      .then((r) => setEvents(r.data.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API]);

  const filtered = filter === "All" ? events : events.filter((e) => e.category === filter);
  const display = preview ? filtered.slice(0, 2) : filtered;

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short",
    });
  }

  const catColors = {
    Technical: "pill-blue", Cultural: "pill-purple", Academic: "pill-green",
    Sports: "pill-orange", Placement: "pill-red", Social: "pill-blue",
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">📅 Events</span>
        <span className="pill pill-blue">{filtered.length} upcoming</span>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /> Loading events...</div>
      ) : (
        <>
          {full && (
            <div className="cat-filters">
              {CATS.map((c) => (
                <button
                  key={c}
                  className={`cat-btn ${filter === c ? "active" : ""}`}
                  onClick={() => setFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <div className="event-list">
            {display.length === 0 && <div className="empty-msg">No events found</div>}
            {display.map((event) => (
              <div key={event.id} className={`event-card event-cat-${event.category}`}>
                <div className="event-title">{event.title}</div>
                <div className="event-meta">
                  <span className="event-date">📆 {formatDate(event.date)}</span>
                  <span className="event-date">⏰ {event.time}</span>
                  <span className={`pill ${catColors[event.category] || "pill-blue"}`}>
                    {event.category}
                  </span>
                </div>
                <div className="event-venue">📍 {event.venue} · by {event.organizer}</div>
                {!preview && (
                  <>
                    <div className="event-desc" style={{ marginTop: 6 }}>{event.description}</div>
                    {event.spots && <div className="event-spots">👥 {event.spots}</div>}
                    {event.registrationLink && (
                      <a className="event-reg" href={event.registrationLink} target="_blank" rel="noreferrer">
                        Register →
                      </a>
                    )}
                  </>
                )}
              </div>
            ))}
            {preview && filtered.length > 2 && (
              <div className="more-hint">+{filtered.length - 2} more events →</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
