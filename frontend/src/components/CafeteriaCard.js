import React, { useState, useEffect } from "react";
import "./Cards.css";

const MEALS = ["breakfast", "lunch", "snacks", "dinner"];
const MEAL_ICONS = { breakfast: "☕", lunch: "🍛", snacks: "🫙", dinner: "🌙" };

function getCurrentMeal() {
  const h = new Date().getHours();
  if (h < 10) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 19) return "snacks";
  return "dinner";
}

export default function CafeteriaCard({ API, full, preview }) {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMeal, setActiveMeal] = useState(getCurrentMeal());

  useEffect(() => {
    API.get("/data/cafeteria/today")
      .then((r) => setMenu(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API]);

  const currentMealData = menu?.menu?.[activeMeal];

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">🍽️ Cafeteria — {menu?.day || "Today"}</span>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /> Loading menu...</div>
      ) : !menu ? (
        <div className="empty-msg">Menu not available</div>
      ) : (
        <>
          <div className="meal-tabs">
            {MEALS.map((m) => (
              <button
                key={m}
                className={`meal-tab ${activeMeal === m ? "active" : ""}`}
                onClick={() => setActiveMeal(m)}
              >
                {MEAL_ICONS[m]} {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {currentMealData?.special && (
            <div className="special-banner">⭐ {currentMealData.special}</div>
          )}

          {currentMealData ? (
            <>
              <div className="meal-time">🕐 {currentMealData.time}</div>
              <div className="meal-items">
                {(preview ? currentMealData.items.slice(0, 4) : currentMealData.items).map((item, i) => (
                  <div key={i} className="meal-item">{item}</div>
                ))}
                {preview && currentMealData.items.length > 4 && (
                  <div className="more-hint">+{currentMealData.items.length - 4} more items →</div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-msg">No {activeMeal} data today</div>
          )}
        </>
      )}
    </div>
  );
}
