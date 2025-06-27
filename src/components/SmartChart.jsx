// src/components/SmartChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const SmartChart = ({ allData, selectedColumns, chartType = 'auto' }) => {
  if (!selectedColumns.length || !allData.length) return null;

  const isNumeric = (col, rows) =>
    rows.slice(0, 10).every((row) => !isNaN(parseFloat(row[col])));

  const colorPalette = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  // Group rows by file source
  const fileGroups = {};
  allData.forEach((row) => {
    const file = row.__source || 'Unknown';
    if (!fileGroups[file]) fileGroups[file] = [];
    fileGroups[file].push(row);
  });

  // Flatten selectedColumns: [["Units"], ["Units"]] => ["Units", "Units"]
  const flatCols = selectedColumns.flat();
  const uniqueCols = [...new Set(flatCols)];

  const sharedCols = uniqueCols.filter(
    (col) =>
      Object.values(fileGroups).filter((rows) =>
        rows.length && rows[0][col] !== undefined && isNumeric(col, rows)
      ).length > 1
  );

  const overlayCharts = sharedCols.map((col, idx) => {
    const datasets = Object.entries(fileGroups)
      .filter(([_, rows]) => rows[0][col] !== undefined)
      .map(([file, rows], i) => ({
        label: `${file} - ${col}`,
        data: rows.map((row) => parseFloat(row[col]) || 0),
        borderColor: colorPalette[i % colorPalette.length],
        backgroundColor: colorPalette[i % colorPalette.length] + '33',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }));

    return (
      <div className="chart-instance" key={`overlay-${col}`}>
        <h4>📊 {col} (Comparison)</h4>
        <Line
          data={{
            labels: datasets[0].data.map((_, i) => i + 1),
            datasets,
          }}
          options={{
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
              },
            },
          }}
        />
      </div>
    );
  });

  const sideBySideCharts = selectedColumns.map((cols, idx) => {
    const fileName = Object.keys(fileGroups)[idx];
    const rows = fileGroups[fileName];
    return cols
      .filter((col) => isNumeric(col, rows))
      .filter((col) => !sharedCols.includes(col))
      .map((col, i) => {
        const values = rows.map((r) => parseFloat(r[col]) || 0);
        return (
          <div className="chart-instance" key={`side-${fileName}-${col}`}>
            <h4>📁 {fileName} - {col}</h4>
            <Line
              data={{
                labels: values.map((_, i) => i + 1),
                datasets: [
                  {
                    label: col,
                    data: values,
                    borderColor: colorPalette[i % colorPalette.length],
                    backgroundColor: colorPalette[i % colorPalette.length] + '33',
                    tension: 0.4,
                    borderWidth: 2,
                    fill: true,
                  },
                ],
              }}
              options={{
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
                  },
                },
              }}
            />
          </div>
        );
      });
  }).flat();

  return <div className="multi-chart-container">{[...overlayCharts, ...sideBySideCharts]}</div>;
};

export default SmartChart;
