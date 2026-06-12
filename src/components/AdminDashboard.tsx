import React from "react";
import { Layers, Users, ShieldAlert, FileHeart, BarChart, BellRing } from "lucide-react";

export function AdminDashboard() {
  // Mock aggregated database diagnostics
  const stats = [
    { title: "إجمالي المشخصين والخاضعين للمراقبة", value: "1,524 حالة", icon: Users, color: "text-blue-400 bg-blue-950/20" },
    { title: "إشارات الخطر المبكر التي تم إدارتها", value: "8 نداءات عاجلة", icon: ShieldAlert, color: "text-rose-450 bg-rose-950/20 text-rose-400" },
    { title: "متوسط الاكتئاب العام (PHQ-9)", value: "11.2 (متوسط الشدة)", icon: FileHeart, color: "text-emerald-400 bg-emerald-950/20" },
    { title: "متوسط قلق التوتر (GAD-7)", value: "9.5 (عتبة خفيفة)", icon: BarChart, color: "text-amber-400 bg-amber-950/20" }
  ];

  const conditionDistribution = [
    { name: "اضطراب القلق العام والمعمم (GAD)", percentage: 41, color: "bg-emerald-500" },
    { name: "أعراض الاكتئاب السريري أحادي القطب", percentage: 26, color: "bg-teal-500" },
    { name: "الاحتراق النفسي والمهني الشديد (Burnout)", percentage: 18, color: "bg-amber-500" },
    { name: "نوبات الهلع المنعزلة ونقص التهوية (Panic)", percentage: 10, color: "bg-cyan-500" },
    { name: "اضطراب كرب ما بعد الصدمة (PTSD)", percentage: 5, color: "bg-indigo-500" }
  ];

  const warningLogs = [
    { id: 1, time: "منذ ساعتين", gender: "أنثى (28 سنة)", info: "حصلت على 22/27 على مقياس PHQ-9 مع توجس بنود إيذاء النفس المباشر.", status: "تم تفعيل السلامة الفوري والربط برقم 15895" },
    { id: 2, time: "منذ 4 ساعات", gender: "ذكر (35 سنة)", info: "شكوى صوتية سريعة كشفت عن تداخل ضلالات ذهانية وفقدان جزئي للتواصل بالواقع.", status: "إشارة بروتوكول عاجل للاستشاري فيصل العتيبي" }
  ];

  return (
    <div id="admin-dashboard-section" className="space-y-8">
      {/* Clinician Hub Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="z-10 text-center md:text-right space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950 border border-indigo-800 rounded-full text-indigo-400 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            مرصد لوحة الإحصائيات العامة والإنذار المبكر للمؤسسات
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">بيانات الوبائيات الإكلينيكية ومرصد الصحة العامة</h2>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            مراقبة نسب انتشار الاضطرابات النفسية بين شرائح المستخدمين، ومراقبة تفعيل بروتوكولات الإنذار المبكر لتقديم دراسات إحصائية تساهم في تقليص فجوة المعالجة وحماية المجتمعات.
          </p>
        </div>
        <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 z-10 animate-pulse">
          <BarChart className="w-12 h-12 text-indigo-400" />
        </div>
      </div>

      {/* Grid of aggregated stats boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div key={idx} className="bg-slate-950 border border-slate-900 rounded-3xl p-5 flex items-center justify-between">
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-bold text-slate-550 block text-slate-400">{stat.title}</span>
                <span className="text-lg font-black text-white">{stat.value}</span>
              </div>
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                <IconComponent className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Horizontal percentage styled bar charts (Suspected conditions) */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="font-bold text-lg text-slate-100">توزيع الاضطرابات المفترضة الأكثر تكراراً</h3>
            <p className="text-xs text-slate-400 mt-1">توضح النسب المئوية مدى تكرار خروج تشخيصات بعينها بناءً على تقييم الشكاوى ودرجات المستخدمين الكلية.</p>
          </div>

          <div className="space-y-4">
            {conditionDistribution.map((cond, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>{cond.name}</span>
                  <span className="text-slate-400 font-mono">{cond.percentage}%</span>
                </div>
                {/* Horizontal bar representation using clean CSS */}
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    className={`${cond.color} h-full rounded-full transition-all duration-1000`}
                    style={{ width: `${cond.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry logs on de-escalating suicide and high risk flags (Early Warning System log) */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-100">سجل إشارات الخطر المبكر ومقاييس السلامة</h3>
              <p className="text-xs text-slate-400 mt-1">سجل يرصد تشغيل جدار حماية السلامة للحالات الفائقة الحرج وتحويلهم المباشر لخدمات الطوارئ.</p>
            </div>
            <span className="bg-red-950/20 border border-red-900/30 text-red-400 text-xs px-2.5 py-0.5 rounded-lg flex items-center gap-1">
              <BellRing className="w-3.5 h-3.5 animate-bounce" /> مرصد حي
            </span>
          </div>

          <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1">
            {warningLogs.map((log) => (
              <div key={log.id} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span className="font-bold text-red-400">تحذير أمان عاجل</span>
                  <span>{log.time}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-300 font-bold block">{log.gender}:</span>
                  <p className="text-slate-400 italic">"{log.info}"</p>
                </div>
                <div className="border-t border-slate-850 pt-2.5 flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-500 font-medium">حالة الاستجابة:</span>
                  <span className="text-emerald-400">{log.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
