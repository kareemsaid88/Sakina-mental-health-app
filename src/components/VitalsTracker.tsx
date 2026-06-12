import React, { useState } from "react";
import { Smile, Calendar, Clock, Sparkles, Plus, TrendingUp, Sun, Moon } from "lucide-react";
import { MoodLog } from "../types";

export function VitalsTracker() {
  const [logs, setLogs] = useState<MoodLog[]>([
    { id: "l1", date: "06/07", moodScore: 2, anxietyScore: 5, happinessScore: 2, sleepHours: 4, physicalActivityMin: 10, notes: "أرق مستمر وضغط العمل شديد مع تسارع خفقان" },
    { id: "l2", date: "06/08", moodScore: 3, anxietyScore: 4, happinessScore: 3, sleepHours: 6, physicalActivityMin: 20, notes: "النوم أفضل قليلاً اليوم وصممت على المشي ربع ساعة" },
    { id: "l3", date: "06/09", moodScore: 3, anxietyScore: 3, happinessScore: 3, sleepHours: 5, physicalActivityMin: 30, notes: "تطبيق تمارين النفس الصباحية خفف من القلق" },
    { id: "l4", date: "06/10", moodScore: 4, anxietyScore: 2, happinessScore: 4, sleepHours: 7, physicalActivityMin: 15, notes: "هدوء نسبي، والالتزام بالجرعات في الأوقات مفيد" },
    { id: "l5", date: "06/11", moodScore: 5, anxietyScore: 1, happinessScore: 5, sleepHours: 8, physicalActivityMin: 45, notes: "شعور رائع، راحة وطاقة إيجابية عالية" }
  ]);

  const [mood, setMood] = useState(3);
  const [anxiety, setAnxiety] = useState(3);
  const [sleep, setSleep] = useState(6);
  const [activity, setActivity] = useState(20);
  const [notes, setNotes] = useState("");

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;

    const newLog: MoodLog = {
      id: "log_" + Date.now(),
      date: formattedDate,
      moodScore: mood,
      anxietyScore: anxiety,
      happinessScore: mood, // matching mood for tracking simplicity
      sleepHours: sleep,
      physicalActivityMin: activity,
      notes: notes
    };

    setLogs([...logs, newLog]);
    setNotes("");
    alert("تم تسجيل مؤشراتك بنجاح! تم تحديث الرسم البياني الإكلينيكي في الحال.");
  };

  // SVG Chart Dimensions & coordinate calculation logic
  const chartHeight = 220;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 30;

  // Render values to SVG points
  const pointsMood = logs.map((log, index) => {
    const x = paddingX + (index * (chartWidth - paddingX * 2)) / Math.max(1, logs.length - 1);
    const y = chartHeight - paddingY - ((log.moodScore - 1) * (chartHeight - paddingY * 2)) / 4;
    return { x, y };
  });

  const pointsAnxiety = logs.map((log, index) => {
    const x = paddingX + (index * (chartWidth - paddingX * 2)) / Math.max(1, logs.length - 1);
    const y = chartHeight - paddingY - ((log.anxietyScore - 1) * (chartHeight - paddingY * 2)) / 4;
    return { x, y };
  });

  const pathMoodD = pointsMood.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
  const pathAnxietyD = pointsAnxiety.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");

  return (
    <div id="vitals-tracker-section" className="space-y-8">
      {/* Vitals Overview Advice Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="z-10 text-center md:text-right space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950 border border-emerald-800 rounded-full text-emerald-400 text-xs font-semibold mb-2">
            <Smile className="w-3.5 h-3.5" />
            تتبع جودة العواطف والمؤشرات الفسيولوجية
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">المفكرة والمتابعة الذاتية للمزاج والنشاط</h2>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            الرصد اليومي للمزاج ومدة النوم والأنشطة البدنية يساهم في تحديد المحفزات البيئية لاقترار الحالة النفسية، ويقدم لمعالجك أدلة علمية واضحة لمدى استجابتك للعلاج.
          </p>
        </div>
        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 z-10">
          <TrendingUp className="w-12 h-12 text-emerald-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form to submit indicators */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4 max-w-full">
          <div>
            <h3 className="font-bold text-base text-slate-100">سجل مؤشرات اليوم بموضوعية</h3>
            <p className="text-[10px] text-slate-400">تذكر الأرقام والساعات لتوليد اتجاهات المطابقة البيولوجية.</p>
          </div>

          <form onSubmit={handleAddLog} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 flex justify-between">
                <span>المستوى المزاجي العام لليوم؟</span>
                <span className="text-emerald-400 font-extrabold">{mood === 5 ? "سعيد ومبتهج" : mood === 4 ? "بحالة جيدة جداً" : mood === 3 ? "مستقر عادي" : mood === 2 ? "ضيق ومزاج مائل" : "حزين ومكتئب تماماً"}</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 flex justify-between">
                <span>مستوى القلق والتوتر الداخلي؟</span>
                <span className="text-amber-400 font-extrabold">{anxiety === 5 ? "نوبة هلع ورعب" : anxiety === 4 ? "قلق وتوجس مرتفع" : anxiety === 3 ? "قلق متوسط متقطع" : anxiety === 2 ? "توتر طفيف جداً" : "هدوء وسكينة تامة"}</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={anxiety}
                onChange={(e) => setAnxiety(parseInt(e.target.value))}
                className="w-full accent-amber-505 bg-slate-900 accent-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" /> ساعات النوم
                </label>
                <input
                  type="number"
                  min="0"
                  max="16"
                  value={sleep}
                  onChange={(e) => setSleep(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-100 border border-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> نشاط بدني (دقيقة)
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={activity}
                  onChange={(e) => setActivity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-100 border border-slate-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400">ملاحظات وخواطر الصيرورة النفسية</label>
              <textarea
                placeholder="صف مشاعرك أو أي مواقف إيجابية/سلبية أثرت بمود اليوم باختصار..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 rounded-xl text-xs text-slate-100 border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-16 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              تسجيل بيانات المزاج والأنشطة اليومية
            </button>
          </form>
        </div>

        {/* Dynamic Graphic representation (SVG-drawn custom charts) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
              <h3 className="font-bold text-lg text-slate-100">مؤشر الاستشفاء السريري ورحلة التعافي</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">تتبع مرئي ديناميكي لمستويات السكينة وتوازن الأعراض عبر الأيام المتتابعة.</p>
          </div>

          {/* Educational Explainer Box */}
          <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-2xl text-[10px] text-zinc-400 leading-relaxed text-right">
            <span className="font-bold text-teal-400 block mb-1">💡 كيف تقرأ منحنى التعافي؟</span>
            <span>
              رحلة الاستشفاء السليمة تتمثل في <strong>تباعد الخطين</strong>: صعود خط <span className="text-emerald-400 font-bold">الحالة المزاجية للأعلى ⬆</span> (مؤشر العافية والنشاط) ونزول خط <span className="text-amber-500 font-bold">القلق والتوتر للأسفل ⬇</span> (تراجع الأعراض المرضية). تظليل المنطقة السفلية يمثل <strong>"مرحلة الطمأنينة الكاملة"</strong>.
            </span>
          </div>

          {/* Render real custom SVG line graph */}
          <div className="relative w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[420px] h-auto overflow-visible">
              
              {/* Shaded Area representing Complete Remission / Clinical Comfort Zone (y range corresponding to score 4 & 5 for Mood, 1 & 2 for Anxiety) */}
              <rect 
                x={paddingX} 
                y={chartHeight - paddingY - ((2 - 1) * (chartHeight - paddingY * 2)) / 4} 
                width={chartWidth - paddingX * 2} 
                height={((2 - 1) * (chartHeight - paddingY * 2)) / 4} 
                fill="#10b981" 
                fillOpacity="0.04" 
              />
              <line 
                x1={paddingX} 
                y1={chartHeight - paddingY - ((2 - 1) * (chartHeight - paddingY * 2)) / 4} 
                x2={chartWidth - paddingX} 
                y2={chartHeight - paddingY - ((2 - 1) * (chartHeight - paddingY * 2)) / 4} 
                stroke="#10b981" 
                strokeWidth="1" 
                strokeDasharray="4,4" 
                strokeOpacity="0.3" 
              />
              <text 
                x={chartWidth - paddingX - 10} 
                y={chartHeight - paddingY - ((2 - 1) * (chartHeight - paddingY * 2)) / 4 - 8} 
                fill="#10b981" 
                fontSize="8" 
                fontWeight="bold" 
                className="opacity-70"
                textAnchor="end"
              >
                ✓ منطقة السكينة والتعافي المنشودة
              </text>

              {/* Grid Lines with clinical translation labels on Y axis */}
              {[
                { val: 1, label: "حرج / نوبة شديدة" },
                { val: 2, label: "ضيق واعتلال" },
                { val: 3, label: "أعراض متوسطة" },
                { val: 4, label: "مستقر / تحسن" },
                { val: 5, label: "ممتاز / عافية كاملة" }
              ].map((item) => {
                const yVal = chartHeight - paddingY - ((item.val - 1) * (chartHeight - paddingY * 2)) / 4;
                return (
                  <g key={item.val}>
                    <line x1={paddingX} y1={yVal} x2={chartWidth - paddingX} y2={yVal} stroke="#334155" strokeWidth="0.8" strokeDasharray="2,2" strokeOpacity="0.6" />
                    {/* Y Axis numeric score */}
                    <text x={paddingX - 8} y={yVal + 3} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="end">{item.val}</text>
                    {/* Y Axis text description */}
                    <text x={chartWidth - paddingX + 6} y={yVal + 3} fill="#64748b" fontSize="8" fontWeight="medium" textAnchor="start">{item.label}</text>
                  </g>
                );
              })}

              {/* X Axis Dates labels */}
              {logs.map((log, i) => {
                const xVal = paddingX + (i * (chartWidth - paddingX * 2)) / Math.max(1, logs.length - 1);
                return (
                  <g key={i}>
                    <line x1={xVal} y1={paddingY} x2={xVal} y2={chartHeight - paddingY} stroke="#334155" strokeWidth="0.5" strokeDasharray="1,2" strokeOpacity="0.2" />
                    <text x={xVal} y={chartHeight - paddingY + 16} fill="#94a3b8" fontSize="9" textAnchor="middle" className="font-bold opacity-80">
                      {log.date}
                    </text>
                  </g>
                );
              })}

              {/* Mood Line (Green) */}
              {logs.length > 1 && (
                <path d={pathMoodD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {/* Mood Points circles */}
              {pointsMood.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="4.5" fill="#047857" stroke="#10b981" strokeWidth="2.5" />
              ))}

              {/* Anxiety Line (Yellow/Orange) */}
              {logs.length > 1 && (
                <path d={pathAnxietyD} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {/* Anxiety Points circles */}
              {pointsAnxiety.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="4.5" fill="#b45309" stroke="#f59e0b" strokeWidth="2.5" />
              ))}
            </svg>
          </div>

          {/* Graph Legend */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-slate-900 pt-4 text-[10px] text-slate-450 text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded bg-emerald-500"></span>
              <span>الحالة المزاجية والطاقة الفسيولوجية <strong className="text-emerald-400 font-bold">(⬆ للأعلى يعني أفضل)</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded bg-amber-500"></span>
              <span>حدة القلق وتشنج الهلع <strong className="text-amber-500 font-bold">(⬇ للأسفل يعني أفضل)</strong></span>
            </div>
          </div>

          {/* Render past diary feed */}
          <div className="space-y-2.5 mt-2">
            <h4 className="text-[10px] font-extrabold text-slate-500 tracking-wider">سجل المذكرات المرفق للمزاج</h4>
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {[...logs].reverse().map((log) => (
                <div key={log.id} className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-900 text-[10px] flex justify-between gap-4 items-start">
                  <div>
                    <span className="text-teal-400 font-bold block mb-0.5">مذكرة تاريخ {log.date}:</span>
                    <p className="text-slate-300 italic">"{log.notes || "لا توجد ملاحظات مدونة."}"</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400 font-semibold">
                    <span className="px-1.5 py-0.5 bg-slate-950 rounded text-emerald-400 border border-emerald-950/20">مزاج {log.moodScore}</span>
                    <span className="px-1.5 py-0.5 bg-slate-950 rounded text-amber-500 border border-amber-950/20">قلق {log.anxietyScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
