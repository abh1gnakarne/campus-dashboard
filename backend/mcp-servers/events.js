// MCP Server: Events & Campus Calendar
// Uses Google Calendar API if configured, otherwise uses mock data

import fetch from "node-fetch";

const MOCK_EVENTS = [
  {
    id: "evt-001",
    title: "TechFest 2026 - AI Workshop",
    date: "2026-06-15",
    time: "10:00 AM - 1:00 PM",
    venue: "CSE Seminar Hall",
    organizer: "MARS Club",
    category: "Technical",
    description: "Hands-on workshop on building AI models from scratch. Bring your laptop!",
    registrationLink: "https://forms.gle/example",
    spots: "30 spots left",
  },
  {
    id: "evt-002",
    title: "Annual Cultural Fest - Spandan",
    date: "2026-06-20",
    time: "5:00 PM onwards",
    venue: "Main Auditorium",
    organizer: "Cultural Committee",
    category: "Cultural",
    description: "Annual cultural extravaganza with music, dance, drama competitions.",
    registrationLink: null,
    spots: "Open entry",
  },
  {
    id: "evt-003",
    title: "Hackathon: 24hr Code Sprint",
    date: "2026-06-22",
    time: "9:00 AM (24 hours)",
    venue: "Innovation Lab",
    organizer: "Dev Club",
    category: "Technical",
    description: "Build something cool in 24 hours. Cash prizes for top 3 teams.",
    registrationLink: "https://forms.gle/example2",
    spots: "50 teams (2-4 members)",
  },
  {
    id: "evt-004",
    title: "Guest Lecture: ML in Production",
    date: "2026-06-13",
    time: "3:00 PM - 4:30 PM",
    venue: "LT-1",
    organizer: "CSE Department",
    category: "Academic",
    description: "Industry expert from Google sharing real-world ML deployment strategies.",
    registrationLink: null,
    spots: "Open to all",
  },
  {
    id: "evt-005",
    title: "Placement Prep Session - Resume Review",
    date: "2026-06-14",
    time: "2:00 PM - 5:00 PM",
    venue: "Placement Cell",
    organizer: "Training & Placement",
    category: "Placement",
    description: "Get your resume reviewed by seniors who got into top companies.",
    registrationLink: "https://forms.gle/example3",
    spots: "15 spots left",
  },
  {
    id: "evt-006",
    title: "Inter-College Cricket Tournament",
    date: "2026-06-18",
    time: "8:00 AM",
    venue: "Sports Ground",
    organizer: "Sports Committee",
    category: "Sports",
    description: "Annual cricket tournament. Our college vs 5 other colleges!",
    registrationLink: null,
    spots: "Spectators welcome",
  },
  {
    id: "evt-007",
    title: "Farewell Party - Final Years",
    date: "2026-06-25",
    time: "6:00 PM - 10:00 PM",
    venue: "College Lawn",
    organizer: "Student Council",
    category: "Social",
    description: "Saying goodbye to the batch of 2026. Everyone invited!",
    registrationLink: null,
    spots: "Open to all",
  },
];

export const eventsMCP = {
  name: "events",
  description: "Campus events, workshops, fests, and calendar",

  tools: [
    {
      name: "get_upcoming_events",
      description: "Get upcoming campus events",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max events to return" },
          category: {
            type: "string",
            description: "Filter by: Technical, Cultural, Academic, Sports, Placement, Social",
          },
        },
      },
    },
    {
      name: "get_todays_events",
      description: "Get events happening today",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_event_details",
      description: "Get details of a specific event",
      inputSchema: {
        type: "object",
        properties: {
          eventId: { type: "string" },
          title: { type: "string" },
        },
      },
    },
    {
      name: "get_events_by_date",
      description: "Get events on a specific date",
      inputSchema: {
        type: "object",
        properties: {
          date: { type: "string", description: "Date in YYYY-MM-DD format" },
        },
        required: ["date"],
      },
    },
  ],

  async executeTool(toolName, args) {
    // Try Google Calendar if configured
    const useGoogleCalendar =
      process.env.GOOGLE_CALENDAR_API_KEY && process.env.GOOGLE_CALENDAR_ID;

    let events = MOCK_EVENTS;

    if (useGoogleCalendar) {
      try {
        const now = new Date().toISOString();
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
          process.env.GOOGLE_CALENDAR_ID
        )}/events?key=${process.env.GOOGLE_CALENDAR_API_KEY}&timeMin=${now}&maxResults=20&singleEvents=true&orderBy=startTime`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.items) {
          events = data.items.map((item) => ({
            id: item.id,
            title: item.summary,
            date: item.start?.date || item.start?.dateTime?.split("T")[0],
            time: item.start?.dateTime
              ? new Date(item.start.dateTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "All Day",
            venue: item.location || "TBD",
            description: item.description || "",
            organizer: "Campus",
            category: "Event",
            registrationLink: null,
            spots: "Check description",
            source: "Google Calendar",
          }));
        }
      } catch (err) {
        console.log("Google Calendar fetch failed, using mock data:", err.message);
      }
    }

    const today = new Date().toISOString().split("T")[0];

    switch (toolName) {
      case "get_upcoming_events": {
        let result = events.filter((e) => e.date >= today);
        if (args?.category) {
          result = result.filter(
            (e) => e.category?.toLowerCase() === args.category.toLowerCase()
          );
        }
        if (args?.limit) result = result.slice(0, args.limit);
        return { events: result, total: result.length, source: useGoogleCalendar ? "Google Calendar" : "Mock Data" };
      }

      case "get_todays_events": {
        const todayEvents = events.filter((e) => e.date === today);
        return { date: today, events: todayEvents, count: todayEvents.length };
      }

      case "get_event_details": {
        const event = events.find(
          (e) =>
            e.id === args?.eventId ||
            e.title?.toLowerCase().includes((args?.title || "").toLowerCase())
        );
        if (!event) return { found: false, message: "Event not found" };
        return { found: true, event };
      }

      case "get_events_by_date": {
        const dateEvents = events.filter((e) => e.date === args.date);
        return { date: args.date, events: dateEvents, count: dateEvents.length };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  },
};
