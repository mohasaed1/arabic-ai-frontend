import React, { useState } from 'react';
import Papa from 'papaparse';
import { Bar, Pie } from 'react-chartjs-2';
import { generateInsights } from '../utils/generateInsights';
import SmartChatWithData from './SmartChatWithData';

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
    setProgress(10);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setProgress(70);
        const parsedData = results.data.slice(0, 5); // only first 5 rows
        const headers = results.meta.fields;
        setData(parsedData);
        setHeaders(headers);
        setSelectedColumn(headers[0]);
        setInsights(generateInsights(parsedData));
        setProgress(100);
      }
    });
  };

  const renderChart = () => {
    if (!selectedColumn) return null;
    const values = data.map(row => row[selectedColumn]);
    const isNumeric = values.every(v => !isNaN(parseFloat(v)));

    const chartData = {
      labels: isNumeric ? values : Object.keys(values.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {})),
      datasets: [{
        label: selectedColumn,
        data: isNumeric ? values.map(Number) : Object.values(values.reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {})),
        backgroundColor: 'rgba(100, 149, 237, 0.6)',
      }]
    };

    return isNumeric ? <Bar data={chartData} /> : <Pie data={chartData} />;
  };

  const t = {
    ar: {
      title: '📊 لوحة البيانات الذكية',
      upload: 'اختر ملف CSV أو Excel',
      chooseColumn: 'اختر عمود:',
      summary: '🧠 ملخص ذكي'
    },
    en: {
      title: '📊 Smart Data Dashboard',
      upload: 'Choose a CSV or Excel file',
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
      <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} />
      {progress > 0 && <progress value={progress} max="100" style={{ width: '100%' }} />}

      {data.length > 0 && (
        <>
          <div className="preview-table">
            <table>
              <thead>
                <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>{headers.map(h => <td key={h}>{row[h]}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="selector">
            <label>{t[language].chooseColumn}</label>
            <select value={selectedColumn} onChange={e => setSelectedColumn(e.target.value)}>
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

          <SmartChatWithData dataPreview={data} language={language} />
        </>
      )}
    </div>
  );
};

export default SmartDataDashboard;
