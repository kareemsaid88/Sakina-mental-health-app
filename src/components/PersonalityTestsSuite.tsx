import React, { useState } from "react";
import { MBTI_QUESTIONS, MBTI_PROFILES, ENNEAGRAM_QUESTIONS, ENNEAGRAM_TYPES, DISC_QUESTIONS, DISC_PROFILES } from "../data/personalityTests";
import { User, ShieldCheck, Sparkles, RefreshCw, Star, Layers, HelpCircle, Trophy, Briefcase, ChevronRight, Activity } from "lucide-react";

export function PersonalityTestsSuite() {
  const [activeSuite, setActiveSuite] = useState<"mbti" | "enneagram" | "disc" | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  
  // Quiz Answers State
  const [mbtiAnswers, setMbtiAnswers] = useState<Record<number, string>>({});
  const [enneagramAnswers, setEnneagramAnswers] = useState<Record<number, number>>({});
  const [discAnswers, setDiscAnswers] = useState<Record<number, string>>({});

  // Calculation Results State
  const [mbtiResult, setMbtiResult] = useState<any | null>(null);
  const [enneagramResult, setEnneagramResult] = useState<any | null>(null);
  const [discResult, setDiscResult] = useState<any | null>(null);

  // Restart State
  const handleStartSuite = (suite: "mbti" | "enneagram" | "disc") => {
    setActiveSuite(suite);
    setCurrentQuestionIdx(0);
    setMbtiAnswers({});
    setEnneagramAnswers({});
    setDiscAnswers({});
    setMbtiResult(null);
    setEnneagramResult(null);
    setDiscResult(null);
  };

  // Select Option Handlers
  const handleSelectMbti = (qId: number, code: string) => {
    setMbtiAnswers((prev) => ({ ...prev, [qId]: code }));
  };

  const handleSelectEnneagram = (qId: number, score: number) => {
    setEnneagramAnswers((prev) => ({ ...prev, [qId]: score }));
  };

  const handleSelectDisc = (qId: number, weight: string) => {
    setDiscAnswers((prev) => ({ ...prev, [qId]: weight }));
  };

  // Calculation logic of MBTI
  const calculateMbti = () => {
    // We check if all answered
    const unanswered = MBTI_QUESTIONS.some((q) => mbtiAnswers[q.id] === undefined);
    if (unanswered) {
      alert("يرجى اختيار إجابة لكل العبارات المخصصة لإتمام الفرز السيكومتري بدقة.");
      return;
    }

    // Accumulate dimensions
    let E = 0, I = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0;
    MBTI_QUESTIONS.forEach((q) => {
      const code = mbtiAnswers[q.id];
      if (q.dimension === "EI") {
        if (code === "E") E++; else I++;
      } else if (q.dimension === "SN") {
        if (code === "S") S++; else N++;
      } else if (q.dimension === "TF") {
        if (code === "T") T++; else F++;
      } else if (q.dimension === "JP") {
        if (code === "J") J++; else P++;
      }
    });

    const finalCode = 
      (E >= I ? "E" : "I") +
      (S >= N ? "S" : "N") +
      (T >= F ? "T" : "F") +
      (J >= P ? "J" : "P");

    const profile = MBTI_PROFILES[finalCode] || MBTI_PROFILES["OTHER"];
    
    setMbtiResult({
      code: finalCode,
      profile,
      scores: { E, I, S, N, T, F, J, P }
    });
  };

  // Calculation of Enneagram
  const calculateEnneagram = () => {
    const unanswered = ENNEAGRAM_QUESTIONS.some((q) => enneagramAnswers[q.id] === undefined);
    if (unanswered) {
      alert("يرجى تقييم جميع البنود قبل احتساب النمط.");
      return;
    }

    // Find the type with the maximum score
    let highestScore = -1;
    let dominantType = 1;

    ENNEAGRAM_QUESTIONS.forEach((q) => {
      const score = enneagramAnswers[q.id];
      if (score > highestScore) {
        highestScore = score;
        dominantType = q.typeAssigned;
      }
    });

    const info = ENNEAGRAM_TYPES[dominantType];
    setEnneagramResult({
      type: dominantType,
      info,
      score: highestScore,
      allAnswers: enneagramAnswers
    });
  };

  // Calculation of DISC
  const calculateDisc = () => {
    const unanswered = DISC_QUESTIONS.some((q) => discAnswers[q.id] === undefined);
    if (unanswered) {
      alert("يرجى الإجابة على جميع البنود لحساب سمات العمل.");
      return;
    }

    const counts: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };
    DISC_QUESTIONS.forEach((q) => {
      const weight = discAnswers[q.id];
      counts[weight] = (counts[weight] || 0) + 1;
    });

    // Calculate percentages
    const total = DISC_QUESTIONS.length;
    const percentages = {
      D: Math.round((counts.D / total) * 100),
      I: Math.round((counts.I / total) * 100),
      S: Math.round((counts.S / total) * 100),
      C: Math.round((counts.C / total) * 100),
    };

    // Find dominate quadrant
    let dominant: "D" | "I" | "S" | "C" = "S";
    let maxPct = -1;
    (Object.keys(percentages) as ("D" | "I" | "S" | "C")[]).forEach((k) => {
      if (percentages[k] > maxPct) {
        maxPct = percentages[k];
        dominant = k;
      }
    });

    const profile = DISC_PROFILES[dominant];
    setDiscResult({
      dominant,
      profile,
      percentages,
      counts
    });
  };

  return (
    <div className="space-y-8">
      {/* Clinician Advice banner */}
      <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="z-10 text-center md:text-right space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 border border-teal-800 rounded-full text-teal-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            أنماط الشخصية وبيئة العمل المهنية
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">موسوعة تصنيف الأنماط واختبارات بيئة العمل</h2>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            استكشف تكوينك الفكري وعلاقاتك في بيئة العمل وبوصلتك الحياتية المستقرة من خلال عينات اختبارات مقيسة وذات شعبية عالمية.
          </p>
        </div>
        <div className="bg-teal-500/10 p-4 rounded-2xl border border-teal-500/20 z-10">
          <Layers className="w-12 h-12 text-teal-400" />
        </div>
      </div>

      {!activeSuite ? (
        /* CHOOSE TESTS SUITE CONTAINER */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* MBTI Card */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 bg-indigo-950 rounded border border-indigo-900 text-indigo-400 text-[9px] font-bold block w-max uppercase">MBTI Test</span>
              <h3 className="text-lg font-black text-slate-100">بوصلة مايرز بريجز (MBTI)</h3>
              <p className="text-xs text-slate-405 leading-relaxed text-slate-400">
                مؤشر الأنماط النفسية العالمي الشهير للكشف عن تفضيلاتك الأربعة الأساسية لتبادل الطاقة والفكر، واتخاذ قرارات متوازنة.
              </p>
            </div>
            <button
              onClick={() => handleStartSuite("mbti")}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition block text-center cursor-pointer"
            >
              ابدأ المقياس السيكومتري (8 بنود)
            </button>
          </div>

          {/* Enneagram Card */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 bg-emerald-950 rounded border border-emerald-900 text-emerald-400 text-[9px] font-bold block w-max uppercase">Enneagram</span>
              <h3 className="text-lg font-black text-slate-100">اختصار الإنياغرام (التساعي)</h3>
              <p className="text-xs text-slate-405 leading-relaxed text-slate-400">
                برنامج الشخصية السلوكي المترابط لمعرفة مخاوف نفسك ودوافعك الداخلية من أنماط الشخصيات التسعة المتلاقية.
              </p>
            </div>
            <button
              onClick={() => handleStartSuite("enneagram")}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black rounded-xl text-xs transition block text-center cursor-pointer"
            >
              ابدأ مقياس المخاوف الذاتية (9 بنود)
            </button>
          </div>

          {/* DISC Work Card */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 bg-pink-950 rounded border border-pink-900 text-pink-400 text-[9px] font-bold block w-max uppercase">DISC Work Environment</span>
              <h3 className="text-lg font-black text-slate-100">تحليل بيئة العمل وسلوك الأداء (DISC)</h3>
              <p className="text-xs text-slate-405 leading-relaxed text-slate-400">
                مقياس السلوك الإداري والمهني لتحديد سماتك الأربعة: السيادة، الإثارة، الوفاء، والامتثال، لبناء شراكات مهنية ناجحة.
              </p>
            </div>
            <button
              onClick={() => handleStartSuite("disc")}
              className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl text-xs transition block text-center cursor-pointer"
            >
              ابدأ سلوكيات مكان العمل (4 بنود كبرى)
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE TEST RUNNER MODULE */
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6 relative">
          
          {/* Back button */}
          <button
            onClick={() => setActiveSuite(null)}
            className="absolute top-4 left-4 p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            المرور للأنماط الأخرى
          </button>

          <h3 className="font-extrabold text-base text-slate-100">
            {activeSuite === "mbti" && "مؤشر الأنماط النفسية Myers-Briggs"}
            {activeSuite === "enneagram" && "مقياس الإنياغرام السلوكي لتسع طبائع للذات"}
            {activeSuite === "disc" && "مقياس DISC لـ سلوكيات بيئة العمل"}
          </h3>

          {/* 1. MBTI RENDERING ACTIVE */}
          {activeSuite === "mbti" && !mbtiResult && (
            <div className="space-y-6">
              <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / MBTI_QUESTIONS.length) * 100}%` }}
                />
              </div>

              <div className="text-xs text-slate-400 flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                <span>البند {currentQuestionIdx + 1} من {MBTI_QUESTIONS.length}</span>
                <span className="font-mono text-indigo-400">أبعاد كشف الشخصية الكبرى</span>
              </div>

              {/* MBTI Question Panel */}
              <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl text-right space-y-4">
                <p className="text-sm md:text-base font-bold text-slate-100 leading-relaxed">
                  {MBTI_QUESTIONS[currentQuestionIdx].textArabic}
                </p>
                
                <div className="space-y-3 pt-3">
                  {MBTI_QUESTIONS[currentQuestionIdx].options.map((opt, oIdx) => {
                    const qId = MBTI_QUESTIONS[currentQuestionIdx].id;
                    const isSelected = mbtiAnswers[qId] === opt.code;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectMbti(qId, opt.code)}
                        className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition text-xs font-semibold ${
                          isSelected 
                            ? "bg-indigo-950/20 border-indigo-500 text-indigo-400" 
                            : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-350 text-slate-300"
                        }`}
                      >
                        <p>{opt.labelArabic}</p>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-indigo-500 bg-indigo-500/20" : "border-slate-700"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="px-4 py-2 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  البند السابق
                </button>
                
                {currentQuestionIdx < MBTI_QUESTIONS.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                    disabled={mbtiAnswers[MBTI_QUESTIONS[currentQuestionIdx].id] === undefined}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    البند التالي
                  </button>
                ) : (
                  <button
                    onClick={calculateMbti}
                    disabled={mbtiAnswers[MBTI_QUESTIONS[currentQuestionIdx].id] === undefined}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-emerald-950/10 cursor-pointer"
                  >
                    احتساب نتيجة النمط النفسي بالحال
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. MBTI RENDERING RESULTS */}
          {activeSuite === "mbti" && mbtiResult && (
            <div className="space-y-6 text-xs animate-fade-in">
              <div className="border-b border-slate-900 pb-4 text-center md:text-right flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 font-extrabold rounded text-[10px] block w-max mb-1 uppercase">مؤشر البوصلة MBTI</span>
                  <h4 className="text-xl font-black text-slate-100">نمطك المستقر: {mbtiResult.code} — {mbtiResult.profile.nameArabic}</h4>
                  <p className="text-slate-400 text-xs mt-1">"{mbtiResult.profile.nickNameArabic}"</p>
                </div>
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center flex flex-col justify-center">
                  <span className="text-[10px] text-slate-450 block font-bold text-slate-400">نمط العقلانية</span>
                  <strong className="text-indigo-400 font-mono text-base">{mbtiResult.code}</strong>
                </div>
              </div>

              <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-2xl">
                <strong className="text-slate-200 block mb-2 font-black">الوصف والتحليل المفاهيمي والسلوكي:</strong>
                <p className="text-slate-300 leading-relaxed leading-loose text-[11px] font-medium">
                  {mbtiResult.profile.descriptionArabic}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-normal">
                <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl space-y-3">
                  <strong className="text-indigo-400 block font-bold text-xs flex items-center gap-1.5 border-b border-slate-900 pb-2">
                    <Trophy className="w-4 h-4" /> نقاط القوة الحيوية المنبثقة:
                  </strong>
                  <ul className="space-y-2 list-disc list-inside text-slate-305 text-slate-300 text-[11px]">
                    {mbtiResult.profile.strengths.map((str: string, i: number) => <li key={i}>{str}</li>)}
                  </ul>
                </div>

                <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl space-y-3">
                  <strong className="text-teal-400 block font-bold text-xs flex items-center gap-1.5 border-b border-slate-900 pb-2">
                    <Briefcase className="w-4 h-4" /> البيئات والمسارات الوظيفية الملائمة:
                  </strong>
                  <ul className="space-y-2 list-disc list-inside text-slate-350 text-slate-300 text-[11px]">
                    {mbtiResult.profile.careers.map((car: string, i: number) => <li key={i}>{car}</li>)}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleStartSuite("mbti")}
                className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> إعادة الاختبار مجدداً
              </button>
            </div>
          )}


          {/* 3. ENNEAGRAM RENDERING ACTIVE */}
          {activeSuite === "enneagram" && !enneagramResult && (
            <div className="space-y-6">
              <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / ENNEAGRAM_QUESTIONS.length) * 100}%` }}
                />
              </div>

              <div className="text-xs text-slate-400 flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                <span>البند {currentQuestionIdx + 1} من {ENNEAGRAM_QUESTIONS.length}</span>
                <span className="font-mono text-emerald-400">تطابق خصائص الهيئات التسعة</span>
              </div>

              {/* Enneagram Question Statement */}
              <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl text-right space-y-5">
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded text-[9px] font-bold">بند تقييم الدوافع الذاتية</span>
                <p className="text-sm md:text-base font-bold text-slate-100 leading-relaxed">
                  هل ينطبق عليك هذا الاعتقاد أو الفكر بانتظام؟
                </p>
                <p className="text-xs font-semibold text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-900 leading-relaxed md:mx-6 shadow-inner">
                  "{ENNEAGRAM_QUESTIONS[currentQuestionIdx].textArabic}"
                </p>

                {/* Rating score values from 1 (does not apply) to 5 (totally applies) */}
                <div className="pt-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 block mb-2">من فضلك قيّم مدى دقة انطباق العبارة أعلاه على طبيعة شخصيتك:</span>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {[
                      { score: 1, label: "لا ينطبق أبداً" },
                      { score: 2, label: "نادراً" },
                      { score: 3, label: "مقبول أحياناً" },
                      { score: 4, label: "ينطبق كثيراً" },
                      { score: 5, label: "ينطبق تماماً وعادة" }
                    ].map((rate) => {
                      const qId = ENNEAGRAM_QUESTIONS[currentQuestionIdx].id;
                      const isSelected = enneagramAnswers[qId] === rate.score;
                      return (
                        <button
                          key={rate.score}
                          type="button"
                          onClick={() => handleSelectEnneagram(qId, rate.score)}
                          className={`p-3 rounded-xl border font-bold flex flex-col items-center justify-between gap-1 transition ${
                            isSelected 
                              ? "bg-emerald-950/30 border-emerald-500 text-emerald-400" 
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <span className="text-sm font-mono font-black">{rate.score}</span>
                          <span className="text-[8px] tracking-tight">{rate.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="px-4 py-2 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  البند السابق
                </button>
                
                {currentQuestionIdx < ENNEAGRAM_QUESTIONS.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                    disabled={enneagramAnswers[ENNEAGRAM_QUESTIONS[currentQuestionIdx].id] === undefined}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black rounded-xl text-xs disabled:opacity-40 cursor-pointer"
                  >
                    البند التالي
                  </button>
                ) : (
                  <button
                    onClick={calculateEnneagram}
                    disabled={enneagramAnswers[ENNEAGRAM_QUESTIONS[currentQuestionIdx].id] === undefined}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-950/10 cursor-pointer"
                  >
                    احتساب نمط طبائع الذات بالحال
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 4. ENNEAGRAM RENDERING RESULTS */}
          {activeSuite === "enneagram" && enneagramResult && (
            <div className="space-y-6 text-xs animate-fade-in">
              <div className="border-b border-slate-900 pb-4 text-center md:text-right flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 font-extrabold rounded text-[10px] block w-max mb-1 uppercase">مقياس الإنياغرام ENNEAGRAM</span>
                  <h4 className="text-xl font-black text-slate-100">نمطك الغالب: النمط رقم {enneagramResult.type} — {enneagramResult.info.nameArabic}</h4>
                  <p className="text-slate-400 text-xs mt-1">المسمى السلوكي: "{enneagramResult.info.roleArabic}"</p>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center flex flex-col justify-center">
                  <span className="text-[10px] text-slate-455 block font-bold text-slate-400">تقييم النمط</span>
                  <strong className="text-emerald-400 font-mono text-base">Type {enneagramResult.type}</strong>
                </div>
              </div>

              <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-2xl">
                <strong className="text-slate-200 block mb-2 font-black">توصيف الشخصية الكلي الدقيق:</strong>
                <p className="text-slate-300 leading-relaxed leading-loose text-[11px] font-medium">
                  {enneagramResult.info.descriptionArabic}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-normal">
                <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl space-y-2">
                  <strong className="text-emerald-400 block font-bold text-xs border-b border-slate-900 pb-1.5 flex items-center gap-1">
                    <Activity className="w-4 h-4 text-emerald-400" /> الرغبة الأساسية المحركة للنمط:
                  </strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-1 font-semibold">
                    {enneagramResult.info.coreDesire}
                  </p>
                </div>

                <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl space-y-2">
                  <strong className="text-red-400 block font-bold text-xs border-b border-slate-900 pb-1.5 flex items-center gap-1">
                    <HelpCircle className="w-4 h-4 text-red-400" /> المخاوف والتشوهات الدفينة الصامتة:
                  </strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-1 font-semibold">
                    {enneagramResult.info.coreFear}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleStartSuite("enneagram")}
                className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> إعادة فحص الإنياغرام
              </button>
            </div>
          )}


          {/* 5. DISC RENDERING ACTIVE */}
          {activeSuite === "disc" && !discResult && (
            <div className="space-y-6">
              <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-pink-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / DISC_QUESTIONS.length) * 100}%` }}
                />
              </div>

              <div className="text-xs text-slate-400 flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                <span>البند {currentQuestionIdx + 1} من {DISC_QUESTIONS.length}</span>
                <span className="font-mono text-pink-400">تحليل رغبات العمل المهنية</span>
              </div>

              {/* DISC Question Statement with Radio Selectors */}
              <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl text-right space-y-4">
                <p className="text-sm md:text-base font-bold text-slate-100 leading-relaxed">
                  {DISC_QUESTIONS[currentQuestionIdx].textArabic}
                </p>

                <div className="space-y-3 pt-3">
                  {DISC_QUESTIONS[currentQuestionIdx].options.map((opt, oIdx) => {
                    const qId = DISC_QUESTIONS[currentQuestionIdx].id;
                    const isSelected = discAnswers[qId] === opt.weight;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectDisc(qId, opt.weight)}
                        className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition text-xs font-semibold ${
                          isSelected 
                            ? "bg-pink-950/20 border-pink-500 text-pink-400" 
                            : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-350 text-slate-300"
                        }`}
                      >
                        <p>{opt.labelArabic}</p>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-pink-500 bg-pink-500/20" : "border-slate-700"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="px-4 py-2 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  البند السابق
                </button>
                
                {currentQuestionIdx < DISC_QUESTIONS.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                    disabled={discAnswers[DISC_QUESTIONS[currentQuestionIdx].id] === undefined}
                    className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    البند التالي
                  </button>
                ) : (
                  <button
                    onClick={calculateDisc}
                    disabled={discAnswers[DISC_QUESTIONS[currentQuestionIdx].id] === undefined}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-emerald-950/10 cursor-pointer"
                  >
                    تحليل بوصلة DISC وحساب التقريرالمهني
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 6. DISC RENDERING RESULTS */}
          {activeSuite === "disc" && discResult && (
            <div className="space-y-6 text-xs animate-fade-in">
              <div className="border-b border-slate-900 pb-4 text-center md:text-right flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="px-2 py-0.5 bg-pink-950 text-pink-400 font-extrabold rounded text-[10px] block w-max mb-1 uppercase">مؤشر بيئة العمل DISC</span>
                  <h4 className="text-xl font-black text-slate-100">بصمتك السلوكية: {discResult.profile.nameArabic}</h4>
                  <p className="text-slate-400 text-xs mt-1">الدور الوظيفي الغالب: "{discResult.profile.roleArabic}"</p>
                </div>
                <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-center flex flex-col justify-center">
                  <span className="text-[10px] text-slate-455 block font-bold text-slate-400">شريحة السلوك</span>
                  <strong className="text-pink-400 font-mono text-base">Core {discResult.dominant}</strong>
                </div>
              </div>

              {/* Graphical representation of percentages quadrants */}
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 space-y-4">
                <span className="font-extrabold text-slate-200 text-xs block">مؤشر توزيع الأبعاد الأربعة في شخصيتك المهنية:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-[11px] font-bold">
                  {/* D */}
                  <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-red-400 block text-xs">D - السيادة</span>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-400 h-full" style={{ width: `${discResult.percentages.D}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 block pt-1">{discResult.percentages.D}%</span>
                  </div>
                  {/* I */}
                  <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-amber-400 block text-xs">I - التأثير</span>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: `${discResult.percentages.I}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 block pt-1">{discResult.percentages.I}%</span>
                  </div>
                  {/* S */}
                  <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-teal-400 block text-xs">S - الاستقرار</span>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-400 h-full" style={{ width: `${discResult.percentages.S}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 block pt-1">{discResult.percentages.S}%</span>
                  </div>
                  {/* C */}
                  <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-indigo-400 block text-xs">C - الامتثال</span>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full" style={{ width: `${discResult.percentages.C}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 block pt-1">{discResult.percentages.C}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl leading-relaxed">
                <strong className="text-slate-200 block mb-1 font-black">الشرح والتقييم الإداري:</strong>
                <p className="text-slate-300 font-medium leading-loose text-[11px]">{discResult.profile.descriptorArabic}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-normal">
                <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl space-y-3">
                  <strong className="text-emerald-400 block font-bold text-xs border-b border-slate-900 pb-2 flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-emerald-400" /> ميزات الأداء والتشغيل:
                  </strong>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-350 text-slate-300 text-[11px]">
                    {discResult.profile.strengths.map((str: string, i: number) => <li key={i}>{str}</li>)}
                  </ul>
                </div>

                <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-2xl space-y-3">
                  <strong className="text-indigo-400 block font-bold text-xs border-b border-slate-900 pb-2 flex items-center gap-1">
                    <Activity className="w-4 h-4 text-indigo-400" /> إرشادات لتحسين الفعالية:
                  </strong>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-350 text-slate-300 text-[11px]">
                    {discResult.profile.tips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleStartSuite("disc")}
                className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> إعادة تقييم بيئة العمل DISC
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
