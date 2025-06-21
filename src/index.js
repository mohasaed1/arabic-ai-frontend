import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './theme.css';

// Chart.js elements registration
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
  PointElement,
  LineElement   
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
