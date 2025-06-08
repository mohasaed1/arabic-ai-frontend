import React, { useState } from 'react';
import axios from 'axios';

export default function AnalyzerForm() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    try {
      const res = await axios.post('https://app.gateofai.com/analyze', { text });
      setResult(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>تحليل النص العربي بالذكاء الاصطناعي</h2>
      <textarea
        style={styles.textarea}
        placeholder="أدخل نصًا باللغة العربية..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>
      <button style={styles.button} onClick={handleAnalyze}>تحليل</button>

      {result && (
        <div style={styles.resultBox}>
          <p><strong>الملخص:</strong> {result.summary}</p>
          <p><strong>المشاعر:</strong> {result.sentiment}</p>
          <p><strong>الكلمات المفتاحية:</strong> {result.keywords.join(', ')}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '20px',
    textAlign: 'right',
    direction: 'rtl',
    fontFamily: 'sans-serif'
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px'
  },
  textarea: {
    width: '100%',
    height: '120px',
    fontSize: '16px',
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  resultBox: {
    marginTop: '30px',
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px'
  }
};
