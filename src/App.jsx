import React from 'react';
import AnalyzerForm from './components/AnalyzerForm';

function App() {
  return (
    <div>
      <AnalyzerForm />
    </div>
  );
}

export default App;

import { useState } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    try {
      const response = await axios.post(
        "https://arabic-ai-app-production.up.railway.app/analyze",
        { text }
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error analyzing:", error);
    }
  };

  return (
    <div className="p-6 text-right font-sans">
      <h1 className="text-2xl font-bold mb-4">تحليل النص العربي بالذكاء الاصطناعي</h1>
      <textarea
        className="w-full h-32 border p-2"
        placeholder="أدخل نصاً باللغة العربية..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleAnalyze}
        className="mt-4 bg-black text-white px-4 py-2 rounded"
      >
        تحليل
      </button>

      {result && (
        <div className="mt-6 text-sm text-right">
          <p><strong>الملخص:</strong> {result.summary}</p>
          <p><strong>المشاعر:</strong> {result.sentiment}</p>
          <p><strong>الكلمات المفتاحية:</strong> {result.keywords.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

export default App;

const [loading, setLoading] = useState(false);

// In handleAnalyze()
setLoading(true);
try {
  const response = await axios.post(...);
  setResult(response.data);
} catch (err) {
  alert("حدث خطأ أثناء الاتصال بالخادم.");
}
setLoading(false);

