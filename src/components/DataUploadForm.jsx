import React, { useState } from "react";
import Papa from "papaparse";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

  const summarize = () => {
    const summary = columns.map((col) => {
      const nonEmpty = data.filter((row) => row[col] && row[col].trim() !== "");
      return `${col}: ${nonEmpty.length} filled rows`;
    });
    return summary;
  };

  const chartData = {
    labels: columns,
    datasets: [
      {
        label: "Filled Rows per Column",
        data: columns.map(
          (col) => data.filter((row) => row[col] && row[col].trim() !== "").length
        ),
        backgroundColor: "#4faaff",
      },
    ],
  };

  return (
    <div className="form-section">
      <h2>📊 Upload CSV Data File</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />

      {columns.length > 0 && (
        <>
          <div className="mt-4">
            <h3>🧾 Summary</h3>
            <ul style={{ padding: "0 1rem" }}>
              {summarize().map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h3>📈 Column Completeness</h3>
            <Bar data={chartData} />
          </div>

          <div className="mt-6">
            <h3>🔍 Preview (first 5 rows)</h3>
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
        </>
      )}
    </div>
  );
}
