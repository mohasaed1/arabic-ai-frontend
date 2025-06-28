// src/components/SmartDataDashboard.jsx 
import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import SmartChat from './SmartChat';
import SmartChart from './SmartChart';
import { generateInsights } from '../utils/generateInsights';

const SmartDataDashboard = () => {
  const [allData, setAllData] = useState([]);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartType, setChartType] = useState('auto');
  const [insights, setInsights] = useState({ ar: '', en: '' });
  const [language, setLanguage] = useState('ar');
  const [suggestedChart, setSuggestedChart] = useState(null);
  const [rawFiles, setRawFiles] = useState([]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFileHeaders([]);
    setRawFiles([]);

    const allParsedData = [];
    const parsedFiles = [];

    files.forEach((file, idx) => {
      const fileType = file.name.split('.').pop().toLowerCase();

      const processParsed = (parsed) => {
        allParsedData.push(...parsed);
        parsedFiles.push(parsed);
        if (parsedFiles.length === files.length) finalizeUpload(parsedFiles, files);
      };

      if (fileType === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => processParsed(results.data),
        });
      } else if (fileType === 'xlsx') {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const workbook = XLSX.read(evt.target.result, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const parsed = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          processParsed(parsed);
        };
        reader.readAsBinaryString(file);
      } else if (["jpg", "jpeg", "png", "tiff"].includes(fileType)) {
        Tesseract.recognize(file, 'eng+ara', { logger: m => console.log(m) })
          .then(({ data: { text } }) => {
            const lines = text.trim().split('\n').filter(Boolean);
            const heads = lines[0].split(/\s+/);
            const parsed = lines.slice(1).map(line => {
              const vals = line.split(/\s+/);
              const row = {};
              heads.forEach((h, i) => row[h] = vals[i] || '');
              return row;
            });
            processParsed(parsed);
          })
          .catch(err => alert("❌ OCR failed: " + err));
      }
    });
  };

  const finalizeUpload = async (parsedFiles, files) => {
    try {
      const response = await fetch("https://arabic-ai-app-production.up.railway.app/join-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: parsedFiles })
      });
      const result = await response.json();
      const merged = result.data || [];
      const joinNote = result.join_summary?.join(" | ") || '';

      setAllData(merged);
      const headers = [{
        fileName: 'Merged Data',
        headers: Object.keys(merged[0] || {})
      }];
      setFileHeaders(headers);
      setSelectedColumns(headers.map(h => h.headers.slice(0, 1)));
      setInsights(generateInsights(merged));

      // Suggested chart logic
      const textCol = headers[0].headers.find(h => isNaN(parseFloat(merged[0][h])));
      const numCol = headers[0].headers.find(h => !isNaN(parseFloat(merged[0][h])));
      if (textCol && numCol) {
        setSuggestedChart({ x: textCol, y: numCol, type: 'bar' });
      }

      alert("✅ " + joinNote);
    } catch (err) {
      alert("❌ Failed to merge files: " + err.message);
    }
  };

  const t = {
    ar: {
      title: '📊 لوحة تحليل البيانات الذكية',
      upload: 'اختر ملفات متعددة (CSV، Excel، صور)',
      chooseColumns: 'اختر الأعمدة:',
      summary: '🧠 ملخص ذكي',
      suggestion: '💡 اقتراح رسم بياني'
    },
    en: {
      title: '📊 Smart Data Analytics Dashboard',
      upload: 'Select multiple files (CSV, Excel, Images)',
      chooseColumns: 'Choose columns:',
      summary: '🧠 Smart Summary',
      suggestion: '💡 Suggested Chart'
    }
  };

  return (
    <div className="dashboard-card" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="lang-toggle">
        <button onClick={() => setLanguage('ar')}>🇸🇦 عربي</button>
        <button onClick={() => setLanguage('en')}>🇺🇸 English</button>
      </div>

      <h2>{t[language].title}</h2>
      <input type="file" accept=".csv,.xlsx,.jpg,.jpeg,.png,.tiff" onChange={handleFileUpload} multiple />

      {fileHeaders.length > 0 && (
        <>
          <label>{t[language].chooseColumns}</label>
          <div className="column-grid">
            {fileHeaders.map((fh, idx) => (
              <div key={idx} className="file-selector">
                <label>📁 {fh.fileName}</label>
                <select
                  multiple
                  className="column-select"
                  value={selectedColumns[idx] || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    const updated = [...selectedColumns];
                    updated[idx] = selected;
                    setSelectedColumns(updated);
                  }}
                >
                  {fh.headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {suggestedChart && (
            <div className="suggestion-box">
              <h4>{t[language].suggestion}</h4>
              <button className="btn" onClick={() => {
                setSelectedColumns([[suggestedChart.x, suggestedChart.y]]);
                setChartType(suggestedChart.type);
              }}>
                {language === 'ar'
                  ? `📈 رسم ${suggestedChart.type.toUpperCase()} بين ${suggestedChart.x} و ${suggestedChart.y}`
                  : `📈 Draw ${suggestedChart.type.toUpperCase()} chart of ${suggestedChart.x} vs ${suggestedChart.y}`}
              </button>
            </div>
          )}

          <SmartChart
            allData={allData}
            selectedColumns={selectedColumns}
            chartType={chartType}
          />

          <div className="insight-box">
            <h4>{t[language].summary}</h4>
            {insights[language] ? (
              insights[language].split('\n').map((line, i) => <p key={i}>{line}</p>)
            ) : (
              <p>🚫 لا يوجد ملخص متاح</p>
            )}
          </div>

          <SmartChat
            fileData={allData}
            setSelectedColumns={setSelectedColumns}
            setChartType={setChartType}
          />
        </>
      )}
    </div>
  );
};

export default SmartDataDashboard;
