// routes/ai.js
// Main AI chat endpoint - routes queries to appropriate MCP servers
// Uses Groq API (free tier, OpenAI-compatible) with function/tool calling

import express from "express";
import OpenAI from "openai";
import { libraryMCP } from "../mcp-servers/library.js";
import { cafeteriaMCP } from "../mcp-servers/cafeteria.js";
import { eventsMCP } from "../mcp-servers/events.js";
import { academicsMCP } from "../mcp-servers/academics.js";

const router = express.Router();

// Groq exposes an OpenAI-compatible API.
// NOTE: client is created lazily (inside getClient) because ES module imports
// are hoisted and evaluated before dotenv.config() runs in server.js — creating
// the client at module load time would see an empty process.env.GROQ_API_KEY.
let _client = null;
function getClient() {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return _client;
}

const MODEL = "llama-3.3-70b-versatile";

// Register all MCP servers
const MCP_SERVERS = {
  library: libraryMCP,
  cafeteria: cafeteriaMCP,
  events: eventsMCP,
  academics: academicsMCP,
};

// Build OpenAI-style tool definitions from MCP servers
function buildTools() {
  const tools = [];
  for (const [serverName, server] of Object.entries(MCP_SERVERS)) {
    for (const tool of server.tools) {
      tools.push({
        type: "function",
        function: {
          name: `${serverName}__${tool.name}`,
          description: `[${server.name.toUpperCase()}] ${tool.description}`,
          parameters:
            tool.inputSchema && Object.keys(tool.inputSchema.properties || {}).length > 0
              ? tool.inputSchema
              : { type: "object", properties: {} },
        },
      });
    }
  }
  return tools;
}

// Execute a tool call
async function executeTool(toolName, args) {
  const [serverName, ...rest] = toolName.split("__");
  const actualToolName = rest.join("__");
  const server = MCP_SERVERS[serverName];
  if (!server) return { error: `Unknown MCP server: ${serverName}` };
  return server.executeTool(actualToolName, args || {});
}

const SYSTEM_PROMPT = `You are CampusBot, the AI assistant for a college campus dashboard. You help students find info about:
- Library: book availability, search, hours
- Cafeteria: today's menu, meal timings
- Events: upcoming events, workshops, fests, registrations
- Academics: timetable, exam schedule, deadlines

## CRITICAL RULE — Multi-source queries:
When a query touches MULTIPLE topics, you MUST call ALL relevant tools in the SAME turn before answering.

Examples:
- "What events do I have today and what's for lunch?" -> Call BOTH events__get_todays_events AND cafeteria__get_meal (meal=lunch)
- "What's my next class and when does the library close?" -> Call BOTH academics__get_next_class AND library__get_library_hours
- "Give me a daily overview" -> Call cafeteria, events, academics (next class + deadlines) tools together
- "What should I do today?" -> Call events + cafeteria + academics together

Always call multiple tools together when the question spans multiple domains. Never call just one tool when the user is asking about multiple things.

## Response style:
- Be conversational, brief, and friendly. Use emojis naturally.
- For multi-source answers, organize by section with a small header emoji
- Show the data clearly — don't just say "here's the info", give the actual info
- Don't mention you're calling tools, just answer naturally with the data

Today's date: ${new Date().toDateString()}
Current time: ${new Date().toLocaleTimeString("en-IN")}
Current day: ${new Date().toLocaleDateString("en-US", { weekday: "long" })}`;

router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const tools = buildTools();

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-8).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      })),
      { role: "user", content: message },
    ];

    const toolsUsed = [];
    let loopGuard = 0;

    let completion = await getClient().chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
    });

    let choice = completion.choices[0];

    // Tool-call loop — supports parallel tool calls in a single turn
    while (choice.finish_reason === "tool_calls" && loopGuard < 6) {
      const toolCalls = choice.message.tool_calls || [];

      messages.push(choice.message);

      // Execute ALL tool calls in parallel (multi-source support)
      const toolResults = await Promise.all(
        toolCalls.map(async (call) => {
          let args = {};
          try {
            args = JSON.parse(call.function.arguments || "{}");
          } catch {
            args = {};
          }
          const result = await executeTool(call.function.name, args);
          toolsUsed.push(call.function.name);
          return {
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(result),
          };
        })
      );

      messages.push(...toolResults);

      completion = await getClient().chat.completions.create({
        model: MODEL,
        messages,
        tools,
        tool_choice: "auto",
      });
      choice = completion.choices[0];
      loopGuard++;
    }

    const textContent = choice.message.content || "";

    res.json({
      reply: textContent,
      toolsUsed: [...new Set(toolsUsed.map((t) => t.split("__")[0]))],
    });
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.status(500).json({
      error: "Something went wrong",
      details: err.message,
    });
  }
});

// Dashboard summary endpoint — calls all 4 MCP servers in parallel (no AI needed)
router.get("/summary", async (req, res) => {
  try {
    const [events, cafeteria, nextClass, deadlines] = await Promise.all([
      eventsMCP.executeTool("get_todays_events", {}),
      cafeteriaMCP.executeTool("get_todays_menu", {}),
      academicsMCP.executeTool("get_next_class", {}),
      academicsMCP.executeTool("get_deadlines", {}),
    ]);

    const booksAvail = await libraryMCP.executeTool("get_all_available", {});

    res.json({
      todayEventsCount: events.count || 0,
      todayEvents: events.events || [],
      lunchItems: cafeteria.menu?.lunch?.items?.slice(0, 3) || [],
      lunchSpecial: cafeteria.menu?.lunch?.special || null,
      nextClass: nextClass.found ? nextClass.class : null,
      upcomingDeadlines: (deadlines.deadlines || []).slice(0, 3),
      availableBooks: booksAvail.count || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
