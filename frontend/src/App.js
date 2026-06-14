import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatBot from "./components/ChatBot";
import LibraryCard from "./components/LibraryCard";
import CafeteriaCard from "./components/CafeteriaCard";
import EventsCard from "./components/EventsCard";
import TimetableCard from "./components/TimetableCard";
import DeadlinesCard from "./components/DeadlinesCard";
import KPIBar from "./components/KPIBar";
import "./App.css";

const API = axios.create({ baseURL: "/api" });

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [nextClass, setNextClass] = useState(null);
  const [todayEvents, setTodayEvents] = useState([]);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    API.get("/data/academics/next-class")
      .then((r) => setNextClass(r.data))
      .catch(() => {});

    API.get("/data/events/today")
      .then((r) => setTodayEvents(r.data.events || []))
      .catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "library", label: "Library", icon: "📚" },
    { id: "cafeteria", label: "Cafeteria", icon: "🍽️" },
    { id: "events", label: "Events", icon: "📅" },
    { id: "academics", label: "Academics", icon: "🎓" },
  ];

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🏫</span>
          <div>
            <div className="logo-name">CampusBot</div>
            <div className="logo-sub">MARS Section · 2026</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`ai-btn ${chatOpen ? "active" : ""}`}
            onClick={() => setChatOpen((p) => !p)}
          >
            <span>🤖</span>
            <span>Ask CampusBot</span>
          </button>
          <div className="sidebar-mcp-info">
            <div className="mcp-label">MCP Servers</div>
            <div className="mcp-dots">
              <span className="mcp-dot" title="Library MCP">📚</span>
              <span className="mcp-dot" title="Cafeteria MCP">🍽️</span>
              <span className="mcp-dot" title="Events MCP">📅</span>
              <span className="mcp-dot" title="Academics MCP">🎓</span>
            </div>
          </div>
          <div className="sidebar-date">{today}</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">
        {/* Top bar */}
        <header className="topbar">
          <div>
            <div className="topbar-greeting">{greeting}, student! 👋</div>
            <div className="topbar-sub">
              {nextClass?.found
                ? `Next up: ${nextClass.class?.subject} at ${nextClass.class?.time}`
                : "No more classes today"}
            </div>
          </div>
          <div className="topbar-alerts">
            {todayEvents.length > 0 && (
              <span className="alert-badge" onClick={() => setActiveTab("events")}>
                🔔 {todayEvents.length} event{todayEvents.length > 1 ? "s" : ""} today
              </span>
            )}
            <span className="mcp-status-badge" title="All MCP servers active">
              ⚡ 4 MCP Servers Active
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="content">
          {activeTab === "dashboard" && (
            <DashboardPage API={API} setActiveTab={setActiveTab} />
          )}
          {activeTab === "library" && <LibraryCard API={API} full />}
          {activeTab === "cafeteria" && <CafeteriaCard API={API} full />}
          {activeTab === "events" && <EventsCard API={API} full />}
          {activeTab === "academics" && (
            <div className="academics-page">
              <TimetableCard API={API} full />
              <div className="academics-row">
                <DeadlinesCard API={API} />
                <ExamCard API={API} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Chatbot */}
      {chatOpen && <ChatBot onClose={() => setChatOpen(false)} />}

      {/* FAB when chat closed */}
      {!chatOpen && (
        <button className="fab" onClick={() => setChatOpen(true)} title="Ask CampusBot">
          🤖
        </button>
      )}
    </div>
  );
}

function DashboardPage({ API, setActiveTab }) {
  return (
    <div className="dashboard-wrap">
      {/* KPI Overview Bar */}
      <div className="section-heading">
        <span className="section-title">📊 Today's Overview</span>
        <span className="section-sub">Live data from all 4 MCP servers</span>
      </div>
      <KPIBar setActiveTab={setActiveTab} />

      {/* Cards Grid */}
      <div className="section-heading">
        <span className="section-title">🏫 Campus Modules</span>
        <span className="section-sub">Click any card to expand</span>
      </div>
      <div className="dashboard-grid">
        <div className="dash-card-wrap" onClick={() => setActiveTab("cafeteria")}>
          <CafeteriaCard API={API} preview />
        </div>
        <div className="dash-card-wrap" onClick={() => setActiveTab("events")}>
          <EventsCard API={API} preview />
        </div>
        <div className="dash-card-wrap" onClick={() => setActiveTab("academics")}>
          <TimetableCard API={API} preview />
        </div>
        <div className="dash-card-wrap" onClick={() => setActiveTab("library")}>
          <LibraryCard API={API} preview />
        </div>
      </div>
    </div>
  );
}

function ExamCard({ API }) {
  const [exams, setExams] = useState([]);
  useEffect(() => {
    API.get("/data/academics/exams")
      .then((r) => setExams(r.data.exams || []))
      .catch(() => {});
  }, [API]);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">📝 Exam Schedule</span>
      </div>
      <div className="exam-list">
        {exams.slice(0, 5).map((exam, i) => (
          <div key={i} className="exam-item">
            <div className="exam-subject">{exam.subject}</div>
            <div className="exam-meta">
              <span>{new Date(exam.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              <span>{exam.time}</span>
              <span className="exam-hall">{exam.hall}</span>
            </div>
          </div>
        ))}
        {exams.length === 0 && <div className="empty-msg">No exams scheduled</div>}
      </div>
    </div>
  );
}
