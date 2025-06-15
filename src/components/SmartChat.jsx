import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { Loader } from "lucide-react";
import "../theme.css";

export default function SmartChat({ fileData }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newUserMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://arabic-ai-app-production.up.railway.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, data: fileData })
      });

      const data = await res.json();
      const aiMsg = {
        role: "assistant",
        content: data.reply || "❌ لم يتم العثور على إجابة."
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ حدث خطأ: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>🤖 استفسر عن بياناتك:</h3>
        <button onClick={clearChat} className="btn clear-btn">🧹 مسح</button>
      </div>

      <div className="chat-log">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <div className="bubble">
              <Markdown>{msg.content}</Markdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg assistant">
            <div className="bubble typing">
              <Loader size={18} className="spin" /> جارٍ التفكير...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <textarea
          placeholder="اكتب سؤالك هنا..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={sendMessage} className="btn send-btn">📨 إرسال</button>
      </div>
    </div>
  );
}
