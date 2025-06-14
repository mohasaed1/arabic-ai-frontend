import React, { useState } from "react";
import Papa from "papaparse";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DataUploadForm() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setColumns(results.meta.fields);
        setData(results.data);
      },
    });
  };

  const generateChartData = () => {
    if (!selectedColumn || data.length === 0) return [];

    const counts = {};
    data.forEach((row) => {
      const value = row[selectedColumn];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([key, value]) => ({ name: key, value }));
  };

  return (
    <div className="form-section">
      <input type="file" accept=".csv" onChange={handleFileChange} />

      {columns.length > 0 && (
        <>
          <div style={{ marginTop: "1.5rem" }}>
            <strong>🧩 Preview (first 5 rows):</strong>
            <table className="data-table" style={{ marginTop: "0.5rem", width: "100%" }}>
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

          <div style={{ marginTop: "2rem" }}>
            <label>
              <strong>📌 Select a column for analysis:</strong>
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                style={{ marginInlineStart: "1rem", padding: "0.3rem" }}
              >
                <option value="">-- اختر عموداً --</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedColumn && (
            <div style={{ marginTop: "2rem" }}>
              <h3>📊 Chart: {selectedColumn}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={generateChartData()}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
