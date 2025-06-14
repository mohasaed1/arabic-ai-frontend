import AnalyzerForm from "./components/AnalyzerForm";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right text-gray-800" dir="rtl">
      
      {/* ✅ Improved Navbar */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md px-6 py-4 flex justify-between items-center rounded-b-xl">
        <h1 className="text-xl font-bold">
          <a href="https://gateofai.com" className="hover:underline">🧠 منصة تحليل النصوص العربية</a>
        </h1>
        <nav className="space-x-4 rtl:space-x-reverse text-sm">
          <a href="https://gateofai.com/#tools" className="hover:underline">الأدوات</a>
          <a href="https://gateofai.com/logout" className="hover:underline">تسجيل الخروج</a>
        </nav>
      </header>

      {/* ✅ Main Section */}
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 🔍 Input Form */}
        <section className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">🔍 أدخل نصاً لتحليله</h2>
            <AnalyzerForm />
          </div>
        </section>

        {/* 🧾 Sidebar */}
        <aside className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between border border-gray-100">
          <div>
            <h3 className="text-lg font-semibold mb-2">🧾 عن الأداة</h3>
            <p className="text-sm leading-relaxed">
              تستخدم هذه الأداة نماذج الذكاء الاصطناعي لتحليل النصوص العربية بدقة عالية:
              <ul className="list-disc pr-5 mt-3 text-sm text-gray-700 space-y-1">
                <li>📝 تلخيص المحتوى</li>
                <li>❤️ تحليل المشاعر</li>
                <li>🧩 استخراج الكلمات المفتاحية</li>
              </ul>
            </p>
          </div>
          <div className="mt-6 text-xs text-gray-400 text-center">© 2025 GateOfAI.com</div>
        </aside>
      </main>
    </div>
  );
}
