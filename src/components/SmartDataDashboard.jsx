import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import { Line } from 'react-chartjs-2';
import { generateInsights } from '../utils/generateInsights';
import SmartChat from './SmartChat';

const SmartDataDashboard = () => {
  const [allData, setAllData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [progress, setProgress] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [insights, setInsights] = useState({ ar: '', en: '' });
  const [language, setLanguage] = useState('ar');

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const allParsedData = [];
    setProgress(10);

    files.forEach((file, idx) => {
      const fileType = file.name.split('.').pop().toLowerCase();

      if (fileType === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data;
            allParsedData.push(...parsed);
            if (idx === files.length - 1) finalizeUpload(allParsedData);
          },
        });
      } else if (fileType === 'xlsx') {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const workbook = XLSX.read(evt.target.result, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const parsed = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          allParsedData.push(...parsed);
          if (idx === files.length - 1) finalizeUpload(allParsedData);
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
              heads.forEach((h, i) => row[h] = vals[i] || '');
              return row;
            });
            allParsedData.push(...parsed);
            if (idx === files.length - 1) finalizeUpload(allParsedData);
          })
          .catch(err => alert("❌ Failed to process image: " + err));
      }
    });
  };

  const finalizeUpload = (combinedData) => {
    const heads = Object.keys(combinedData[0] || {});
    setAllData(combinedData);
    setHeaders(heads);
    setSelectedColumns(heads.slice(0, 2));
    setInsights(generateInsights(combinedData));
    setProgress(100);
  };

  const renderChart = () => {
    if (selectedColumns.length < 2) return null;
    const datasets = selectedColumns.map(col => {
      return {
        label: col,
        data: allData.map(row => parseFloat(row[col]) || 0),
        fill: false,
      };
    });
    return <div style={{ width: '100%', minHeight: 400 }}><Line data={{
      labels: allData.map((_, i) => i + 1),
      datasets,
    }} /></div>;
  };

  const t = {
    ar: {
      title: '📊 لوحة تحليل البيانات الذكية',
      upload: 'اختر ملفات متعددة (CSV، Excel، صور)',
      chooseColumns: 'اختر الأعمدة للمقارنة:',
      summary: '🧠 ملخص ذكي'
    },
    en: {
      title: '📊 Smart Data Analytics Dashboard',
      upload: 'Select multiple files (CSV, Excel, Images)',
      chooseColumns: 'Select columns for comparison:',
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
      <input
        type="file"
        accept=".csv,.xlsx,.jpg,.jpeg,.png,.tiff"
        onChange={handleFileUpload}
        multiple
        title={t[language].upload}
      />
      {progress > 0 && <progress value={progress} max="100" style={{ width: '100%' }} />}

      {allData.length > 0 && (
        <>
          <div className="selector">
            <label>{t[language].chooseColumns}</label>
            <select
  multiple
  value={selectedColumns}
  onChange={e =>
    setSelectedColumns(Array.from(e.target.selectedOptions, (option) => option.value))
  }
  className="column-select"
>
  {headers.map((h) => (
    <option key={h} value={h}>
      {h}
    </option>
  ))}
</select>
          </div>

          <div className="chart-area">
            {renderChart()}
          </div>

          <div className="insight-box">
            <h4>{t[language].summary}</h4>
            <div className="insight-box">
  <h4>{t[language].summary}</h4>
  {insights[language] ? (
    insights[language].split('\n').map((line, i) => <p key={i}>{line}</p>)
  ) : (
    <p>🚫 لا يوجد ملخص متاح</p>
  )}
</div>

          </div>

          <SmartChat fileData={allData} />
        </>
      )}
    </div>
  );
};

export default SmartDataDashboard;
