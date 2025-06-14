import AnalyzerForm from "./components/AnalyzerForm";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 font-sans text-right text-gray-800" dir="rtl">
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <h1 className="text-xl font-bold">منصة تحليل النصوص العربية</h1>
        </div>
        <a href="https://gateofai.com/logout" className="text-sm text-blue-600 hover:underline">تسجيل الخروج</a>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Analysis Form */}
        <section className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">🔍 أدخل نصاً لتحليله</h2>
            <AnalyzerForm />
          </div>
        </section>

        {/* Sidebar Info */}
        <aside className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between border border-gray-100">
          <div>
            <h3 className="text-lg font-semibold mb-2">📄 عن الأداة</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              تستخدم هذه الأداة الذكاء الاصطناعي لتحليل النصوص العربية:
              <ul className="list-disc pr-5 mt-2 text-sm space-y-1">
                <li>تلخيص المحتوى</li>
                <li>تحليل المشاعر</li>
                <li>استخراج الكلمات المفتاحية</li>
              </ul>
            </p>
          </div>
          <div className="mt-6 text-xs text-gray-400 text-center">© 2025 GateOfAI.com</div>
        </aside>
      </main>
    </div>
  );
}
