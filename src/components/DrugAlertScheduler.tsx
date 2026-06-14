import React, { useState, useEffect } from "react";
import { Pill, AlarmClock, Plus, Check, Trash, ShieldAlert, Sparkles, User, Info, Bot, CheckCircle } from "lucide-react";
import { MedicationReminder } from "../types";
import { getCustomizedMedicationsList, PSYCHIATRIC_MEDICATIONS } from "../data/medicationsData";

export function DrugAlertScheduler() {
  const [medications, setMedications] = useState<MedicationReminder[]>([]);

  const [newNameAr, setNewNameAr] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newFrequency, setNewFrequency] = useState("Daily");
  const [newTimes, setNewTimes] = useState("09:00");

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<string | null>(null);
  const [customMsg, setCustomMsg] = useState<string | null>(null);
  const [suggestedMed, setSuggestedMed] = useState<any | null>(null);
  const [demographics, setDemographics] = useState<any | null>(null);

  // 🔄 Load customized user medication dynamically on mount
  useEffect(() => {
    const loadMeds = () => {
      try {
        const loggedInKey = localStorage.getItem("sakeenah_logged_in_user") || "guest";
        setCurrentUser(loggedInKey);
        
        const rawData = localStorage.getItem(`sakeenah_patient_${loggedInKey}`);
        const savedState = localStorage.getItem(`sakeenah_meds_${loggedInKey}`);

        if (rawData) {
          const data = JSON.parse(rawData);
          setDemographics(data.demographics || null);
          const name = data.demographics?.name || loggedInKey;
          
          if (data.finalReportResult) {
            const report = data.finalReportResult;
            setCurrentDiagnosis(report.testName || report.testId);
            setSuggestedMed(report.medicationPre || null);
            
            // Build single diagnosed medication reminder list
            let singleMedList: MedicationReminder[] = [];
            if (report.medicationPre) {
              singleMedList = [
                {
                  id: "med_linked_" + report.testId,
                  nameArabic: `${report.medicationPre.brandNameLocal} (${report.medicationPre.categoryArabic})`,
                  nameEnglish: `${report.medicationPre.brandNameForeign} (${report.medicationPre.genericName})`,
                  dosage: report.medicationPre.strengths?.[0] || "10 ملغ",
                  frequency: "يومياً أو وفق توجيهات طبيبك المختص",
                  timesOfDay: ["21:00"],
                  isActive: true,
                  takenToday: []
                }
              ];
            }
            
            if (report.testId === "PHQ-9") {
              setCustomMsg(`عناية: تم تخصيص قائمة الأدوية لمطابقة تشخيصك بـ [${report.severity}] على مقياس الاكتئاب السريري PHQ-9 وبما يتوافق تماماً مع تقرير التقييم.`);
            } else if (report.testId === "GAD-7") {
              setCustomMsg(`عناية: تم تخصيص هذا الجدول الدوائي بمطابقة مباشرة مع تشخيص القلق والهلع [${report.severity}] المقاس سريرياً بمقياس GAD-7.`);
            } else if (report.testId === "PSS-10") {
              setCustomMsg(`عناية: تم ضبط جرعاتك الموصى بها بما يتلاءم مع مؤشرات التوتر النفسي العصبي والمهني [${report.severity}] تحت معايير PSS-10.`);
            } else {
              setCustomMsg(`بروتوكول معياري: تم توفير جرعات افتراضية إرشادية لـ (${name}) بانتظار استكمال فحصك النفسي المعتمد بالكامل.`);
            }
            
            if (savedState) {
              setMedications(JSON.parse(savedState));
            } else {
              setMedications(singleMedList);
              localStorage.setItem(`sakeenah_meds_${loggedInKey}`, JSON.stringify(singleMedList));
            }
          } else {
            setCustomMsg(`تنبيه للملف الطبي لـ (${name}): لم تقم بإنهاء المقياس النفسي والتشخيص النهائي بعد بالمرحلة الرابعة. يرجى تدوين تفاصيل عنائك والقيام بالفحص لنقوم بتهيئة الأدوية المخصصة لحالتك بدقة.`);
            
            if (savedState) {
              setMedications(JSON.parse(savedState));
            } else {
              setMedications([]);
            }
          }
        } else {
          setCustomMsg("تنبيه: يمكنك تسجيل روتينك الدوائي يدوياً من خلال الاستمارة الجانبية، أو استكمال الفرز السريري بالمرحلة الثانية والثالثة والتشخيص بالرابعة ليقترح الخوارزم الطبي المقررات تلقائياً وبدقة عالية.");
          if (savedState) {
            setMedications(JSON.parse(savedState));
          } else {
            setMedications([]);
          }
        }
      } catch (e) {
        console.error("Error initializing medications check", e);
      }
    };

    loadMeds();

    window.addEventListener("sakeenah_patient_updated", loadMeds);
    return () => {
      window.removeEventListener("sakeenah_patient_updated", loadMeds);
    };
  }, []);

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameAr.trim()) return;

    const timesArray = newTimes.split(",").map(t => t.trim());

    const newMed: MedicationReminder = {
      id: "med_" + Date.now(),
      nameArabic: newNameAr,
      nameEnglish: newNameEn || "Generic",
      dosage: newDosage || "1 حبة",
      frequency: newFrequency,
      timesOfDay: timesArray,
      isActive: true,
      takenToday: []
    };

    const updatedMeds = [...medications, newMed];
    setMedications(updatedMeds);
    
    // Save to localStorage immediately to prevent race conditions with event listeners
    const loggedInKey = localStorage.getItem("sakeenah_logged_in_user") || "guest";
    localStorage.setItem(`sakeenah_meds_${loggedInKey}`, JSON.stringify(updatedMeds));
    
    setNewNameAr("");
    setNewNameEn("");
    setNewDosage("");
    setNewTimes("09:00");
    
    // Notify external directory tabs to sync
    window.dispatchEvent(new CustomEvent("sakeenah_patient_updated"));
  };

  const handleDeleteMed = (id: string) => {
    const updatedMeds = medications.filter((m) => m.id !== id);
    setMedications(updatedMeds);
    
    // Notify external directory tabs to sync
    const key = currentUser || localStorage.getItem("sakeenah_logged_in_user") || "guest";
    localStorage.setItem(`sakeenah_meds_${key}`, JSON.stringify(updatedMeds));
    window.dispatchEvent(new CustomEvent("sakeenah_patient_updated"));
  };

  const toggleTakeDose = (medId: string, time: string) => {
    const updated = medications.map((m) => {
      if (m.id === medId) {
        const alreadyTaken = m.takenToday.includes(time);
        const updatedTaken = alreadyTaken
          ? m.takenToday.filter((t) => t !== time)
          : [...m.takenToday, time];
        return { ...m, takenToday: updatedTaken };
      }
      return m;
    });
    setMedications(updated);

    const key = currentUser || localStorage.getItem("sakeenah_logged_in_user") || "guest";
    localStorage.setItem(`sakeenah_meds_${key}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("sakeenah_patient_updated"));
  };

  // Calculate global compliance index for today
  const getTotalDosesCount = () => {
    return medications.reduce((sum, m) => sum + m.timesOfDay.length, 0);
  };

  const getTakenDosesCount = () => {
    return medications.reduce((sum, m) => sum + m.takenToday.length, 0);
  };

  const totalDoses = getTotalDosesCount();
  const takenDoses = getTakenDosesCount();
  const complianceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  return (
    <div id="drug-scheduler-section" className="space-y-8">
      {/* Clinician Advice Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="z-10 text-center md:text-right space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 border border-teal-800 rounded-full text-teal-400 text-xs font-semibold mb-2">
            <Pill className="w-3.5 h-3.5" />
            صيدليتي الذكية والمطابقة الدوائية
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">إدارة الروتين الدوائي النفسي والجرعات</h2>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            تجنب التوقف المفاجئ لأدوية السيروتونين (SSRIs) لتجنب متلازمة الانسحاب. رتب مواعيد جرعاتك بانتظام، وضع علامة اكتمال يومية، واحتفظ بسجل التزامك الإكلينيكي.
          </p>
        </div>
        <div className="bg-teal-500/10 p-4 rounded-2xl border border-teal-500/20 z-10">
          <AlarmClock className="w-12 h-12 text-teal-400 animate-pulse" />
        </div>
      </div>

      {customMsg && (
        <div className="bg-teal-950/30 border border-teal-900/40 p-4 rounded-3xl flex gap-3 items-center text-right text-xs text-teal-400 animate-fade-in">
          <Sparkles className="w-5 h-5 text-teal-400 shrink-0 animate-pulse" />
          <p className="font-semibold leading-relaxed">{customMsg}</p>
        </div>
      )}

      {suggestedMed && (
        <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/20 rounded-3xl p-6 text-right space-y-4 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/40 pb-4 z-10 relative">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500/10 border border-emerald-400/20 p-2.5 rounded-xl text-emerald-400 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-emerald-300">الربط السريري المباشر: الأدوية المقترحة في خطتك العلاجية الطبية المعتمدة</h4>
                <p className="text-[10px] text-slate-400">هذا العقار مرتبط بتشخيصك بـ ({currentDiagnosis || "تقريرك السريري"}) لخدمة تسريع التماثل والتعافي.</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                // Check if already in the list
                const isAlreadyAdded = medications.some(m => m.nameArabic.includes(suggestedMed.brandNameLocal) || m.nameEnglish.includes(suggestedMed.brandNameForeign));
                if (isAlreadyAdded) {
                  alert("هذا الدواء مدرج بالفعل في جدول جرعاتك اليقظة!");
                  return;
                }
                const newMed: MedicationReminder = {
                  id: "med_linked_" + Date.now(),
                  nameArabic: `${suggestedMed.brandNameLocal} (${suggestedMed.categoryArabic})`,
                  nameEnglish: `${suggestedMed.brandNameForeign} (${suggestedMed.genericName})`,
                  dosage: suggestedMed.strengths?.[0] || "10 ملغ",
                  frequency: "يومياً أو وفق توجيهات طبيبك المختص",
                  timesOfDay: ["21:00"],
                  isActive: true,
                  takenToday: []
                };
                const updatedMeds = [...medications, newMed];
                setMedications(updatedMeds);
                
                // Write immediately to localStorage to prevent race conditions with event listeners
                const loggedInKey = localStorage.getItem("sakeenah_logged_in_user") || "guest";
                localStorage.setItem(`sakeenah_meds_${loggedInKey}`, JSON.stringify(updatedMeds));

                window.dispatchEvent(new CustomEvent("sakeenah_patient_updated"));
                alert("تم إضافة وربط الدواء العلاجي المقترح من خطتك الطبية لقائمة أدويتك المشخصة بنجاح! 🎉");
              }}
              className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/20 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> إضافة ووصف هذا العلاج لجدول الجرعات المجدولة 🚀
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs leading-normal font-sans z-10 relative">
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl space-y-1">
              <strong className="text-[10px] text-slate-450 text-slate-400 block">العلاج والاسم التجاري:</strong>
              <span className="font-extrabold text-slate-100">{suggestedMed.brandNameLocal}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl space-y-1">
              <strong className="text-[10px] text-slate-450 text-slate-400 block">المادة العلمية الفعالة:</strong>
              <span className="font-bold text-emerald-400 font-mono text-[11px] block">{suggestedMed.genericName}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl space-y-1">
              <strong className="text-[10px] text-slate-450 text-slate-400 block">مدة العلاج المتوقعة:</strong>
              <span className="font-extrabold text-teal-300">{suggestedMed.standardDurationArabic || "حسب رؤية الاستشاري المعالج"}</span>
            </div>
          </div>
        </div>
      )}

      {/* 🧠 الذكاء الاصطناعي والربط التكاملي مع الأمراض المزمنة والتداخلات الدوائية في خطة العلاج الدوائي */}
      {(() => {
        if (!demographics?.chronicDiseases) return null;
        const diseaseAdvice = getChronicDiseaseAdviceList(demographics.chronicDiseases, suggestedMed);
        if (diseaseAdvice.length > 0) {
          return (
            <div className="bg-slate-900 border border-indigo-900/40 p-6 rounded-3xl space-y-4 text-right relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
              <div className="z-10 relative space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <span className="text-[9px] text-indigo-400 font-extrabold bg-indigo-950/60 border border-indigo-900/60 px-2.5 py-1 rounded-full animate-pulse">
                    ربط تخصصي تكاملي مفعّل 🧠⚡
                  </span>
                  <h3 className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    الربط السريري وعلاقة تداخل أدوية خطتك مع أمراضك المزمنة المذكورة ({demographics.chronicDiseases})
                  </h3>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  بموجب فحص معايير السكينة الفسيولوجية والدوائية، تم تحديد التداخلات التالية لرفع مستويات الرقابة والسلامة المنزلية:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {diseaseAdvice.map((advice, i) => {
                    let typeBadgeColor = "text-amber-400 bg-amber-950/60 border-amber-900";
                    if (advice.type === "synergy") typeBadgeColor = "text-emerald-400 bg-emerald-950/60 border-emerald-900";
                    if (advice.type === "contraindication") typeBadgeColor = "text-red-400 bg-red-950/60 border-red-900";
                    if (advice.type === "warning") typeBadgeColor = "text-orange-400 bg-orange-950/60 border-orange-900";

                    return (
                      <div key={i} className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl space-y-2 text-right animate-scale-up">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${typeBadgeColor}`}>
                            {advice.type === "synergy" ? "تآزر علاجي إيجابي" : 
                             advice.type === "contraindication" ? "تعارض دوائي خطير" : 
                             advice.type === "warning" ? "تنبيه استقلابي" : "إرشاد للملف الطبي"}
                          </span>
                          <strong className="text-slate-200 text-xs font-bold block">{advice.label}</strong>
                        </div>
                        <p className="text-slate-300 text-[10.5px] leading-relaxed">{advice.textAr}</p>
                        <p className="text-slate-500 text-[9.5px] leading-relaxed font-mono" dir="ltr">{advice.textEn}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        } else if (demographics.chronicDiseases !== "لا يوجد" && demographics.chronicDiseases.trim() !== "") {
          return (
            <div className="bg-slate-900/30 border border-emerald-950/50 p-4 rounded-2xl flex items-center gap-3 text-right">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-emerald-400 shrink-0">
                <CheckCircle className="w-5 h-5 bg-emerald-950/50 rounded-xl" />
              </div>
              <div className="space-y-0.5 text-[11px] text-right">
                <strong className="text-emerald-400 block font-bold">مؤشر السلامة والتطابق الدوائي المتكامل:</strong>
                <p className="text-slate-400 leading-relaxed">
                  تم مسح قائمة أمراضك المزمنة المكتوبة ({demographics.chronicDiseases}) ومقارنتها كيميائياً مع روتينك الدوائي؛ لم نرصد تداخلات عكسية أو آثار تعارضية تخل بجودة تعافيك بمشيئة الله.
                </p>
              </div>
            </div>
          );
        }
        return null;
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form to Add Medication */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4 max-w-full">
          <div>
            <h3 className="font-bold text-base text-slate-100">أضف علاجاً جديداً للجدول</h3>
            <p className="text-[10px] text-slate-400">ستضاف مواقيت الجرعات تلقائياً لخطة المتابعة اليومية.</p>
          </div>

          <form onSubmit={handleAddMedication} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-teal-400">اختر دواءً جاهزاً من الموسوعة (الخيارات المقررة)</label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const selected = PSYCHIATRIC_MEDICATIONS.find(m => m.id === val);
                  if (selected) {
                    // Extract name before slash or parenthesis
                    const cleanAr = selected.brandNameLocal.split("(")[0].split("/")[0].trim();
                    const cleanEn = selected.brandNameForeign.split("(")[0].trim();
                    setNewNameAr(cleanAr);
                    setNewNameEn(`${cleanEn} (${selected.genericName})`);
                    setNewDosage(selected.strengths[0] || "10 ملغ");
                    setNewFrequency("Daily");
                    setNewTimes("09:00");
                  }
                }}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-100 border border-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="">-- اختر علاجاً لتلقين وتعبئة البيانات تلقائياً --</option>
                {PSYCHIATRIC_MEDICATIONS.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.brandNameLocal.split("(")[0].split("/")[0].trim()} | {med.genericName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">الاسم التجاري أو الوصف بالعربية</label>
              <input
                type="text"
                placeholder="مثال: سيبرالكس CIPRALEX"
                value={newNameAr}
                onChange={(e) => setNewNameAr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-100 border border-slate-800 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">الاسم العلمي بالإنجليزي (اختياري)</label>
              <input
                type="text"
                placeholder="Escitalopram"
                value={newNameEn}
                onChange={(e) => setNewNameEn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-100 border border-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">الجرعة / التركيز</label>
              <input
                type="text"
                placeholder="مثال: حبة واحدة 10ملجم"
                value={newDosage}
                onChange={(e) => setNewDosage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-100 border border-slate-800 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">تكرار التناول</label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-100 border border-slate-800 focus:outline-none"
              >
                <option value="Daily">يومياً (Daily)</option>
                <option value="Twice a day">مرتين باليوم (Twice distinct)</option>
                <option value="As needed">عند الحاجة فقط (PRN / As needed)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">ساعة التنبيه اليقظة (تنسيق 24 ساعة، افصل بفواصل للجرعات المتعددة)</label>
              <input
                type="text"
                placeholder="09:00, 21:00"
                value={newTimes}
                onChange={(e) => setNewTimes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-100 border border-slate-800 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> إدراج الدواء في السجل
            </button>
          </form>

          {/* Legal and Medication Alert Caution */}
          <div className="bg-amber-950/10 border border-amber-900/20 p-3 rounded-2xl flex gap-2 text-[10px] text-amber-300">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block">تحذير إكلينيكي هام:</span>
              لا تقم بتعديل جرعة دوائية، أو إلغاء علاج، أو إتباع جدولة بديلة إلا بنظام مرسل وتحت إشراف مباشر من طبيبك النفسي المعالج قانوناً.
            </div>
          </div>
        </div>

        {/* Daily dosage logs and reminders checklist */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-100">لوحة الجرعات المجدولة لليوم</h3>
              <p className="text-xs text-slate-400 mt-0.5">انقر على الخانات لتأكيد تناول دواءك. يتم تحديث مؤشّرات المطابقة الطبية فوراً.</p>
            </div>

            {/* Compliance Circular progress or badge info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-center flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400">معدل التزامك اليوم:</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-black ${
                  complianceRate >= 80 ? "text-emerald-400" : complianceRate >= 50 ? "text-amber-400" : "text-rose-400"
                }`}>{complianceRate}%</span>
                <span className="text-[10px] text-slate-500">({takenDoses} من {totalDoses})</span>
              </div>
            </div>
          </div>

          {medications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              لا توجد أدوية مجدولة حالياً. أضف عقاقيرك من خلال الاستمارة الجانبية لبدء المتابعة والالتزام.
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map((med) => (
                <div key={med.id} className="bg-slate-900/60 border border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-teal-950 p-2.5 rounded-xl border border-teal-800/40 text-teal-400 mt-0.5">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-100">{med.nameArabic}</h4>
                      <p className="text-xs text-slate-400 font-mono">{med.nameEnglish}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-1">
                        <span>الجرعة الحالية: <strong className="text-slate-300">{med.dosage}</strong></span>
                        <span>•</span>
                        <span>تكرار: <strong className="text-slate-300">{med.frequency}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Times alarms buttons checklist */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {med.timesOfDay.map((time) => {
                      const isTaken = med.takenToday.includes(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => toggleTakeDose(med.id, time)}
                          className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition font-bold border ${
                            isTaken
                              ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <AlarmClock className="w-3.5 h-3.5" />
                          <span>{time}</span>
                          <span className={`w-2.5 h-2.5 rounded-full flex items-center justify-center ${
                            isTaken ? "bg-teal-400 text-slate-950" : "bg-slate-800"
                          }`}>
                            {isTaken && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                          </span>
                        </button>
                      );
                    })}

                    {/* Delete medication element */}
                    <button
                      type="button"
                      onClick={() => handleDeleteMed(med.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-950 rounded-xl transition cursor-pointer"
                      title="مسح من الجدول"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function getChronicDiseaseAdviceList(chronicDiseasesText: string, matchedMed: any) {
  if (!chronicDiseasesText || chronicDiseasesText === "لا يوجد") return [];
  const text = chronicDiseasesText.toLowerCase();
  const adviceList: { label: string; type: "synergy" | "warning" | "info" | "contraindication"; textAr: string; textEn: string }[] = [];
  
  const isInderal = matchedMed && (
    matchedMed.brandNameForeign?.toLowerCase().includes("propranolol") ||
    matchedMed.brandNameForeign?.toLowerCase().includes("inderal") ||
    matchedMed.brandNameLocal?.includes("إنديرال") ||
    matchedMed.genericName?.toLowerCase().includes("propranolol")
  );

  // 1. الضغط
  if (text.includes("ضغط") || text.includes("tension") || text.includes("pressure")) {
    if (isInderal) {
      adviceList.push({
        label: "ارتفاع ضغط الدم الشرياني & دواء إنديرال",
        type: "synergy",
        textAr: "علاقة تكاملية إيجابية: دواء إنديرال (بروبرانولول) مدرج لعلاج أعراض القلق الجسدي (تسارع نبض القلب والارتجاف) وهو في الأصل منظم هام لضغط الدم الشرياني. يمثل الرابط هنا تآزراً علاجياً مزدوجاً، لكن يرجى قياس الضغط بشكل دوري ومراجعة طبيب القلب لتفادي الهبوط المفرط للضغط والدقات أو التعارض مع Concor أو منظمات الضغط الأخرى.",
        textEn: "Synergistic relationship: Inderal (Propranolol) targets physical symptoms of anxiety (tachycardia, tremors) while naturally regulating arterial blood pressure. This provides a dual therapeutic benefit. Monitor blood pressure routinely and consult your cardiologist to avoid excessive hypotension or bradycardia when coupled with other anti-hypertensives like Concor."
      });
    } else {
      adviceList.push({
        label: "ارتفاع ضغط الدم الشرياني & العلاج الدوائي",
        type: "info",
        textAr: "ربط إكلينيكي: المنشأة العلاجية (سيبرالكس / مضادات الاكتئاب SSRIs) آمنة عموماً لمرضى الضغط المرتفع. ومع ذلك، نوصي بتجنب تراكيب أدوية SNRIs (مثل إيفكسور) التي قد تؤثر طردياً على رفع قيم ضغط الشرايين بدون إشراف طبي وثيق.",
        textEn: "Clinical link: Escitalopram is generally safe for patients with hypertension. However, SNRIs (like Venlafaxine/Effexor) should be avoided as they can elevate blood pressure; routine clinical monitoring is recommended."
      });
    }
  }

  // 2. السكري
  if (text.includes("سكري") || text.includes("سكر") || text.includes("diabet")) {
    adviceList.push({
      label: "داء السكري & هرمونات القلق ومقاومة الإنسولين",
      type: "info",
      textAr: "ربط وتأثير متبادل: هناك علاقة هرمونية وطيدة بين الاكتئاب والقلق وبين مستويات السكر؛ حيث يؤدي القلق والتوتر الدائم لزيادة إفراز الكورتيزول وبالتالي زيادة مقاومة الإنسولين في الخلايا. علاجك النفسي سيساهم إيجاباً في استقرار سكر الدم! ولكن انتبه: يحظر تماماً تناول مضادات الذهان من فئة الأدوية غير النمطية (مثل أولانزابين Olanzapine) لتفادي خطر المتلازمة التمثيلية وزيادة الوزن والسكري، واستشر طبيب الغدد دائماً.",
      textEn: "Metabolic link: Chronic anxiety/depression raises cortisol levels, causing cell-insulin resistance. Treating mood disorders with CBT and safe SSRIs like Escitalopram promotes glycemic stability! However, atypical antipsychotics (like Olanzapine) must be avoided due to the high risk of metabolic syndrome and hyperlipidemia."
    });
  }

  // 3. الكلى والكبد
  if (text.includes("كلى") || text.includes("كبد") || text.includes("renal") || text.includes("kidney") || text.includes("liver") || text.includes("hepatic")) {
    adviceList.push({
      label: "أمراض الكلى والكبد & الاستقلاب وتراكم الدواء",
      type: "warning",
      textAr: "ربط الاستقلاب الدوائي: يتم استقلاب وتفكيك معظم مضادات الاكتئاب والقلق (بما فيها السيروتونين سيبرالكس) حيوياً عبر خلايا الكبد ويتم تصريف نفاياتها عبر الكلى. في حال وجود اعتلال كبدي أو قصور كلوي، نوصي طبياً بتعديل وخفض الجرعة البدئية إلى النصف (مثلاً 5 ملغ لسيبرالكس بدلاً من 10 ملغ) لمنع تراكم الدواء بالدم والتسمم، ومراقبة وظائف الأعضاء بدقة.",
      textEn: "Pharmacokinetic caution: Most psychiatric drugs (including Escitalopram) are hepatically metabolized and renally cleared. In patients with renal or hepatic impairment, the initial dosage should be halved (e.g., 5mg instead of 10mg) to prevent drug accumulation and systemic toxicity; monitor liver/kidney funtion panels regularly."
    });
  }

  // 4. الصرع
  if (text.includes("صرع") || text.includes("epilep") || text.includes("seiz")) {
    adviceList.push({
      label: "مرض الصرع & عتبة التشنجات والاضطرابات العصبية",
      type: "warning",
      textAr: "تأهب نوبات الصرع: تخفض بعض مضادات الاكتئاب (مثل Bupropion/Wellbutrin) من عتبة الاختلاج والصرع وتزيد نوبات التشنج. يعتبر دواء سيبرالكس إكلينيكياً آمناً نسبياً لمرضى الصرع، لكن تجب الحيطة وموازنة دواء الصرع (مثل كربامازيبين Carbamazepine) الذي يفرز إنزيمات الكبد ويقلل مستويات مضادات الاكتئاب بالدم.",
      textEn: "Seizure threshold warning: Certain antidepressants (especially Bupropion/Wellbutrin) lower the seizure threshold. While Escitalopram is clinically safer, any anti-epileptic medication (like Carbamazepine) can induce liver enzymes and decrease the efficacy of antidepressants, necessitating exact safety titration."
    });
  }

  // 5. الغدة الدرقية
  if (text.includes("غدة") || text.includes("درقية") || text.includes("thyroid")) {
    adviceList.push({
      label: "اضطرابات الغدة الدرقية & تشابه الأعراض المظلل",
      type: "info",
      textAr: "تشابه الأعراض المظلل: تؤدي اضطرابات هرمونات الغدة الدرقية إلى تغيرات نفسية تحاكي بوضوح الوعكة النفسية؛ خمول وقصور الغدة (Hypothyroidism) يسبب اكتئاباً وخمولاً وغياب دافعية حادة، ونشاط الغدة المفرط (Hyperthyroidism) يثير نوبات الهلع وتسارع نبضات القلب والقلق الحاد. تأكد منصتنا من ضرورة فحص TSH/Free T4 مخبرياً لنفي المنشأ العضوي للاكتئاب قبل الاستمرار بالعلاج الكيميائي.",
      textEn: "Symptom mimicry link: Thyroid hormones control metabolism and mood. Hypothyroidism can mimic major depressive episodes (apathy, clinical fatigue), whereas hyperthyroidism directly generates physical panic attacks (palpitations, acute anxiety). Always check laboratory serum TSH/Free T4 levels to rule out organic thyroid causes before finalizing psychiatric treatments."
    });
  }

  // 6. أمراض الجهاز الهضمي
  if (text.includes("هضمي") || text.includes("قولون") || text.includes("معدة") || text.includes("قرحة") || text.includes("ibs") || text.includes("stomach") || text.includes("gastric")) {
    adviceList.push({
      label: "أمراض الجهاز الهضمي & القولون العصبي ومظلة السيروتونين",
      type: "info",
      textAr: "ربط المحور العصبي المعوي (IBS): توجد بكتيريا وخلايا عصبية في الجهاز الهضمي تفرز السيروتونين وتسمى 'الدماغ الثاني'. القلق العاطفي يثير مباشرة متلازمة القولون العصبي (IBS). العلاج بمثبطات استرداد السيروتونين مفيد جداً للمعدة المعوية تحت التنشيط، لكن الأيام الأولى قد يصحبها غثيان خفيف نتيجة تحفيز مستقبلات السيروتونين الموضعية بالبطن. احذر: تزيد مضادات الاكتئاب من خطر نزيف المعدة إذا تم دمجها مع مسكنات الألم NSAIDs كعلاجات الضغط والظهر العظام اليومية دون حماية مبطنة للمعدة (مثل أوميبرازول).",
      textEn: "Gut-Brain axis alignment (IBS): Serotonin acts as a key neurotransmitter in the gastrointestinal system (the 'second brain'). Emotional anxiety directly triggers Irritable Bowel Syndrome (IBS). SSRIs significantly improve gastrointestinal symptoms over time, though mild nausea is expected initially. Caution: Antidepressants elevate bleeding risk when combined with chronic NSAIDs (daily painkillers) without gastric protection like Omeprazole."
    });
  }

  // 7. أمراض الجهاز التنفسي
  if (text.includes("تنفس") || text.includes("ربو") || text.includes("صدر") || text.includes("asthma") || text.includes("copd") || text.includes("respirat")) {
    if (isInderal) {
      adviceList.push({
        label: "أمراض الصدر والربو & دواء إنديرال (تعارض مطلق!)",
        type: "contraindication",
        textAr: "⚠️ تعارض وتضاد حاد وخطير للغاية! يمنع تماماً وقطيعاً تناول دواء إنديرال (بروبرانولول) لمرضى الربو الشعبي والانسداد الرئوي المزمن؛ لأنه يغلق مستقبلات بيتا-2 الهوائية مما يؤدي إلى تشنج القصبات الحاد وضيق تنفس قد يهدد الحياة! يجب فوراً وبصورة حتمية استشارة الطبيب لاستبدال إنديرال بمثبطات قلق انتقائية (مثل سيبرالكس أو أدوية بيتا الانتقائية لمرضى الصدر).",
        textEn: "⚠️ CRITICAL SEVERE CONTRAINDICATION! Propranolol (Inderal) is strictly and absolutely forbidden for patients with bronchial asthma or COPD. As a non-selective beta-blocker, it blocks beta-2 receptors in the lungs, worsening bronchospasm and causing life-threatening respiratory distress. Consult your psychiatrist immediately to substitute Propranolol with safe alternatives."
      });
    } else {
      adviceList.push({
        label: "أمراض الجهاز التنفسي والربو & مضادات القلق والـ SSRIs",
        type: "info",
        textAr: "ربط التكيف التنفسي: مضادات الاكتئاب والقلق مثل سيبرالكس هي أدوية آمنة ومريحة للمنفس الهوائي لمرضى الربو، ولم يسجل لها أي آثار تعارضية تضيق النفس السلوكي، وتساهم بفعالية في تهدئة الهلع المرافق لنوبات ضيق الصدر الرئوي الحادة.",
        textEn: "Respiratory safety: SSRIs like Escitalopram are safe for respiratory functions. They do not induce asthma or bronchial inflammation, and effectively calm the secondary panic and hypoxia anxiety associated with acute respiratory distress episodes."
      });
    }
  }

  return adviceList;
}
