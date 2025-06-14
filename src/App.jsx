import React, { useState } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("يرجى إدخال نص لتحليله.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(
        "https://arabic-ai-app-production.up.railway.app/analyze",
        { text }
      );
      setResult(response.data);
    } catch (err) {
      setError("❌ حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-right font-sans max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">تحليل النص العربي بالذكاء الاصطناعي</h1>

      <textarea
        className="w-full h-32 border p-2 rounded"
        placeholder="أدخل نصاً باللغة العربية..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="mt-4 bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "جارٍ التحليل..." : "تحليل"}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {result && (
        <div className="mt-6 bg-gray-50 p-4 rounded text-sm leading-loose">
          <p><strong>الملخص:</strong> {result.summary}</p>
          <p><strong>المشاعر:</strong> {result.sentiment}</p>
          <p><strong>الكلمات المفتاحية:</strong> {result.keywords.join("، ")}</p>
        </div>
      )}
    </div>
  );
}

export default App;
