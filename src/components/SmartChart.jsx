import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function SmartChart({ allData, selectedColumns, chartType }) {
  const groupBySource = () => {
    const grouped = {};
    allData.forEach(row => {
      const src = row.__source || 'unknown';
      if (!grouped[src]) grouped[src] = [];
      grouped[src].push(row);
    });
    return grouped;
  };

  const getChartType = (type, yCol) => {
    if (type !== 'auto') return type;
    if (!yCol) return 'bar';
    return yCol.length === 1 ? 'pie' : 'bar';
  };

  const exportAsImage = async () => {
    const chartEl = document.querySelector('.chart-section');
    if (!chartEl) return;
    const canvas = await html2canvas(chartEl);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 180, 160);
    pdf.save('chart.pdf');
  };

  const renderChart = (data, file, idx) => {
    const cols = selectedColumns[idx] || [];
    if (cols.length === 0) return null;

    const x = cols[0];
    const ys = cols.slice(1);
    const uniqueX = [...new Set(data.map(row => row[x]))];

    const datasets = ys.map((y, i) => ({
      label: y,
      data: uniqueX.map(xVal => {
        const matches = data.filter(row => row[x] === xVal);
        const sum = matches.reduce((acc, r) => acc + (parseFloat(r[y]) || 0), 0);
        return sum / matches.length;
      }),
      backgroundColor: `hsl(${i * 70}, 70%, 60%)`,
      borderColor: `hsl(${i * 70}, 70%, 40%)`,
      borderWidth: 1,
      fill: true,
      tension: 0.3
    }));

    const type = getChartType(chartType, ys);
    const config = {
      labels: uniqueX,
      datasets: datasets.length ? datasets : [{
        label: x,
        data: uniqueX.map(v => data.filter(d => d[x] === v).length),
        backgroundColor: `hsl(210, 70%, 70%)`
      }]
    };

    return (
      <div key={idx} style={{ marginBottom: 40, maxWidth: 1000 }}>
        <h4>{file}</h4>
        {type === 'pie' ? (
          <Pie data={config} />
        ) : type === 'line' ? (
          <Line data={config} />
        ) : (
          <Bar data={config} />
        )}
      </div>
    );
  };

  const grouped = groupBySource();
  const keys = Object.keys(grouped);

  return (
    <div className="chart-section" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button onClick={exportAsImage} className="btn">📥 Export PDF</button>
      {keys.map((k, i) => renderChart(grouped[k], k, i))}
    </div>
  );
}
