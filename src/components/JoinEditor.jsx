import React, { useEffect, useState } from "react";

export default function JoinEditor({ files, onConfirm }) {
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState({});
  const [manualJoin, setManualJoin] = useState({ file1: '', col1: '', file2: '', col2: '' });

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await fetch("https://arabic-ai-app-production.up.railway.app/detect-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: files.map(f => ({ fileName: f.name, data: f.data })) })
      });
      const result = await res.json();
      setMatches(result.matches || []);
    };
    fetchMatches();
  }, [files]);

  const handleSelect = (match) => {
    const key = `${match.file1}-${match.file2}`;
    setSelected(prev => ({ ...prev, [key]: match }));
  };

  const handleManualAdd = () => {
    const { file1, col1, file2, col2 } = manualJoin;
    if (file1 && col1 && file2 && col2) {
      const key = `${file1}-${file2}`;
      setSelected(prev => ({
        ...prev,
        [key]: { file1, col1, file2, col2, score: 'manual' }
      }));
    }
  };

  const uniqueFileNames = [...new Set(files.map(f => f.name))];
  const fileColumns = Object.fromEntries(files.map(f => [f.name, Object.keys(f.data[0] || {})]));

  return (
    <div className="bg-white p-4 rounded shadow-lg max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔗 Join Editor</h2>
      <p className="text-sm text-gray-600 mb-2">Review or edit suggested joins between your uploaded files:</p>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {matches.map((m, i) => (
          <div
            key={i}
            className={`p-2 border rounded ${selected[`${m.file1}-${m.file2}`]?.col1 === m.col1 ? 'border-blue-500' : 'border-gray-300'}`}
            onClick={() => handleSelect(m)}
          >
            {m.file1}.{m.col1} = {m.file2}.{m.col2} (score: {m.score})
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-4">
        <h3 className="text-sm font-semibold mb-1">✍️ Manual Join</h3>
        <div className="flex gap-2 flex-wrap">
          <select onChange={e => setManualJoin({ ...manualJoin, file1: e.target.value })}>
            <option value=''>File A</option>
            {uniqueFileNames.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select onChange={e => setManualJoin({ ...manualJoin, col1: e.target.value })}>
            <option value=''>Column A</option>
            {(fileColumns[manualJoin.file1] || []).map(col => <option key={col} value={col}>{col}</option>)}
          </select>

          <select onChange={e => setManualJoin({ ...manualJoin, file2: e.target.value })}>
            <option value=''>File B</option>
            {uniqueFileNames.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select onChange={e => setManualJoin({ ...manualJoin, col2: e.target.value })}>
            <option value=''>Column B</option>
            {(fileColumns[manualJoin.file2] || []).map(col => <option key={col} value={col}>{col}</option>)}
          </select>
          <button onClick={handleManualAdd} className="bg-green-500 text-white px-2 rounded">➕ Add</button>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <h3 className="text-sm font-semibold mb-1">🗺️ Visual Join Map</h3>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
          {Object.values(selected).map((m, i) => `${m.file1}.${m.col1} = ${m.file2}.${m.col2}  [${m.score}]`).join("\n") || "(No joins selected)"}
        </pre>
      </div>

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => onConfirm(Object.values(selected))}
      >
        ✅ Confirm Join
      </button>
    </div>
  );
}
