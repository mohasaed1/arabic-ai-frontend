// Smart AI Data Analysis App (Final UX Polished Version)
import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function SmartDataAnalyzer() {
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [chartData, setChartData] = useState(null);
  const [isNumeric, setIsNumeric] = useState(false);
  const bottomRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const detectLang = (text) => /[\u0600-\u06FF]/.test(text) ? "ar" : "en";

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    const ext = file.name.split(".").pop().toLowerCase();

    reader.onload = (evt) => {
      const content = evt.target.result;
      if (ext === "csv") {
        const parsed = Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
        });
        processParsedData(parsed.data, parsed.meta.fields);
      } else if (ext === "xlsx") {
        const workbook = XLSX.read(content, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        const fields = Object.keys(jsonData[0]);
        processParsedData(jsonData, fields);
      }
    };

    ext === "csv" ? reader.readAsText(file) : reader.readAsBinaryString(file);
  };

  const processParsedData = (rows, fields) => {
    setColumns(fields);
    setData(rows);
    setMessages([]);
    setChartData(null);
    setSelectedColumn("");
  };

  const handleColumnSelect = (col) => {
    setSelectedColumn(col);
    const values = data.map((row) => row[col]).filter(Boolean);
    const numeric = values.every((v) => !isNaN(v));
    setIsNumeric(numeric);

    const freqMap = {};
    values.forEach((v) => {
      const key = numeric ? Number(v).toFixed(0) : v;
      freqMap[key] = (freqMap[key] || 0) + 1;
    });

    setChartData(freqMap);
  };

  const askAI = async () => {
    if (!query || data.length === 0) return;
    const userLang = detectLang(query);
    const userMsg = { role: "user", content: query, lang: userLang };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("https://arabic-ai-app-production.up.railway.app/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, data }),
      });
      const result = await res.json();
      const reply = result.answer || result.error || "❌ لم أتمكن من توليد إجابة.";

      const assistantMsg = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, assistantMsg]);

      for (const col of columns) {
        if (reply.includes(col)) {
          handleColumnSelect(col);
          break;
        }
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ خطأ: " + err.message }]);
    }

    setQuery("");
    setLoading(false);
  };

  const exportChart = () => {
    if (!chartRef.current) return;
    const url = chartRef.current.toBase64Image();
    const link = document.createElement("a");
    link.download = "chart.png";
    link.href = url;
    link.click();
  };

  return (
    <div className="ai-dashboard" dir="rtl">
      <section className="upload-bar">
        <h2>📊 ارفع ملف بيانات (CSV أو Excel)</h2>
        <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} />
        {fileName && <p>📄 تم تحميل: {fileName}</p>}
      </section>

      {data.length > 0 && (
        <div className="chat-ui">
          <h3>🤖 استفسر عن بياناتك:</h3>
          <div className="chat-box">
            <div className="chat-stream">
              {messages.map((msg, i) => (
                <div key={i} className={`bubble ${msg.role}`}>{msg.content}</div>
              ))}
              {loading && <div className="bubble assistant">✍️ جارٍ توليد الرد...</div>}
              <div ref={bottomRef}></div>
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="اكتب سؤالك هنا..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
              />
              <button onClick={askAI} disabled={loading}>📤</button>
            </div>
          </div>

          <div className="mt-4">
            <label>🎯 اختر عمود لعرض الرسم البياني:</label>
            <select
              value={selectedColumn}
              onChange={(e) => handleColumnSelect(e.target.value)}
            >
              <option value="">-- اختر عمود --</option>
              {columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {chartData && (
            <div className="chart-wrapper">
              <h3>📈 عرض {isNumeric ? "عمودي" : "دائري"} لـ {selectedColumn}</h3>
              <button className="btn" onClick={exportChart}>📥 حفظ الرسم</button>
              {isNumeric ? (
                <Bar ref={chartRef} data={{ labels: Object.keys(chartData), datasets: [{ label: selectedColumn, data: Object.values(chartData), backgroundColor: "#3b82f6" }] }} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                <Pie ref={chartRef} data={{ labels: Object.keys(chartData), datasets: [{ label: selectedColumn, data: Object.values(chartData), backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6366f1"] }] }} options={{ responsive: true, maintainAspectRatio: false }} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
