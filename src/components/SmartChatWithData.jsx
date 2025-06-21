import React, { useState } from 'react';

const SmartChatWithData = ({ dataPreview, language }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);

    const response = await fetch('https://your-fastapi-backend/chat-with-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: input,
        data: dataPreview,
        language: language
      })
    });

    const json = await response.json();
    const botMsg = { role: 'assistant', content: json.answer };
    setMessages(prev => [...prev, botMsg]);
    setInput('');
    setLoading(false);
  };

  return (
    <div className="chat-box">
      <h4>{language === 'ar' ? '🗣️ اسأل عن بياناتك' : '🗣️ Ask about your data'}</h4>
      <div className="chat-log">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            <b>{msg.role === 'user' ? '🧑' : '🤖'}:</b> {msg.content}
          </div>
        ))}
        {loading && <p>⏳...</p>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder={language === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question...'}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button onClick={askQuestion} disabled={loading}>
          {language === 'ar' ? 'أرسل' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default SmartChatWithData;
