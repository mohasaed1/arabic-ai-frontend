import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export default function DataUploadForm() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          setColumns(results.meta.fields);
          setData(results.data);
        },
      });
    } else if (
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls")
    ) {
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        setColumns(Object.keys(json[0]));
        setData(json);
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Please upload a valid CSV or Excel file.");
    }
  };

  return (
    <div className="form-section">
      <h2 style={{ marginBottom: "1rem" }}>📊 Upload CSV or Excel File</h2>
      <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
      {fileName && <p style={{ marginTop: "0.5rem" }}>📁 File: {fileName}</p>}

      {columns.length > 0 && (
        <div className="preview-table" style={{ marginTop: "1.5rem" }}>
          <h3>📋 Preview First 5 Rows</h3>
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
