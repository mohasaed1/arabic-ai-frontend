import React, { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import Markdown from "react-markdown";

export default function SmartChat({ fileData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({
          message: input,
          data: fileData,
        }),
      });
      const result = await res.json();
      const reply = result?.reply || "❌ No answer was found.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "❌ Server communication failed." },
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
    <div className="form-section" dir="rtl">
      <h3>🤖 Ask about your data:</h3>
      <div className="results-container">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`result-card ${
              msg.role === "user"
                ? "bg-white text-black"
                : "bg-gray-100 text-blue-800"
            }`}
            style={{ marginBottom: "1rem" }}
          >
            <Markdown>{msg.content}</Markdown>
          </div>
        ))}
        {loading && (
          <p>
            <LoaderCircle className="animate-spin" /> Processing...
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          📤 Send
        </button>
        <button
          className="btn"
          style={{ background: "#ef4444" }}
          onClick={handleClear}
        >
          <Trash2 size={16} /> Clear
        </button>
      </div>
      <input
        type="text"
        placeholder="Type your question here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ marginTop: "1rem", fontSize: "1rem" }}
      />
    </div>
  );
}
