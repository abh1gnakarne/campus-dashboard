# 🏫 CampusBot — Unified Campus Intelligence Dashboard

> MARS Open Projects 2026 | Web Development — Problem Statement 1

A unified web dashboard with an AI assistant that routes natural-language queries to **independent MCP (Model Context Protocol) servers** for each campus data source — library, cafeteria, events, and academics.

---

## 🎯 Features

- **AI Assistant (CampusBot)** — Ask anything in plain English; AI routes to the right MCP server(s)
- **Multi-source queries** — "What's for lunch and do I have events today?" → calls Cafeteria MCP + Events MCP **simultaneously**
- **📊 KPI Dashboard Bar** — Live stats: today's events count, next class, lunch special, upcoming deadline, library availability
- **📚 Library MCP** — Book availability, search (campus + Open Library API), hours
- **🍽️ Cafeteria MCP** — Today's menu, meal timings, weekly schedule
- **📅 Events MCP** — Upcoming events, workshops, fests; Google Calendar integration optional
- **🎓 Academics MCP** — Day-wise timetable, exam schedule, assignment deadlines
- **Unified Dashboard** — All sources in one view, no single giant database

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Student's Browser                           │
│                    React.js Frontend                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │Library   │  │Cafeteria │  │Events    │  │Academics     │  │
│  │Card      │  │Card      │  │Card      │  │Card          │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │              │                │           │
│  ┌────┴──────────────┴──────────────┴────────────────┴──────┐  │
│  │                     KPI Bar (Overview)                    │  │
│  └───────────────────────────────┬───────────────────────────┘  │
│                                  │                               │
│  ┌───────────────────────────────┴───────────────────────────┐  │
│  │                   CampusBot AI Chat                       │  │
│  └───────────────────────────────┬───────────────────────────┘  │
└──────────────────────────────────┼──────────────────────────────┘
                                   │ REST API (HTTP)
                   ┌───────────────▼───────────────┐
                   │    Node.js / Express Backend   │
                   │                                │
                   │  POST /api/ai/chat             │
                   │  GET  /api/ai/summary          │
                   │  GET  /api/data/*              │
                   └───────────────┬───────────────┘
                                   │
              ┌────────────────────▼──────────────────────┐
              │         Groq API (FREE TIER)               │
              │      llama-3.3-70b-versatile                │
              │    Function-calling for MCP routing        │
              │   (OpenAI-compatible, via "openai" SDK)    │
              └────────┬──────────────────────────────────┘
                       │ Parallel tool calls
        ┌──────────────┼──────────────────────┐
        │              │              │        │
   ┌────▼─────┐  ┌─────▼────┐  ┌────▼─────┐  ┌▼──────────┐
   │ Library  │  │Cafeteria │  │  Events  │  │ Academics │
   │  MCP     │  │  MCP     │  │   MCP    │  │   MCP     │
   │ Server   │  │ Server   │  │  Server  │  │  Server   │
   └────┬─────┘  └──────────┘  └────┬─────┘  └───────────┘
        │                            │
   ┌────▼──────┐             ┌───────▼────────┐
   │Open       │             │ Google Calendar│
   │Library API│             │ API (optional) │
   └───────────┘             └────────────────┘
```

### How MCP Routing Works

1. Student types: *"What events do I have today and what's for lunch?"*
2. Claude AI identifies the query spans **two domains** (events + cafeteria)
3. Llama 3.3 70B (via Groq) calls `events__get_todays_events` and `cafeteria__get_meal` **in parallel** (one response can contain multiple `tool_calls`)
4. Both MCP servers respond independently
5. The model combines results into one natural-language answer
6. Frontend shows which MCP servers were queried (source tags)

Each MCP server (`mcp-servers/*.js`) exposes:
- A list of **tools** (with JSON schema)
- An `executeTool(name, args)` method

The AI backend converts these tool schemas into OpenAI-style **function/tool definitions**, and the model (via Groq's OpenAI-compatible API) decides which function(s) to call based on the student's query.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- A free Groq API key (see below)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/campus-dashboard.git
cd campus-dashboard

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Get a Free Groq API Key

1. Go to https://console.groq.com/keys
2. Sign in (Google account works, no credit card needed)
3. Click **Create API Key**
4. Copy the key (starts with `gsk_...`)

### 3. Set Up Environment

```bash
cd backend
cp .env.example .env
# Paste your key: GROQ_API_KEY=gsk_...
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend  
cd frontend && npm start
```

Open http://localhost:3000 🎉

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Free Groq API key from console.groq.com/keys |
| `GOOGLE_CALENDAR_API_KEY` | Optional | For live events from Google Calendar |
| `GOOGLE_CALENDAR_ID` | Optional | Calendar ID (e.g. `xxx@group.calendar.google.com`) |
| `FRONTEND_URL` | Production | Your deployed frontend URL (for CORS) |
| `PORT` | Optional | Backend port (default: 5000) |

---

## 🌐 Deployment Guide

### Step 1: Deploy Backend → Render

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add environment variables:
   - `GROQ_API_KEY` = your free Groq key
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = your Vercel URL (add after Step 2)
6. Deploy — copy the URL (e.g. `https://campus-backend.onrender.com`)

### Step 2: Deploy Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App
4. Add environment variable:
   - `REACT_APP_API_URL` = your Render backend URL
5. Update `frontend/src/App.js` line:
   ```js
   const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || "/api" });
   ```
6. Update `frontend/vercel.json` — replace `REPLACE_WITH_YOUR_BACKEND_URL` with your Render URL
7. Deploy

### Step 3: Update CORS

Back on Render, set `FRONTEND_URL` = your Vercel URL (e.g. `https://campus-dashboard.vercel.app`)

---

## 📁 Project Structure

```
campus-dashboard/
├── backend/
│   ├── mcp-servers/
│   │   ├── library.js       # Library MCP Server (Open Library API)
│   │   ├── cafeteria.js     # Cafeteria MCP Server (weekly menu data)
│   │   ├── events.js        # Events MCP Server (+ Google Calendar)
│   │   └── academics.js     # Academics MCP Server (timetable, exams)
│   ├── routes/
│   │   ├── ai.js            # Claude AI chat + /summary endpoint
│   │   └── data.js          # Direct REST data endpoints
│   ├── server.js
│   ├── render.yaml          # Render deployment config
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── KPIBar.js        # 📊 Live KPI overview bar (NEW)
    │   │   ├── ChatBot.js       # AI assistant UI
    │   │   ├── LibraryCard.js
    │   │   ├── CafeteriaCard.js
    │   │   ├── EventsCard.js
    │   │   ├── TimetableCard.js
    │   │   └── DeadlinesCard.js
    │   ├── App.js
    │   └── setupProxy.js        # Dev proxy config
    └── vercel.json              # Vercel deployment config
```

---

## 🎥 Demo Video Checklist

- [ ] Show KPI bar with live stats (events count, next class, lunch, deadline, books)
- [ ] Click each KPI card — navigates to the right section
- [ ] Show cafeteria → today's menu + meal tabs
- [ ] Show events → upcoming events + category filter
- [ ] Show library → search for "algorithms"
- [ ] Show academics → timetable + deadlines
- [ ] Open CampusBot and ask: **"What events do I have today and what's for lunch?"** (multi-source!)
- [ ] Show source tags — multiple MCP servers highlighted
- [ ] Ask: "Give me today's full overview" — watch all 4 MCP servers get queried
- [ ] Ask: "Is CLRS available in the library?"

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js 18, Axios |
| Backend | Node.js, Express.js |
| AI | Groq API — Llama 3.3 70B Versatile (FREE tier, OpenAI-compatible) |
| MCP Pattern | Function/tool-calling based MCP server simulation |
| External APIs | Open Library (free), Google Calendar (optional) |
| Hosting | Vercel (frontend), Render (backend) |

---

## 👨‍💻 Notes for Evaluators

- Each data source is a **separate MCP server** — not a monolithic database
- The AI uses **parallel tool calling** — multi-domain queries call multiple MCP servers simultaneously
- Source attribution shown in chat (which MCP servers answered)
- `/api/ai/summary` fetches from all 4 MCP servers in parallel for the KPI bar
- Rate limiting on AI endpoint (20 req/min)
- Open Library API integration is live (real external API)

---

*Built for MARS Open Projects 2026 | Models and Robotics Section*
