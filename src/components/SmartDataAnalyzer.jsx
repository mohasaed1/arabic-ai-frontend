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

export default function SmartDataAnalyzer({ onDataReady }) {
  const [fileName, setFileName] = useState("");
  const [columns, setColumns] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [isNumeric, setIsNumeric] = useState(false);
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
        processParsedData(parsed.data);
      } else if (ext === "xlsx") {
        const workbook = XLSX.read(content, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        processParsedData(jsonData);
      }
    };

    if (ext === "csv") {
      reader.readAsText(file);
    } else if (ext === "xlsx") {
      reader.readAsBinaryString(file);
    }
  };

  const processParsedData = (rows) => {
    const fields = Object.keys(rows[0]);
    setColumns(fields);
    onDataReady(rows);
  };

  const handleColumnSelect = (col) => {
    setSelectedColumn(col);
    const values = JSON.parse(localStorage.getItem("__last_data"))?.map((row) => row[col]).filter(Boolean);
    const numeric = values.every((v) => !isNaN(v));
    setIsNumeric(numeric);

    const freqMap = {};
    values.forEach((v) => {
      const key = numeric ? Number(v).toFixed(0) : v;
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
    <div className="form-section">
      <h2>📂 ارفع ملف بيانات (Excel أو CSV)</h2>
      <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} />
      {fileName && <p>📄 تم تحميل: {fileName}</p>}

      {columns.length > 0 && (
        <>
          <label htmlFor="column-select">🎯 اختر عمودًا لعرض الرسم البياني:</label>
          <select id="column-select" value={selectedColumn} onChange={(e) => handleColumnSelect(e.target.value)}>
            <option value="">-- اختر عمود --</option>
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </>
      )}

      {chartData && (
        <div className="chart-wrapper">
          <h3>📊 عرض {isNumeric ? "عمودي" : "دائري"} لـ {selectedColumn}</h3>
          <button className="btn" onClick={exportChart}>📥 حفظ الرسم</button>
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
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          ) : (
            <Pie
              ref={chartRef}
              data={{
                labels: Object.keys(chartData),
                datasets: [{
                  label: selectedColumn,
                  data: Object.values(chartData),
                }],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          )}
        </div>
      )}
    </div>
  );
}
