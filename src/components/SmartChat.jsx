// src/components/SmartChat.jsx
import React, { useState } from "react";

export default function SmartChat() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse("");

    try {
     const res = await fetch("https://arabic-ai-app-production.up.railway.app/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: input })
});

      const data = await res.json();
      setResponse(data.reply || data.error || "❌ No response from AI.");
    } catch (err) {
      setResponse("❌ Failed to connect to AI: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>💬 استشارة ذكية بالذكاء الاصطناعي</h3>
      <textarea
        placeholder="اسأل كيف يمكن تحسين المبيعات أو البيانات..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        style={{ width: "100%", marginBottom: "1rem" }}
      />
      <button onClick={handleChat} disabled={loading}>
        {loading ? "جاري التفكير..." : "أرسل"}
      </button>
      {response && (
        <div className="mt-4" style={{ whiteSpace: "pre-wrap" }}>
          <strong>الرد:</strong><br />{response}
        </div>
      )}
    </div>
  );
}
