// SmartChat.jsx
import React, { useState, useEffect } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import Markdown from "react-markdown";

export default function SmartChat({ fileData, suggestChart }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isArabic = (text) => /[؀-ۿ]/.test(text);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://arabic-ai-app-production.up.railway.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, data: fileData }),
      });
      const result = await res.json();
      const reply = result?.reply || "❌ لا توجد إجابة.";

      // Auto-suggest a column from the AI reply (example: if it mentions "SalesMan")
      const match = reply.match(/(?:column|العمود)[:\s"']+(\w+)/i);
      if (match && suggestChart) {
        suggestChart(match[1]);
      }

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "❌ فشل الاتصال بالخادم." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="chat-box" dir="rtl">
      <h3> اسأل عن بياناتك</h3>
      <div className="chat-history">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.role}`}
          >
            <Markdown>{msg.content}</Markdown>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant">
            <LoaderCircle className="animate-spin" style={{ display: "inline", marginInlineEnd: 6 }} />
            {isArabic(input) ? "جاري التحليل..." : "Analyzing..."}
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="...اكتب سؤالك هنا"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn" onClick={handleSubmit} disabled={loading}>📤 إرسال</button>
        <button className="btn clear-btn" onClick={handleClear}><Trash2 size={16} /> مسح</button>
      </div>
    </div>
  );
}
