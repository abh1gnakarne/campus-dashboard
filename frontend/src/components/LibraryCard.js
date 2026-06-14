import React, { useState, useEffect } from "react";
import "./Cards.css";

export default function LibraryCard({ API, full, preview }) {
  const [books, setBooks] = useState([]);
  const [hours, setHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get("/data/library/available"),
      API.get("/data/library/hours"),
    ])
      .then(([booksRes, hoursRes]) => {
        setBooks(booksRes.data.books || []);
        setHours(hoursRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API]);

  async function handleSearch(e) {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await API.get(`/data/library/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data);
    } catch {}
    finally { setSearching(false); }
  }

  const displayBooks = preview ? books.slice(0, 3) : books;

  return (
    <div className="card lib-card">
      <div className="card-header">
        <span className="card-title">📚 Library</span>
        {hours && (
          <span className={`pill ${hours.todayHours !== "Closed" ? "pill-green" : "pill-red"}`}>
            {hours.todayHours !== "Closed" ? `Open till ${hours.todayHours?.split(" - ")[1] || "?"}` : "Closed"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /> Loading books...</div>
      ) : (
        <>
          {full && (
            <div className="search-wrap">
              <input
                className="search-input"
                placeholder="Search books, authors..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
              />
              <button className="search-btn" onClick={handleSearch} disabled={searching}>
                {searching ? "..." : "Search"}
              </button>
            </div>
          )}

          {searchResults ? (
            <div>
              <div className="section-label">Search: "{query}"</div>
              {searchResults.campusBooks?.length === 0 && searchResults.externalResults?.length === 0 && (
                <div className="empty-msg">No books found</div>
              )}
              {searchResults.campusBooks?.map((book) => (
                <BookRow key={book.id} book={book} />
              ))}
              {searchResults.externalResults?.length > 0 && (
                <>
                  <div className="section-label" style={{ marginTop: 12 }}>Open Library Results</div>
                  {searchResults.externalResults.map((book) => (
                    <BookRow key={book.id} book={book} external />
                  ))}
                </>
              )}
              <button className="clear-btn" onClick={() => setSearchResults(null)}>← Back</button>
            </div>
          ) : (
            <>
              <div className="section-label">Available Now ({books.length})</div>
              {displayBooks.length === 0 && <div className="empty-msg">No books available right now</div>}
              {displayBooks.map((book) => (
                <BookRow key={book.id} book={book} />
              ))}
              {preview && books.length > 3 && (
                <div className="more-hint">+{books.length - 3} more available →</div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function BookRow({ book, external }) {
  return (
    <div className="book-row">
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author}</div>
        {book.location && !external && (
          <div className="book-location">📍 {book.location}</div>
        )}
      </div>
      <div className="book-avail">
        {external ? (
          <span className="pill pill-blue">External</span>
        ) : (
          <span className={`pill ${book.available > 0 ? "pill-green" : "pill-red"}`}>
            {book.available > 0 ? `${book.available} left` : "Checked out"}
          </span>
        )}
      </div>
    </div>
  );
}
