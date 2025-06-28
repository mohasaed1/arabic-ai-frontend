// SmartDataDashboard.jsx (with tagging + export)
import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import SmartChat from './SmartChat';
import SmartChart from './SmartChart';
import JoinEditor from './JoinEditor';
import { generateInsights } from '../utils/generateInsights';
import html2pdf from 'html2pdf.js';

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
      headers: Object.keys(merged[0] || {}).filter(k => k && !k.toLowerCase().includes('empty'))
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
      const promptAr = `📊 الرجاء تحليل هذه البيانات واستخراج أهم المؤشرات الذكية، أبرز الاتجاهات، القيم غير العادية، وأهم المخرجات الممكنة مع وضع علامة على كل نتيجة بوضوح (✅ جيد، 🔺 شاذة، 🔻 ضعيفة).`;
      const promptEn = `📊 Analyze this dataset and return key KPIs, patterns, anomalies, and business insights. Tag each line clearly with (✅ Good, 🔺 Outlier, 🔻 Drop).`;

      const [arRes, enRes] = await Promise.all([
        fetch("https://arabic-ai-app-production.up.railway.app/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: promptAr, data: allData, lang: "ar" })
        }),
        fetch("https://arabic-ai-app-production.up.railway.app/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: promptEn, data: allData, lang: "en" })
        })
      ]);

      const arData = await arRes.json();
      const enData = await enRes.json();

      setInsights({
        ar: arData.reply?.trim() || '❌ لم يتم التوصل إلى ملخص ذكي. يرجى المحاولة مرة أخرى.',
        en: enData.reply?.trim() || '❌ No AI summary returned. Try again with a simpler dataset.'
      });
    } catch (e) {
      alert("❌ Full AI Analysis failed.");
    } finally {
      setLoadingAI(false);
    }
  };

  const downloadReport = () => {
    const content = `\nArabic Summary:\n${insights.ar}\n\nEnglish Summary:\n${insights.en}`;
    const opt = { margin: 0.5, filename: 'AI_Analysis_Report.pdf', html2canvas: {}, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
    html2pdf().set(opt).from(`<pre>${content}</pre>`).save();
  };

  const t = {
    ar: {
      title: '📊 لوحة تحليل البيانات الذكية',
      upload: 'اختر ملفات متعددة (CSV، Excel، صور)',
      chooseColumns: 'اختر الأعمدة:',
      summary: '🧠 ملخص ذكي',
      suggestion: '💡 اقتراح رسم بياني',
      runAI: '🔍 تنفيذ تحليل AI الكامل',
      download: '📥 تحميل التقرير',
      debug: '🪵 عرض البيانات'
    },
    en: {
      title: '📊 Smart Data Analytics Dashboard',
      upload: 'Select multiple files (CSV, Excel, Images)',
      chooseColumns: 'Choose columns:',
      summary: '🧠 Smart Summary',
      suggestion: '💡 Suggested Chart',
      runAI: '🔍 Run Full AI Analysis',
      download: '📥 Download Report',
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

          <div className="my-2">
            <button className="btn bg-yellow-400" onClick={runFullAI} disabled={loadingAI}>
              {loadingAI ? '⏳ Running Analysis...' : t[language].runAI}
            </button>
            <button className="btn mx-2" onClick={downloadReport}>{t[language].download}</button>
            <button className="btn" onClick={() => setShowDebug(!showDebug)}>{t[language].debug}</button>
          </div>

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
