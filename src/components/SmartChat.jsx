// SmartChat.jsx – updated for full AI utilization with visual tags
import React, { useState } from 'react';

const SmartChat = ({ allData, language }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const askAI = async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("https://arabic-ai-app-production.up.railway.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, data: allData, lang: language })
      });
      const data = await res.json();
      setResponse(data.reply || '❌ No response');
      setHistory(prev => [...prev, { q: query, a: data.reply }]);
      setQuery('');
    } catch (e) {
      setResponse('❌ Error connecting to AI');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') askAI();
  };

  return (
    <div className="chat-box">
      <h3>{language === 'ar' ? 'اسأل عن بياناتك' : 'Ask about your data'}</h3>

      {history.map((item, idx) => (
        <div key={idx} className="chat-entry">
          <div className="user-msg">🧑‍💼 {item.q}</div>
          <div className="ai-msg">🤖 {item.a}</div>
        </div>
      ))}

      <div className="chat-input">
        <input
          type="text"
          placeholder={language === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={askAI} disabled={loading}>
          {language === 'ar' ? 'إرسال' : 'Send'}
        </button>
        <button onClick={() => setQuery('')} className="clear-btn">❌</button>
      </div>
    </div>
  );
};

export default SmartChat;
