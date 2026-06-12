import React, { useState } from "react";
import { PSYCHIATRIC_MEDICATIONS, PsychiatricMedication } from "../data/medicationsData";
import { Search, Info, ShieldAlert, Pill, Check, Clock, Globe, Briefcase, HelpCircle } from "lucide-react";

export function PsychiatricMedicationsDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredMeds = PSYCHIATRIC_MEDICATIONS.filter((med) => {
    const matchesSearch = 
      med.brandNameLocal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.brandNameForeign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.indicationsArabic.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === "all" || med.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 text-right animate-fade-in text-xs leading-loose">
      
      {/* Clinician Advice disclaimer */}
      <div className="bg-red-950/20 border border-red-900/40 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="z-10 space-y-2 text-center md:text-right">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-950 border border-red-900 rounded-full text-red-400 text-[10px] font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            تحذير طبي وقانوني وأخلاقي هام جداً (Clinician Warning)
          </div>
          <h2 className="text-lg md:text-xl font-black text-slate-100">الموسوعة الدوائية التثقيفية الاسترشادية</h2>
          <p className="text-slate-400 max-w-xl text-[11px] leading-relaxed">
            جميع البيانات المعروضة في هذه الموسوعة هي لغرض التثقيف الدوائي وزيادة الوعي العلمي بالتركيزات والمزايا والعيوب والجرعات النموذجية. 
            <strong className="text-red-400"> يُحظر تماماً صرف أو بلع أي دواء نفسي كيميائي دون فحص سريري مباشر وصحبة روشتة طبية معتمدة من طبيب نفسي مرخص.</strong>
          </p>
        </div>
        <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 z-10 shrink-0">
          <Pill className="w-12 h-12 text-red-500 animate-pulse" />
        </div>
      </div>

      {/* Directory Controls (Search & Category filter) */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-5 md:p-6 space-y-5">
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن دواء نفسي بالاسم التجاري، المادة الفعالة أو الداعي السريري (مثال: سيروكويل، Cipralex، وسواس...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 text-xs text-right text-white focus:outline-none focus:border-teal-500 transition font-semibold placeholder-slate-500"
          />
          <div className="absolute top-3.5 left-4 text-slate-500">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Categories Tab Pill Lists */}
        <div className="flex flex-wrap gap-2 justify-start font-semibold">
          {[
            { id: "all", label: "جميع التصنيفات الدوائية" },
            { id: "antidepressant", label: "مضادات الاكتئاب والقلق" },
            { id: "anxiolytic", label: "مهدئات ومضادات الهلع" },
            { id: "mood_stabilizer", label: "مثبتات المزاج والأقطاب" },
            { id: "antipsychotic", label: "مضادات الذهان الفصامية" },
            { id: "adhd_cognition", label: "منشطات التركيز وعلاج ADHD" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs transition cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-teal-600 text-slate-950 font-black shadow"
                  : "bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Medication Detailed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMeds.length > 0 ? (
          filteredMeds.map((med: PsychiatricMedication) => (
            <div key={med.id} className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-5 hover:border-slate-800 transition relative overflow-hidden flex flex-col justify-between">
              
              {/* Header */}
              <div className="space-y-2 border-b border-slate-900 pb-3">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-900/60 rounded text-[9px] font-black uppercase">
                    {med.categoryArabic}
                  </span>
                  
                  <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>{med.brandNameForeign}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div>
                    <h3 className="text-base font-black text-slate-100">{med.brandNameLocal}</h3>
                    <span className="text-[10px] text-teal-400 font-bold block pt-0.5 font-mono">المادة النشطة: {med.genericName}</span>
                  </div>
                  <div className="text-left font-mono text-[10px] text-slate-350 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded">
                     التركيزات: {med.strengths.join(" / ")}
                  </div>
                </div>
              </div>

              {/* Body Info block details */}
              <div className="space-y-4 text-[11px] font-medium leading-relaxed leading-loose">
                <p className="text-slate-300">
                  <strong className="text-slate-400">دواعي الاستعمال في التشخيص السلوكي:</strong> {med.indicationsArabic}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 leading-normal text-[10px]">
                  <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-900 space-y-1.5">
                    <strong className="text-emerald-400 font-bold block flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" /> المزايا والآلية الإيجابية للدواء:
                    </strong>
                    <ul className="space-y-1 list-disc list-inside text-slate-400 pr-1">
                      {med.advantages.slice(0, 3).map((adv, idx) => (
                        <li key={idx}>
                          {adv}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-900 space-y-1.5">
                    <strong className="text-red-400 font-bold block flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" /> العيوب والآثار الجانبية والتحذيرات:
                    </strong>
                    <ul className="space-y-1 list-disc list-inside text-slate-400 pr-1">
                      {med.sideEffects.slice(0, 3).map((side, idx) => (
                        <li key={idx}>
                          {side}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer specs */}
              <div className="border-t border-slate-900 pt-3 flex flex-wrap justify-between items-center text-[10px] text-slate-400 font-semibold gap-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>الجدول الزمني الموصى به: <span className="text-teal-400 font-bold">{med.standardDurationArabic}</span></span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[9px]">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span>{med.manufacturerInfo}</span>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-2 bg-slate-900/10 border border-slate-900/60 rounded-3xl p-12 text-center text-slate-400 space-y-2">
            <Info className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="font-extrabold text-slate-200">لا توجد أدوية موازية لمدخلات البحث الحالية</h4>
            <p className="text-xs">تأكد من كتابة أحرف صحيحة أو تصفية تصنيف دوائي آخر.</p>
          </div>
        )}
      </div>
    </div>
  );
}
