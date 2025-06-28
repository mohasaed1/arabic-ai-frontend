// SmartChat.jsx (Restored with animated typing + AI integration)
import React, { useState } from 'react';

const SmartChat = ({ fileData, setSelectedColumns, setChartType }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('ar');

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch("https://arabic-ai-app-production.up.railway.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, data: fileData, lang: language })
      });
      const data = await res.json();
      const reply = data.reply || '❌ No response';
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: '❌ فشل في الاتصال بـ API الذكاء الاصطناعي.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <span>🤖 SmartChat AI</span>
        <select onChange={(e) => setLanguage(e.target.value)} value={language}>
          <option value="ar">🇸🇦 عربي</option>
          <option value="en">🇺🇸 English</option>
        </select>
      </div>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.sender}`}>{msg.text}</div>
        ))}
        {loading && <div className="chat-msg bot loading">...
          <span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </div>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          placeholder={language === 'ar' ? '💬 اكتب سؤالك هنا...' : '💬 Type your question...'}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>📤</button>
      </div>
    </div>
  );
};

export default SmartChat;
