// SmartChat.jsx 
import React, { useState, useEffect, useRef } from "react";
import { LoaderCircle, Trash2, Mic } from "lucide-react";
import Markdown from "react-markdown";

export default function SmartChat({ fileData, setSelectedColumns, setChartType, setGroupBy }) {
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

  const extractChartInstructions = (reply) => {
    const columns = [...reply.matchAll(/\b(?:column|العمود|الرسم)[:\s"']+(\w+)/gi)].map(m => m[1]);
    const chartTypeMatch = reply.match(/(?:type|نوع)[:\s"']+(bar|line|pie)/i);
    const groupByMatch = reply.match(/group\s+by\s+([\w,\s]+)/i);

    if (columns.length && setSelectedColumns) setSelectedColumns([columns]);
    if (chartTypeMatch && setChartType) setChartType(chartTypeMatch[1]);
    if (groupByMatch && setGroupBy) {
      const keys = groupByMatch[1].split(',').map(x => x.trim());
      setGroupBy(keys);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setTypingContent("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    try {
      const res = await fetch("https://arabic-ai-app-production.up.railway.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ message: input, data: fileData, lang: isArabic(input) ? 'ar' : 'en' }),
      });
      clearTimeout(timeoutId);
      const result = await res.json();
      const reply = result?.reply && result.reply.trim().length > 0 ? result.reply : "❌ لا توجد إجابة.";

      let i = 0;
      const typeChar = () => {
        setTypingContent(reply.slice(0, i + 1));
        i++;
        if (i < reply.length) {
          setTimeout(typeChar, 20);
        } else {
          setMessages([...newMessages, { role: "assistant", content: reply }]);
          setTypingContent("");
          extractChartInstructions(reply);
        }
      };
      typeChar();
    } catch (err) {
      clearTimeout(timeoutId);
      setMessages([...newMessages, { role: "assistant", content: "❌ فشل الاتصال بالخادم أو انتهاء المهلة." }]);
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
          <div className="chat-bubble assistant" dir={isArabic(input) ? "rtl" : "ltr"}>
            <span style={{ fontWeight: 'bold' }}>
              {isArabic(input) ? "جارٍ التحليل" : "Analyzing"} <span className="dots">...</span>
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
