import React, { useState } from "react";
import { CLINICAL_TESTS } from "../data/clinicalTests";
import { StandardTest } from "../types";
import { FileHeart, Star, ArrowRight, Check, Award, AlertTriangle, HelpCircle } from "lucide-react";

interface StandardTestsProps {
  onTestComplete: (testId: string, score: number) => void;
  onEmergencyTriggered: (reason: string) => void;
}

export function StandardTests({ onTestComplete, onEmergencyTriggered }: StandardTestsProps) {
  const [activeTest, setActiveTest] = useState<StandardTest | null>(null);
  const [currentQuestIdx, setCurrentQuestIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [testHistory, setTestHistory] = useState<Record<string, { score: number; date: string; level: string; severity: string }>>({});

  const handleStartTest = (test: StandardTest) => {
    setActiveTest(test);
    setCurrentQuestIdx(0);
    setAnswers({});
  };

  const handleSelectOption = (questionId: number, score: number) => {
    setAnswers({ ...answers, [questionId]: score });
  };

  const handleNext = () => {
    if (activeTest && currentQuestIdx < activeTest.questions.length - 1) {
      setCurrentQuestIdx(currentQuestIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestIdx > 0) {
      setCurrentQuestIdx(currentQuestIdx - 1);
    }
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;

    // Verify all questions are answered
    const unanswered = activeTest.questions.some((q) => answers[q.id] === undefined);
    if (unanswered) {
      alert("يرجى الإجابة على جميع بنود الاختبار لإتمام حساب الدرجة الإكلينيكية بدقة.");
      return;
    }

    // Direct PHQ-9 Q9 suicide screening
    if (activeTest.id === "PHQ-9") {
      const q9Answer = answers[9]; // Question ID 9 is the self-harm topic
      if (q9Answer > 0) {
        onEmergencyTriggered("إجابة مرتفعة على البند التاسع الخاص برصد الأفكار الانتحارية وإيذاء الذات في اختبار الاكتئاب (PHQ-9).");
        return;
      }
    }

    // Calculate total score
    const totalScore = activeTest.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    const interp = activeTest.interpret(totalScore);

    const updatedHistory = {
      ...testHistory,
      [activeTest.id]: {
        score: totalScore,
        date: new Date().toLocaleDateString("ar-EG"),
        level: interp.levelArabic,
        severity: interp.severity
      }
    };

    setTestHistory(updatedHistory);
    onTestComplete(activeTest.id, totalScore);
    setActiveTest(null);

    alert(`أحسنت! تم حفظ نتائج الاختبار بنجاح. درجاتك: ${totalScore} من ${activeTest.maxScore} (${interp.levelArabic}).`);
  };

  return (
    <div id="clinical-checklists-section" className="space-y-8">
      {/* Clinician Advice banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="z-10 text-center md:text-right space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950 border border-emerald-800 rounded-full text-emerald-400 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            استبيانات التقييم الذاتي بموثوقية إكلينيكية مطلقة
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">الاكتشاف الذاتي والمقاييس النفسية المعتمدة</h2>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            استمارات تشخيصية قياسية معترف بها في منظمة الصحة العالمية والشرائح العيادية. تساعدك في رصد مستويات القلق والاكتئاب والاحتراق المهني بشكل مبكر لوضع خريطة طريق واضحة.
          </p>
        </div>
        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 z-10">
          <FileHeart className="w-12 h-12 text-emerald-400" />
        </div>
      </div>

      {activeTest ? (
        /* ACTIVE TEST RUNNER MODULE */
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6">
          {/* Header Progress on Active Test */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-400">{activeTest.nameEnglish}</span>
              <h3 className="font-extrabold text-lg text-slate-100">{activeTest.nameArabic}</h3>
            </div>
            {/* Question indices */}
            <div className="text-xs font-bold text-slate-400">
              السؤال <span className="text-teal-400 font-mono text-sm">{currentQuestIdx + 1}</span> من <span className="font-mono">{activeTest.questions.length}</span>
            </div>
          </div>

          {/* Graphical top progress line */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-500 h-full transition-all duration-300"
              style={{ width: `${((currentQuestIdx + 1) / activeTest.questions.length) * 100}%` }}
            />
          </div>

          {/* Active Question Box */}
          <div className="bg-slate-900/40 p-6 border border-slate-900 rounded-2xl space-y-5 text-right">
            <span className="bg-teal-950/40 text-teal-400 font-black px-2 py-0.5 rounded text-[10px] inline-block border border-teal-805/10">بند الاختبار</span>
            <p className="text-sm md:text-base font-bold text-slate-100 leading-relaxed md:ml-3">
              {activeTest.questions[currentQuestIdx].textArabic}
            </p>
          </div>

          {/* Radio Options items */}
          <div className="space-y-3.5">
            {activeTest.questions[currentQuestIdx].options.map((opt) => {
              const questionId = activeTest.questions[currentQuestIdx].id;
              const isSelected = answers[questionId] === opt.score;
              return (
                <div
                  key={opt.score}
                  onClick={() => handleSelectOption(questionId, opt.score)}
                  className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition ${
                    isSelected 
                      ? "bg-teal-950/20 border-teal-500 text-teal-400" 
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <p className="text-xs md:text-sm font-semibold">{opt.labelArabic}</p>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-teal-500 bg-teal-500/20" : "border-slate-700"
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls Bar for active tests */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-900">
            <button
              onClick={handlePrev}
              disabled={currentQuestIdx === 0}
              className={`py-2 px-5 rounded-xl text-xs font-bold transition ${
                currentQuestIdx === 0 ? "bg-slate-950 text-slate-700 cursor-not-allowed" : "bg-slate-900 text-slate-300 hover:text-white"
              }`}
            >
              البند السابق
            </button>

            {currentQuestIdx < activeTest.questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={answers[activeTest.questions[currentQuestIdx].id] === undefined}
                className={`py-2 px-6 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  answers[activeTest.questions[currentQuestIdx].id] === undefined 
                    ? "bg-slate-950 text-slate-655 cursor-not-allowed text-slate-600" 
                    : "bg-teal-500 hover:bg-teal-600 text-slate-950"
                }`}
              >
                البند التالي <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={answers[activeTest.questions[currentQuestIdx].id] === undefined}
                className={`py-3 px-8 rounded-xl text-xs font-black transition ${
                  answers[activeTest.questions[currentQuestIdx].id] === undefined 
                    ? "bg-slate-950 text-slate-655 cursor-not-allowed text-slate-600" 
                    : "bg-emerald-600 hover:bg-emerald-700 text-slate-950 shadow-md shadow-emerald-900/10"
                }`}
              >
                إرسال وحساب النطاق الإكلينيكي بالحال
              </button>
            )}
          </div>
        </div>
      ) : (
        /* QUESTIONNAIRE DIRECTORY CARDS + HISTORY STATUS */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List of active tests */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-bold text-lg text-slate-100">المقاييس السيكومترية المتاحة</h3>
            <div className="space-y-4 text-xs">
              {CLINICAL_TESTS.map((test) => {
                const history = testHistory[test.id];
                return (
                  <div key={test.id} className="bg-slate-950 border border-slate-905 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 border-slate-900">
                    <div className="space-y-1.5 max-w-md">
                      <span className="text-[9px] uppercase font-bold text-teal-450 tracking-wider font-mono text-teal-400">{test.id} • {test.nameEnglish}</span>
                      <h4 className="font-bold text-slate-100 text-sm">{test.nameArabic}</h4>
                      <p className="text-slate-400 leading-relaxed text-[11px]">{test.descriptionArabic}</p>
                    </div>

                    <div className="flex-shrink-0 flex sm:items-center gap-4 flex-col sm:flex-row md:flex-col lg:flex-row">
                      {history ? (
                        <div className="text-right sm:text-left md:text-right border-l border-slate-900 pl-4 space-y-0.5">
                          <span className="text-[9px] text-slate-400 block font-medium">سجلّك السابق: <strong>{history.score} درجات</strong></span>
                          <span className={`text-[10px] font-bold block ${
                            history.severity === "low" ? "text-emerald-400" : history.severity === "medium" ? "text-amber-400" : "text-rose-400"
                          }`}>{history.level}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic block">لم تختبر حديثاً</span>
                      )}

                      <button
                        onClick={() => handleStartTest(test)}
                        className="py-2.5 px-4 bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold rounded-xl text-xs transition"
                      >
                        ابدأ الاختبار
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test scores diagnostics explanations */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-slate-100">سجل المؤشرات الإكلينيكية والتشخيصية</h3>
              <p className="text-xs text-slate-405 mt-1 text-slate-400">ملخص لجميع الاختبارات التي أنهيتها ونطاق الخطورة الحالي المعتمد إكلينيكياً.</p>
            </div>

            {Object.keys(testHistory).length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-600" />
                <span>لا توجد سجلات سابقة بعد. أكمل أحد الاختبارات للبدء في توليد تقريرك السيكومتري التفصيلي.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {(Object.entries(testHistory) as [string, { score: number; date: string; level: string; severity: string }][]).map(([id, hist]) => {
                  return (
                    <div key={id} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-100 text-[13px]">{id === "PHQ-9" ? "تقييم العتبة الاكتئابية" : id === "GAD-7" ? "تقييم مؤشر القلق" : "تقييم الضغط النفسي"}</span>
                        <span className="text-[10px] font-bold text-slate-500">{hist.date}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60 text-[11px]">
                        <span className="text-slate-405">الدرجة الكلية: <strong className="text-slate-200 font-mono text-xs">{hist.score}</strong></span>
                        <span>•</span>
                        <span>الشخيص المعتمد:</span>
                        <span className={`font-black ${
                          hist.severity === "low" ? "text-emerald-400" : hist.severity === "medium" ? "text-amber-500" : "text-rose-400"
                        }`}>{hist.level}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
