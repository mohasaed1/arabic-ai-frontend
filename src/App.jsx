import AnalyzerForm from "./components/AnalyzerForm";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-right text-white font-sans" dir="rtl">
      <header className="bg-[#1e293b] shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-cyan-400">🧠 منصة تحليل النصوص العربية</h1>
        <a href="https://gateofai.com/logout" className="text-sm text-cyan-300 hover:underline">تسجيل الخروج</a>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Analyzer Input */}
        <section className="md:col-span-2">
          <div className="bg-[#1e293b] rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-cyan-300">🔍 أدخل نصاً لتحليله</h2>
            <AnalyzerForm />
          </div>
        </section>

        {/* Sidebar Info */}
        <aside className="bg-[#1e293b] rounded-2xl shadow-lg p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold mb-2 text-cyan-300">🧾 عن الأداة</h3>
            <p className="text-sm leading-relaxed text-gray-300">
              هذه الأداة تستخدم نماذج الذكاء الاصطناعي لتحليل النصوص العربية:
              <ul className="list-disc pr-5 mt-2 text-sm text-cyan-100 space-y-1">
                <li>تلخيص المحتوى</li>
                <li>تحليل المشاعر</li>
                <li>استخراج الكلمات المفتاحية</li>
              </ul>
            </p>
          </div>
          <div className="mt-6 text-xs text-gray-500 text-center">GateOfAI.com © 2025</div>
        </aside>
      </main>
    </div>
  );
}
