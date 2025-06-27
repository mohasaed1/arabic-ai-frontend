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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const allParsedData = [];
    setFileHeaders([]);

    files.forEach((file, idx) => {
      const fileType = file.name.split('.').pop().toLowerCase();
      const tagSource = (data) => data.map((row) => ({ ...row, __source: file.name }));

      const processParsed = (parsed) => {
        const tagged = tagSource(parsed);
        allParsedData.push(...tagged);
        if (idx === files.length - 1) finalizeUpload(allParsedData, files);
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

  const finalizeUpload = (combinedData, files) => {
    setAllData(combinedData);
    const headers = files.map(file => {
      const data = combinedData.filter(row => row.__source === file.name);
      return {
        fileName: file.name,
        headers: Object.keys(data[0] || {}).filter(k => k !== '__source')
      };
    });
    setFileHeaders(headers);
    setSelectedColumns(headers.map(h => h.headers.slice(0, 1)));
    setInsights(generateInsights(combinedData));
  };

  const t = {
    ar: {
      title: '📊 لوحة تحليل البيانات الذكية',
      upload: 'اختر ملفات متعددة (CSV، Excel، صور)',
      chooseColumns: 'اختر الأعمدة لكل ملف:',
      summary: '🧠 ملخص ذكي'
    },
    en: {
      title: '📊 Smart Data Analytics Dashboard',
      upload: 'Select multiple files (CSV, Excel, Images)',
      chooseColumns: 'Choose columns per file:',
      summary: '🧠 Smart Summary'
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
