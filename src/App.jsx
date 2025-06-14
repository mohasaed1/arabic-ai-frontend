import { useEffect, useState } from "react";
import AnalyzerForm from "./components/AnalyzerForm";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading state

  useEffect(() => {
    fetch("https://gateofai.com/wp-json/wp/v2/users/me", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.id) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  if (isLoggedIn === null) {
    return <div className="p-8 text-center">🔄 جار التحقق من تسجيل الدخول...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="text-right p-10 font-sans">
        <h2 className="text-xl font-bold mb-4">🔒 تحتاج إلى تسجيل الدخول</h2>
        <p className="mb-4">يرجى تسجيل الدخول عبر موقع GateOfAI لاستخدام أدوات التحليل.</p>
        <a
          href="https://gateofai.com/login/?redirect_to=https://app.gateofai.com"
          className="bg-black text-white px-5 py-2 rounded"
        >
          تسجيل الدخول
        </a>
      </div>
    );
  }

  // If logged in, show Analyzer
  return (
    <div className="p-4 text-right">
      <h1 className="text-3xl font-bold mb-4">🎯 مرحباً بك في منصة تحليل النصوص</h1>
      <AnalyzerForm />
    </div>
  );
}

export default App;
