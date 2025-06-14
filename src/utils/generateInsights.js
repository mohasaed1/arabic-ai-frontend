export function generateInsights(data, column) {
  if (!data || !column) return "No data to analyze.";

  const values = data.map(row => row[column]).filter(v => v !== undefined && v !== null && v !== "");

  if (values.length === 0) return "No values found in this column.";

  const isNumeric = values.every(val => !isNaN(parseFloat(val)));

  if (isNumeric) {
    const nums = values.map(Number);
    const sum = nums.reduce((a, b) => a + b, 0);
    const avg = (sum / nums.length).toFixed(2);
    const min = Math.min(...nums);
    const max = Math.max(...nums);

    return `📊 This column contains numeric data.
- Count: ${nums.length}
- Average: ${avg}
- Min: ${min}
- Max: ${max}`;
  } else {
    const counts = {};
    values.forEach(v => counts[v] = (counts[v] || 0) + 1);

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 3).map(([val, count]) => `${val} (${count})`).join(", ");

    return `🧾 This column contains text data.
- Unique Values: ${Object.keys(counts).length}
- Most common: ${top}`;
  }
}
