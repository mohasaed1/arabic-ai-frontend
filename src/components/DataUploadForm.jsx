import React, { useState } from "react";
import Papa from "papaparse";
import generateInsights from "../utils/generateInsights";

export default function DataUploadForm() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
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

        // Generate intelligent summary
        const summary = generateInsights(rows, fields);
        setInsights(summary);
      },
    });
  };

  return (
    <div className="form-section">
      <h2>📊 Upload CSV Data File</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />

      {columns.length > 0 && (
        <>
          <div className="mt-4">
            <h3>📋 Preview ({data.length} rows)</h3>
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

          {insights && (
            <div className="mt-6 insights-box">
              <h3>🧠 Intelligent Summary</h3>
              <p>{insights}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
