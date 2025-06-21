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
  const [selectedColumn, setSelectedColumn] = useState('');
  const [insights, setInsights] = useState({ ar: '', en: '' });
  const [language, setLanguage] = useState('ar'); // default to Arabic

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    setProgress(10);

    if (['csv'].includes(fileType)) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const parsedData = results.data.slice(0, 20);
          const headers = results.meta.fields;
          setData(parsedData);
          setHeaders(headers);
          setSelectedColumn(headers[0]);
          setInsights(generateInsights(parsedData));
          setProgress(100);
        },
      });
    } else if (['xlsx'].includes(fileType)) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const workbook = XLSX.read(evt.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const headers = Object.keys(parsedData[0] || {});
        setData(parsedData.slice(0, 20));
        setHeaders(headers);
        setSelectedColumn(headers[0]);
        setInsights(generateInsights(parsedData.slice(0, 20)));
        setProgress(100);
      };
      reader.readAsBinaryString(file);
    } else if (['jpg', 'jpeg', 'png', 'tiff'].includes(fileType)) {
      Tesseract.recognize(file, 'eng+ara', { logger: m => console.log(m) })
        .then(({ data: { text } }) => {
          const lines = text.trim().split('\n').filter(Boolean);
          const headers = lines[0].split(/\s+/);
          const parsedData = lines.slice(1, 21).map(line => {
            const values = line.split(/\s+/);
            const row = {};
            headers.forEach((h, i) => row[h] = values[i] || '');
            return row;
          });
          setData(parsedData);
          setHeaders(headers);
          setSelectedColumn(headers[0]);
          setInsights(generateInsights(parsedData));
          setProgress(100);
        })
        .catch(err => {
          console.error(err);
          alert("❌ Failed to process image. Please upload a clearer image.");
        });
    } else {
      alert("❌ Unsupported file type. Please upload CSV, XLSX, JPG, PNG, or TIFF.");
    }
  };

  const renderChart = () => {
    if (!selectedColumn) return null;
    const values = data.map(row => row[selectedColumn]);
    const isNumeric = values.every(v => !isNaN(parseFloat(v)));

    const grouped = values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    const chartData = {
      labels: Object.keys(grouped),
      datasets: [{
        label: selectedColumn,
        data: Object.values(grouped),
        backgroundColor: 'rgba(100, 149, 237, 0.6)',
      }]
    };

    return <div style={{ width: '100%', marginTop: 20 }}><Bar data={chartData} /></div>;
  };

  const t = {
    ar: {
      title: '📊 لوحة البيانات الذكية',
      upload: 'اختر ملف CSV أو Excel أو صورة (JPEG، PNG...)',
      chooseColumn: 'اختر عمود:',
      summary: '🧠 ملخص ذكي'
    },
    en: {
      title: '📊 Smart Data Dashboard',
      upload: 'Choose a CSV, Excel, or Image file (JPEG, PNG...)',
      chooseColumn: 'Select column:',
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
      />
      {progress > 0 && <progress value={progress} max="100" style={{ width: '100%' }} />}

      {headers.length > 0 && (
        <div className="selector">
          <label>{t[language].chooseColumn}</label>
          <select value={selectedColumn} onChange={e => setSelectedColumn(e.target.value)}>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      )}

      <div className="chart-area">
        {renderChart()}
      </div>

      <div className="insight-box">
        <h4>{t[language].summary}</h4>
        <p>{insights[language]}</p>
      </div>

      <SmartChat fileData={data} language={language} />
    </div>
  );
};

export default SmartDataDashboard;
