// SmartChat.jsx (Restored animated typing + filtered AI summary)
import React, { useState, useEffect, useRef } from 'react';

const SmartChat = ({ allData, language }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsg = { role: 'user', text: input };
    setMessages([...messages, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch("https://arabic-ai-app-production.up.railway.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          data: allData,
          lang: language,
        })
      });
      const json = await res.json();
      const reply = json.reply || (language === 'ar' ? "❌ لم يتم العثور على رد." : "❌ No reply received.");
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: language === 'ar' ? "❌ فشل الاتصال بالخادم." : "❌ Server error." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => e.key === 'Enter' && sendMessage();

  return (
    <div className="chat-box">
      <h3>{language === 'ar' ? 'اسأل عن بياناتك' : 'Ask about your data'}</h3>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>{m.text}</div>
        ))}
        {loading && <div className="msg ai">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={language === 'ar' ? '...اكتب سؤالك هنا' : '...Type your question here'}
        />
        <button className="send" onClick={sendMessage}>📤</button>
        <button className="clear" onClick={() => setMessages([])}>❌</button>
      </div>
    </div>
  );
};

export default SmartChat;
