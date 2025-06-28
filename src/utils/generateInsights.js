// utils/generateInsights.js

export function generateInsights(data) {
  if (!Array.isArray(data) || data.length === 0) return { ar: '', en: '' };

  const isNumeric = val => !isNaN(parseFloat(val)) && isFinite(val);
  const stats = {};
  const keys = Object.keys(data[0] || {}).filter(k => k !== '__source');

  keys.forEach(key => {
    const values = data.map(row => row[key]).filter(v => v !== undefined && v !== null && v !== '');
    const nums = values.map(parseFloat).filter(isNumeric);

    if (nums.length > 0) {
      const sum = nums.reduce((a, b) => a + b, 0);
      const avg = (sum / nums.length).toFixed(2);
      stats[key] = {
        type: 'number',
        min: Math.min(...nums),
        max: Math.max(...nums),
        avg
      };
    } else {
      const freq = {};
      values.forEach(v => freq[v] = (freq[v] || 0) + 1);
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      stats[key] = {
        type: 'text',
        top: sorted.slice(0, 3)
      };
    }
  });

  const en = [`🔍 Loaded ${data.length} rows.`];
  const ar = [`🔍 تم تحميل ${data.length} صفًا.`];

  Object.entries(stats).forEach(([key, val]) => {
    if (val.type === 'number') {
      en.push(`📊 ${key}: min=${val.min}, max=${val.max}, avg=${val.avg}`);
      ar.push(`📊 ${key}: الأدنى=${val.min}، الأعلى=${val.max}، المتوسط=${val.avg}`);
    } else {
      const tops = val.top.map(([v, c]) => `${v} (${c})`).join(', ');
      en.push(`🗂️ ${key}: top values → ${tops}`);
      ar.push(`🗂️ ${key}: القيم الأكثر تكرارًا → ${tops}`);
    }
  });

  return {
    en: en.join('\n'),
    ar: ar.join('\n')
  };
}
