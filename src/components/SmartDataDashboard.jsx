import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import SmartChat from './SmartChat';
import { generateInsights } from '../utils/generateInsights';

ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const SmartDataDashboard = () => {
  const [datasets, setDatasets] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [progress, setProgress] = useState(0);
  const [insights, setInsights] = useState({ ar: '', en: '' });
  const [language, setLanguage] = useState('ar');

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    let combinedData = [];
    let allHeaders = new Set();
    setProgress(10);

    for (const file of files) {
      const fileType = file.name.split('.').pop().toLowerCase();
      if (['csv'].includes(fileType)) {
        await new Promise((resolve) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
              const data = results.data;
              combinedData = combinedData.concat(data);
              data.forEach(row => Object.keys(row).forEach(h => allHeaders.add(h)));
              resolve();
            }
          });
        });
      } else if (['xlsx'].includes(fileType)) {
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onload = (evt) => {
            const workbook = XLSX.read(evt.target.result, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            combinedData = combinedData.concat(data);
            data.forEach(row => Object.keys(row).forEach(h => allHeaders.add(h)));
            resolve();
          };
          reader.readAsBinaryString(file);
        });
      } else if (['jpg', 'jpeg', 'png', 'tiff'].includes(fileType)) {
        await Tesseract.recognize(file, 'eng+ara', { logger: m => console.log(m) })
          .then(({ data: { text } }) => {
            const lines = text.trim().split('\n').filter(Boolean);
            const headers = lines[0].split(/\s+/);
            const data = lines.slice(1).map(line => {
              const values = line.split(/\s+/);
              const row = {};
              headers.forEach((h, i) => row[h] = values[i] || '');
              return row;
            });
            combinedData = combinedData.concat(data);
            data.forEach(row => Object.keys(row).forEach(h => allHeaders.add(h)));
          });
      }
    }

    const allHeadersArr = Array.from(allHeaders);
    setDatasets(combinedData);
    setHeaders(allHeadersArr);
    setSelectedColumns(allHeadersArr.slice(0, 2));
    setInsights(generateInsights(combinedData));
    setProgress(100);
  };

  const renderChart = () => {
    if (selectedColumns.length < 1 || datasets.length === 0) return null;
    const labels = datasets.map((row, idx) => `Row ${idx + 1}`);
    const chartData = {
      labels,
      datasets: selectedColumns.map(col => ({
        label: col,
        data: datasets.map(row => isNaN(row[col]) ? 0 : Number(row[col])),
        fill: false,
        backgroundColor: 'rgba(100, 149, 237, 0.6)',
        borderColor: 'rgba(30, 100, 200, 1)',
        tension: 0.4
      }))
    };
    return <Line data={chartData} />;
  };

  const t = {
    ar: {
      title: '🧠 منصة تحليل البيانات الذكية',
      upload: 'اختر ملفات CSV أو Excel أو صور (PNG، JPG...)',
      chooseColumns: 'اختر أعمدة:',
      summary: '🧠 ملخص ذكي'
    },
    en: {
      title: '🧠 Smart Data Analysis Platform',
      upload: 'Choose CSV, Excel, or image files (PNG, JPG...)',
      chooseColumns: 'Select Columns:',
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
        title={t[language].upload}
        multiple
      />

      {progress > 0 && <progress value={progress} max="100" style={{ width: '100%' }} />}

      {headers.length > 0 && (
        <div className="selector">
          <label>{t[language].chooseColumns}</label>
          <select multiple value={selectedColumns} onChange={e => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setSelectedColumns(values);
          }}>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      )}

      <div className="chart-area" style={{ width: '100%', minHeight: '300px' }}>
        {renderChart()}
      </div>

      <div className="insight-box">
        <h4>{t[language].summary}</h4>
        <p>{insights[language]}</p>
      </div>

      <SmartChat fileData={datasets} language={language} />
    </div>
  );
};

export default SmartDataDashboard;
