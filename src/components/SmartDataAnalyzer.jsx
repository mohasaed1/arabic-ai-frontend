// Smart AI Data Analysis App (Chat Bubble + Model Switch + Auto Scroll + Lang Detect)
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
  const [confirmed, setConfirmed] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [chartData, setChartData] = useState(null);
  const [isNumeric, setIsNumeric] = useState(false);
  const [insights, setInsights] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [model, setModel] = useState("gpt-4");
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
    setConfirmed(false);
    setSelectedColumn("");
    setChartData(null);
    setInsights("");
    setSuggestions([]);
    setMessages([]);
  };

  const confirmAndAnalyze = () => {
    setConfirmed(true);
    setInsights(generateAIInsights(data, columns));
    setSuggestions(columns.slice(0, 3));
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

  const generateAIInsights = (rows, fields) => {
    if (!rows || rows.length === 0) return "📭 لا توجد بيانات لتحليلها.";
    let lines = [];
    fields.forEach((field) => {
      const values = rows.map((r) => r[field]).filter(Boolean);
      if (values.every((v) => !isNaN(v))) {
        const nums = values.map(Number);
        const avg = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
        lines.push(`📊 متوسط ${field}: ${avg}`);
      } else {
        const top = mostCommon(values);
        lines.push(`🔤 التكرار الأعلى لـ ${field}: ${top}`);
      }
    });
    return lines.join(" | ");
  };

  const mostCommon = (arr) => {
    const freq = {};
    for (let item of arr) freq[item] = (freq[item] || 0) + 1;
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
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
        body: JSON.stringify({ query, data, model }),
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
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ تعذر الاتصال بالخادم: " + err.message }]);
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
    <div className="form-section" dir="rtl">
      <h2>🤖 منصة تحليل البيانات الذكية</h2>
      <p>📁 يدعم CSV و Excel مع تحليل تفاعلي وذكي</p>
      <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} />
      {fileName && <p className="mt-2">📄 تم تحميل: {fileName}</p>}

      {data.length > 0 && !confirmed && (
        <>
          <h3>📋 معاينة ({data.length} صف)</h3>
          <table className="data-table">
            <thead>
              <tr>{columns.map((col) => <th key={col}>{col}</th>)}</tr>
            </thead>
            <tbody>
              {data.slice(0, 5).map((row, i) => (
                <tr key={i}>{columns.map((col) => <td key={col}>{row[col]}</td>)}</tr>
              ))}
            </tbody>
          </table>
          <button className="btn" onClick={confirmAndAnalyze}>✅ تحليل البيانات</button>
        </>
      )}

      {confirmed && (
        <>
          <div className="mt-4 chat-section">
            <label htmlFor="ai-query">💬 اسألني عن بياناتك</label>
            <div className="model-switch">
              <label>النموذج:</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5</option>
              </select>
            </div>
            <input
              id="ai-query"
              type="text"
              placeholder="ما هي النسبة بين الربح والتكلفة؟"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button className="btn" onClick={askAI} disabled={loading}>🚀 إرسال</button>

            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`bubble ${msg.role}`}>
                  {msg.content}
                </div>
              ))}
              {loading && <div className="bubble assistant">✍️ جارٍ توليد الرد...</div>}
              <div ref={bottomRef}></div>
            </div>
          </div>

          <div className="mt-4">
            <p>🧠 اقتراحات:</p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {suggestions.map((col) => (
                <button key={col} className="btn" onClick={() => handleColumnSelect(col)}>
                  {col}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="column-select">📈 اختر عمودًا للرسم:</label>
            <select
              id="column-select"
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
              <h3>📊 {isNumeric ? "رسم عمودي" : "رسم دائري"} لـ {selectedColumn}</h3>
              <button className="btn" onClick={exportChart}>📥 حفظ الرسم</button>
              {isNumeric ? (
                <Bar ref={chartRef} data={{ labels: Object.keys(chartData), datasets: [{ label: selectedColumn, data: Object.values(chartData), backgroundColor: "#3b82f6" }] }} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                <Pie ref={chartRef} data={{ labels: Object.keys(chartData), datasets: [{ label: selectedColumn, data: Object.values(chartData), backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6366f1"] }] }} options={{ responsive: true, maintainAspectRatio: false }} />
              )}
            </div>
          )}

          {insights && (
            <div className="insights-box">
              <h3>📌 ملخص سريع</h3>
              <p>{insights}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
