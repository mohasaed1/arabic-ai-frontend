// SmartDataDashboard.jsx (with AI auto-run + search filtering)
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
  const [searchTerm, setSearchTerm] = useState('');

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
        if (parsedFiles.length === files.length) {
          setRawFiles(parsedFiles);

          if (parsedFiles.length === 1) {
            const data = parsedFiles[0].data;
            setAllData(data);
            const headers = [{
              fileName: parsedFiles[0].name,
              headers: Object.keys(data[0] || {}).filter(k => k && !k.toLowerCase().includes('empty'))
            }];
            setFileHeaders(headers);
            setSelectedColumns(headers.map(h => h.headers.slice(0, 1)));
            setInsights(generateInsights(data));

            const validCols = headers[0].headers;
            const textCol = validCols.find(h => typeof data[0][h] === 'string' && data[0][h].trim());
            const numCol = validCols.find(h => !isNaN(parseFloat(data[0][h])));
            if (textCol && numCol) {
              setSuggestedChart({ x: textCol, y: numCol, type: 'bar' });
            }
            runFullAI();
          }
        }
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

  const filteredData = allData.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="dashboard-card" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="lang-toggle">
        <button onClick={() => setLanguage('ar')}>🇸🇦 عربي</button>
        <button onClick={() => setLanguage('en')}>🇺🇸 English</button>
      </div>

      <h2>📊 لوحة تحليل البيانات الذكية</h2>
      <input type="file" accept=".csv,.xlsx,.jpg,.jpeg,.png,.tiff" onChange={handleFileUpload} multiple />

      {allData.length > 0 && (
        <input
          type="text"
          placeholder={language === 'ar' ? '🔍 ابحث في البيانات...' : '🔍 Search in data...'}
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}

      <SmartChart allData={filteredData} selectedColumns={selectedColumns} chartType={chartType} />
    </div>
  );
};

export default SmartDataDashboard;
