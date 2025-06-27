// Updated SmartChat.jsx with advanced response support and chart updates
import React, { useState, useEffect, useRef } from "react";
import { LoaderCircle, Trash2, Mic } from "lucide-react";
import Markdown from "react-markdown";

export default function SmartChat({ fileData, setSelectedColumns, setChartType }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingContent, setTypingContent] = useState("");
  const chatBottomRef = useRef(null);

  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingContent]);

  const handleAIChartSuggestion = (result) => {
    if (result.chartCols && Array.isArray(result.chartCols)) {
      setSelectedColumns([result.chartCols]);
    }
    if (result.chartType) {
      setChartType(result.chartType);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const userLang = isArabic(input) ? "ar" : "en";
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setTypingContent("");

    try {
      const res = await fetch("https://arabic-ai-app-production.up.railway.app/chat-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, data: fileData, lang: userLang })
      });
      const result = await res.json();
      const reply = result?.answer || (userLang === "ar" ? "❌ لا توجد إجابة." : "❌ No response.");

      let i = 0;
      const typeChar = () => {
        setTypingContent(reply.slice(0, i + 1));
        i++;
        if (i < reply.length) {
          setTimeout(typeChar, 20);
        } else {
          setMessages([...newMessages, { role: "assistant", content: reply }]);
          setTypingContent("");
          handleAIChartSuggestion(result);
        }
      };
      typeChar();
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: userLang === "ar" ? "❌ فشل الاتصال بالخادم." : "❌ Server connection failed." }
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
    recognition.lang = isArabic(input) ? "ar-EG" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <div className="chat-box">
      <h3>{isArabic(input) ? "\u0627\u0633\u0623\u0644 \u0639\u0646 \u0628\u064a\u0627\u0646\u0627\u062a\u0643" : "Ask about your data"}</h3>
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
          <div className="chat-bubble assistant" dir={isArabic(input) ? "rtl" : "ltr"}>
            <span style={{ fontWeight: 'bold' }}>
              {isArabic(input) ? "\u062c\u0627\u0631ٍ \u0627\u0644\u062a\u062d\u0644\u064a\u0644" : "Analyzing"} <span className="dots">...</span>
            </span>
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
