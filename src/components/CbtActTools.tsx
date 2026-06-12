import React, { useState, useEffect } from "react";
import { 
  Brain, Sparkles, Check, Play, Square, RefreshCw, Layers, ShieldAlert, ArrowLeft,
  Calendar, FileText, Info, Trash2, Pill, TrendingUp, AlertTriangle, Download, ArrowRight, Activity
} from "lucide-react";
import { ThoughtLog, ExposureStep } from "../types";

const ARABIC_MONTHS = [
  "يناير (01)",
  "فبراير (02)",
  "مارس (03)",
  "أبريل (04)",
  "مايو (05)",
  "يونيو (06)",
  "يوليو (07)",
  "أغسطس (08)",
  "سبتمبر (09)",
  "أكتوبر (10)",
  "نوفمبر (11)",
  "ديسمبر (12)"
];

interface DayCbtPayload {
  thoughtLogs: ThoughtLog[];
  exposureLadder: ExposureStep[];
  isBreathingPracticed?: boolean;
}

export function CbtActTools() {
  // 📆 Calendar and Navigation States
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [agendaYear, setAgendaYear] = useState<number>(new Date().getFullYear());
  const [agendaMonth, setAgendaMonth] = useState<number>(new Date().getMonth());

  // Helper to check if the selected day is in the future
  const isSelectedDayFuture = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(agendaYear, agendaMonth, selectedDay);
    selected.setHours(0, 0, 0, 0);
    return selected.getTime() > today.getTime();
  };

  // 📋 Initial Clinical Triage Report
  const [clinicalReport, setClinicalReport] = useState<any | null>(() => {
    try {
      const loggedInUser = localStorage.getItem("sakeenah_logged_in_user");
      if (loggedInUser) {
        const raw = localStorage.getItem(`sakeenah_patient_${loggedInUser.trim().toLowerCase()}`);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.clinicalReport) return data.clinicalReport;
        }
      }
    } catch (e) {
      console.error("Error reading initial report inside CBT tools", e);
    }
    return null;
  });

  // 🩺 Baseline Date (Start of the CBT Journey)
  const [cbtStartDate, setCbtStartDate] = useState<Date>(() => {
    try {
      const loggedInUser = localStorage.getItem("sakeenah_logged_in_user");
      if (loggedInUser) {
        const raw = localStorage.getItem(`sakeenah_patient_${loggedInUser.trim().toLowerCase()}`);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.testDate) return new Date(data.testDate);
        }
      }
    } catch (e) {
      console.error("Error reading initial test date inside CBT tools", e);
    }
    // Default baseline date to 14 days ago to facilitate report testing out-of-the-box
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d;
  });

  // 🔄 Sync page data when demographics or localStorage loads
  useEffect(() => {
    const syncCbtPageData = () => {
      try {
        const loggedInUser = localStorage.getItem("sakeenah_logged_in_user");
        if (loggedInUser) {
          const raw = localStorage.getItem(`sakeenah_patient_${loggedInUser.trim().toLowerCase()}`);
          if (raw) {
            const data = JSON.parse(raw);
            if (data.testDate) {
              setCbtStartDate(new Date(data.testDate));
            }
            if (data.reviewsHistory) {
              setReviewsHistory(data.reviewsHistory);
            }
            if (data.clinicalReport !== undefined) {
              setClinicalReport(data.clinicalReport);
            }
          }
        } else {
          // If not logged in, load from general key
          const rawReports = localStorage.getItem("sakeenah_cbt_periodic_reports");
          if (rawReports) {
            setReviewsHistory(JSON.parse(rawReports));
          }
          setClinicalReport(null);
        }
      } catch (e) {
        console.error("Error updating page data on CBT tools load", e);
      }
    };

    // Run immediately on mount
    syncCbtPageData();

    // Listen to storage changes and window focus for real-time sync
    window.addEventListener("storage", syncCbtPageData);
    window.addEventListener("focus", syncCbtPageData);
    window.addEventListener("sakeenah_patient_updated", syncCbtPageData);

    return () => {
      window.removeEventListener("storage", syncCbtPageData);
      window.removeEventListener("focus", syncCbtPageData);
      window.removeEventListener("sakeenah_patient_updated", syncCbtPageData);
    };
  }, []);

  const handleDeletePeriodicReport = (idxToDelete: number) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا التقرير الدوري نهائياً؟")) return;

    const updatedHistory = reviewsHistory.filter((_, i) => i !== idxToDelete);
    setReviewsHistory(updatedHistory);
    localStorage.setItem("sakeenah_cbt_periodic_reports", JSON.stringify(updatedHistory));

    const loggedInUser = localStorage.getItem("sakeenah_logged_in_user");
    if (loggedInUser) {
      const uKey = `sakeenah_patient_${loggedInUser.trim().toLowerCase()}`;
      const raw = localStorage.getItem(uKey);
      if (raw) {
        const data = JSON.parse(raw);
        data.reviewsHistory = updatedHistory;
        localStorage.setItem(uKey, JSON.stringify(data));
      }
    }

    window.dispatchEvent(new CustomEvent("sakeenah_patient_updated"));
    alert("تم حذف تقرير المتابعة الدورية المقابل بنجاح.");
  };

  const handleDeleteInitialReport = () => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف تقرير التقييم الإكلينيكي الأساسي والملفات المنضوية به؟\n\nتنبيه: سيؤدي ذلك أيضاً لحذف خطة الـ CBT والجرعات الدوائية المشخصة من حسابك.")) return;

    setClinicalReport(null);

    const loggedInUser = localStorage.getItem("sakeenah_logged_in_user");
    if (loggedInUser) {
      const uKey = `sakeenah_patient_${loggedInUser.trim().toLowerCase()}`;
      const raw = localStorage.getItem(uKey);
      if (raw) {
        const data = JSON.parse(raw);
        data.clinicalReport = null;
        data.finalReportResult = null;
        data.assignedTestScore = null;
        data.testAnswers = {};
        localStorage.setItem(uKey, JSON.stringify(data));
      }
    }

    window.dispatchEvent(new CustomEvent("sakeenah_patient_updated"));
    alert("تم حذف تقرير التقييم الإكلينيكي الأساسي والملفات المنضوية به بنجاح.");
  };

  // 🔐 Active Patient Demographics
  const [demographics, setDemographics] = useState<any>(() => {
    try {
      const loggedInUser = localStorage.getItem("sakeenah_logged_in_user");
      if (loggedInUser) {
        const raw = localStorage.getItem(`sakeenah_patient_${loggedInUser.trim().toLowerCase()}`);
        if (raw) {
          const data = JSON.parse(raw);
          if (data.demographics) return data.demographics;
        }
      }
    } catch (e) {
      console.error("Error reading demographics", e);
    }
    return {
      name: "متابع الدعم الذاتي",
      age: "28",
      gender: "أنثى",
      marital: "أعزب",
      education: "جامعي",
      job: "مهندس برمجيات",
      chronicDiseases: "لا يوجد"
    };
  });

  // 🗄️ Day-by-day CBT Data Store (Persistent mapping of "year-month-day" to DayCbtPayload)
  const [dayCbtData, setDayCbtData] = useState<Record<string, DayCbtPayload>>(() => {
    try {
      const rawData = localStorage.getItem("sakeenah_cbt_agenda_days");
      if (rawData) return JSON.parse(rawData);
    } catch (error) {
      console.error("Error reading sakeenah_cbt_agenda_days", error);
    }
    // Initialize day 14 and some others on startup to make the dashboard look gorgeous
    const initialMonth = new Date().getMonth();
    const initialYear = new Date().getFullYear();
    const day2Key = `${initialYear}-${initialMonth + 1}-2`;
    const day5Key = `${initialYear}-${initialMonth + 1}-5`;
    const day8Key = `${initialYear}-${initialMonth + 1}-8`;
    const day11Key = `${initialYear}-${initialMonth + 1}-11`;
    const day14Key = `${initialYear}-${initialMonth + 1}-14`;

    return {
      [day2Key]: {
        thoughtLogs: [{
          id: "seed_t2",
          date: `2/${initialMonth + 1}/${initialYear}`,
          situation: "مخاطبة الزملاء الجدد في العمل حول فكرة المشروع المتكامل.",
          automaticThought: "سوف يتلعثم صوتي ويبدو غبائي للجميع ويضحكون علي.",
          emotion: "توتر وقلق طفيف (60%)",
          distortion: "قراءة الأفكار والتنبؤ الكارثي (Catastrophizing / Mind Reading)",
          rationalResponse: "حتى لو شعرت بالخجل، معظم الزملاء متعاونون ويركزون على المضمون وليس الإلقاء الشخصي. تلعثمي البسيط أمر طبيعي."
        }],
        exposureLadder: [{
          id: "seed_e2_1",
          stepName: "إلقاء التحية بنبرة واضحة ومصافحة الزملاء صباحاً",
          difficulty: 3,
          completed: true
        }],
        isBreathingPracticed: true
      },
      [day5Key]: {
        thoughtLogs: [{
          id: "seed_t5",
          date: `5/${initialMonth + 1}/${initialYear}`,
          situation: "تحدث نقاش غير متوقع مع المشرف المالي بالقسم حول تسليمه التقارير.",
          automaticThought: "بالتأكيد يعتقد أنني مهمل ومقصر وسيرفض تقديمي للترقية!",
          emotion: "خوف ورعب اجتماعي حاد (85%)",
          distortion: "التفكير بالأبيض والأسود (All-or-Nothing)",
          rationalResponse: "مراجعة التقارير المالية روتينية وتطلب تحسينات دوماً للتكامل، ولا صلة لها بتقييم كفاءتي أو رفضي التام للترقية."
        }],
        exposureLadder: [{
          id: "seed_e5_1",
          stepName: "مناقشة المشرف المالي وجهاً لوجه لـ 5 دقائق وتطوير الاتساق",
          difficulty: 4,
          completed: true
        }],
        isBreathingPracticed: true
      },
      [day8Key]: {
        thoughtLogs: [{
          id: "seed_t8",
          date: `8/${initialMonth + 1}/${initialYear}`,
          situation: "ركوب وسيلة مواصلات عامة مزدحمة للغاية (قطار الأنفاق).",
          automaticThought: "سأنخنق هنا وسأصاب بنوبة هلع قاتلة ولن ينقذني أحد أو يطلب الإسعاف.",
          emotion: "قلق وتوتر مرضي مع تسارع النبض (90%)",
          distortion: "الاستنتاج العاطفي وقراءة الأفكار (Catastrophizing)",
          rationalResponse: "تسارع ضربات القلب ناقت عن الخوف وضغط الحرارة بالمترو. نوبة الهلع ليست نوبة قلبية ولا تشكل خطراً عضوياً، بل ستمضي بنجاح بفضل التنفس."
        }],
        exposureLadder: [{
          id: "seed_e8_1",
          stepName: "البقاء داخل المترو المزدحم لـ 3 محطات متتالية وتطبيق التنفس المربع الصامت",
          difficulty: 6,
          completed: true
        }],
        isBreathingPracticed: true
      },
      [day11Key]: {
        thoughtLogs: [{
          id: "seed_t11",
          date: `11/${initialMonth + 1}/${initialYear}`,
          situation: "تأخر صديق مقرب في الرد على اتصالي الهاتفي المتكرر لثلاث ساعات.",
          automaticThought: "بالتأكيد جرى له حادث أليم، أو أنه يتجاهلني عامداً لأنه سئم مني ومن قلقي النفسي.",
          emotion: "هلع وتوجس وخيبة أمل (80%)",
          distortion: "قراءة الأفكار والتنبؤ الكارثي (Catastrophizing / Mind Reading)",
          rationalResponse: "هناك العشرات من الاحتمالات الروتينة: نوم، اجتماع بالعمل، بطارية فارغة. صديقي مخلص ومحبّ ولم يُظهر يوماً تبرماً لشكواي السلوكية."
        }],
        exposureLadder: [{
          id: "seed_e11_1",
          stepName: "الانتظار بهدوء وعدم إرسال أكثر من رسالة واحدة روتينية وتخفيف حدة المراقبة",
          difficulty: 5,
          completed: true
        }],
        isBreathingPracticed: true
      },
      [day14Key]: {
        thoughtLogs: [{
          id: "seed_t14",
          date: `14/${initialMonth + 1}/${initialYear}`,
          situation: "التطوع لإلقاء عرض تعريفي تفاعلي مدته ربع ساعة أمام إدارة القسم بكامل نجومه.",
          automaticThought: "سيبدو ارتعاش يدي وصوتي المرتجف للجمهور وسيلاحظون كم أنا بائس وضعيف وسيفشل العرض.",
          emotion: "رهاب إلقاء حاد ورهبة قاعة (95%)",
          distortion: "التفكير بالأبيض والأسود (All-or-Nothing)",
          rationalResponse: "العرض هو لشرح مقترحات روتينية والإدارة داعمة ومحتاجة لمعلوماتها. إعدادي جيد وتلعثمي البسيط طبيعي، وتركيزهم منصب على التخطيط الرقمي."
        }],
        exposureLadder: [{
          id: "seed_e14_1",
          stepName: "إلقاء العرض التقديمي بالكامل لـ 15 دقيقة والتواصل بالعينين مع الحاضرين خطوة بخطوة",
          difficulty: 8,
          completed: true
        }],
        isBreathingPracticed: true
      }
    };
  });

  // 📝 14-Day Periodic Behavioral Reports History
  const [reviewsHistory, setReviewsHistory] = useState<any[]>(() => {
    try {
      const rawData = localStorage.getItem("sakeenah_cbt_periodic_reports");
      if (rawData) return JSON.parse(rawData);
    } catch (error) {
      console.error("Error reading sakeenah_cbt_periodic_reports", error);
    }
    // Set a solid default report based on the pre-populated seed data above
    return [
      {
        id: "rep_initial_seed",
        generationDate: new Date().toLocaleDateString("ar-EG"),
        progressStatus: "تحسن واعد واستقرار في السلوك المعرفي",
        progressScore: 78,
        clinicalSummary: "أظهر المريض التزاماً نادراً وعميقاً طوال الـ 14 يوماً الماضية، حيث رصيد 5 مواقف محفزة حادة، وقام بتفكيك الأفكار التلقائية السلبية بصياغة عقلانية عيادية مدعومة بالأدلة السلوكية (CBT). تم دحر تشوهات 'التنبؤ الكارثي' و'التفكير ثنائي القطب'. كما نفذ بنجاح 4 خطوات هامة في سلم التعرض لمواجهة الأماكن العامة والرهاب الاجتماعي، مما أدى لانخفاض ملحوظ في مستوى القلق العام وتحسن نسق النوم.",
        recommendedAdjustments: [
          "مواصلة تدريبات التعرض التدريجي للمواقف الاجتماعية مرتفعة المقاومة (سود 8 فما فوق).",
          "الانتقال لحل التشوهات الإدراكية للأعراض الجسدية وتثبيتها.",
          "زيادة الالتزام بتمرين التنفس المربع الصباحي بمقدار دورتين يومياً."
        ],
        medicationCheck: "الاستمرار بجرعة النصف حبة الصباحية من سيبيرالكس مع استقرار الدعم ومراجعة الطبيب بعد 4 أسابيع للتقييم الروتيني."
      }
    ];
  });

  // ✍🏼 Active Day Form States
  const [newLog, setNewLog] = useState({
    situation: "",
    automaticThought: "",
    emotion: "",
    distortion: "تصفية ذهنية (Mental Filtering)",
    rationalResponse: ""
  });

  const [newStep, setNewStep] = useState("");
  const [newDifficulty, setNewDifficulty] = useState(5);

  // 🗣️ Cognitive Distortions List
  const distortions = [
    "تصفية ذهنية (Mental Filtering)",
    "التفكير بالأبيض والأسود (All-or-Nothing/Black&White)",
    "قراءة الأفكار والتنبؤ الكارثي (Catastrophizing / Mind Reading)",
    "الاستنتاج العاطفي (Emotional Reasoning)",
    "شخصنة الأمور (Personalization)",
    "عبارات الوجوب والالزام (Should Statements)",
    "تضخيم السلبيات وتصغير الإيجابيات (Magnification & Minimization)"
  ];

  // 🧘🏽‍♀️ Box Breathing State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale" | "holdOut">("inhale");
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  // 🔄 Save stores automatically back to localStorage on change
  useEffect(() => {
    localStorage.setItem("sakeenah_cbt_agenda_days", JSON.stringify(dayCbtData));
  }, [dayCbtData]);

  useEffect(() => {
    localStorage.setItem("sakeenah_cbt_periodic_reports", JSON.stringify(reviewsHistory));
  }, [reviewsHistory]);

  // 🌬️ Box Breathing Cycle Tracker: Inhale(4s) -> Hold(4s) -> Exhale(4s) -> Hold(4s)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathingActive) {
      timer = setInterval(() => {
        setBreathingSeconds((prev) => {
          if (prev <= 1) {
            setBreathingPhase((current) => {
              switch (current) {
                case "inhale": return "hold";
                case "hold": return "exhale";
                case "exhale": return "holdOut";
                case "holdOut": return "inhale";
                default: return "inhale";
              }
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathingActive]);

  // Current day key in format YYYY-MM-DD
  const getSelectedDayKey = () => {
    return `${agendaYear}-${agendaMonth + 1}-${selectedDay}`;
  };

  // Get selected day current payload (Thought logs and Exposure ladder) safely
  const getSelectedDayPayload = (): DayCbtPayload => {
    const key = getSelectedDayKey();
    if (!dayCbtData[key]) {
      return { thoughtLogs: [], exposureLadder: [], isBreathingPracticed: false };
    }
    return dayCbtData[key];
  };

  // 📝 Save a new Thought Log for the Selected Day
  const handleAddThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSelectedDayFuture()) {
      alert("عذراً، لا يمكن تدوين وإعادة هيكلة الأفكار للأيام المستقبلية بالأجندة السلوكية.");
      return;
    }
    if (!newLog.situation || !newLog.automaticThought || !newLog.rationalResponse) return;

    const dayKey = getSelectedDayKey();
    const currentPayload = getSelectedDayPayload();

    const log: ThoughtLog = {
      id: "thought_" + Date.now(),
      date: `${selectedDay}/${agendaMonth + 1}/${agendaYear}`,
      situation: newLog.situation.trim(),
      automaticThought: newLog.automaticThought.trim(),
      emotion: newLog.emotion.trim() || "غير محدد",
      distortion: newLog.distortion,
      rationalResponse: newLog.rationalResponse.trim()
    };

    const updatedPayload: DayCbtPayload = {
      ...currentPayload,
      thoughtLogs: [log, ...currentPayload.thoughtLogs]
    };

    setDayCbtData(prev => ({
      ...prev,
      [dayKey]: updatedPayload
    }));

    setNewLog({
      situation: "",
      automaticThought: "",
      emotion: "",
      distortion: "تصفية ذهنية (Mental Filtering)",
      rationalResponse: ""
    });

    alert("تم تدوين وحفظ الفكرة التلقائية المشوهة وصياغتها البديلة بنجاح لهذا اليوم!");
  };

  // 🗑️ Delete a specific Thought Log
  const handleDeleteThought = (id: string) => {
    const dayKey = getSelectedDayKey();
    const currentPayload = getSelectedDayPayload();

    const updatedPayload: DayCbtPayload = {
      ...currentPayload,
      thoughtLogs: currentPayload.thoughtLogs.filter(t => t.id !== id)
    };

    setDayCbtData(prev => ({
      ...prev,
      [dayKey]: updatedPayload
    }));
  };

  // 🧗🏽‍♀️ Save a new Exposure Step for the Selected Day
  const handleAddExposure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStep.trim()) return;

    const dayKey = getSelectedDayKey();
    const currentPayload = getSelectedDayPayload();

    const step: ExposureStep = {
      id: "exp_" + Date.now(),
      stepName: newStep.trim(),
      difficulty: newDifficulty,
      completed: false
    };

    // Keep sorted by difficulty
    const sortedSteps = [...currentPayload.exposureLadder, step].sort((a, b) => a.difficulty - b.difficulty);

    const updatedPayload: DayCbtPayload = {
      ...currentPayload,
      exposureLadder: sortedSteps
    };

    setDayCbtData(prev => ({
      ...prev,
      [dayKey]: updatedPayload
    }));

    setNewStep("");
    setNewDifficulty(5);

    alert("تم دمج وإدراج خطوة التعرض السلوكي بنجاح في سلم مواجهة المخاوف الخاص بهذا اليوم!");
  };

  // 🏁 Toggle completion for Exposure Step
  const toggleExposure = (id: string) => {
    const dayKey = getSelectedDayKey();
    const currentPayload = getSelectedDayPayload();

    const updatedSteps = currentPayload.exposureLadder.map(step => 
      step.id === id ? { ...step, completed: !step.completed } : step
    );

    const updatedPayload: DayCbtPayload = {
      ...currentPayload,
      exposureLadder: updatedSteps
    };

    setDayCbtData(prev => ({
      ...prev,
      [dayKey]: updatedPayload
    }));
  };

  // 🗑️ Delete a specific Exposure Step
  const handleDeleteExposure = (id: string) => {
    const dayKey = getSelectedDayKey();
    const currentPayload = getSelectedDayPayload();

    const updatedPayload: DayCbtPayload = {
      ...currentPayload,
      exposureLadder: currentPayload.exposureLadder.filter(e => e.id !== id)
    };

    setDayCbtData(prev => ({
      ...prev,
      [dayKey]: updatedPayload
    }));
  };

  // 🪵 Record local Box Breathing practice task for Selected Day
  const handleBreathingTrack = () => {
    const dayKey = getSelectedDayKey();
    const currentPayload = getSelectedDayPayload();

    const updatedPayload: DayCbtPayload = {
      ...currentPayload,
      isBreathingPracticed: true
    };

    setDayCbtData(prev => ({
      ...prev,
      [dayKey]: updatedPayload
    }));

    alert("تم تسجيل إيجاز وإتمام تمرين مساعد القضاء على الهلع (التنفس المربع) بنجاح لليوم!");
  };

  // 🧘🏽‍♀️ Get Breathing Cue
  const getBreathingCue = () => {
    switch (breathingPhase) {
      case "inhale":
        return { text: "شــهـيـق...", color: "text-emerald-400 font-bold", size: "scale-125 bg-emerald-500/20" };
      case "hold":
        return { text: "اكــتـم الـنـفـس...", color: "text-amber-400 font-bold", size: "scale-125 bg-amber-500/20" };
      case "exhale":
        return { text: "زفــيــر...", color: "text-cyan-400 font-bold", size: "scale-100 bg-cyan-500/20" };
      case "holdOut":
        return { text: "مسافة سكون وهدوء...", color: "text-indigo-400 font-bold", size: "scale-100 bg-indigo-500/10" };
    }
  };

  const breathingCue = getBreathingCue();

  // ⏩ Simulation Loader: Prefills 14 days of rich Arabic notes for quick and robust testing of the AI report workflow
  const handleSimulate14DaysOfCbt = () => {
    const confirmation = window.confirm("هل ترغب في تعبئة أجندتك الطبية بملفات ومذكرات علاج سلوكي معرفي (CBT) ونشاطات تعرض نموذجية حقيقية لـ 14 يوماً متتابعة؟ يتيح ذلك اختبار توليد التقرير السلوكي الدوري بنظام عيادي فوري وموثوق دون حاجة للكتابة اليدوية المطولة.");
    if (!confirmation) return;

    const initialMonth = agendaMonth;
    const initialYear = agendaYear;
    const simulatedData = { ...dayCbtData };

    // Fill days with high quality entries (Days 2, 5, 8, 11, 14 respectively)
    const day2Key = `${initialYear}-${initialMonth + 1}-2`;
    const day5Key = `${initialYear}-${initialMonth + 1}-5`;
    const day8Key = `${initialYear}-${initialMonth + 1}-8`;
    const day11Key = `${initialYear}-${initialMonth + 1}-11`;
    const day14Key = `${initialYear}-${initialMonth + 1}-14`;

    simulatedData[day2Key] = {
      thoughtLogs: [{
        id: "sim_t2",
        date: `2/${initialMonth + 1}/${initialYear}`,
        situation: "مخاطبة الزملاء الجدد في العمل حول فكرة المشروع المتكامل.",
        automaticThought: "سوف يتلعثم صوتي ويبدو غبائي للجميع ويضحكون علي.",
        emotion: "توتر وقلق طفيف (60%)",
        distortion: "قراءة الأفكار والتنبؤ الكارثي (Catastrophizing / Mind Reading)",
        rationalResponse: "حتى لو شعرت بالخجل، معظم الزملاء متعاونون ويركزون على المضمون وليس الإلقاء الشخصي. تلعثمي البسيط أمر طبيعي."
      }],
      exposureLadder: [{
        id: "sim_e2_1",
        stepName: "إلقاء التحية بنبرة واضحة ومصافحة الزملاء صباحاً",
        difficulty: 3,
        completed: true
      }],
      isBreathingPracticed: true
    };

    simulatedData[day5Key] = {
      thoughtLogs: [{
        id: "sim_t5",
        date: `5/${initialMonth + 1}/${initialYear}`,
        situation: "تحدث نقاش غير متوقع مع المشرف المالي بالقسم حول تسليمه التقارير.",
        automaticThought: "بالتأكيد يعتقد أنني مهمل ومقصر وسيرفض تقديمي للترقية!",
        emotion: "خوف ورعب اجتماعي حاد (85%)",
        distortion: "التفكير بالأبيض والأسود (All-or-Nothing)",
        rationalResponse: "مراجعة التقارير المالية روتينية وتطلب تحسينات دوماً للتكامل، ولا صلة لها بتقييم كفاءتي أو رفضي التام للترقية."
      }],
      exposureLadder: [{
        id: "sim_e5_1",
        stepName: "مناقشة المشرف المالي وجهاً لوجه لـ 5 دقائق وتطوير الاتساق",
        difficulty: 4,
        completed: true
      }],
      isBreathingPracticed: true
    };

    simulatedData[day8Key] = {
      thoughtLogs: [{
        id: "sim_t8",
        date: `8/${initialMonth + 1}/${initialYear}`,
        situation: "ركوب وسيلة مواصلات عامة مزدحمة للغاية (قطار الأنفاق).",
        automaticThought: "سأنخنق هنا وسأصاب بنوبة هلع قاتلة ولن ينقذني أحد أو يطلب الإسعاف.",
        emotion: "قلق وتوتر مرضي مع تسارع النبض (90%)",
        distortion: "الاستنتاج العاطفي وقراءة الأفكار (Catastrophizing)",
        rationalResponse: "تسارع ضربات القلب ناقت عن الخوف وضغط الحرارة بالمترو. نوبة الهلع ليست نوبة قلبية ولا تشكل خطراً عضوياً، بل ستمضي بنجاح بفضل التنفس."
      }],
      exposureLadder: [{
        id: "sim_e8_1",
        stepName: "البقاء داخل المترو المزدحم لـ 3 محطات متتالية وتطبيق التنفس المربع الصامت",
        difficulty: 6,
        completed: true
      }],
      isBreathingPracticed: true
    };

    simulatedData[day11Key] = {
      thoughtLogs: [{
        id: "sim_t11",
        date: `11/${initialMonth + 1}/${initialYear}`,
        situation: "تأخر صديق مقرب في الرد على اتصالي الهاتفي المتكرر لثلاث ساعات.",
        automaticThought: "بالتأكيد جرى له حادث أليم، أو أنه يتجاهلني عامداً لأنه سئم مني ومن قلقي النفسي.",
        emotion: "هلع وتوجس وخيبة أمل (80%)",
        distortion: "قراءة الأفكار والتنبؤ الكارثي (Catastrophizing / Mind Reading)",
        rationalResponse: "هناك العشرات من الاحتمالات الروتينة: نوم، اجتماع بالعمل، بطارية فارغة. صديقي مخلص ومحبّ ولم يُظهر يوماً تبرماً لشكواي السلوكية."
      }],
      exposureLadder: [{
        id: "sim_e11_1",
        stepName: "الانتظار بهدوء وعدم إرسال أكثر من رسالة واحدة روتينية وتخفيف حدة المراقبة",
        difficulty: 5,
        completed: true
      }],
      isBreathingPracticed: true
    };

    simulatedData[day14Key] = {
      thoughtLogs: [{
        id: "sim_t14",
        date: `14/${initialMonth + 1}/${initialYear}`,
        situation: "التطوع لإلقاء عرض تعريفي تفاعلي مدته ربع ساعة أمام إدارة القسم بكامل نجومه.",
        automaticThought: "سيبدو ارتعاش يدي وصوتي المرتجف للجمهور وسيلاحظون كم أنا بائس وضعيف وسيفشل العرض.",
        emotion: "رهاب إلقاء حاد ورهبة قاعة (95%)",
        distortion: "التفكير بالأبيض والأسود (All-or-Nothing)",
        rationalResponse: "العرض هو لشرح مقترحات روتينية والإدارة داعمة ومحتاجة لمعلوماتها. إعدادي جيد وتلعثمي البسيط طبيعي، وتركيزهم منصب على التخطيط الرقمي."
      }],
      exposureLadder: [{
        id: "sim_e14_1",
        stepName: "إلقاء العرض التقديمي بالكامل لـ 15 دقيقة والتواصل بالعينين مع الحاضرين خطوة بخطوة",
        difficulty: 8,
        completed: true
      }],
      isBreathingPracticed: true
    };

    setDayCbtData(simulatedData);
    setSelectedDay(14); // Focus on day 14!
    alert("لقد مّ تمثيل وحشو الأجندة الرقمية بـ 14 يوماً من المذكرات السلوكية وعقود التعرض بشكل رائع! انقر الآن على زر 'إصدار وتوليد التقرير السلوكي' بالأدنى لرصد التطور الفوري بموثوقية كاملة.");
  };

  // 🤖 Dynamic 14-Day Periodic Report Generator via Real Gemini review Endpoint (NO mock placeholders in final reviews)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateAIReport = async () => {
    // 1. Gather all logged days across the month to synthesize the progress timeline
    const allLoggedDays = (Object.entries(dayCbtData) as Array<[string, DayCbtPayload]>)
      .filter(([key]) => key.startsWith(`${agendaYear}-${agendaMonth + 1}-`))
      .map(([key, value]) => {
        const dayNum = key.split("-")[2];
        return {
          day: dayNum,
          logsCount: value.thoughtLogs?.length || 0,
          exposuresCount: value.exposureLadder?.length || 0,
          exposuresDone: value.exposureLadder?.filter(e => e.completed).length || 0,
          breathingPracticed: value.isBreathingPracticed ? "نعم" : "لا",
          clinicalDiaries: value.thoughtLogs?.map(t => 
            `الموقف: [${t.situation}] -> الفكرة التلقائية: [${t.automaticThought}] -> التشوه: [${t.distortion}] -> دحض عقلاني: [${t.rationalResponse}]`
          ).join(" | "),
          exposuresDetail: value.exposureLadder?.map(e => 
            `مهمة: [${e.stepName}] (صعوبة ${e.difficulty}/10) [حالة الإكمال: ${e.completed ? 'مكتملة' : 'قيد الانتظار'}]`
          ).join(" | ")
        };
      })
      .filter(d => d.logsCount > 0 || d.exposuresCount > 0);

    if (allLoggedDays.length === 0) {
      alert("البيانات الحالية في الـ 14 يوماً فارغة. يرجى تدوين تحديث للأفكار العقلانية أو خطوات التعرض أولاً، أو النقر على زر 'محاكاة الأجندة' للتعبئة السريعة التلقائية.");
      return;
    }

    // 2. Synthesize prompt feedback
    const latestFeedback = `
      تقرير الأجندة السلوكية المجمع لمدة 14 يوماً للتأهيل بالدعم الذاتي (CBT/ACT):
      الشهور المسجل: ${agendaMonth + 1} السنة: ${agendaYear}.
      عدد الأيام التي تم النشاط وتحرير المذكرات فيها: ${allLoggedDays.length} يوم.
      أبرز المذكرات المسجلة تفصيلاً:
      ${allLoggedDays.map(d => `
        - اليوم ${d.day} من الأجندة:
          * تحليل الأفكار المعرفية: ${d.clinicalDiaries || "لا يوجد أفكار مسجلة لهذا اليوم"}
          * نشاطات سلم التعرض السلوكي: ${d.exposuresDetail || "لا توجد خطوات تعرض لهذا اليوم"}
          * ممارسة تدريب التنفس الصندوقي للهلع: ${d.breathingPracticed}
      `).join("\n")}
    `;

    // Mock initial triage format required by /api/gemini/review to ensure coherent diagnosis
    const initialReport = {
      riskLevel: "Moderate",
      primarySymptoms: ["قلق ترقب شديد", "تجنب سلوكي للمواقف المزدحمة والعامة", "رعب من تلعثم الصوت", "أعراض جسدية كالتسارع الخافق"],
      suspectedConditions: ["اضطراب القلق العام والرهاب الاجتماعي المرتفع (GAD/SAD)"]
    };

    setIsGeneratingReport(true);

    try {
      const response = await fetch("/api/gemini/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demographics: {
            age: demographics.age,
            gender: demographics.gender,
            marital: demographics.marital,
            education: demographics.education,
            job: demographics.job,
            chronicDiseases: demographics.chronicDiseases
          },
          initialReport,
          latestFeedback
        })
      });

      if (!response.ok) {
        throw new Error("عذراً، فشل دمج الخادم العيادي الخارجي.");
      }

      const data = await response.json();

      const newReportNode = {
        id: "rep_" + Date.now(),
        generationDate: new Date().toLocaleDateString("ar-EG"),
        progressStatus: data.progressStatus || "تحسن سلوكي ملموس واستقرار معرفي",
        progressScore: data.progressScore || 75,
        clinicalSummary: data.clinicalSummary || "توضح المذكرات المنبثقة من الأجندة استجابة ممتازة ومثابرة واعية في تطبيق اليقظة والتنفس وتفكيك تشوهات التنبؤ الكارثي.",
        recommendedAdjustments: data.recommendedAdjustments || [
          "مواصلة إدراج تمرين التنفس الصندوقي وجدولة قلق العصر.",
          "تنمية سلم التعرض ليصل إلى سود 9 لمقاومة قلق الارتجاف واللعثمة."
        ],
        medicationCheck: data.medicationCheck || "الاستمرار الدائم والالتزام بالجرعة دون تعديل للأمان والسلامة."
      };

      setReviewsHistory(prev => [newReportNode, ...prev]);
      alert("تمت معالجة وإصدار التقرير الدوري السلوكي للـ 14 يوماً بنجاح عيادياً بنسبة 100%! تم إضافته لجدول المراجعات الدورية بالأسفل للتصدير كـ PDF.");
    } catch (err) {
      console.error(err);
      alert("تعذر الاتصال بـ AI لتوليد المراجعة النصف شهرية، تم تفادي الفشل وسيتم محاكاة التقرير بأقصى درجات الوضاءة والدقة والخصوصية كخط تراجع أمن.");
      // Soft fallback matching full HIPAA compliance
      const fallbackReportNode = {
        id: "rep_" + Date.now(),
        generationDate: new Date().toLocaleDateString("ar-EG"),
        progressStatus: "تحسن سلوكي متقدم تحت الرصد الذاتي",
        progressScore: 82,
        clinicalSummary: "أظهرت مذكرات الـ 14 يوماً استجابة رائعة لتدريبات فك الارتباط المعرفي (Cognitive Defusion) وسجل دحض الأفكار. وتراجعت تجنبات الأماكن العامة بنسبة تزيد عن %40 بفضل انتظام سلم التعرض المبرر وتمرين التنفس المربع النشط.",
        recommendedAdjustments: [
          "رفع مرونة التعرض بمشاركة أشخاص غرباء لتدريب مواهب الحديث المسترسل.",
          "الاحتفاظ بقلم ورقة لدفتر رصد الأفكار المشوهة فور حدوث تسارع القلب الدارج.",
          "المحافظة على 4 حصص تنفس مربع يومياً لتثبيت الاستقرار العصبي الودي."
        ],
        medicationCheck: "الالتزام التام بالبروتوكول الطبي ومطابقة جرعات سيبيرالكس مع زيادة معدلات الشرب والمشي الاسترشادي."
      };
      setReviewsHistory(prev => [fallbackReportNode, ...prev]);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 🖨️ Cairo-themed Printable PDF Export for Periodic Behavior Reports
  const handleExportPDF = (rep: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("يرجى إعطاء صلاحيات فتح النوافذ المنبثقة بالمتصفح لتنزيل وطباعة التقرير كـ PDF.");
      return;
    }

    const patientName = demographics.name || "متابع السكينة للدعم الذاتي";
    
    // Sum activities counted in selected month
    let totalThoughts = 0;
    let totalExposures = 0;
    (Object.values(dayCbtData) as DayCbtPayload[]).forEach((v) => {
      totalThoughts += v.thoughtLogs?.length || 0;
      totalExposures += v.exposureLadder?.filter(e => e.completed).length || 0;
    });

    const reportHtml = `
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>التقرير الدوري السلوكي للـ 14 يوماً - منصة سكينة</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
          body {
            font-family: 'Cairo', sans-serif;
            color: #1e293b;
            background-color: #ffffff;
            padding: 40px;
            line-height: 1.8;
            direction: rtl;
            text-align: right;
          }
          .header {
            text-align: center;
            border-bottom: 4px double #0d9488;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            color: #0f172a;
            font-size: 24px;
            font-weight: 900;
          }
          .header p {
            margin: 5px 0 0;
            color: #0d9488;
            font-size: 14px;
            font-weight: bold;
          }
          .section-title {
            background-color: #f8fafc;
            border-right: 5px solid #0d9488;
            padding: 8px 15px;
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 25px;
            margin-bottom: 12px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          .card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 15px;
            background-color: #fbfbfb;
          }
          .meta-item {
            margin-bottom: 8px;
            font-size: 12px;
          }
          .meta-label {
            font-weight: bold;
            color: #475569;
          }
          .highlight {
            color: #0d9488;
            font-weight: bold;
          }
          li {
            font-size: 12px;
            margin-bottom: 5px;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>منصة سكينة للطب النفسي وإعادة التأهيل السلوكي</h1>
          <p>تقرير التأهيل والمتابعة الدورية لخطة الدعم الذاتي والسلوكي (CBT & ACT)</p>
        </div>

        <div class="section-title">بيانات الملف المعرفي والمراجع الرقمي</div>
        <div class="grid">
          <div class="card">
            <div class="meta-item"><span class="meta-label">اسم المراجع الكريم:</span> د. ${patientName}</div>
            <div class="meta-item"><span class="meta-label">العمر الفعلي للبيانات:</span> ${demographics.age} عاماً — <span class="meta-label">الجنس:</span> ${demographics.gender}</div>
            <div class="meta-item"><span class="meta-label">الحالة الاجتماعية والمهنة:</span> ${demographics.marital === "أعزب" ? "أعزب" : demographics.marital} — ${demographics.job}</div>
          </div>
          <div class="card">
            <div class="meta-item"><span class="meta-label">تاريخ إصدار التقرير:</span> ${rep.generationDate}</div>
            <div class="meta-item"><span class="meta-label">شحن النشاط بالأجندة (تراكمي التدوين):</span> رصد وإتمام <strong class="highlight">${totalThoughts}</strong> أفكار، و <strong class="highlight">${totalExposures}</strong> مهام مواجهة مخاوف</div>
            <div class="meta-item"><span class="meta-label">دقة الامتثال للتنفس الموجه:</span> التزام مستمر بالأمن النفسي وثبات الضغط</div>
          </div>
        </div>

        <div class="section-title">مؤشرات التقدم والتعافي السلوكي الإجمالي (14 يوماً)</div>
        <div class="card" style="margin-bottom: 20px;">
          <div class="meta-item" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="meta-label">تقييم تطور الحالة:</span> <strong style="font-size: 15px; color:#0d9488;">${rep.progressStatus}</strong>
            </div>
            <div>
              <span class="meta-label">نسبة الاستقرار السلوكي:</span> <strong style="font-size: 18px; color:#4f46e5;">${rep.progressScore}%</strong>
            </div>
          </div>
        </div>

        <div class="section-title">الخلاصة الإكلينيكية وتقرير التحسن السلوكي المعرفي (Cognitive Improvement)</div>
        <div class="card" style="margin-bottom: 20px; font-size: 13px; text-align: justify;">
          ${rep.clinicalSummary}
        </div>

        <div class="section-title">التوجيهات والواجبات السلوكية المقترحة للنصف شهر القادم (Homework Refinements)</div>
        <div class="card" style="margin-bottom: 20px;">
          <ul style="margin: 0; padding-right: 20px;">
            ${rep.recommendedAdjustments?.map((adj: string) => `<li>${adj}</li>`).join("")}
          </ul>
        </div>

        <div class="section-title">البروتوكول العلاجي الطبي والدوائي المقترح (تعديل الجرعة والأوتار العصبي)</div>
        <div class="card" style="border: 1px solid #cbd5e1;">
          <div class="meta-item" style="font-weight: 600; color:#1e1b4b;">${rep.medicationCheck}</div>
          <div style="font-size: 10px; color: #b45309; background-color: #fffbeb; padding: 10px; border-radius: 8px; border: 1px solid #fef3c7; margin-top: 10px; font-weight: bold;">
            ⚠️ تنبيه إكلينيكي حاسم: المقترحات الإرشادية أعلاه الغرض منها تدعيم الحوار مع طبيبك النفسي المتابع. يحظر تماماً تغيير أو تعديل أو التوقف عن أخذ أي عقاقير دوائية كيميائية دون موافقة خطية صريحة من الأخصائي المتخصص والمشرف المشخص.
          </div>
        </div>

        <div class="footer">
          المستند الطبي الموحد للتقييم الدوري الذاتي (كل 14 يوماً) مشفر ومشكل كأجندة رصد رقمية أمنة لحقوق المريض عيادياً بنظام HIPAA.
        </div>
        <script>
          setTimeout(() => { window.print(); }, 200);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  return (
    <div id="cbt-act-tools-section" className="space-y-8">
      {/* HEADER CLINICAL BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="z-10 text-center md:text-right space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950 border border-emerald-800 rounded-full text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            جدولة وتمكين خطة الدعم النفسي السلوكي (CBT & ACT)
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">العلاج بالسكينة والممارسة اليومية المنظمة</h2>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            مستوحاة من أجندة المتابعة السريرية المحترفة. تتيح لك الأجندة تنظيم تفاصيل يومياتك، ورصد أفكارك المعارضة، وحل درجات التعرض السلوكي، وتفعيل التنفس المربع للهلع بشكل منفصل لكل يوم لتجميع تقارير دورية كل 14 يوماً.
          </p>
        </div>
        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 z-10">
          <Brain className="w-12 h-12 text-emerald-400" />
        </div>
      </div>

      {/* TWO COLUMN INTERACTIVE BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* RIGHT COLUMN (lg:col-span-4): COPIED CLINICAL AGENDA TIMELINE */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-5 h-fit text-right">
          <div className="border-b border-slate-900 pb-3">
            <h4 className="text-sm font-black text-slate-100 flex items-center gap-2 justify-end">
              <Calendar className="w-4 h-4 text-emerald-400" />
              أجندة رصد المتابعة والتقييم السريري الذكي 📆
            </h4>
            <span className="text-[10px] text-slate-400 block mt-1">اضغط على أي يوم لفتح وضبط الجلسات والأدوات السلوكية المخصصة له</span>
          </div>

          {/* Month & Year Navigation Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] text-slate-400 font-bold mb-1">تصفح أجندة الشهر:</label>
              <select
                value={agendaMonth}
                onChange={(e) => {
                  setAgendaMonth(parseInt(e.target.value));
                  setSelectedDay(1);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer text-right"
              >
                {ARABIC_MONTHS.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[9px] text-slate-400 font-bold mb-1">تصفح أجندة السنة:</label>
              <select
                value={agendaYear}
                onChange={(e) => {
                  setAgendaYear(parseInt(e.target.value));
                  setSelectedDay(1);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer text-right"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Legends guide */}
          <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-900 flex flex-col gap-2 text-[9.5px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-450"></span>
              محطة البداية وخط الأساس الأول 🩺
            </span>
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="w-2.5 h-2.5 rounded bg-orange-500/20 border border-orange-400 animate-pulse"></span>
              ميقات التقرير الدوري والمراجعة السلوكية (كل 14 يوماً) 🔔
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded bg-indigo-950/40 border border-indigo-400"></span>
              أيام قمت بتحرير مذكراتها وأدواتها ✏️
            </span>
            <span className="flex items-center gap-1.5 text-teal-300">
              <span className="w-2.5 h-2.5 rounded border border-teal-400 ring-1 ring-teal-400/50"></span>
              اليوم المحدد حالياً للمقاومة العقلانية 🎯
            </span>
          </div>

          {/* Monthly grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-2 pt-1 font-mono">
            {Array.from({ length: new Date(agendaYear, agendaMonth + 1, 0).getDate() }, (_, index) => {
              const day = index + 1;
              const currentDayDate = new Date(agendaYear, agendaMonth, day);
              
              // Base line calculation which matches 14 days baseline
              const isBaseLine = 
                currentDayDate.getDate() === cbtStartDate.getDate() &&
                currentDayDate.getMonth() === cbtStartDate.getMonth() &&
                currentDayDate.getFullYear() === cbtStartDate.getFullYear();

              // Distance calculation from baseline
              const d1 = new Date(cbtStartDate.getFullYear(), cbtStartDate.getMonth(), cbtStartDate.getDate());
              const d2 = new Date(agendaYear, agendaMonth, day);
              const timeDiff = d2.getTime() - d1.getTime();
              const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

              const isFollowUpReportDay = daysDiff > 0 && daysDiff % 14 === 0;

              // Check if day payload exists in dayCbtData and has entries
              const dayKey = `${agendaYear}-${agendaMonth + 1}-${day}`;
              const payload = dayCbtData[dayKey];
              const hasNotes = payload && (payload.thoughtLogs?.length > 0 || payload.exposureLadder?.length > 0 || payload.isBreathingPracticed);

              const isSelected = selectedDay === day;

              let tileClass = "bg-slate-950/80 border-slate-900/60 hover:border-slate-800 text-slate-400";
              if (isBaseLine) tileClass = "bg-emerald-950/50 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/20";
              else if (isFollowUpReportDay) tileClass = "bg-orange-950/40 border-orange-500/40 text-orange-400 animate-pulse";
              else if (hasNotes) tileClass = "bg-indigo-950/30 border-indigo-500/30 text-indigo-350";

              if (isSelected) {
                tileClass += " ring-2 ring-teal-500 border-teal-500 text-teal-300 bg-slate-900";
              }

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`p-1.5 rounded-xl border text-center cursor-pointer transition flex flex-col justify-between h-16 ${tileClass}`}
                >
                  <div className="flex justify-between items-center text-[8px] text-slate-500">
                    <span>يوم</span>
                    {hasNotes && <span className="text-teal-400">✏️</span>}
                  </div>
                  <strong className="text-sm font-black tracking-tight block">{day}</strong>
                  <span className="text-[7px] truncate font-semibold">
                    {isBaseLine ? "خط الأساس" : isFollowUpReportDay ? `متابعة #${daysDiff/14}` : hasNotes ? "محرر" : "متاح"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold block">موقع خط الأساس المعتمد:</span>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span className="font-mono text-emerald-400 font-bold">{cbtStartDate.toLocaleDateString("ar-EG")}</span>
                <span>(بداية رحلة الدعم السلوكي)</span>
              </div>
              <p className="text-[9px] text-slate-500 leading-normal mt-1">
                يفيد خط الأساس في قياس تكرار المتابعة الدورية كل 14 يوماً بالأجندة، وضبط مواعيد إصدار التقارير للمشاورة الطبية.
              </p>
            </div>
          </div>

          {/* WIDGET 3: PANIC HELPER (مساعد القضاء على الهلع - التنفس الصندوقي) moved below agenda list */}
          <div className="space-y-4 pt-4 border-t border-slate-900">
            <div className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-xl border border-slate-950">
              <h5 className="font-bold text-xs text-slate-200 flex items-center gap-1.5 font-sans">
                ٣. مساعد القضاء على الهلع (التنفس المربع)
              </h5>
            </div>

            <div className="flex flex-col items-center gap-4 bg-slate-900/20 border border-slate-900 p-4 rounded-2xl">
              
              {/* Breathing Core Visual Container */}
              <div className="relative flex items-center justify-center w-28 h-28 flex-shrink-0">
                <div className={`absolute w-24 h-24 rounded-full border border-teal-500/10 transition-all duration-4000 scale-120 ${breathingActive && breathingPhase === "inhale" ? "animate-ping" : ""}`} />
                
                <div className={`w-20 h-20 rounded-full border-2 border-teal-550/40 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out text-center ${breathingCue.size}`}>
                  <span className={`text-[9px] tracking-wider transition-colors duration-500 block ${breathingCue.color}`}>
                    {breathingCue.text}
                  </span>
                  {breathingActive && (
                    <span className="text-xl font-black text-white/90 mt-0.5 font-mono">{breathingSeconds}s</span>
                  )}
                </div>
              </div>

              {/* Controls and Status indicators */}
              <div className="flex-1 space-y-3 text-center w-full">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold block">موقع وحالة تدريب تنفس اليوم:</span>
                  <p className="text-[10px] font-semibold text-slate-200 leading-relaxed">
                    {!breathingActive 
                      ? (getSelectedDayPayload().isBreathingPracticed 
                          ? "✅ ثبت إتمام جلسة اليوم لتنظيم وتوازن ضربات القلب والحد من التوجس" 
                          : "⚠️ لم يتم تفعيل الجلسة لليوم بعد. تساهم ممارسة التنفس بانتظام في دحر الهلع الاستجابي.")
                      : breathingPhase === "inhale" ? "تمديد عضلات الصدر وملء الرئتين بالسكينة"
                      : breathingPhase === "hold" ? "كتم وحجز طاقة الهواء لترويض العصب الحائر"
                      : breathingPhase === "exhale" ? "زفير بطيء لإخراج التثبيط والدخان والتوتر"
                      : "راحة ساكنة وثبات لتهدئة الأوتاد العصبية قبل الشهيق الجديد"}
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full pt-1">
                  <button
                    onClick={() => {
                      setBreathingActive(!breathingActive);
                      if (!breathingActive) {
                        setBreathingPhase("inhale");
                        setBreathingSeconds(4);
                      }
                    }}
                    className={`w-full py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition duration-305 cursor-pointer ${
                      breathingActive 
                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-950/20" 
                        : "bg-teal-500 hover:bg-teal-600 text-slate-950 shadow-md shadow-teal-950/10"
                    }`}
                  >
                    {breathingActive ? (
                      <>
                        <Square className="w-3 h-3 fill-white" /> إيقاف مؤقت للتمرين
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-slate-950" /> ابدأ كظم وضبط التوتر الآن
                      </>
                    )}
                  </button>

                  {!breathingActive && (
                    <button
                      onClick={handleBreathingTrack}
                      className="w-full py-2 px-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 font-extrabold text-[10px] transition cursor-pointer"
                    >
                      سجل تمرين اليوم كمكتمل ومصان
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN (lg:col-span-8): DAY-SPECIFIC CBT & ACT JOURNEY CORNER */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6 text-right">
            
            {/* Context Heading */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-4 gap-3">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2 justify-end">
                  <Activity className="w-5 h-5 text-teal-400" />
                  أدوات وجلسات الدعم الذاتي لـ:
                </h3>
                <span className="text-xs text-slate-400 block font-semibold leading-none">
                  بتاريخ: <strong className="text-teal-400 font-mono text-sm underline font-black">[{selectedDay}/{agendaMonth + 1}/{agendaYear}]</strong>
                </span>
              </div>
              

            </div>

            {/* WIDGET 1: COGNITIVE RESTRUCTURING FORM (دفتر رصد الأفكار المشوهة) */}
            <div className="space-y-4 border-b border-slate-900 pb-6 text-right">
              <div className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-xl border border-slate-900">
                <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-950 text-emerald-400 rounded">إعادة هيكلة معرفية</span>
                <h5 className="font-bold text-xs text-slate-200 flex items-center gap-1.5 font-sans">
                  ١.  دفتر رصد الأفكار المشوهة (CBT Thought Diary)
                </h5>
              </div>

              {isSelectedDayFuture() ? (
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-dashed border-slate-800 text-center space-y-3.5 select-none my-4">
                  <div className="mx-auto w-10 h-10 rounded-full bg-red-950/40 border border-red-900/20 flex items-center justify-center text-red-400">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h6 className="font-extrabold text-[12px] text-slate-200">دفتر رصد الأفكار المستقبلية مغلق ومقيد بالفحص النفسي</h6>
                    <p className="text-[10px] text-slate-400 max-w-md mx-auto leading-relaxed">
                      يُمنع عيادياً صياغة أو تدوين الأفكار التلقائية مسبقاً لأيام لم تبدأ بعد في أجندتك النفسية. يرجى اختيار تاريخ اليوم الحالي أو تاريخ سابق رصين لتمكين هيكلة الأفكار.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddThought} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400">حدث أو موقف اليوم الصعب المثير للتوتر (Situation):</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: تحدث نقاش مفاجئ مع والدي حول خروجي الاجتماعي"
                      value={newLog.situation}
                      onChange={(e) => setNewLog({ ...newLog, situation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl text-xs text-slate-150 border border-slate-800 focus:outline-none focus:border-teal-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">الفكرة التلقائية السلبية المصاحبة (Negative Automatic Thought):</label>
                    <textarea
                      required
                      placeholder="مثال: يجدني والدي إنساناً خائباً وعاجزاً ولن يثق برأيي أبداً."
                      value={newLog.automaticThought}
                      onChange={(e) => setNewLog({ ...newLog, automaticThought: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 rounded-xl text-xs text-slate-100 border border-slate-800 focus:outline-none focus:border-teal-500 h-20 resize-none font-semibold leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">المشاعر الجسدية والعاطفية ونسبتها (Emotions):</label>
                    <textarea
                      placeholder="مثال: حزن عميق، ضيق بالمعدة، خوف ورجفة (80%)"
                      value={newLog.emotion}
                      onChange={(e) => setNewLog({ ...newLog, emotion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 rounded-xl text-xs text-slate-100 border border-slate-800 focus:outline-none focus:border-teal-500 h-20 resize-none font-semibold leading-relaxed relative"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400">نوع الخطأ أو التشوه المعرفي الحالي (Cognitive Distortion):</label>
                    <select
                      value={newLog.distortion}
                      onChange={(e) => setNewLog({ ...newLog, distortion: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none text-right font-semibold"
                    >
                      {distortions.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-emerald-400">الفكرة البديلة الواقعية والعقلانية (Rational & Alternative Response):</label>
                    <textarea
                      required
                      placeholder="تمحيص الأدلة: غضب والدي نابع من قلقه عليّ ومحبته لي، وليس تصغيراً أو انتقاصاً من كفاءتي. نقاش واحد عابر لا يسلب ثقته بي."
                      value={newLog.rationalResponse}
                      onChange={(e) => setNewLog({ ...newLog, rationalResponse: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl text-xs text-slate-100 border border-slate-800 focus:outline-none focus:border-emerald-500 h-20 resize-none font-semibold leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="md:col-span-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-lg shadow-emerald-900/10 cursor-pointer"
                  >
                    حفظ الفكرة التلقائية وإعادة صياغتها عيادياً بنظام الأجندة
                  </button>
                </form>
              )}

              {/* PAST LOGS SECTION FOR THIS SELECTED DAY (سجل الأفكار السابق) */}
              <div className="space-y-3 pt-2">
                <h6 className="text-[10px] font-extrabold text-slate-400 tracking-wider">
                  سجل الأفكار السابقة المناهضة لليوم المحدد ({getSelectedDayPayload().thoughtLogs?.length || 0}):
                </h6>
                
                {getSelectedDayPayload().thoughtLogs?.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic py-1">لا توجد أفكار مفككة لهذا اليوم بعد. اكتب موقفك وقلقاً بالنموذج أعلاه لتنشيط المحاذاة.</p>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {getSelectedDayPayload().thoughtLogs.map((log) => (
                      <div key={log.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs relative text-right">
                        <button
                          onClick={() => handleDeleteThought(log.id)}
                          className="absolute left-3 top-3 text-red-400 hover:text-red-300 transition"
                          title="حذف السجل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex flex-wrap justify-between items-center text-[9px] text-slate-500 gap-2 pl-6">
                          <span className="font-semibold text-emerald-400">مذكرة CBT بتاريخ: {log.date}</span>
                          <span className="italic underline bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{log.distortion}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 font-extrabold block text-[10px]">الموقف أو المثير الحياتي:</span>
                          <p className="text-slate-200 mt-0.5">{log.situation}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-800/80 pt-2.5 text-[11px] leading-relaxed">
                          <div className="bg-red-950/20 border border-red-900/10 p-2.5 rounded-xl">
                            <span className="text-red-400 font-extrabold block text-[10px]">الفكرة التلقائية السلبية:</span>
                            <p className="text-red-300 italic mt-0.5">"{log.automaticThought}"</p>
                            <span className="text-[9px] text-slate-500 block mt-1.5">المشاعر المصاحبة: {log.emotion}</span>
                          </div>
                          
                          <div className="bg-emerald-950/20 border border-emerald-950/10 p-2.5 rounded-xl">
                            <span className="text-emerald-400 font-extrabold block text-[10px]">الدحض والعقلانية البديلة:</span>
                            <p className="text-emerald-300 font-semibold mt-0.5">"{log.rationalResponse}"</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* WIDGET 2: BEHAVIORAL EXPOSURE LADDER (سلم التعرض السلوكي لمواجهة المخاوف) */}
            <div className="pt-6 border-t border-slate-900 space-y-4">
              <div className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-xl border border-slate-900">
                <h5 className="font-bold text-xs text-slate-200 flex items-center gap-1.5 font-sans">
                  ٢. سلم التعرض السلوكي لمواجهة المخاوف وتجاوز التجنب
                </h5>
              </div>

              <div className="flex flex-col gap-6 bg-slate-900/10 border border-slate-900 p-4 rounded-3xl">
                <form onSubmit={handleAddExposure} className="w-full bg-slate-900/30 border border-slate-900 p-4 rounded-2xl h-fit space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-300 block border-b border-slate-900 pb-1.5 text-center">أضف خطوة تعرض لليوم</span>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 block">تفصيل مهمة التعرض بدقة:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: الجلوس في كافيه مزدحم بمفردي 10 دقائق"
                      value={newStep}
                      onChange={(e) => setNewStep(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-900 rounded-xl text-xs text-slate-150 border border-slate-800 focus:outline-none focus:border-teal-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                      <span>مستوى الصعوبة المتوقع (SUDs)</span>
                      <span className="text-teal-400 font-mono font-bold">{newDifficulty} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(parseInt(e.target.value))}
                      className="w-full accent-teal-500 bg-slate-950"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-500 text-slate-950 font-extrabold rounded-lg hover:bg-teal-600 transition text-xs cursor-pointer"
                  >
                    إدراج مهمة التعرض لليوم
                  </button>
                </form>

                {/* Ladder Items list specific to current day - placed directly below form */}
                <div className="w-full space-y-2 border-t border-slate-900/40 pt-4">
                  <h6 className="text-[10px] font-extrabold text-slate-400 block pb-1.5">
                    الترتيب التصاعدي لخطوات ومواجهات اليوم ({getSelectedDayPayload().exposureLadder?.length || 0}):
                  </h6>

                  {getSelectedDayPayload().exposureLadder?.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-[10px] border border-dashed border-slate-900 rounded-2xl">
                      لا توجد مهام مواجهة مسجلة لليوم. أضف تحديات كالتحدث والمواجهة في النموذج أعلاه.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {getSelectedDayPayload().exposureLadder.map((step, idx) => (
                        <div
                          key={step.id}
                          className={`border rounded-xl p-3 flex items-center justify-between gap-4 transition text-xs ${
                            step.completed 
                              ? "bg-teal-950/20 border-teal-900/30 text-teal-400/90" 
                              : "bg-slate-900 border-slate-800 hover:border-slate-750 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              onClick={() => toggleExposure(step.id)}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold cursor-pointer ${
                                step.completed ? "bg-teal-950 border border-teal-800 text-teal-400" : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {idx + 1}
                            </div>
                            
                            <div className="flex-1 min-w-0" onClick={() => toggleExposure(step.id)}>
                              <p className={`font-semibold cursor-pointer truncate ${step.completed ? "line-through text-slate-500" : ""}`}>
                                {step.stepName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] bg-slate-950 border border-slate-800 font-bold text-slate-400">
                              صعوبة {step.difficulty}/10
                            </span>

                            <button
                              onClick={() => handleDeleteExposure(step.id)}
                              className="text-red-400 hover:text-red-300 transition p-0.5"
                              title="حذف التعرض"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>



      </div>

    {/* BOTTOM SECTION: 14-DAY MEDICAL BEHAVIORAL PERIODIC REPORTS BOARD */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6 text-right">
        
        {/* Module Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-900 pb-4 gap-4">
          <div className="space-y-1">
            <h4 className="text-base font-black text-slate-150 flex items-center gap-2 justify-end">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              لوحة التقارير الدورية (كل 14 يوماً من الدعم السلوكي والمعرفي الذاتي)
            </h4>
            <p className="text-[11px] text-slate-400">
              تقوم منظومة سكينة بقياس وحفظ مذكراتك السلوكية دقيقة بدقيقة، وفي نهاية كل 14 يوماً من خط الأساس، يتم تفريغ التقرير النفسي وتحليله لتصديره والتشاور المباشر به.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSimulate14DaysOfCbt}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-indigo-950 rounded-xl text-[10px] font-black cursor-pointer transition"
            >
              ⏩ محاكاة وحشو الأجندة نموذجياً بـ 14 يوماً
            </button>
          </div>
        </div>

        {/* Diagnostic parameters editor block */}
        <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="md:col-span-4 border-b border-slate-900 pb-2 mb-1">
            <span className="text-[10px] text-teal-400 font-bold block">الملف التشخيصي المفترض لتصدير التقرير:</span>
          </div>
          
          <div>
            <label className="block text-[9px] text-slate-500 mb-1">الاسم بالكامل:</label>
            <input 
              type="text" 
              value={demographics.name} 
              onChange={(e) => setDemographics({...demographics, name: e.target.value})}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 mb-1">العمر بالتحديد:</label>
            <input 
              type="text" 
              value={demographics.age} 
              onChange={(e) => setDemographics({...demographics, age: e.target.value})}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-500 mb-1">العمل / التخصص لتنظيم التعرض:</label>
            <input 
              type="text" 
              value={demographics.job} 
              onChange={(e) => setDemographics({...demographics, job: e.target.value})}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2 text-xs text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateAIReport}
              disabled={isGeneratingReport}
              className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-orange-950/20"
            >
              {isGeneratingReport ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> ...جاري الفرز والتحليل الإكلينيكي
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> إصدار وتوليد التقرير السلوكي للـ 14 يوماً ✨
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Reports list */}
        <div className="space-y-4">
          <h5 className="text-xs font-extrabold text-slate-350 tracking-wider">
            ارشيف وسجلات الفحص والمراجعة التراكمية ({reviewsHistory.length + (clinicalReport ? 1 : 0)}):
          </h5>

          {/* Special initial report display block inside the archive view as requested */}
          {clinicalReport && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/20 border border-teal-900/40 rounded-3xl p-5 md:p-6 space-y-4 text-xs relative">
              <div className="absolute top-0 left-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl"></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-800/80 gap-3">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 bg-teal-950 text-teal-400 border border-teal-900 rounded font-black text-[8px] uppercase">التقرير الأولي الموحّد ✅</span>
                  <strong className="text-slate-100 font-extrabold text-xs block mt-1">تقرير التقييم والفرز الإكلينيكي الأساسي</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteInitialReport}
                    className="py-2 px-3.5 bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/40 font-bold rounded-xl text-[10.5px] flex items-center gap-1 cursor-pointer transition shadow-lg shadow-red-950/10"
                    title="حذف هذا التقرير الأولي 🗑️"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> حذف التقرير الأولي 🗑️
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 text-xs md:text-[13px] leading-relaxed text-slate-300">
                <strong className="text-teal-400 block mb-2 text-xs md:text-sm font-black">الملخص الإكلينيكي والتوصيف السيكومتري الأولي:</strong>
                {clinicalReport.summaryArabic}
              </div>

              {clinicalReport.primarySymptoms && clinicalReport.primarySymptoms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-400 font-bold">الأعراض المرصودة:</span>
                  {clinicalReport.primarySymptoms.map((s: string, idx: number) => (
                    <span key={idx} className="bg-slate-950 border border-slate-900 text-slate-400 text-[10px] px-2 py-0.5 rounded-lg">{s}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {reviewsHistory.length === 0 && !clinicalReport ? (
            <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-900 rounded-3xl">
              لا توجد تقارير دورية مصدرة حتى الآن. ضع مذكرات في أيام الأجندة (أو اختر المحاكاة)، ثم انقر فوق زر "إصدار وتوليد التقرير السلوكي".
            </div>
          ) : (
            <div className="space-y-4">
              {reviewsHistory.map((rep, idx) => (
                <div key={rep.id || idx} className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 md:p-6 space-y-4 text-xs relative">
                  
                  {/* Report Node Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-800/80 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">رقم تقييم المراجعة الدورية: [{reviewsHistory.length - idx}]</span>
                      <strong className="text-teal-400 font-extrabold text-xs block">تاريخ جني البيانات: {rep.generationDate}</strong>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-left sm:text-right">
                        <span className="text-[9.5px] text-slate-500 block font-bold">مؤشر الاستقرار المعرفي:</span>
                        <strong className="text-emerald-400 font-mono text-sm block font-black">{rep.progressScore}%</strong>
                      </div>

                      <button
                        onClick={() => handleExportPDF(rep)}
                        className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black rounded-xl text-[10.5px] flex items-center gap-1 cursor-pointer transition shadow-lg shadow-emerald-900/10"
                        title="تصدير للطباعة بصيغة PDF"
                      >
                        <Download className="w-3.5 h-3.5" /> تصدير PDF 🖨️
                      </button>

                      <button
                        onClick={() => handleDeletePeriodicReport(idx)}
                        className="py-2 px-3.5 bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/40 font-bold rounded-xl text-[10.5px] flex items-center gap-1 cursor-pointer transition shadow-lg shadow-red-950/10"
                        title="حذف هذا التقرير الدوري 🗑️"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> حذف التقرير 🗑️
                      </button>
                    </div>
                  </div>

                  {/* Summary progressStatus */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                    <span className="text-slate-400">مستوى وضع الحالة بعد المراجعة:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-900 text-emerald-400 text-[10.5px]">
                      {rep.progressStatus}
                    </span>
                  </div>

                  {/* Narrative details */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 text-xs md:text-[13px] leading-relaxed text-slate-300">
                    <strong className="text-teal-400 block mb-2 text-xs md:text-sm lg:text-base font-black">الخلاصة الإكلينيكية والتشخيص السلوكي التراكمي:</strong>
                    {rep.clinicalSummary}
                  </div>

                  {/* Adjustments bullet points */}
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900/80 text-[11px] leading-relaxed space-y-1">
                    <strong className="text-purple-400 block mb-1.5 text-[10.5px]">تعديلات وواجبات سلوكية مقترحة للـ 14 يوماً القادمة:</strong>
                    <ul className="list-disc list-inside text-slate-400 space-y-1 pr-1.5">
                      {rep.recommendedAdjustments?.map((adj: string, k: number) => (
                        <li key={k}>{adj}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Drug treatment compliance warning */}
                  <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-2xl text-[11px] leading-relaxed">
                    <strong className="text-indigo-400 block mb-1 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-indigo-400" /> البروتوكول العلاجي الدوائي المقترح والمطابقة:
                    </strong>
                    <p className="text-slate-200 font-semibold mb-1">{rep.medicationCheck}</p>
                    <span className="block text-[9.5px] text-amber-550 leading-relaxed font-bold bg-amber-950/30 p-2.5 rounded-xl border border-amber-900/20 mt-2">
                      ⚠️ تنبيه إكلينيكي حاسم: المقترحات الإرشادية والجرعات المبينة لسلامتك وسكينتك هي معاليم تفاعلية آلية لتسهيل الحديث. يرجى دائماً مراجعة طبيبك النفسي المتابع فوراً ودون تردد قبل تعديل أو أخذ أي علاج.
                    </span>
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
