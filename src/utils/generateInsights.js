// src/utils/generateInsights.js

export function generateInsights(rows, fields) {
  if (!rows || rows.length === 0) return "📭 لا توجد بيانات لتحليلها.";

  // Auto-detect fields from the first row if not provided
  if (!fields && rows.length > 0) {
    fields = Object.keys(rows[0]);
  }

  if (!fields || fields.length === 0) {
    return "⚠️ لم يتم العثور على أعمدة لتحليلها.";
  }

  const stats = fields.map((field) => {
    const values = rows.map((r) => r[field]).filter(Boolean);
    const numeric = values.every((v) => !isNaN(v));
    if (numeric) {
      const nums = values.map(Number);
      const avg = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
      return `📊 متوسط ${field}: ${avg}`;
    } else {
      const top = mostCommon(values);
      return `🔤 التكرار الأعلى لـ ${field}: ${top}`;
    }
  });

  return stats.join(" | ");
}

function mostCommon(arr) {
  const freq = {};
  for (let item of arr) {
    freq[item] = (freq[item] || 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}
