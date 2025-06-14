import SmartDataAnalyzer from "./components/SmartDataAnalyzer";
import "./theme.css";

export default function App() {
  return (
    <div className="app-wrapper">
      <header style={{
        background: "var(--bg-accent)",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 0 8px rgba(0,255,255,0.05)"
      }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "600" }}>🧠 منصة تحليل البيانات الذكية</h1>
        <a href="https://gateofai.com/logout" style={{ fontSize: "0.9rem", color: "var(--primary)" }}>تسجيل الخروج</a>
      </header>

      <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", display: "grid", gap: "2rem", gridTemplateColumns: "2fr 1fr" }}>
        <section className="card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>📊 ارفع ملف بيانات (CSV أو Excel)</h2>
          <DataUploadForm />
        </section>

        <aside className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>🧾 عن الأداة</h3>
            <ul style={{ paddingRight: "1.2rem", color: "var(--text-muted)", lineHeight: "1.6" }}>
              <li>تحليل الجداول والبيانات</li>
              <li>ملخص ذكي للبيانات</li>
              <li>اقتراحات وتصورات</li>
            </ul>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2rem" }}>
            GateOfAI.com © 2025
          </div>
        </aside>
      </main>
    </div>
  );
}
