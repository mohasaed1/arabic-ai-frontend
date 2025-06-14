import React, { useState } from "react";
import Papa from "papaparse";
import { generateInsights } from "../utils/generateInsights";
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

export default function DataUploadForm() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [chartData, setChartData] = useState(null);
  const [isNumeric, setIsNumeric] = useState(false);
  const [insights, setInsights] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const fields = results.meta.fields;
        const rows = results.data;
        setColumns(fields);
        setData(rows);
        setSelectedColumn("");
        setChartData(null);
        setInsights(generateInsights(rows, fields));
      },
    });
  };

  const handleColumnChange = (col) => {
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

  return (
    <div className="form-section" dir="rtl">
      <h2>🤖 منصة تحليل البيانات الذكية</h2>
      <p>📁 ارفع ملف بيانات (CSV أو Excel) لاستكشاف وتحليل المحتوى باستخدام الذكاء الاصطناعي</p>
      <input type="file" accept=".csv" onChange={handleFileChange} />

      {columns.length > 0 && (
        <>
          <div className="mt-4">
            <h3>📋 معاينة ({data.length} صف)</h3>
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <label htmlFor="column-select">📊 اختر عمودًا لعرض الرسم البياني:</label>
            <select
              id="column-select"
              value={selectedColumn}
              onChange={(e) => handleColumnChange(e.target.value)}
            >
              <option value="">-- اختر عمود --</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {chartData && (
            <div className="chart-wrapper">
              <h3>📈 رسم {isNumeric ? "بياني عمودي" : "بياني دائري"} لـ {selectedColumn}</h3>
              {isNumeric ? (
                <Bar
                  data={{
                    labels: Object.keys(chartData),
                    datasets: [
                      {
                        label: selectedColumn,
                        data: Object.values(chartData),
                        backgroundColor: "#3b82f6",
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              ) : (
                <Pie
                  data={{
                    labels: Object.keys(chartData),
                    datasets: [
                      {
                        label: selectedColumn,
                        data: Object.values(chartData),
                        backgroundColor: [
                          "#10b981",
                          "#3b82f6",
                          "#f59e0b",
                          "#ef4444",
                          "#6366f1",
                        ],
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
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
