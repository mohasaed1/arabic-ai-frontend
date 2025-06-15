import React, { useState } from "react";
import SmartDataAnalyzer from "./components/SmartDataAnalyzer";
import SmartChat from "./components/SmartChat";
import "./theme.css";

export default function App() {
  const [fileData, setFileData] = useState([]);

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

      <main
        style={{
          padding: "2rem",
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "2rem"
        }}
      >
        <SmartDataAnalyzer onDataReady={setFileData} />
        {fileData.length > 0 && <SmartChat fileData={fileData} />}
      </main>

      <footer
        style={{
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginTop: "4rem",
          paddingBottom: "2rem"
        }}
      >
        GateOfAI.com © 2025
      </footer>
    </div>
  );
}
