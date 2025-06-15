// src/components/SmartChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function SmartChat({ data }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://arabic-ai-app-production.up.railway.app/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, data }),
      });
      const result = await res.json();
      const botMessage = {
        role: "assistant",
        content: result.answer || "❌ لم أتمكن من العثور على إجابة واضحة من البيانات المرفقة.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `❌ خطأ في الاتصال بالخادم: ${err.message}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="form-section" style={{ marginTop: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>💬 استفسر عن بياناتك:</h3>
        <button className="btn" onClick={clearChat}>🔄 إعادة المحادثة</button>
      </div>

      <div className="chat-bubbles" style={{ marginTop: "1rem", maxHeight: "400px", overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bubble ${msg.role}`}
          >
            {msg.content}
          </motion.div>
        ))}
        {loading && (
          <motion.div className="bubble assistant" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
            يكتب...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <textarea
        placeholder="اكتب سؤالك هنا..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
      />
      <button className="btn" onClick={handleSend} disabled={loading}>
        🚀 إرسال
      </button>
    </div>
  );
}
