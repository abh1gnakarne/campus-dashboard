import React, { useState, useEffect } from "react";
import axios from "axios";
import "./KPIBar.css";

const API = axios.create({ baseURL: "/api" });

export default function KPIBar({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/ai/summary")
      .then((r) => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="kpi-bar">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="kpi-card skeleton" />
      ))}
    </div>
  );

  const nextClass = data?.nextClass;
  const urgentDeadline = data?.upcomingDeadlines?.[0];
  const daysUntilDeadline = urgentDeadline
    ? Math.ceil((new Date(urgentDeadline.date) - new Date()) / 86400000)
    : null;

  return (
    <div className="kpi-bar">
      {/* Today's Events */}
      <div className="kpi-card" onClick={() => setActiveTab("events")} title="Click to view events">
        <div className="kpi-icon" style={{background:"rgba(79,142,247,0.12)", color:"var(--accent)"}}>📅</div>
        <div className="kpi-info">
          <div className="kpi-value">{data?.todayEventsCount ?? 0}</div>
          <div className="kpi-label">Events Today</div>
          {data?.todayEvents?.[0] && (
            <div className="kpi-sub">{data.todayEvents[0].title.length > 20
              ? data.todayEvents[0].title.slice(0, 20) + "…"
              : data.todayEvents[0].title}</div>
          )}
        </div>
      </div>

      {/* Next Class */}
      <div className="kpi-card" onClick={() => setActiveTab("academics")} title="Click to view timetable">
        <div className="kpi-icon" style={{background:"rgba(167,139,250,0.12)", color:"var(--accent2)"}}>🎓</div>
        <div className="kpi-info">
          <div className="kpi-value" style={{fontSize:"13px", marginTop:"2px"}}>
            {nextClass ? nextClass.subject.split(" ")[0] : "Free"}
          </div>
          <div className="kpi-label">Next Class</div>
          {nextClass && <div className="kpi-sub">{nextClass.time.split(" - ")[0]} · {nextClass.room}</div>}
          {!nextClass && <div className="kpi-sub">No more classes today</div>}
        </div>
      </div>

      {/* Today's Lunch Special */}
      <div className="kpi-card" onClick={() => setActiveTab("cafeteria")} title="Click to view menu">
        <div className="kpi-icon" style={{background:"rgba(251,146,60,0.12)", color:"var(--accent4)"}}>🍽️</div>
        <div className="kpi-info">
          <div className="kpi-value" style={{fontSize:"12px", marginTop:"2px"}}>
            {data?.lunchSpecial ? "Special!" : (data?.lunchItems?.[0] || "Lunch")}
          </div>
          <div className="kpi-label">Today's Lunch</div>
          {data?.lunchSpecial && <div className="kpi-sub kpi-special">{data.lunchSpecial}</div>}
          {!data?.lunchSpecial && data?.lunchItems?.[1] && (
            <div className="kpi-sub">{data.lunchItems.slice(1,3).join(", ")}</div>
          )}
        </div>
      </div>

      {/* Upcoming Deadline */}
      <div className="kpi-card" onClick={() => setActiveTab("academics")} title="Click to view deadlines">
        <div className="kpi-icon" style={{
          background: daysUntilDeadline <= 3 ? "rgba(248,113,113,0.12)" : "rgba(52,211,153,0.12)",
          color: daysUntilDeadline <= 3 ? "var(--red)" : "var(--accent3)"
        }}>⏰</div>
        <div className="kpi-info">
          <div className="kpi-value" style={{
            fontSize:"13px", marginTop:"2px",
            color: daysUntilDeadline <= 3 ? "var(--red)" : undefined
          }}>
            {urgentDeadline ? `${daysUntilDeadline}d left` : "None"}
          </div>
          <div className="kpi-label">Next Deadline</div>
          {urgentDeadline && (
            <div className="kpi-sub">{urgentDeadline.title.length > 22
              ? urgentDeadline.title.slice(0, 22) + "…"
              : urgentDeadline.title}</div>
          )}
        </div>
      </div>

      {/* Library Books Available */}
      <div className="kpi-card" onClick={() => setActiveTab("library")} title="Click to view library">
        <div className="kpi-icon" style={{background:"rgba(52,211,153,0.12)", color:"var(--accent3)"}}>📚</div>
        <div className="kpi-info">
          <div className="kpi-value">{data?.availableBooks ?? "—"}</div>
          <div className="kpi-label">Books Available</div>
          <div className="kpi-sub">In campus library</div>
        </div>
      </div>
    </div>
  );
}
