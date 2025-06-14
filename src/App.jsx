import { useState } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://arabic-ai-app-production.up.railway.app/analyze",
        { text }
      );
      setResult(response.data);
    } catch (error) {
      alert("حدث خطأ أثناء الاتصال بالخادم.");
    }
    setLoading(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-white text-right px-4 py-10 font-sans">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">تحليل النص العربي بالذكاء الاصطناعي</h1>
        
        <textarea
          className="w-full h-32 border border-gray-300 rounded p-3 focus:outline-none focus:ring"
          placeholder="أدخل نصاً باللغة العربية..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={handleAnalyze}
          className="mt-4 bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? "جاري التحليل..." : "تحليل"}
        </button>

        {result && (
          <div className="mt-8 bg-gray-50 p-4 rounded shadow text-sm space-y-2">
            <p><strong>الملخص:</strong> {result.summary}</p>
            <p><strong>المشاعر:</strong> {result.sentiment}</p>
            <p><strong>الكلمات المفتاحية:</strong> {result.keywords.join("، ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
