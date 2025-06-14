import React, { useState } from "react";
import Papa from "papaparse";

export default function DataUploadForm() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setColumns(results.meta.fields);
        setData(results.data);
      },
    });
  };

  return (
    <div className="form-section">
      <h2>📊 Upload CSV Data File</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />

      {columns.length > 0 && (
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
      )}
    </div>
  );
}
