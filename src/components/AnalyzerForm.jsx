import { useState } from "react";
import axios from "axios";

export default function AnalyzerForm() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(
        "https://arabic-ai-app-production.up.railway.app/analyze",
        { text }
      );
      setResult(res.data);
    } catch (err) {
      alert("حدث خطأ أثناء الاتصال بالخادم.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <textarea
        className="w-full h-32 border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-300"
        placeholder="أدخل نصاً باللغة العربية للتحليل..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "🔄 جار التحليل..." : "🔍 تحليل"}
      </button>

      {result && (
        <div className="bg-gray-100 rounded-xl p-4 space-y-2 text-sm">
          <div><strong>📝 الملخص:</strong> {result.summary}</div>
          <div><strong>😊 المشاعر:</strong> {result.sentiment}</div>
          <div><strong>🏷️ الكلمات المفتاحية:</strong> {result.keywords.join("، ")}</div>
        </div>
      )}
    </div>
  );
}
