""import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "../theme.css";

export default function SmartChat({ fileData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.gateofai.com/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, data: fileData }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "❌ لم أتمكن من فهم سؤالك." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ حدث خطأ في الاتصال بالخادم." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>🤖 استفسر عن بياناتك:</h3>
        <button className="btn clear-btn" onClick={resetChat}>♻️ مسح المحادثة</button>
      </div>

      <div className="chat-history">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`chat-bubble ${msg.role}`}
          >
            <span>{msg.content}</span>
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="chat-bubble assistant"
          >
            <span>...يكتب</span>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب سؤالك هنا..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="btn" onClick={sendMessage}>📤 إرسال</button>
      </div>
    </div>
  );
}
