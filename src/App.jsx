import AnalyzerForm from "./components/AnalyzerForm";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right text-gray-800" dir="rtl">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🧠 منصة تحليل النصوص العربية</h1>
        <a href="https://gateofai.com/logout" className="text-sm text-blue-600 hover:underline">تسجيل الخروج</a>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔍 أدخل نصاً لتحليله</h2>
            <AnalyzerForm />
          </div>
        </section>

        <aside className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">🧾 عن الأداة</h3>
            <p className="text-sm leading-relaxed">
              هذه الأداة تستخدم نماذج الذكاء الاصطناعي لتحليل النصوص العربية:
              <ul className="list-disc pr-5 mt-2 text-sm text-gray-600 space-y-1">
                <li>تلخيص المحتوى</li>
                <li>تحليل المشاعر</li>
                <li>استخراج الكلمات المفتاحية</li>
              </ul>
            </p>
          </div>
          <div className="mt-6 text-xs text-gray-400">GateOfAI.com © 2025</div>
        </aside>
      </main>
    </div>
  );
}
