import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import { Bar } from 'react-chartjs-2';
import { generateInsights } from '../utils/generateInsights';
import SmartChat from './SmartChat';

const SmartDataDashboard = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [progress, setProgress] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [insights, setInsights] = useState({ ar: '', en: '' });
  const [language, setLanguage] = useState('ar');

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const combinedData = [];
    setProgress(10);

    for (const file of files) {
      const fileType = file.name.split('.').pop().toLowerCase();

      if (['csv'].includes(fileType)) {
        await new Promise((resolve) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              combinedData.push(...results.data);
              resolve();
            },
          });
        });
      } else if (['xlsx'].includes(fileType)) {
        const content = await file.arrayBuffer();
        const workbook = XLSX.read(content, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        combinedData.push(...sheetData);
      } else if (['jpg', 'jpeg', 'png', 'tiff'].includes(fileType)) {
        const { data: { text } } = await Tesseract.recognize(file, 'eng+ara');
        const lines = text.trim().split('\n').filter(Boolean);
        const imageHeaders = lines[0].split(/\s+/);
        const parsedData = lines.slice(1).map(line => {
          const row = {};
          line.split(/\s+/).forEach((val, i) => row[imageHeaders[i]] = val);
          return row;
        });
        combinedData.push(...parsedData);
      }
    }

    const validData = combinedData.slice(0, 50);
    const cols = Object.keys(validData[0] || {});
    setData(validData);
    setHeaders(cols);
    setSelectedColumns(cols.slice(0, 2));
    setInsights(generateInsights(validData));
    setProgress(100);
  };

  const renderChart = () => {
    if (selectedColumns.length === 0) return null;
    const labels = data.map((_, i) => `Row ${i + 1}`);
    const datasets = selectedColumns.map((col, index) => {
      return {
        label: col,
        data: data.map(row => parseFloat(row[col]) || 0),
        backgroundColor: `rgba(${(index * 80) % 255}, ${(index * 120) % 255}, 200, 0.5)`,
      };
    });

    return (
      <div className="chart-container">
        <Bar data={{ labels, datasets }} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      </div>
    );
  };

  const t = {
    ar: {
      title: '📊 منصة تحليل البيانات الذكية',
      upload: 'اختر ملفات CSV أو Excel أو صور (JPEG، PNG، TIFF)',
      chooseColumns: 'اختر أعمدة التحليل:',
      summary: '🧠 ملخص ذكي'
    },
    en: {
      title: '📊 Smart Data Analysis Platform',
      upload: 'Choose CSV, Excel or Image files (JPEG, PNG, TIFF)',
      chooseColumns: 'Select analysis columns:',
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
        multiple
        onChange={handleFileUpload}
        title={t[language].upload}
      />
      {progress > 0 && <progress value={progress} max="100" style={{ width: '100%' }} />}

      {headers.length > 0 && (
        <>
          <div className="selector">
            <label>{t[language].chooseColumns}</label>
            <select multiple value={selectedColumns} onChange={e => {
              const options = Array.from(e.target.selectedOptions).map(o => o.value);
              setSelectedColumns(options);
            }}>
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

          <SmartChat fileData={data} onAiChartUpdate={setSelectedColumns} />
        </>
      )}
    </div>
  );
};

export default SmartDataDashboard;
