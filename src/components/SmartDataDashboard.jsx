import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import { Bar, Pie } from 'react-chartjs-2';
import { generateInsights } from '../utils/generateInsights';
import SmartChat from './SmartChat';

const SmartDataDashboard = () => {
  const [datasets, setDatasets] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [progress, setProgress] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [insights, setInsights] = useState({ ar: '', en: '' });
  const [language, setLanguage] = useState('ar');

  const handleFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setProgress(10);
    let allData = [];

    for (const file of files) {
      const fileType = file.name.split('.').pop().toLowerCase();

      if (['csv'].includes(fileType)) {
        await new Promise((resolve) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              allData.push(...results.data);
              resolve();
            },
          });
        });
      } else if (['xlsx'].includes(fileType)) {
        const data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const workbook = XLSX.read(evt.target.result, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            resolve(XLSX.utils.sheet_to_json(sheet, { defval: '' }));
          };
          reader.readAsBinaryString(file);
        });
        allData.push(...data);
      } else if (['jpg', 'jpeg', 'png', 'tiff'].includes(fileType)) {
        const { data: { text } } = await Tesseract.recognize(file, 'eng+ara');
        const lines = text.trim().split('\n').filter(Boolean);
        const hdrs = lines[0].split(/\s+/);
        const parsed = lines.slice(1).map(line => {
          const values = line.split(/\s+/);
          return hdrs.reduce((obj, key, idx) => ({ ...obj, [key]: values[idx] || '' }), {});
        });
        allData.push(...parsed);
      }
    }

    const uniqueHeaders = Array.from(new Set(allData.flatMap(row => Object.keys(row))));
    setDatasets(allData);
    setHeaders(uniqueHeaders);
    setSelectedColumns([uniqueHeaders[0]]);
    setInsights(generateInsights(allData));
    setProgress(100);
  };

  const renderChart = () => {
    if (!selectedColumns.length) return null;
    const chartData = {
      labels: datasets.map((_, i) => `Row ${i + 1}`),
      datasets: selectedColumns.map((col, idx) => {
        const data = datasets.map(row => parseFloat(row[col]) || 0);
        return {
          label: col,
          data,
          backgroundColor: `hsl(${idx * 60}, 70%, 60%)`
        };
      }),
    };

    return <div style={{ width: '100%', minHeight: '400px' }}><Bar data={chartData} /></div>;
  };

  const t = {
    ar: {
      title: '🧠 منصة تحليل البيانات الذكية',
      upload: 'اختر ملفات CSV أو Excel أو صورة (JPEG، PNG...) لتحليلها معًا',
      chooseColumn: 'اختر أعمدة:',
      summary: '🧠 ملخص ذكي'
    },
    en: {
      title: '🧠 Smart Data Analytics Platform',
      upload: 'Upload CSV, Excel, or Image files (JPEG, PNG...) to analyze together',
      chooseColumn: 'Choose columns:',
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
        onChange={handleFilesUpload}
        title={t[language].upload}
      />
      {progress > 0 && <progress value={progress} max="100" style={{ width: '100%' }} />}

      {datasets.length > 0 && (
        <>
          <div className="selector">
            <label>{t[language].chooseColumn}</label>
            <select multiple value={selectedColumns} onChange={e => {
              const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
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

          <SmartChat fileData={datasets} onInsightCommand={setSelectedColumns} />
        </>
      )}
    </div>
  );
};

export default SmartDataDashboard;
