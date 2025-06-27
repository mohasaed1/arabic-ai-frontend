import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import { Line } from 'react-chartjs-2';
import { generateInsights } from '../utils/generateInsights';
import SmartChat from './SmartChat';

const SmartDataDashboard = () => {
  const [allData, setAllData] = useState([]);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [progress, setProgress] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [insights, setInsights] = useState({ ar: '', en: '' });
  const [language, setLanguage] = useState('ar');

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const allParsedData = [];
    const headersPerFile = [];
    setProgress(10);

    files.forEach((file, idx) => {
      const fileType = file.name.split('.').pop().toLowerCase();

      const tagSource = (data) =>
        data.map((row) => ({ ...row, __source: file.name }));

      if (fileType === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const tagged = tagSource(results.data);
            allParsedData.push(...tagged);
            if (idx === files.length - 1) finalizeUpload(allParsedData, files);
          },
        });
      } else if (fileType === 'xlsx') {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const workbook = XLSX.read(evt.target.result, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const parsed = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          const tagged = tagSource(parsed);
          allParsedData.push(...tagged);
          if (idx === files.length - 1) finalizeUpload(allParsedData, files);
        };
        reader.readAsBinaryString(file);
      } else if (['jpg', 'jpeg', 'png', 'tiff'].includes(fileType)) {
        Tesseract.recognize(file, 'eng+ara', { logger: m => console.log(m) })
          .then(({ data: { text } }) => {
            const lines = text.trim().split('\n').filter(Boolean);
            const heads = lines[0].split(/\s+/);
            const parsed = lines.slice(1).map(line => {
              const vals = line.split(/\s+/);
              const row = {};
              heads.forEach((h, i) => (row[h] = vals[i] || ''));
              return row;
            });
            const tagged = tagSource(parsed);
            allParsedData.push(...tagged);
            if (idx === files.length - 1) finalizeUpload(allParsedData, files);
          })
          .catch((err) => alert("❌ Failed to process image: " + err));
      }
    });
  };

  const finalizeUpload = (combinedData, originalFiles) => {
    const groupedHeaders = originalFiles.map((file) => {
      const data = combinedData.filter((row) => row.__source === file.name);
      return {
        fileName: file.name,
        headers: Object.keys(data[0] || {}).filter((key) => key !== '__source'),
      };
    });

    setAllData(combinedData);
    setFileHeaders(groupedHeaders);
    setSelectedColumns(groupedHeaders.map(g => g.headers.slice(0, 1))); // default first column
    setInsights(generateInsights(combinedData));
    setProgress(100);
  };

  const renderChart = () => {
    const allSelected = selectedColumns.flat();
    if (allSelected.length < 1) return null;

    const datasets = allSelected.map((col) => ({
      label: col,
      data: allData.map((row) => parseFloat(row[col]) || 0),
      fill: false,
      borderWidth: 2,
    }));

    return (
      <div className="chart-container">
        <Line
          data={{
            labels: allData.map((_, i) => i + 1),
            datasets,
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    );
  };

  const t = {
    ar: {
      title: '📊 لوحة تحليل البيانات الذكية',
      upload: 'اختر ملفات متعددة (CSV، Excel، صور)',
      chooseColumns: 'اختر الأعمدة لكل ملف:',
      summary: '🧠 ملخص ذكي',
    },
    en: {
      title: '📊 Smart Data Analytics Dashboard',
      upload: 'Select multiple files (CSV, Excel, Images)',
      chooseColumns: 'Choose columns per file:',
      summary: '🧠 Smart Summary',
    },
  };

  return (
    <div className="dashboard-card" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="lang-toggle">
        <button onClick={() => setLanguage('ar')}>🇸🇦 عربي</button>
        <button onClick={() => setLanguage('en')}>🇺🇸 English</button>
      </div>

      <h2>{t[language].title}</h2>
      <input
        type="file"
        accept=".csv,.xlsx,.jpg,.jpeg,.png,.tiff"
        onChange={handleFileUpload}
        multiple
        title={t[language].upload}
      />
      {progress > 0 && <progress value={progress} max="100" style={{ width: '100%' }} />}

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

          <div className="chart-area">{renderChart()}</div>

          <div className="insight-box">
            <h4>{t[language].summary}</h4>
            {insights[language] ? (
              insights[language].split('\n').map((line, i) => <p key={i}>{line}</p>)
            ) : (
              <p>🚫 لا يوجد ملخص متاح</p>
            )}
          </div>

          <SmartChat fileData={allData} />
        </>
      )}
    </div>
  );
};

export default SmartDataDashboard;
