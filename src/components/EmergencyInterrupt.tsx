import React, { useState } from "react";
import { ShieldAlert, PhoneCall, HeartHandshake, Check, AlertTriangle } from "lucide-react";

interface EmergencyProps {
  onDismiss: () => void;
  reason?: string;
}

export function EmergencyInterrupt({ onDismiss, reason }: EmergencyProps) {
  const [agreementChecked, setAgreementChecked] = useState([false, false, false]);

  const regionalHotlines = [
    { country: "جمهورية مصر العربية", number: "15895", desc: "الخط الساخن للأمان النفسي - وزارة الصحة وعلاج الإدمان (مجاني طوال 24 ساعة)" },
    { country: "جمهورية مصر العربية (بديل)", number: "08008880700", desc: "خط دعم المجلس القومي للصحة النفسية لتقديم الدعم والمساندة الإنسانية" },
    { country: "المملكة العربية السعودية", number: "937", desc: "استشارات وزارة الصحة المباشرة - تواصل طبي/نفسي طارئ فوري" },
    { country: "المملكة العربية السعودية (مستشفى إرادة)", number: "920033360", desc: "مجمع إرادة للصحة النفسية بالرياض لعلاج الأزمات الطارئة الشديدة" },
    { country: "دولة الإمارات العربية المتحدة", number: "800 4673", desc: "الخط الساخن لتعزيز الصحة النفسية - وزارة الصحة ووقاية المجتمع" },
    { country: "المملكة الأردنية الهاشمية", number: "111", desc: "خط طوارئ المساندة الطبية والنفسية المتكاملة لوزارة الصحة الأردنية" },
    { country: "الخط العالمي للوقاية والطوارئ", number: "988", desc: "المنخرط دولياً للإحالة والإسناد السلوكي للأزمات الفائقة" }
  ];

  const handleDeescalate = () => {
    const allChecked = agreementChecked.every((val) => val === true);
    if (!allChecked) {
      alert("يرجى قراءة بنود السلامة الأربعة والموافقة عليها لتفعيل العودة الآمنة للمنصة.");
      return;
    }
    onDismiss();
  };

  const handleToggleCheck = (index: number) => {
    setAgreementChecked(
      agreementChecked.map((val, idx) => (idx === index ? !val : val))
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-50 overflow-y-auto flex items-center justify-center p-4 backdrop-blur-md">
      <div className="max-w-3xl w-full bg-slate-900 border-2 border-red-500 rounded-3xl p-6 md:p-8 space-y-6 text-right relative overflow-hidden my-8">
        
        {/* Animated warning backgrounds */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl"></div>

        {/* Header Alert sign */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 pb-4 border-b border-slate-800">
          <div className="bg-red-500/10 p-4 rounded-full border border-red-500/30 text-red-500 animate-bounce">
            <ShieldAlert className="w-14 h-14" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-rose-500">بروتوكول السلامة والتدخل العاجل مفعّل حالياً</h2>
          <p className="text-xs text-slate-350 max-w-xl leading-relaxed text-slate-400">
            أهلاً بك يا صديقي. تم تعليق خدمات التحليل العادية للمنصة مؤقتاً لأننا رصدنا إشارات أو إجابات تعبّر عن ألم نفسي كثيف، أو مشاعر حادة لإيذاء نفسك، أو التفكير بالرحيل. لا حرج عليك، ولسنا هنا لمحاكمتك، بل لنحميك بكل حب وصدق.
          </p>
          {reason && (
            <div className="mt-2 text-xs bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg text-red-400 font-semibold font-mono">
              محفز التدخل العاجل: "{reason}"
            </div>
          )}
        </div>

        {/* Hotlines Grid */}
        <div className="space-y-3.5">
          <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-500" /> الخطوط الساخنة ومقرات المساعدة العاجلة المجانية (اتصل بنا فوراً):
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
            {regionalHotlines.map((hotline, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-200 block">{hotline.country}</span>
                  <span className="text-[10px] text-slate-500 block leading-tight">{hotline.desc}</span>
                </div>
                <a
                  href={`tel:${hotline.number.replace(/\s+/g, "")}`}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-3.5 py-1.5 rounded-xl font-mono text-xs flex-shrink-0 flex items-center gap-1 transition"
                >
                  <PhoneCall className="w-3 h-3" /> {hotline.number}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Secure safety plan contract checklist */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-4">
          <h3 className="font-bold text-xs text-slate-200 flex items-center gap-1">
            <HeartHandshake className="w-4 h-4 text-emerald-400" /> خطة الالتزام بالسلامة قبل مغادرة وضع الطوارئ:
          </h3>
          <p className="text-[10px] text-slate-400">نرجو منك قراءة هذه التفاهمات بعمق وهدوء والضغط على المربعات لتأكيد التزامك برعاية روحك الغالية:</p>
          
          <div className="space-y-3 text-xs text-slate-300">
            {[
              "أتعهد بصدق ألا ألحق أي أذى بجسدي أو بنفسي الليلة، وأن أؤجل أي قرار متسرع اتجاه نفسي.",
              "إذا زاد ضغط الأفكار أو شعرت برغبة عارمة في الرحيل، سأتصل فوراً بأحد الأرقام الساخنة المذكورة أعلاه أو أستدعِ فرداً مقرباً أو أتوجه لأقرب مستشفى طوارئ.",
              "أدرك تماماً أن هذه الأفكار الحادة هي بسبب اضطراب كيميائي مؤقت في المزاج وسحابة ستعبر حتماً، ولست بمفردي وسجلت عهد الطمأنينة."
            ].map((clause, idx) => (
              <div
                key={idx}
                onClick={() => handleToggleCheck(idx)}
                className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                  agreementChecked[idx] 
                    ? "bg-slate-900 border-emerald-500/20 text-emerald-400" 
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className={`w-4 h-4 rounded mt-0.5 flex-shrink-0 flex items-center justify-center border ${
                  agreementChecked[idx] ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"
                }`}>
                  {agreementChecked[idx] && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <p className="leading-relaxed select-none">{clause}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons to dismiss or seek aid */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDeescalate}
            className="flex-grow py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-900/10"
          >
            <Check className="w-4 h-4" /> تأكيد التزامي بالسلامة والعودة لاستكمال الدعم بالمنصة
          </button>
          
          <a
            href="https://www.who.int/mental_health/prevention/suicide/suicideprevent/en/"
            target="_blank"
            rel="noreferrer"
            className="py-3 px-6 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-xl text-xs font-semibold text-center border border-slate-800 transition"
          >
            توصيات منظمة الصحة العالمية
          </a>
        </div>
      </div>
    </div>
  );
}
