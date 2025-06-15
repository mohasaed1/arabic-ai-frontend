// Smart AI Data Analysis App (Enhanced with Dynamic Chart + Styling)
import React, { useState, useRef } from "react";
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
  const [aiResponse, setAIResponse] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [chartData, setChartData] = useState(null);
  const [isNumeric, setIsNumeric] = useState(false);
  const [insights, setInsights] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const chartRef = useRef();

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

    if (ext === "csv") {
      reader.readAsText(file);
    } else if (ext === "xlsx") {
      reader.readAsBinaryString(file);
    }
  };

  const processParsedData = (rows, fields) => {
    setColumns(fields);
    setData(rows);
    setConfirmed(false);
    setSelectedColumn("");
    setChartData(null);
    setInsights("");
    setSuggestions([]);
    setAIResponse("");
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
    try {
      const res = await fetch("https://arabic-ai-app-production.up.railway.app/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, data }),
      });
      const result = await res.json();
      const reply = result.answer || result.error || "❌ لم يتم العثور على إجابة.";
      setAIResponse(reply);

      // Attempt to detect a suggested column from reply
      for (const col of columns) {
        if (reply.includes(col)) {
          handleColumnSelect(col);
          break;
        }
      }
    } catch (err) {
      setAIResponse("❌ حدث خطأ أثناء الاتصال بالخادم: " + err.message);
    }
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
          <div className="mt-4">
            <label htmlFor="ai-query">🧠 اسأل الذكاء الاصطناعي عن بياناتك:</label>
            <input
              id="ai-query"
              type="text"
              placeholder="مثلاً: ما هي النسبة بين الربح والتكلفة؟"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn" onClick={askAI}>🔍 إرسال</button>
            {aiResponse && <div className="mt-2 result-box" dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, "<br>") }} />}
          </div>

          <div className="mt-4">
            <p>📊 اقتراحات الذكاء الاصطناعي:</p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {suggestions.map((col) => (
                <button key={col} className="btn" onClick={() => handleColumnSelect(col)}>
                  {col}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="column-select">🎛 اختر عمودًا لعرض الرسم البياني:</label>
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
              <h3>📈 رسم {isNumeric ? "بياني عمودي" : "بياني دائري"} لـ {selectedColumn}</h3>
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
              <h3>🧠 الملخص الذكي</h3>
              <p>{insights}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
