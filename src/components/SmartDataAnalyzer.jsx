import React, { useState, useRef } from "react";
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

export default function SmartDataAnalyzer({ onDataReady }) {
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [chartData, setChartData] = useState(null);
  const [isNumeric, setIsNumeric] = useState(false);
  const [chartHeight, setChartHeight] = useState(400);
  const chartRef = useRef();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    const ext = file.name.split(".").pop().toLowerCase();

    reader.onload = async (evt) => {
      let rows = [];
      let fields = [];

      if (ext === "csv") {
        const Papa = await import("papaparse");
        const parsed = Papa.parse(evt.target.result, {
          header: true,
          skipEmptyLines: true,
        });
        rows = parsed.data;
        fields = parsed.meta.fields;
      } else if (ext === "xlsx") {
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(evt.target.result, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(firstSheet);
        fields = Object.keys(rows[0] || {});
      }

      setData(rows);
      setColumns(fields);
      onDataReady(rows);
    };

    if (ext === "csv") reader.readAsText(file);
    else if (ext === "xlsx") reader.readAsBinaryString(file);
  };

  const handleColumnSelect = (col) => {
    setSelectedColumn(col);
    const values = data.map((row) => row[col]).filter((v) => v !== undefined && v !== null);
    const numeric = values.every((v) => !isNaN(v));
    setIsNumeric(numeric);

    const freqMap = {};
    values.forEach((v) => {
      const key = numeric ? Number(v).toFixed(0) : String(v);
      freqMap[key] = (freqMap[key] || 0) + 1;
    });

    setChartData(freqMap);
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
      <h2>📁 ارفع ملف بيانات (CSV أو Excel)</h2>
      <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} />
      {fileName && <p className="mt-2">📄 تم تحميل: {fileName}</p>}

      {columns.length > 0 && (
        <>
          <div className="mt-6">
            <label htmlFor="column-select">📊 اختر عمودًا لعرض الرسم البياني:</label>
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
            <div className="chart-wrapper" style={{ height: chartHeight + "px" }}>
              <h3>📈 عرض {isNumeric ? "عمودي" : "دائري"} لـ {selectedColumn}</h3>
              <button className="btn" onClick={exportChart}>📥 حفظ الرسم</button>

              <div style={{ margin: "1rem 0" }}>
                <label>🔧 ارتفاع الرسم: {chartHeight}px</label>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  value={chartHeight}
                  onChange={(e) => setChartHeight(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              {isNumeric ? (
                <Bar
                  ref={chartRef}
                  data={{
                    labels: Object.keys(chartData),
                    datasets: [{
                      label: selectedColumn,
                      data: Object.values(chartData),
                      backgroundColor: "#3b82f6",
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true },
                    },
                  }}
                />
              ) : (
                <Pie
                  ref={chartRef}
                  data={{
                    labels: Object.keys(chartData),
                    datasets: [{
                      label: selectedColumn,
                      data: Object.values(chartData),
                      backgroundColor: [
                        "#10b981", "#3b82f6", "#f59e0b",
                        "#ef4444", "#6366f1", "#22c55e",
                        "#e11d48", "#8b5cf6", "#14b8a6"
                      ],
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true },
                    },
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
