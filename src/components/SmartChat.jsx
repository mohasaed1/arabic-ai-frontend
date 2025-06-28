// SmartChat.jsx 
import React, { useState } from 'react';

const SmartChat = ({ fileData, setSelectedColumns, setChartType }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('ar');

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch('https://arabic-ai-app-production.up.railway.app/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMsg.text, data: fileData, lang: language }),
      });
      const json = await res.json();
      const reply = json.reply || '❌ No response';
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: '❌ Failed to reach AI server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smartchat-box">
      <div className="header">
        <span>🧠 SmartChat</span>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="ar">🇸🇦 عربي</option>
          <option value="en">🇺🇸 English</option>
        </select>
      </div>

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.sender}`}>{m.text}</div>
        ))}
        {loading && (
          <div className="msg bot">
            <span className="dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
        )}
      </div>

      <div className="input-row">
        <input
          value={input}
          placeholder={language === 'ar' ? '📝 اكتب سؤالك' : '📝 Type your question'}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>📨</button>
      </div>
    </div>
  );
};

export default SmartChat;
