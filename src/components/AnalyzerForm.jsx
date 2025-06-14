import { useState } from "react";
import axios from "axios";

export default function AnalyzerForm() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await axios.post("https://arabic-ai-app-production.up.railway.app/analyze", { text });
      setResult(res.data);
    } catch (err) {
      alert("حدث خطأ أثناء الاتصال بالخادم.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full h-40 p-4 text-sm rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        placeholder="أدخل نصاً باللغة العربية..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full py-3 px-6 bg-cyan-600 text-white font-bold rounded hover:bg-cyan-700 disabled:opacity-50"
      >
        {loading ? "جاري التحليل..." : "تحليل"}
      </button>

      {result && (
        <div className="bg-gray-900 rounded-xl p-4 mt-4 space-y-2 text-sm text-gray-100">
          <div><strong>📝 الملخص:</strong> {result.summary}</div>
          <div><strong>😊 المشاعر:</strong> {result.sentiment}</div>
          <div><strong>🔑 الكلمات المفتاحية:</strong> {result.keywords.join(", ")}</div>
        </div>
      )}
    </div>
  );
}
