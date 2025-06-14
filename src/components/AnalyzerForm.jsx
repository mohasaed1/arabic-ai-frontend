import { useState } from "react";
import axios from "axios";

export default function AnalyzerForm() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post(
        "https://arabic-ai-app-production.up.railway.app/analyze",
        { text }
      );
      setResult(response.data);
    } catch (err) {
      alert("حدث خطأ أثناء تحليل النص.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="✍️ أدخل نصاً باللغة العربية هنا..."
        style={{
          width: "100%",
          height: "120px",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #333",
          background: "var(--bg-dark)",
          color: "var(--text-light)",
          resize: "vertical",
          fontSize: "1rem",
          marginBottom: "1rem"
        }}
      />

      <button onClick={handleAnalyze} className="btn" disabled={loading}>
        {loading ? "جارٍ التحليل..." : "تحليل النص"}
      </button>

      {result && (
        <div style={{ marginTop: "2rem", lineHeight: "1.8", fontSize: "0.95rem" }}>
          <p><strong>📄 الملخص:</strong> {result.summary}</p>
          <p><strong>😊 المشاعر:</strong> {result.sentiment}</p>
          <p><strong>🔑 الكلمات المفتاحية:</strong> {result.keywords.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
