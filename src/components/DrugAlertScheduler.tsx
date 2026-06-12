import React, { useState, useEffect } from "react";
import { Pill, AlarmClock, Plus, Check, Trash, ShieldAlert, Sparkles, User, Info } from "lucide-react";
import { MedicationReminder } from "../types";

export function DrugAlertScheduler() {
  const [medications, setMedications] = useState<MedicationReminder[]>([
    {
      id: "m1",
      nameArabic: "سيبرالكس (مضاد اكتئاب وقلق)",
      nameEnglish: "Cipralex (Escitalopram)",
      dosage: "10 ملغ (نصف حبة)",
      frequency: "يومياً صباحاً",
      timesOfDay: ["09:00"],
      isActive: true,
      takenToday: []
    },
    {
      id: "m2",
      nameArabic: "إندرال (منظم تسارع خفقان القلب)",
      nameEnglish: "Inderal (Propranolol)",
      dosage: "10 ملغ",
      frequency: "عند الحشرة والقلق الشديد",
      timesOfDay: ["11:00", "21:00"],
      isActive: true,
      takenToday: ["11:00"]
    }
  ]);

  const [newNameAr, setNewNameAr] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newFrequency, setNewFrequency] = useState("Daily");
  const [newTimes, setNewTimes] = useState("09:00");

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<string | null>(null);
  const [customMsg, setCustomMsg] = useState<string | null>(null);
  const [suggestedMed, setSuggestedMed] = useState<any | null>(null);

  // 🔄 Load customized user medication dynamically on mount
  useEffect(() => {
    try {
      const loggedInKey = localStorage.getItem("sakeenah_logged_in_user");
      if (loggedInKey) {
        setCurrentUser(loggedInKey);
        const rawData = localStorage.getItem(`sakeenah_patient_${loggedInKey}`);
        if (rawData) {
          const data = JSON.parse(rawData);
          const name = data.demographics?.name || loggedInKey;
          
          if (data.finalReportResult) {
            const report = data.finalReportResult;
            setCurrentDiagnosis(report.testName || report.testId);
            setSuggestedMed(report.medicationPre || null);
            
            // Customize medications list according to diagnostic testId
            let customizedList: MedicationReminder[] = [];
            
            if (report.testId === "PHQ-9") {
              customizedList = [
                {
                  id: "cust-m1",
                  nameArabic: "فلوزاك (مضاد اكتئاب وتحسين دافع النشاط)",
                  nameEnglish: "Philozac (Fluoxetine)",
                  dosage: "20 ملغ (حبة واحدة)",
                  frequency: "يومياً صباحاً بعد الأكل",
                  timesOfDay: ["08:30"],
                  isActive: true,
                  takenToday: []
                },
                {
                  id: "cust-m2",
                  nameArabic: "تربتيزول (علاج الأرق وتثبيت النوم المفرط)",
                  nameEnglish: "Tryptizol (Amitriptyline)",
                  dosage: "10 ملغ (حبة واحدة)",
                  frequency: "يومياً قبل النوم بـ 30 دقيقة",
                  timesOfDay: ["22:30"],
                  isActive: true,
                  takenToday: []
                }
              ];
              setCustomMsg(`عناية: تم تخصيص قائمة الأدوية المقترحة لـ (${name}) لتناسب تشخيصك بـ [${report.severity}] على مقياس الاكتئاب السريري PHQ-9.`);
            } else if (report.testId === "GAD-7") {
              customizedList = [
                {
                  id: "cust-m1",
                  nameArabic: "سيبرالكس (مضاد قلق وتوتر معمم وموجات الهلع)",
                  nameEnglish: "Cipralex (Escitalopram)",
                  dosage: "10 ملغ (نصف حبة صباحاً)",
                  frequency: "يومياً صباحاً",
                  timesOfDay: ["09:00"],
                  isActive: true,
                  takenToday: []
                },
                {
                  id: "cust-m2",
                  nameArabic: "إندرال (التحكم في أعراض خفقان وتسارع ضربات القلب السلوكي)",
                  nameEnglish: "Inderal (Propranolol)",
                  dosage: "10 ملغ (حبة واحدة)",
                  frequency: "عند اللزوم النفسي والشعور بنوبة تسارع أو ضيق تنفس",
                  timesOfDay: ["11:00", "21:00"],
                  isActive: true,
                  takenToday: []
                }
              ];
              setCustomMsg(`عناية: تم تخصيص هذا الجدول الدوائي لـ (${name}) بمطابقة مباشرة مع تشخيص القلق والهلع [${report.severity}] المقاس سريرياً بمقياس GAD-7.`);
            } else if (report.testId === "PSS-10") {
              customizedList = [
                {
                  id: "cust-m1",
                  nameArabic: "بوسبار (انحلال وتخفيف وساوس الضغوط والتوتر وعصب الصدر)",
                  nameEnglish: "Buspar (Buspirone)",
                  dosage: "5 ملغ (حبة صباحاً وحبة مساءً)",
                  frequency: "مرتين بالعمر اليومي (صباحاً/مساءً)",
                  timesOfDay: ["08:00", "20:00"],
                  isActive: true,
                  takenToday: []
                },
                {
                  id: "cust-m2",
                  nameArabic: "إندرال (منظم تسارع ضربات القلب السلوكية)",
                  nameEnglish: "Inderal (Propranolol)",
                  dosage: "10 ملغ",
                  frequency: "عند اشتداد رغبة التوتر أو نوبات انقباض المعدة العصبي",
                  timesOfDay: ["13:00"],
                  isActive: true,
                  takenToday: []
                }
              ];
              setCustomMsg(`عناية: تم ضبط جرعاتك الموصى بها تلقائياً لـ (${name}) بما يتلاءم مع مؤشرات التوتر النفسي العصبي والمهني [${report.severity}] تحت معايير PSS-10.`);
            } else {
              // Default mixed/light customization
              customizedList = [
                {
                  id: "cust-m1",
                  nameArabic: "سيبرالكس (مضاد اكتئاب وقلق خفيف المتابعة)",
                  nameEnglish: "Cipralex (Escitalopram)",
                  dosage: "10 ملغ (نصف حبة)",
                  frequency: "يومياً صباحاً",
                  timesOfDay: ["09:00"],
                  isActive: true,
                  takenToday: []
                }
              ];
              setCustomMsg(`بروتوكول معياري: تم توفير جرعات افتراضية إرشادية لـ (${name}) بانتظار استكمال فحصك النفسي المعتمد بالكامل.`);
            }
            
            // Check if user has updated medication state in localStorage before
            const savedState = localStorage.getItem(`sakeenah_meds_${loggedInKey}`);
            if (savedState) {
              setMedications(JSON.parse(savedState));
            } else {
              setMedications(customizedList);
            }
          } else {
            setCustomMsg(`تنبيه للملف الطبي لـ (${name}): لم تقم بإنهاء المقياس النفسي والتشخيص النهائي بعد بالمرحلة الخمسة. يمكنك المتابعة وإرسال الشكوى وتطبيق الفحص لنقوم بتهيئة الأدوية المخصصة لحالتك بدقة.`);
          }
        }
      }
    } catch (e) {
      console.error("Error initializing medications check", e);
    }
  }, []);

  // 💾 Automatically save medications adjustments of current user to localStorage
  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(`sakeenah_meds_${currentUser}`, JSON.stringify(medications));
    } catch (e) {
      console.error("Error storing medications layout", e);
    }
  }, [medications, currentUser]);

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

    setMedications([...medications, newMed]);
    setNewNameAr("");
    setNewNameEn("");
    setNewDosage("");
    setNewTimes("09:00");
  };

  const handleDeleteMed = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  const toggleTakeDose = (medId: string, time: string) => {
    setMedications(
      medications.map((m) => {
        if (m.id === medId) {
          const alreadyTaken = m.takenToday.includes(time);
          const updatedTaken = alreadyTaken
            ? m.takenToday.filter((t) => t !== time)
            : [...m.takenToday, time];
          return { ...m, takenToday: updatedTaken };
        }
        return m;
      })
    );
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
                setMedications([...medications, newMed]);
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form to Add Medication */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4 max-w-full">
          <div>
            <h3 className="font-bold text-base text-slate-100">أضف علاجاً جديداً للجدول</h3>
            <p className="text-[10px] text-slate-400">ستضاف مواقيت الجرعات تلقائياً لخطة المتابعة اليومية.</p>
          </div>

          <form onSubmit={handleAddMedication} className="space-y-3.5 text-xs">
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
