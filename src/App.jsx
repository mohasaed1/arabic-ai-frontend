// App.jsx
import React, { useState } from "react";
import SmartDataAnalyzer from "./components/SmartDataAnalyzer";
import SmartChat from "./components/SmartChat";

export default function App() {
  const [fileData, setFileData] = useState([]);
  const [suggestChart, setSuggestChart] = useState(() => () => {});

  return (
    <div className="app-wrapper" dir="rtl">
      <header
        style={{
          background: "var(--bg-accent)",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 0 8px rgba(0,255,255,0.05)"
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: "600" }}>
          🧠 منصة تحليل البيانات الذكية
        </h1>
        <nav>
          <a
            href="https://gateofai.com"
            style={{ fontSize: "0.9rem", color: "var(--primary)", marginLeft: "1rem" }}
          >
            GateOfAI
          </a>
          <a
            href="https://gateofai.com/help"
            style={{ fontSize: "0.9rem", color: "var(--primary)" }}
          >
            المساعدة
          </a>
        </nav>
      </header>

      <main className="app-container" style={{ display: "flex", flexDirection: "column-reverse", gap: "2rem", padding: "1rem", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ zIndex: 1 }}>
          <SmartDataAnalyzer
            onDataReady={(rows) => setFileData(rows)}
            onColumnSuggest={(selectFn) => setSuggestChart(() => selectFn)}
          />
        </div>
        <div style={{ position: "relative", zIndex: 2 }}>
          <SmartChat
            fileData={fileData}
            suggestChart={suggestChart}
          />
        </div>
      </main>
    </div>
  );
}
