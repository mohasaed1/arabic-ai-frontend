import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { generateInsights } from '../utils/generateInsights';
import SmartChat from './SmartChat';

const SmartDataDashboard = () => {
  const [allData, setAllData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [progress, setProgress] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [insights, setInsights] = useState({ ar: '', en: '' });
  const [language, setLanguage] = useState('ar');
  const [suggestedColumn, setSuggestedColumn] = useState('');

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    let combinedData = [];
    setProgress(10);

    const processFile = (file, index, done) => {
      const fileType = file.name.split('.').pop().toLowerCase();

      if (['csv'].includes(fileType)) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            combinedData = [...combinedData, ...results.data];
            done();
          },
        });
      } else if (['xlsx'].includes(fileType)) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const workbook = XLSX.read(evt.target.result, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          combinedData = [...combinedData, ...parsedData];
          done();
        };
        reader.readAsBinaryString(file);
      } else if (['jpg', 'jpeg', 'png', 'tiff'].includes(fileType)) {
        Tesseract.recognize(file, 'eng+ara', { logger: m => console.log(m) })
          .then(({ data: { text } }) => {
            const lines = text.trim().split('\n').filter(Boolean);
            const headers = lines[0].split(/\s+/);
            const parsedData = lines.slice(1).map(line => {
              const values = line.split(/\s+/);
              const row = {};
              headers.forEach((h, i) => row[h] = values[i] || '');
              return row;
            });
            combinedData = [...combinedData, ...parsedData];
            done();
          })
          .catch(err => {
            console.error(err);
            alert("❌ Failed to process image file.");
            done();
          });
      } else {
        alert("❌ Unsupported file: " + file.name);
        done();
      }
    };

    let count = 0;
    const onFileProcessed = () => {
      count++;
      if (count === files.length) {
        setAllData(combinedData);
        const uniqueHeaders = [...new Set(combinedData.flatMap(obj => Object.keys(obj)))];
        setHeaders(uniqueHeaders);
        setSelectedColumns(uniqueHeaders.slice(0, 2));
        setInsights(generateInsights(combinedData.slice(0, 5)));
        setProgress(100);
      }
    };

    files.forEach(file => processFile(file, 0, onFileProcessed));
  };

  const renderChart = () => {
    if (!selectedColumns.length) return null;
    const chartData = {
      labels: allData.map((_, i) => `Row ${i + 1}`),
      datasets: selectedColumns.map((col, index) => {
        const isNumeric = allData.every(row => !isNaN(parseFloat(row[col])));
        return {
          label: col,
          data: allData.map(row => parseFloat(row[col]) || 0),
          backgroundColor: `rgba(100, ${100 + index * 50}, 237, 0.5)`
        };
      })
    };
    return <Line data={chartData} />;
  };

  const handleAIChartSuggestion = (col) => {
    if (col && headers.includes(col)) {
      setSelectedColumns([col]);
      setSuggestedColumn(col);
    }
  };

  const t = {
    ar: {
      title: '🧠 منصة تحليل البيانات الذكية',
      upload: 'اختر ملفات CSV أو Excel أو صور (JPEG, PNG...)',
      chooseColumn: 'اختر أعمدة:',
      summary: '🧠 ملخص ذكي'
    },
    en: {
      title: '🧠 Smart Data Analysis Platform',
      upload: 'Select CSV, Excel, or image files (JPEG, PNG...)',
      chooseColumn: 'Select columns:',
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
        multiple
        accept=".csv,.xlsx,.jpg,.jpeg,.png,.tiff"
        onChange={handleFileUpload}
        title={t[language].upload}
      />
      {progress > 0 && <progress value={progress} max="100" style={{ width: '100%' }} />}

      {allData.length > 0 && (
        <>
          <div className="selector">
            <label>{t[language].chooseColumn}</label>
            <select
              multiple
              value={selectedColumns}
              onChange={e => setSelectedColumns(Array.from(e.target.selectedOptions, option => option.value))}
            >
              {headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div className="chart-area">
            {renderChart()}
          </div>

          <div className="insight-box">
            <h4>{t[language].summary}</h4>
            <p>{insights[language]}</p>
          </div>

          <SmartChat
            fileData={allData}
            suggestChart={handleAIChartSuggestion}
            language={language}
          />
        </>
      )}
    </div>
  );
};

export default SmartDataDashboard;
