import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ChatBot.css";

const SUGGESTIONS = [
  "What events do I have today and what's for lunch? 🍽️📅",
  "Give me today's full campus overview",
  "What's my next class and any deadlines soon?",
  "Is CLRS available in the library?",
  "What's for lunch today?",
  "Any tech events this week?",
  "Show me today's timetable",
  "When are my exams?",
];

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hey! 👋 I'm CampusBot. Ask me anything about the library, cafeteria menu, events, or your timetable!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post("/api/ai/chat", {
        message: msg,
        conversationHistory: history,
      });

      const assistantMsg = { role: "assistant", text: res.data.reply, sources: res.data.toolsUsed };
      setMessages((prev) => [...prev, assistantMsg]);

      // Update history for context
      setHistory((prev) => [
        ...prev,
        { role: "user", content: msg },
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (err) {
      const backendMsg = err.response?.data?.details || err.response?.data?.error;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: backendMsg
            ? `Oops, something broke 😅\n\n**Error:** ${backendMsg}`
            : "Oops, something broke on my end 😅 Try again?",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const sourceLabels = {
    library: "📚 Library",
    cafeteria: "🍽️ Cafeteria",
    events: "📅 Events",
    academics: "🎓 Academics",
  };

  return (
    <div className="chatbot">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">🤖</div>
          <div>
            <div className="chat-title">CampusBot</div>
            <div className="chat-status">
              <span className="status-dot"></span>
              Powered by Groq (Llama 3.3) + MCP Servers
            </div>
          </div>
        </div>
        <button className="chat-close" onClick={onClose}>✕</button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="msg-avatar">🤖</div>
            )}
            <div className="msg-bubble-wrap">
              <div className={`msg-bubble ${msg.error ? "error" : ""}`}>
                <MessageText text={msg.text} />
              </div>
              {msg.sources?.length > 0 && (
                <div className="msg-sources">
                  {[...new Set(msg.sources)].map((s) => (
                    <span key={s} className="source-tag">
                      {sourceLabels[s] || s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg assistant">
            <div className="msg-avatar">🤖</div>
            <div className="msg-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only when few messages) */}
      {messages.length <= 2 && !loading && (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about library, food, events, classes..."
          rows={1}
          disabled={loading}
        />
        <button
          className="chat-send"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

// Renders text with basic markdown-like formatting
function MessageText({ text }) {
  if (!text) return null;
  // Convert **bold** and line breaks
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <React.Fragment key={i}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
}
