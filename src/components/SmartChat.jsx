// SmartChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { LoaderCircle, Trash2, Mic } from "lucide-react";
import Markdown from "react-markdown";

export default function SmartChat({ fileData, setSelectedColumns, setChartType }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingContent, setTypingContent] = useState("");
  const chatBottomRef = useRef(null);

  const isArabic = (text) => /[؀-ۿ]/.test(text);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingContent]);

  const handleAIChartSuggestion = (reply) => {
    const colMatch = reply.match(/(?:column|العمود|البياني)[:\s"']+(\w+)/i);
    const typeMatch = reply.match(/(?:type|نوع|الرسم)[:\s"']+(bar|line|pie)/i);
    if (colMatch && setSelectedColumns) {
      setSelectedColumns([[colMatch[1]]]);
    }
    if (typeMatch && setChartType) {
      setChartType(typeMatch[1]);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setTypingContent("");

    try {
      const res = await fetch("https://arabic-ai-app-production.up.railway.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, data: fileData }),
      });
      const result = await res.json();
      const reply = result?.reply || "❌ لا توجد إجابة.";

      let i = 0;
      const typeChar = () => {
        setTypingContent(reply.slice(0, i + 1));
        i++;
        if (i < reply.length) {
          setTimeout(typeChar, 20);
        } else {
          setMessages([...newMessages, { role: "assistant", content: reply }]);
          setTypingContent("");
          handleAIChartSuggestion(reply);
        }
      };
      typeChar();
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "❌ فشل الاتصال بالخادم." },
      ]);
      setTypingContent("");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput("");
    setTypingContent("");
  };

  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "ar-EG";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <div className="chat-box">
      <h3>{isArabic(input) ? "اسأل عن بياناتك" : "Ask about your data"}</h3>
      <div className="chat-history">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.role}`}
            dir={isArabic(msg.content) ? "rtl" : "ltr"}
            style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start" }}
          >
            <Markdown>{msg.content}</Markdown>
          </div>
        ))}
        {typingContent && (
          <div
            className="chat-bubble assistant"
            dir={isArabic(typingContent) ? "rtl" : "ltr"}
            style={{ alignSelf: "flex-start", whiteSpace: "pre-wrap" }}
          >
            <Markdown>{typingContent}</Markdown>
          </div>
        )}
        {loading && !typingContent && (
          <div className="chat-bubble assistant">
            <LoaderCircle className="animate-spin" style={{ display: "inline", marginInlineEnd: 6 }} />
            {isArabic(input) ? "جاري التحليل..." : "Analyzing..."}
          </div>
        )}
        <div ref={chatBottomRef} />
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
        <button className="btn" onClick={handleVoiceInput} title="🎤 إدخال صوتي"><Mic size={16} /></button>
      </div>
    </div>
  );
}
