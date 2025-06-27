// SmartChart.jsx
import React from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const colorPalette = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const SmartChart = ({ allData, selectedColumns, chartType }) => {
  if (!selectedColumns.length || selectedColumns.every(cols => cols.length === 0)) return null;

  const flatCols = [...new Set(selectedColumns.flat())];
  const isSingleFile = selectedColumns.length === 1;

  const isNumericColumn = (col, sample = 5) => {
    const nums = allData.map(row => parseFloat(row[col])).filter(val => !isNaN(val));
    return nums.length >= sample;
  };

  const autoChartType = (col) => (isNumericColumn(col) ? 'line' : 'bar');

  const commonLabels = allData.map((_, i) => i + 1);

  const buildDataset = (col, fileName = '') => {
    return {
      label: `${col}${fileName ? ' - ' + fileName : ''}`,
      data: allData.map(row => parseFloat(row[col]) || 0),
      backgroundColor: colorPalette[Math.floor(Math.random() * colorPalette.length)] + '88',
      borderColor: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      borderWidth: 2,
      tension: 0.4,
      fill: false,
    };
  };

  const groupedData = selectedColumns.map((cols, fileIdx) => {
    return cols.map(col => buildDataset(col));
  }).flat();

  const chartProps = {
    data: {
      labels: commonLabels,
      datasets: groupedData,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#eee' },
        },
        x: {
          grid: { color: '#f5f5f5' },
          ticks: {
            callback: function (val, index) {
              return index % 5 === 0 ? val : '';
            },
          },
        },
      },
    },
  };

  const finalChartType = chartType !== 'auto' ? chartType : (isNumericColumn(flatCols[0]) ? 'line' : 'bar');

  return (
    <div style={{ width: '100%', height: '500px' }}>
      {finalChartType === 'bar' && <Bar {...chartProps} />}
      {finalChartType === 'line' && <Line {...chartProps} />}
      {finalChartType === 'pie' && <Pie {...chartProps} data={{
        labels: groupedData.map(ds => ds.label),
        datasets: [{
          data: groupedData.map(ds => ds.data.reduce((sum, val) => sum + val, 0)),
          backgroundColor: colorPalette,
        }]
      }} />}
    </div>
  );
};

export default SmartChart;
