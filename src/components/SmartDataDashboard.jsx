// src/components/SmartDataDashboard.jsx with fallback logic and debug preview
import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import SmartChat from './SmartChat';
import SmartChart from './SmartChart';
import JoinEditor from './JoinEditor';
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
  const [showJoinEditor, setShowJoinEditor] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFileHeaders([]);
    setRawFiles([]);
    setShowJoinEditor(false);

    const parsedFiles = [];

    files.forEach((file) => {
      const fileType = file.name.split('.').pop().toLowerCase();

      const processParsed = (parsed) => {
        parsedFiles.push({ name: file.name, data: parsed });
        if (parsedFiles.length === files.length) setRawFiles(parsedFiles);
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

  const finalizeJoin = async (confirmedMatches) => {
    const filesToJoin = rawFiles.map(f => f.data);
    const response = await fetch("https://arabic-ai-app-production.up.railway.app/join-files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: filesToJoin, keys: confirmedMatches })
    });
    const result = await response.json();
    const merged = result.data || [];
    setAllData(merged);

    const headers = [{
      fileName: 'Merged Data',
      headers: Object.keys(merged[0] || {}).filter(k => k && k !== 'EMPTY__')
    }];
    setFileHeaders(headers);
    setSelectedColumns(headers.map(h => h.headers.slice(0, 1)));
    setInsights(generateInsights(merged));

    const validCols = headers[0].headers;
    const textCol = validCols.find(h => typeof merged[0][h] === 'string' && merged[0][h].trim());
    const numCol = validCols.find(h => !isNaN(parseFloat(merged[0][h])));
    if (textCol && numCol) {
      setSuggestedChart({ x: textCol, y: numCol, type: 'bar' });
    }
  };

  const runFullAI = async () => {
    if (!allData.length) return;
    try {
      setLoadingAI(true);
      const [arRes, enRes] = await Promise.all([
        fetch("https://arabic-ai-app-production.up.railway.app/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "الرجاء تقديم ملخص كامل مع مؤشرات الأداء المهمة والتحليلات الذكية", data: allData, lang: "ar" })
        }),
        fetch("https://arabic-ai-app-production.up.railway.app/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "Please provide a full summary with key KPIs and smart insights", data: allData, lang: "en" })
        })
      ]);

      const arData = await arRes.json();
      const enData = await enRes.json();

      const fallback = "يمكنك طرح أي سؤال حول المبيعات أو الأداء، وسنجيب بالتحليل.";
      setInsights({
        ar: arData.reply?.trim() || fallback,
        en: enData.reply?.trim() || "You can ask any question about sales or performance."
      });
    } catch (e) {
      alert("❌ Full AI Analysis failed.");
    } finally {
      setLoadingAI(false);
    }
  };

  const t = {
    ar: {
      title: '📊 لوحة تحليل البيانات الذكية',
      upload: 'اختر ملفات متعددة (CSV، Excel، صور)',
      chooseColumns: 'اختر الأعمدة:',
      summary: '🧠 ملخص ذكي',
      suggestion: '💡 اقتراح رسم بياني',
      runAI: '🔍 تنفيذ تحليل AI الكامل',
      debug: '🪵 عرض البيانات'
    },
    en: {
      title: '📊 Smart Data Analytics Dashboard',
      upload: 'Select multiple files (CSV, Excel, Images)',
      chooseColumns: 'Choose columns:',
      summary: '🧠 Smart Summary',
      suggestion: '💡 Suggested Chart',
      runAI: '🔍 Run Full AI Analysis',
      debug: '🪵 Show Debug Table'
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

      {rawFiles.length > 1 && !allData.length && (
        <div className="mt-6">
          <JoinEditor files={rawFiles} onConfirm={(matches) => { setShowJoinEditor(false); finalizeJoin(matches); }} />
        </div>
      )}

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

          <button className="btn my-3 bg-yellow-400" onClick={runFullAI} disabled={loadingAI}>
            {loadingAI ? '⏳ Running Analysis...' : t[language].runAI}
          </button>
          <button className="btn my-2" onClick={() => setShowDebug(!showDebug)}>{t[language].debug}</button>

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

          {showDebug && (
            <div className="debug-table">
              <pre>{JSON.stringify(allData.slice(0, 5), null, 2)}</pre>
            </div>
          )}

          <SmartChart allData={allData} selectedColumns={selectedColumns} chartType={chartType} />

          <div className="insight-box">
            <h4>{t[language].summary}</h4>
            {insights[language] ? insights[language].split('\n').map((line, i) => <p key={i}>{line}</p>) : <p>🚫 لا يوجد ملخص متاح</p>}
          </div>

          <SmartChat fileData={allData} setSelectedColumns={setSelectedColumns} setChartType={setChartType} />
        </>
      )}
    </div>
  );
};

export default SmartDataDashboard;
