// MCP Server: Library
// Handles book availability, search, due dates
// Uses Open Library API (free, no key needed) + mock campus data

import fetch from "node-fetch";

const MOCK_LIBRARY_BOOKS = [
  {
    id: "campus-001",
    title: "Introduction to Algorithms",
    author: "Cormen, Leiserson, Rivest, Stein",
    isbn: "9780262033848",
    available: 2,
    total: 5,
    location: "Stack A - Row 3",
    dueDate: null,
  },
  {
    id: "campus-002",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    available: 0,
    total: 3,
    location: "Stack B - Row 1",
    dueDate: "2026-06-20",
  },
  {
    id: "campus-003",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    isbn: "9780135957059",
    available: 1,
    total: 2,
    location: "Stack B - Row 2",
    dueDate: null,
  },
  {
    id: "campus-004",
    title: "Design Patterns",
    author: "Gang of Four",
    isbn: "9780201633610",
    available: 3,
    total: 4,
    location: "Stack C - Row 5",
    dueDate: null,
  },
  {
    id: "campus-005",
    title: "Artificial Intelligence: A Modern Approach",
    author: "Russell & Norvig",
    isbn: "9780134610993",
    available: 0,
    total: 6,
    location: "Stack A - Row 7",
    dueDate: "2026-06-18",
  },
  {
    id: "campus-006",
    title: "Database System Concepts",
    author: "Silberschatz, Korth, Sudarshan",
    isbn: "9780078022159",
    available: 4,
    total: 7,
    location: "Stack D - Row 2",
    dueDate: null,
  },
  {
    id: "campus-007",
    title: "Computer Networks",
    author: "Tanenbaum & Wetherall",
    isbn: "9780132126953",
    available: 1,
    total: 3,
    location: "Stack D - Row 4",
    dueDate: null,
  },
];

const LIBRARY_HOURS = {
  Monday: "8:00 AM - 10:00 PM",
  Tuesday: "8:00 AM - 10:00 PM",
  Wednesday: "8:00 AM - 10:00 PM",
  Thursday: "8:00 AM - 10:00 PM",
  Friday: "8:00 AM - 8:00 PM",
  Saturday: "9:00 AM - 6:00 PM",
  Sunday: "10:00 AM - 6:00 PM",
};

export const libraryMCP = {
  name: "library",
  description: "Campus library book availability, search, and hours",

  tools: [
    {
      name: "search_books",
      description: "Search for books by title, author, or subject",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search term" },
        },
        required: ["query"],
      },
    },
    {
      name: "check_availability",
      description: "Check if a specific book is available",
      inputSchema: {
        type: "object",
        properties: {
          bookId: { type: "string" },
          title: { type: "string" },
        },
      },
    },
    {
      name: "get_library_hours",
      description: "Get library opening hours",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_all_available",
      description: "Get all currently available books",
      inputSchema: { type: "object", properties: {} },
    },
  ],

  async executeTool(toolName, args) {
    switch (toolName) {
      case "search_books": {
        const q = args.query.toLowerCase();
        const results = MOCK_LIBRARY_BOOKS.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q)
        );

        // Also try Open Library API for additional results
        try {
          const olRes = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(args.query)}&limit=3`
          );
          const olData = await olRes.json();
          const olBooks = (olData.docs || []).slice(0, 3).map((doc) => ({
            id: `ol-${doc.key}`,
            title: doc.title,
            author: doc.author_name?.[0] || "Unknown",
            available: "Check physical copy",
            total: "External catalog",
            location: "Open Library (External)",
            source: "Open Library",
          }));

          return {
            campusBooks: results,
            externalResults: olBooks,
            total: results.length,
          };
        } catch {
          return { campusBooks: results, total: results.length };
        }
      }

      case "check_availability": {
        const book = MOCK_LIBRARY_BOOKS.find(
          (b) =>
            b.id === args.bookId ||
            b.title.toLowerCase().includes((args.title || "").toLowerCase())
        );
        if (!book) return { found: false, message: "Book not found in campus library" };
        return {
          found: true,
          book,
          available: book.available > 0,
          message:
            book.available > 0
              ? `${book.available} copies available at ${book.location}`
              : `All copies checked out. Next return expected: ${book.dueDate || "Unknown"}`,
        };
      }

      case "get_library_hours": {
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
        return {
          hours: LIBRARY_HOURS,
          today,
          todayHours: LIBRARY_HOURS[today] || "Closed",
        };
      }

      case "get_all_available": {
        const available = MOCK_LIBRARY_BOOKS.filter((b) => b.available > 0);
        return { books: available, count: available.length };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  },
};
