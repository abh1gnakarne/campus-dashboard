# 🏫 CampusBot – Unified Campus Intelligence Dashboard

A web-based campus dashboard that combines Library, Cafeteria, Events, and Academics information into a single platform. The system includes an AI-powered assistant (CampusBot) that can answer student queries by routing requests to the appropriate campus service.

## Features

* 🤖 AI-powered CampusBot for natural language queries
* 📚 Library search and book availability
* 🍽️ Cafeteria menu and meal schedules
* 📅 Events and workshop tracking
* 🎓 Academic timetable and assignment deadlines
* 📊 KPI dashboard with campus overview
* 🔄 Multi-source query support using MCP-based architecture

## Tech Stack

| Layer      | Technology                                       |
| ---------- | ------------------------------------------------ |
| Frontend   | React.js, Axios                                  |
| Backend    | Node.js, Express.js                              |
| AI         | Groq API (Llama 3.3 70B)                         |
| APIs       | Open Library API, Google Calendar API (Optional) |
| Deployment | Vercel, Render                                   |

## Architecture

The application uses independent MCP servers for:

* Library
* Cafeteria
* Events
* Academics

CampusBot analyzes user queries, routes them to the relevant MCP server(s), and combines the responses into a unified answer.

## Live Demo

* Frontend: https://your-vercel-url.vercel.app
* Backend API: https://your-render-url.onrender.com

## Installation

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/campus-dashboard.git
cd campus-dashboard
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Environment Variables

### Backend (.env)

```env
GROQ_API_KEY=your_groq_api_key
GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
GOOGLE_CALENDAR_ID=your_calendar_id
FRONTEND_URL=your_frontend_url
NODE_ENV=production
```

### Frontend (Vercel)

```env
REACT_APP_API_URL=your_backend_url
```

## Deployment

### Backend (Render)

* Root Directory: `backend`
* Build Command: `npm install`
* Start Command: `node server.js`

### Frontend (Vercel)

* Root Directory: `frontend`
* Framework Preset: Create React App
* Environment Variable:

```env
REACT_APP_API_URL=your_render_backend_url
```

## Security Note

API keys and secrets are not included in this repository. Create your own `.env` file and add the required credentials before running the project.

## Project Highlights

* MCP-based modular architecture
* AI-powered query routing
* Multi-source response generation
* Unified campus information dashboard
* Real-time API integration
