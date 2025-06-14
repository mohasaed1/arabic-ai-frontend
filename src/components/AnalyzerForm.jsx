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

     <button
  onClick={handleAnalyze}
  disabled={loading}
  className="analyze-btn"
>
  {loading ? "⏳ جاري التحليل..." : "تحليل النص"}
</button>


      {result && (
  <div className="results-container mt-6 space-y-4">
    <div className="result-card">
      <h3>📝 الملخص</h3>
      <p>{result.summary}</p>
    </div>

    <div className="result-card">
      <h3>😊 المشاعر</h3>
      <p>{result.sentiment}</p>
    </div>

    <div className="result-card">
      <h3>🏷️ الكلمات المفتاحية</h3>
      <p>{result.keywords.join("، ")}</p>
    </div>
  </div>
)}

    </div>
  );
}
