// src/components/SmartChart.jsx
import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const SmartChart = ({ allData, selectedColumns, chartType }) => {
  if (!allData || selectedColumns.flat().length === 0) return null;

  const allSelected = selectedColumns.flat();

  const labels = allData.map((_, i) => `Row ${i + 1}`);
  const colorPalette = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  const datasets = allSelected.map((col, idx) => ({
    label: col,
    data: allData.map((row) => parseFloat(row[col]) || 0),
    backgroundColor: colorPalette[idx % colorPalette.length] + 'AA',
    borderColor: colorPalette[idx % colorPalette.length],
    borderWidth: 2,
    tension: 0.4,
    fill: true,
    pointRadius: 3,
  }));

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { beginAtZero: true },
      x: { ticks: { callback: (val, i) => i % 5 === 0 ? val : '' } },
    },
  };

  const renderChart = () => {
    if (chartType === 'bar') return <Bar data={chartData} options={options} />;
    if (chartType === 'pie') return <Pie data={{ labels: allSelected, datasets: [datasets[0]] }} />;
    return <Line data={chartData} options={options} />;
  };

  return (
    <div style={{ width: '100%', height: '500px', marginBottom: '2rem' }}>
      {renderChart()}
    </div>
  );
};

export default SmartChart;
