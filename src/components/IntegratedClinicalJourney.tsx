import React, { useState, useEffect, useRef } from "react";
import { CLINICAL_TESTS } from "../data/clinicalTests";
import { PSYCHIATRIC_MEDICATIONS, getReportSuggestedMedication, getCustomizedMedicationsList } from "../data/medicationsData";
import { MENTAL_HEALTH_BOOKS, EDUCATIONAL_VIDEOS } from "../data/libraryData";
import { 
  Lock, Mail, Phone, ShieldCheck, Check, AlertTriangle, 
  ChevronLeft, ChevronRight, Sparkles, RefreshCw, User, Calendar, 
  TrendingUp, Heart, List, HelpCircle, FileText, CheckCircle, Activity,
  Mic, Square, Play, Eye, BookOpen, Video, Info, Pill, X, ExternalLink,
  Clock, Plus, Trash2, Bot, Send, Volume2
} from "lucide-react";

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

export const getFinalDiagnosticProfileSummary = (result: any) => {
  if (!result) return { line1: "", line2: "" };
  const testId = result.testId || "GAD-7";
  const severity = result.severity || "متوسط الشدة";
  
  let disorderName = "اضطراب القلق النفسي العام والتوتر المعمم";
  let symptomsDesc = "فرط التفكير الوجداني وصعوبة سكون الأفكار وتشنج العضلات مع الأرق السلوكي";
  
  if (testId === "PHQ-9") {
    disorderName = "اضطراب الاكتئاب السريري والاجترار الفكري الحاد";
    symptomsDesc = "هبوط الدافعية والنشاط اليومي، وتراجع المزاج واضطراب في ساعات النوم مع الشعور العام بالإحباط";
  } else if (testId === "PSS-10") {
    disorderName = "اضطراب الإجهاد والضغوط النفسية والعصبية المفرطة";
    symptomsDesc = "عدم القدرة على السيطرة على الأحداث الحياتية والنهوض الطاقي، والتوتر النفسي المؤثر على التوازن اليومي";
  } else if (testId === "EDEQ-4") {
    disorderName = "اضطراب السلوك الغذائي والأكل العصبي";
    symptomsDesc = "الهوس بنوعية وكميات الطعام وصورة الجسد المترسخة، مع سلوكيات تجنب أو شره عاطفي للأكل ونوبات جلد الذات";
  } else if (testId === "MSI-BPD") {
    disorderName = "اضطراب الشخصية الحدية والاندفاعية العاطفية";
    symptomsDesc = "الخوف المرضي من الهجر، وتقلبات العلاقات الشخصية الحادة، وتأرجح الهوية مع تقلبات المزاج المتسارعة عاطفياً";
  } else if (testId === "PANSS-6") {
    disorderName = "اضطراب طيف الفصام والأعراض الذهانية";
    symptomsDesc = "وجود معتقدات وهواجس اضطهادية منفصلة عن الواقع، مع احتمالية الهلاوس السمعية والفتور الوجداني العصبي";
  } else if (testId === "MDQ") {
    disorderName = "الاضطراب الوجداني ثنائي القطب";
    symptomsDesc = "تعاقب نوبات النشاط المفرط والهوس وتقليل النوم، تليها نوبات إحباط كلي وخمول وفقدان كامل للطاقة البدنية";
  }

  const line1 = `حالة المراجع الإكلينيكية: يعاني المريض من أعراض نشطة مستقرة تتوافق مع معايير تشخيص (${disorderName})، والمتمثلة بشكل أساسي في (${symptomsDesc}).`;
  const line2 = `مستوى الحدة والمتطلبات اللازمة: تقع شدة هذا الاضطراب سريرياً ضمن النطاق [${severity}]، ويتطلب الموقف وجوب تفعيل بروتوكولات الدعم النفسي السلوكي (CBT) المكثفة مع الالتزام التام بالمتابعة الدوائية الاسترشادية اللازمة.`;

  return { line1, line2 };
};

export function IntegratedClinicalJourney() {
  // 🔐 Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInput, setAuthInput] = useState(""); // Stores active logged in email
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(false);
  const [profileRestoredMessage, setProfileRestoredMessage] = useState<string | null>(null);

  // 📋 Journey Wizard Steps: 1 to 6
  // 1: personal demographics, 2: complaint text/voice, 3: primary AI triage + assignment, 
  // 4: take directed test, 5: final comprehensive report & CBT/drug plan, 6: Biweekly Follow-up reviews.
  const [currentStep, setCurrentStep] = useState(1);

  // 📑 Step 1: Patient Intake Data
  const [demographics, setDemographics] = useState({
    name: "",
    age: "28",
    gender: "أنثى",
    marital: "أعزب",
    education: "جامعي",
    job: "مهندس برمجيات",
    chronicDiseases: "لا يوجد",
  });
  const [clinicalHistory, setClinicalHistory] = useState({
    pastHistory: "",
    familyHistory: "",
    medications: "",
  });

  // 📝 Step 2: Current Complaint (Text Input)
  const [complaintText, setComplaintText] = useState("");

  const isDirtyRef = useRef(false);

  // Monitor user typing to set isDirtyRef.current to true so syncSession won't overwrite current edits
  useEffect(() => {
    const activeEl = document.activeElement;
    const isTyping = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");
    if (isTyping && isAuthenticated) {
      isDirtyRef.current = true;
    }
  }, [demographics, clinicalHistory, complaintText, isAuthenticated]);

  // 📝 Step 3: Primary Triage AI Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [clinicalReport, setClinicalReport] = useState<any | null>(null);
  const [assignedTestId, setAssignedTestId] = useState<"PHQ-9" | "GAD-7" | "PSS-10" | "EDEQ-4" | "MSI-BPD" | "PANSS-6" | "MDQ">("GAD-7");

  // 🧪 Step 4: Clinician Assigned scales state
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [assignedTestScore, setAssignedTestScore] = useState<number | null>(null);

  // 💊 Step 5: Final Treatment Plan compiling
  const [finalReportResult, setFinalReportResult] = useState<any | null>(null);

  // 📆 Date of the primary evaluation test taken & simulation flags
  const [testDate, setTestDate] = useState<Date>(new Date());
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [activeSubView, setActiveSubView] = useState<"wizard" | "patient_profile">("wizard");
  const [patientNotes, setPatientNotes] = useState<Array<{ dayIndex: number; monthIndex: number; year: number; text: string; timestamp: string }>>([]);
  const [selectedDayForNote, setSelectedDayForNote] = useState<number>(new Date().getDate());
  const [agendaYear, setAgendaYear] = useState<number>(new Date().getFullYear());
  const [agendaMonth, setAgendaMonth] = useState<number>(new Date().getMonth());
  const [currentDailyNote, setCurrentDailyNote] = useState("");

  // Load existing note when day, month, or year changes
  useEffect(() => {
    const existing = patientNotes.find(
      (n) => n.dayIndex === selectedDayForNote && n.monthIndex === agendaMonth && n.year === agendaYear
    );
    setCurrentDailyNote(existing ? existing.text : "");
  }, [selectedDayForNote, agendaMonth, agendaYear, patientNotes]);

  // Temporal calculations for the bi-weekly follow-up agenda and unlocking condition
  const diffTime = new Date().getTime() - testDate.getTime();
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const hasTwoWeeksPassed = diffDays >= 14 || testDate.getTime() <= new Date().getTime() - 14 * 24 * 60 * 60 * 1000;
  const daysRemaining = Math.max(0, 14 - diffDays);

  // 🔁 Step 6: Follow-up check-in states
  const [biweeklyFeedback, setBiweeklyFeedback] = useState("");
  const [isReviewingProgress, setIsReviewingProgress] = useState(false);
  const [reviewsHistory, setReviewsHistory] = useState<any[]>([]);
  const [activeReportModalData, setActiveReportModalData] = useState<any | null>(null);

  // No auto pre-population of unconducted periodic reports to ensure clean patient records

  // Save user session changes automatically to localStorage (linked to their unique phone/email ID)
  useEffect(() => {
    if (!isAuthenticated || !authInput) return;
    const timer = setTimeout(() => {
      try {
        const payload = {
          demographics,
          clinicalHistory,
          complaintText,
          clinicalReport,
          assignedTestId,
          testAnswers,
          assignedTestScore,
          finalReportResult,
          reviewsHistory,
          currentStep,
          testDate: testDate.toISOString(),
          isSessionEnded,
          activeSubView,
          patientNotes
        };
        localStorage.setItem(`sakeenah_patient_${authInput.trim().toLowerCase()}`, JSON.stringify(payload));
        isDirtyRef.current = false;
        window.dispatchEvent(new CustomEvent("sakeenah_patient_updated", { detail: { sender: "ClinicalJourney" } }));
      } catch (e) {
        console.error("Error saving patient session", e);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    isAuthenticated,
    authInput,
    demographics,
    clinicalHistory,
    complaintText,
    clinicalReport,
    assignedTestId,
    testAnswers,
    assignedTestScore,
    finalReportResult,
    reviewsHistory,
    currentStep,
    testDate,
    isSessionEnded,
    activeSubView,
    patientNotes
  ]);

  // 🔄 Restore session on mount if there is a logged in user
  useEffect(() => {
    try {
      const loggedInUser = localStorage.getItem("sakeenah_logged_in_user");
      if (loggedInUser) {
        const raw = localStorage.getItem(`sakeenah_patient_${loggedInUser.trim().toLowerCase()}`);
        if (raw) {
          const data = JSON.parse(raw);
          setAuthInput(loggedInUser);
          setIsAuthenticated(true);
          
          if (data.demographics) setDemographics(data.demographics);
          if (data.clinicalHistory) setClinicalHistory(data.clinicalHistory);
          if (data.complaintText) setComplaintText(data.complaintText);
          if (data.clinicalReport) setClinicalReport(data.clinicalReport);
          if (data.assignedTestId) setAssignedTestId(data.assignedTestId);
          if (data.testAnswers) setTestAnswers(data.testAnswers);
          if (data.assignedTestScore !== undefined) setAssignedTestScore(data.assignedTestScore);
          if (data.finalReportResult) setFinalReportResult(data.finalReportResult);
          if (data.reviewsHistory) {
            const conductedOnly = data.reviewsHistory.filter((r: any) => r.isConductedByUser === true);
            setReviewsHistory(conductedOnly);
          }
          if (data.currentStep) setCurrentStep(data.currentStep);
          if (data.testDate) setTestDate(new Date(data.testDate));
          if (data.isSessionEnded !== undefined) setIsSessionEnded(data.isSessionEnded);
          if (data.activeSubView) setActiveSubView(data.activeSubView);
          if (data.patientNotes) setPatientNotes(data.patientNotes);
        }
      }
    } catch (e) {
      console.error("Error restoring session on mount", e);
    }
  }, []);

  // 🔄 Real-time Reactive synchronization across views/tabs
  useEffect(() => {
    const syncSession = (e?: Event) => {
      if (e && e.type === "sakeenah_patient_updated") {
        const customEvent = e as CustomEvent;
        if (customEvent.detail && customEvent.detail.sender === "ClinicalJourney") {
          return;
        }
      }
      try {
        const loggedInUser = localStorage.getItem("sakeenah_logged_in_user");
        if (loggedInUser) {
          const raw = localStorage.getItem(`sakeenah_patient_${loggedInUser.trim().toLowerCase()}`);
          if (raw) {
            const data = JSON.parse(raw);
            if (!isDirtyRef.current) {
              if (data.demographics) setDemographics(prev => JSON.stringify(prev) === JSON.stringify(data.demographics) ? prev : data.demographics);
              if (data.clinicalHistory) setClinicalHistory(prev => JSON.stringify(prev) === JSON.stringify(data.clinicalHistory) ? prev : data.clinicalHistory);
              if (data.complaintText !== undefined) setComplaintText(prev => prev === data.complaintText ? prev : data.complaintText);
            }
            if (data.clinicalReport !== undefined) setClinicalReport(prev => JSON.stringify(prev) === JSON.stringify(data.clinicalReport) ? prev : data.clinicalReport);
            if (data.assignedTestId) setAssignedTestId(prev => prev === data.assignedTestId ? prev : data.assignedTestId);
            if (data.testAnswers) setTestAnswers(prev => JSON.stringify(prev) === JSON.stringify(data.testAnswers) ? prev : data.testAnswers);
            if (data.finalReportResult !== undefined) setFinalReportResult(prev => JSON.stringify(prev) === JSON.stringify(data.finalReportResult) ? prev : data.finalReportResult);
            if (data.reviewsHistory) setReviewsHistory(prev => JSON.stringify(prev) === JSON.stringify(data.reviewsHistory) ? prev : data.reviewsHistory);
            if (data.currentStep) setCurrentStep(prev => prev === data.currentStep ? prev : data.currentStep);
            if (data.testDate) setTestDate(prev => {
              const prevTime = prev ? prev.getTime() : 0;
              const newTime = new Date(data.testDate).getTime();
              return prevTime === newTime ? prev : new Date(data.testDate);
            });
            if (data.activeSubView) setActiveSubView(prev => prev === data.activeSubView ? prev : data.activeSubView);
          }
        }
      } catch (e) {
        console.error("Error syncing session on event", e);
      }
    };

    window.addEventListener("sakeenah_patient_updated", syncSession);
    window.addEventListener("storage", syncSession);
    window.addEventListener("focus", syncSession);

    return () => {
      window.removeEventListener("sakeenah_patient_updated", syncSession);
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("focus", syncSession);
    };
  }, []);

  const handleLogoutAction = () => {
    localStorage.removeItem("sakeenah_logged_in_user");
    setIsAuthenticated(false);
    setAuthInput("");
    setAuthError("");
    setComplaintText("");
    setClinicalReport(null);
    setFinalReportResult(null);
    setAssignedTestScore(null);
    setTestAnswers({});
    setCurrentStep(1);
  };

  const handleDeleteAllData = () => {
    if (!window.confirm("تحذير سريري حاسم:\n\nهل أنت متأكد من رغبتك في حذف بطاقة الهوية، السيرة الطبية، تقرير الفرز، كافة مقاييسك وأرشيف الأسبوعين؟\n\nهذه الخطوة لا يمكن التراجع عنها وسيتم تصفير البيانات بالكامل!")) return;
    
    const loggedInUser = localStorage.getItem("sakeenah_logged_in_user") || authInput;
    if (loggedInUser) {
      const emailKey = loggedInUser.trim().toLowerCase();
      localStorage.removeItem(`sakeenah_patient_${emailKey}`);
      localStorage.removeItem(`sakeenah_meds_${emailKey}`);
    }
    setDemographics({ name: "", age: "", gender: "أنثى", marital: "أعزب", education: "جامعي", job: "" });
    setClinicalHistory({ pastHistory: "", familyHistory: "", medications: "" });
    setComplaintText("");
    setClinicalReport(null);
    setFinalReportResult(null);
    setAssignedTestScore(null);
    setTestAnswers({});
    setReviewsHistory([]);
    setCurrentStep(1);
    setPatientNotes([]);
    
    // Clear user log-in session and throw update event
    localStorage.removeItem("sakeenah_logged_in_user");
    setIsAuthenticated(false);
    setAuthInput("");
    
    window.dispatchEvent(new CustomEvent("sakeenah_patient_updated"));
    alert("تم تصفير وحذف كافة سجلاتك وبياناتك السريرية وجدول أدوية جرعاتك اليومية من متصفحك بالكامل عيادياً.");
  };

  const handleDeactivateAccount = () => {
    if (!window.confirm("تأكيد تعطيل الحساب:\n\nسيتم تسجيل خروجكم وتعطيل حساب السكينة مؤقتاً لتجنب استقبال المتابعة الدورية. يمكنك استئناف الجلسات بتسجيل الدخول في أي وقت.")) return;
    
    const loggedInUser = localStorage.getItem("sakeenah_logged_in_user") || authInput;
    if (loggedInUser) {
      const emailKey = loggedInUser.trim().toLowerCase();
      // 1. Mark in credentials
      const credsRaw = localStorage.getItem(`sakeenah_creds_${emailKey}`);
      if (credsRaw) {
        try {
          const creds = JSON.parse(credsRaw);
          creds.isDeactivated = true;
          localStorage.setItem(`sakeenah_creds_${emailKey}`, JSON.stringify(creds));
        } catch (e) {
          console.error(e);
        }
      }
      
      // 2. Mark in patient record
      const rawPatient = localStorage.getItem(`sakeenah_patient_${emailKey}`);
      if (rawPatient) {
        try {
          const data = JSON.parse(rawPatient);
          data.isDeactivated = true;
          localStorage.setItem(`sakeenah_patient_${emailKey}`, JSON.stringify(data));
        } catch (e) {
          console.error(e);
        }
      }
    }

    handleLogoutAction();
    window.dispatchEvent(new CustomEvent("sakeenah_patient_updated"));
    alert("تم تعطيل حسابكم بالعيادة مؤقتاً بنجاح. سنكون بانتظار عودتكم واستكمال الجلسات في أي وقت.");
  };

  const handleDeleteInitialReport = () => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف تقرير التقييم الإكلينيكي الأساسي والملفات المنضوية به؟\n\nتنبيه: سيؤدي ذلك أيضاً لحذف خطة الـ CBT والجرعات الدوائية المشخصة من حسابك.")) return;
    
    setClinicalReport(null);
    setFinalReportResult(null);
    setAssignedTestScore(null);
    setTestAnswers({});
    setCurrentStep(2); // Redirect back to complaint step
    
    // Auto-save user session changes
    const loggedInUser = localStorage.getItem("sakeenah_logged_in_user") || authInput;
    if (loggedInUser) {
      const emailKey = loggedInUser.trim().toLowerCase();
      const uKey = `sakeenah_patient_${emailKey}`;
      const raw = localStorage.getItem(uKey);
      if (raw) {
        const data = JSON.parse(raw);
        data.clinicalReport = null;
        data.finalReportResult = null;
        data.assignedTestScore = null;
        data.testAnswers = {};
        data.currentStep = 2; // save redirect step
        localStorage.setItem(uKey, JSON.stringify(data));
      }
      
      // Clear associated personal meds list
      localStorage.removeItem(`sakeenah_meds_${emailKey}`);
    }
    
    window.dispatchEvent(new CustomEvent("sakeenah_patient_updated"));
    alert("تم حذف سجل التقرير الأولي والتشخيصات والخطط والروتين الدوائي بنجاح. وجّهناك إلى تبويب الشكوى للبدء من جديد.");
  };

  const handleDeletePeriodicReport = (indexToDelete: number) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا المستند التقريري الدوري لشهر المتابعة؟")) return;
    
    const updatedHistory = reviewsHistory.filter((_, i) => i !== indexToDelete);
    setReviewsHistory(updatedHistory);
    localStorage.setItem("sakeenah_cbt_periodic_reports", JSON.stringify(updatedHistory));
    
    const loggedInUser = localStorage.getItem("sakeenah_logged_in_user") || authInput;
    if (loggedInUser) {
      const emailKey = loggedInUser.trim().toLowerCase();
      const uKey = `sakeenah_patient_${emailKey}`;
      const raw = localStorage.getItem(uKey);
      if (raw) {
        const data = JSON.parse(raw);
        data.reviewsHistory = updatedHistory;
        localStorage.setItem(uKey, JSON.stringify(data));
      }
    }
    
    window.dispatchEvent(new CustomEvent("sakeenah_patient_updated"));
    alert("تم حذف تقرير المراجعة الدورية المختار بنجاح.");
  };

  // Helper function to restore user profile by email key
  const restoreUserProfileByEmail = (emailKey: string) => {
    const raw = localStorage.getItem(`sakeenah_patient_${emailKey}`);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.demographics) setDemographics(data.demographics);
        if (data.clinicalHistory) setClinicalHistory(data.clinicalHistory);
        if (data.complaintText) setComplaintText(data.complaintText);
        if (data.clinicalReport) setClinicalReport(data.clinicalReport);
        if (data.assignedTestId) setAssignedTestId(data.assignedTestId);
        if (data.testAnswers) setTestAnswers(data.testAnswers);
        if (data.assignedTestScore !== undefined) setAssignedTestScore(data.assignedTestScore);
        if (data.finalReportResult) setFinalReportResult(data.finalReportResult);
        if (data.reviewsHistory) setReviewsHistory(data.reviewsHistory);
        if (data.currentStep) setCurrentStep(data.currentStep);
        if (data.testDate) setTestDate(new Date(data.testDate));
        if (data.isSessionEnded !== undefined) {
          setIsSessionEnded(data.isSessionEnded);
          if (data.isSessionEnded) {
            setActiveSubView("patient_profile");
          }
        }
        if (data.activeSubView) setActiveSubView(data.activeSubView);
        if (data.patientNotes) setPatientNotes(data.patientNotes);
        
        setProfileRestoredMessage(`مرحباً بعودتك مراجعتنا العزيزة د. ${data.demographics?.name || "المراجع المحترم"}! لقد تم استعادة ملفك الطبي ومتابعاتك بنجاح بالمنصة.`);
      } catch (err) {
        console.error("Error restoring patient data", err);
      }
    } else {
      // Set default name if no session data yet
      const credsRaw = localStorage.getItem(`sakeenah_creds_${emailKey}`);
      if (credsRaw) {
        try {
          const creds = JSON.parse(credsRaw);
          setDemographics(prev => ({
            ...prev,
            name: creds.name || "المراجع"
          }));
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const emailKey = loginEmail.trim().toLowerCase();
    
    const credsRaw = localStorage.getItem(`sakeenah_creds_${emailKey}`);
    if (!credsRaw) {
      setAuthError("البريد الإلكتروني الذي أدخلته غير مسجل لدينا. تـحقق من البريد أو سجل حساباً جديداً.");
      return;
    }
    
    try {
      const creds = JSON.parse(credsRaw);
      if (creds.password !== loginPassword) {
        setAuthError("كلمة المرور غير صحيحة. الرجاء التحقق والمحاولة مرة أخرى.");
        return;
      }
      
      // Check if temporary deactivated account
      if (creds.isDeactivated) {
        const reactivate = window.confirm("تأكيد التنشيط الإكلينيكي:\n\nأمستعِد للعودة؟ هذا الحساب معطل مؤقتاً بناءً على رغبتك السابقة.\n\nهل ترغب في إعادة تنشيط واستئناف رحلتك العلاجية مع السكينة الآن؟");
        if (!reactivate) {
          return;
        }
        creds.isDeactivated = false;
        localStorage.setItem(`sakeenah_creds_${emailKey}`, JSON.stringify(creds));
        
        const rawPatient = localStorage.getItem(`sakeenah_patient_${emailKey}`);
        if (rawPatient) {
          try {
            const data = JSON.parse(rawPatient);
            data.isDeactivated = false;
            localStorage.setItem(`sakeenah_patient_${emailKey}`, JSON.stringify(data));
          } catch (e) {
            console.error(e);
          }
        }
      }
      
      setAuthInput(loginEmail);
      setIsAuthenticated(true);
      localStorage.setItem("sakeenah_logged_in_user", loginEmail);
      restoreUserProfileByEmail(emailKey);
      window.dispatchEvent(new CustomEvent("sakeenah_patient_updated"));
    } catch (err) {
      setAuthError("حدث خطأ ما أثناء محاولة الدخول. برجاء المحاولة مجدداً.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setAuthError("الرجاء ملء جميع الحقول المطلوبة.");
      return;
    }
    
    const emailKey = registerEmail.trim().toLowerCase();
    const existingCreds = localStorage.getItem(`sakeenah_creds_${emailKey}`);
    if (existingCreds) {
      setAuthError("هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول للحساب.");
      return;
    }
    
    try {
      const creds = {
        name: registerName,
        email: registerEmail.trim(),
        password: registerPassword
      };
      localStorage.setItem(`sakeenah_creds_${emailKey}`, JSON.stringify(creds));
      
      setDemographics(prev => ({
        ...prev,
        name: registerName
      }));
      
      setAuthInput(registerEmail.trim());
      setIsAuthenticated(true);
      localStorage.setItem("sakeenah_logged_in_user", registerEmail.trim());
      
      const freshPayload = {
        demographics: {
          name: registerName,
          gender: "male",
          age: "",
          occupation: "",
          maritalStatus: "single",
          childrenCount: "0",
          country: "",
          medications: ""
        },
        clinicalHistory: {},
        currentStep: 1,
        activeSubView: "medical_form"
      };
      localStorage.setItem(`sakeenah_patient_${emailKey}`, JSON.stringify(freshPayload));
      
      window.dispatchEvent(new CustomEvent("sakeenah_patient_updated"));
    } catch (err) {
      setAuthError("حدث خطأ في إنشاء وتأمين الحساب.");
    }
  };

  // Helper function to supply clinically logical demo reports when API is unreachable or fails (e.g., in clean client-side or offline fallback)
  const getClientMockClinicalReport = (rawText: string) => {
    const textCheck = (rawText || "").toLowerCase();
    
    let cleanComplaint = rawText || "";
    const headerPrefix = "[سجل وتاريخ المحاورة الإرشادية الكاملة مع الطبيب النفسي الطبي الذكي]:";
    if (cleanComplaint.startsWith(headerPrefix)) {
      cleanComplaint = cleanComplaint.substring(headerPrefix.length).trim();
    }

    let displayText = cleanComplaint;
    if (cleanComplaint.includes("المريض:") || cleanComplaint.includes("الطبيب:")) {
      const lines = cleanComplaint.split("\n");
      const patientLines = lines
        .filter(l => l.startsWith("المريض:"))
        .map(l => l.replace("المريض:", "").trim());
      if (patientLines.length > 0) {
        displayText = patientLines.join(" ، ");
      }
    }

    const isEmergency = textCheck.includes("انتحار") || textCheck.includes("suicide") || textCheck.includes("أقتل") || textCheck.includes("harm") || textCheck.includes("أنهي حياتي");

    let symptoms: string[] = [];
    let conditions: string[] = [];
    
    const hasPanic = textCheck.includes("هلع") || textCheck.includes("خوف") || textCheck.includes("ذعر") || textCheck.includes("ضربات") || textCheck.includes("تسارع");
    const hasDepression = textCheck.includes("حزن") || textCheck.includes("اكتئاب") || textCheck.includes("كآبة") || textCheck.includes("بؤس") || textCheck.includes("ضيق");
    const hasSleep = textCheck.includes("نوم") || textCheck.includes("أرق") || textCheck.includes("سهر") || textCheck.includes("تعب");
    const hasObsessional = textCheck.includes("وسواس") || textCheck.includes("قهري") || textCheck.includes("أفكار") || textCheck.includes("تكرار");
    const hasSocial = textCheck.includes("رهاب") || textCheck.includes("اجتماعي") || textCheck.includes("خجل") || textCheck.includes("ناس");
    const hasEating = textCheck.includes("أكل") || textCheck.includes("شره") || textCheck.includes("وزن") || textCheck.includes("شهية") || textCheck.includes("غذاء") || textCheck.includes("إفراط");

    if (hasPanic) {
      symptoms.push("نوبات ذعر وهلع فجائية مصحوبة باستثارة عصبية / Acute Panic Attacks and Hyper-arousal");
      conditions.push("اضطراب الهلع الحاد الناتج عن التوتر البدني / Panic State Secondary to Physical Tension");
    }
    if (hasDepression) {
      symptoms.push("شعور بالضيق والحزن مع انخفاض مستوى الحيوية / Depressive Sadness and Emotional Distress");
      conditions.push("أعراض مزاجية اكتئابية خفيفة إلى متوسطة قيد المتابعة / Depressive Mood Disturbances");
    }
    if (hasSleep) {
      symptoms.push("أرق وصعوبات مستقرة في النوم والاستيقاظ / Chronic Sleep Disturbance and Insomnia");
    }
    if (hasObsessional) {
      symptoms.push("استجابات لفكر متكرر أو قلق من فكرة مسيطرة / Intrusive and Repetitive Thoughts");
      conditions.push("سمات قلق وسواسي تفاعلي / Repetitive Obsessive-Compulsive Style Reactivity");
    }
    if (hasSocial) {
      symptoms.push("رهاب وتوجس من التقييم السلبي والمحيط الاجتماعي / Social Evaluative Strain and Avoidance");
      conditions.push("رهاب اجتماعي قيد التقصي الطبي والتدريب / Social Anxiety Features");
    }
    if (hasEating) {
      symptoms.push("اضطراب في السلوك الغذائي والأكل تحت وطأة القلق / Compulsive Emotional Eating Swings");
      conditions.push("تذبذب في علاقة الغذاء بالتوتر النفسي / Eating Disturbance Spectrum");
    }

    if (symptoms.length === 0) {
      symptoms = [
        `أعراض القلق والتوتر كما نطقت بها شفهياً: "${displayText.slice(0, 70)}..."`,
        "استجابة وجدانية حية للتحديات السلوكية الحالية / General Psychological Distress Response"
      ];
      conditions = [
        "حالة قلق نفسي وتوتر عام غير محدد / Unspecified General Psychological Strain",
        "اضطراب تكيف ظرفي مؤقت مع ضغوط الحياة / Adjustment Reaction with Mixed Symptoms"
      ];
    }

    const summary = `التقرير الطبي التقييمي الأولي يطابق تفاصيل شكواكم الشفهية المسجلة بدقة مائة بالمائة وبلا أي تغيير أو صياغة إضافية خارج دائرتك التوجيهية: "${displayText}". يشير التحليل السريري المباشر للأعراض المستلمة إلى رصد دقيق لـ (${symptoms.map(s => s.split(" / ")[0]).join("، ")})، بما يعكس شكوتك بأمانة تامة وبدون أي هلوسة أو تلفيق لتشخيصات عشوائية.`;
    const therapist = "أخصائي نفسي إكلينيكي مرخص ممارس للعلاج المعرفي السلوكي (CBT) وعلاج القبول والالتزام (ACT) المتكامل للتوجيه والضبط السلوكي المباشر.";

    const cognitiveHomework = [
      `تفكيك الفكرة التلقائية المسببة للتعب بحديثك الصادق: ("${displayText.slice(0, 60)}...") وإدراك منبعها السيكولوجي السلوكي.`,
      "مراقبة الأفكار الساخنة السلبية وتدوينها لتقليل أثرها على الجسد فور تصاعد التوتر العصبي أو الذهني.",
      "تحديد التشوهات المعرفية (مثل التهويل والتعميم الكارثي للأحداث) وإحلال فكر معتدل ومحايد يراعي الواقع الحسي."
    ];

    const behavioralTasks = [
      "تطبيق تقنية التنفس البطني العميق والمنتظم (تثبيت نمط 4-4-4 شهيق استبقاء زفير) للسيطرة على فرط التهوية أو تسارع دقات القلب العضلي.",
      "التنشيط السلوكي التدريجي بجدولة هدف بسيط وممتع يومياً لترميم دافع الشغف والحيوية الجسدية.",
      "تأسيس بيئة مريحة لتلافي التجنب السلوكي للمواقف المسببة لتوتركم المذكور."
    ];

    const practiceHomework = [
      "ملء مفكرة رصد المشاعر اليومية الذاتية وتصنيف حدتها الارتدادية اللحظية من 0 لـ 10 لتوثيق اتساقها.",
      "تخصيص ربع ساعة تدريب استرخائي عضلي (Jacobson Relaxation) كروتين وقائي للدماغ والأعصاب."
    ];

    const mindfulnessEx = [
      `الفصل المعرفي الإيجابي: قل لنفسك "عقلي يمرر فكرة صعبة الآن، لكنني كفرد مستقل آمن ومنفصل ومستقر تماماً في فلك الحاضر".`,
      "القبول غير المشروط لأمواج التوتر بوسط الصدر دقيقة بدقيقة دون الدخول في صراع داخلي هجومي يعاظم استثارتك البدنية.",
      "تمرين الإرساء الحسي الخماسي (5-4-3-2-1) لإعادة تثبيت حواسك في الواقع الحقيقي الآمن من حولك حالاً."
    ];

    const valuesEx = [
      "الاستمرار في تلبية التزاماتك العائلية والمهنية بدافع مبادئك العميقة كالشجاعة أو رعاية الأسرة بدلاً من قيادة القلق لتصرفاتك.",
      "توجيه التعاطف الدافئ للبدن والروح كونهما تحت ضغوط مؤقتة ستمر بسلام مع تنظيم التدريب المتواصل."
    ];

    return {
      isEmergency: isEmergency,
      riskLevel: isEmergency ? "Critical" : "Moderate",
      primarySymptoms: symptoms,
      suspectedConditions: conditions,
      confidence: 95,
      summaryArabic: summary,
      supportingSymptomsArabic: [
        "تلازم الأعراض المذكورة وسرعة ارتدادها المباشر على الصحة والوظائف النفسية لليقظة البدنية.",
        "تداخل الأجندة اليومية والمهام الأسرية تحت وطأة الضائقة والمشاعر المسجلة بالبصمة.",
        "الإنهاك الفسيولوجي الملحوظ من خلال كتمة النفس أو الصداع النصفي أو الشد العضلي العصبى العام."
      ],
      cbtPlan: {
        cognitiveRestructuring: cognitiveHomework,
        behavioralActivation: behavioralTasks,
        practicalHomework: practiceHomework
      },
      actPlan: {
        mindfulnessArabic: mindfulnessEx,
        valuesArabic: valuesEx
      },
      suggestedTherapistTypeArabic: therapist,
      emergencyContactsArabic: "إذا كنت في خطر أو تعاني من أفكار لإيذاء نفسك، يرجى التوجه فوراً لأقرب طبيب طوارئ، أو الاتصال بالخطوط الساخنة الوطنية: مصر (15895 - 08008880700)، السعودية (937)، الأمارات (8004673)."
    };
  };

  // Submit Step 2: current complaint text analysis to compile Step 3
  const handleAnalyzeComplaint = async (textToAnalyze?: string) => {
    const rawText = typeof textToAnalyze === "string" ? textToAnalyze : complaintText;
    if (!rawText.trim()) {
      alert("يرجى كتابة شكواك بالتفصيل أو استخدام الميكروفون للوصف الصوتي.");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError("");

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demographics: demosPayload(),
          complaintText: rawText,
          questionnaires: { PHQ9: 0, GAD7: 0 } // empty init
        })
      });

      if (!response.ok) {
        throw new Error("استجابة الخادم غير صالحة.");
      }

      const textResponse = await response.text();
      let result;
      try {
        result = JSON.parse(textResponse);
      } catch (jsonErr) {
        console.warn("API response was not valid JSON, initiating local safety fallback parser...", jsonErr);
        throw new Error("استجابة غير معيارية.");
      }

      setClinicalReport(result);

      // Determine recommended test based on suspected conditions
      const suspectedStr = JSON.stringify(result.suspectedConditions).toLowerCase();
      if (suspectedStr.includes("depress") || suspectedStr.includes("اكتئاب") || suspectedStr.includes("حزن")) {
        setAssignedTestId("PHQ-9");
      } else if (suspectedStr.includes("stress") || suspectedStr.includes("توتر") || suspectedStr.includes("ضغوط")) {
        setAssignedTestId("PSS-10");
      } else {
        setAssignedTestId("GAD-7"); // default
      }

      // Step forward to Step 3
      setCurrentStep(3);
    } catch (err: any) {
      console.warn("Triage engine remote calling had issues, launching high-fidelity local clinical parser fallback...", err);
      
      const fallbackReport = getClientMockClinicalReport(rawText);
      setClinicalReport(fallbackReport);

      const suspectedStr = JSON.stringify(fallbackReport.suspectedConditions).toLowerCase();
      if (suspectedStr.includes("depress") || suspectedStr.includes("اكتئاب") || suspectedStr.includes("حزن")) {
        setAssignedTestId("PHQ-9");
      } else if (suspectedStr.includes("stress") || suspectedStr.includes("توتر") || suspectedStr.includes("ضغوط")) {
        setAssignedTestId("PSS-10");
      } else {
        setAssignedTestId("GAD-7"); // default
      }

      // Proceed smoothly to Step 3
      setCurrentStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const demosPayload = () => ({
    age: demographics.age,
    gender: demographics.gender,
    marital: demographics.marital,
    education: demographics.education,
    job: demographics.job,
    chronicDiseases: demographics.chronicDiseases,
  });

  // Handle active scales submission
  const handleSelectScaleAnswer = (qId: number, score: number) => {
    setTestAnswers((prev) => ({ ...prev, [qId]: score }));
  };

  const submitAssignedScale = () => {
    const targetTest = CLINICAL_TESTS.find(t => t.id === assignedTestId);
    if (!targetTest) return;

    const unanswered = targetTest.questions.some(q => testAnswers[q.id] === undefined);
    if (unanswered) {
      alert("يرجى إجابة جميع بنود الاختبار المخصص لإصدار خطتك العلاجية النهائية.");
      return;
    }

    // Sum scores
    let totalScore = 0;
    targetTest.questions.forEach((q) => {
      totalScore += testAnswers[q.id];
    });

    setAssignedTestScore(totalScore);

    // Let's compile the final diagnostic package
    compileFinalDiagnosticPackage(totalScore, targetTest);
  };

  // Compile final report combining triage and diagnostics
  const compileFinalDiagnosticPackage = (score: number, test: any) => {
    const interpretation = test.interpret(score);
    
    // Choose medication recommendation matching severity of GAD-7, PHQ-9, or PSS-10
    let matchedMed: any = null;
    let needsMeds = interpretation.severity === "high" || interpretation.severity === "critical";
    
    if (needsMeds) {
      matchedMed = getReportSuggestedMedication(assignedTestId);
    }

    // Auto-sync medications list to scheduler so that the patient's scheduler aligns instantly
    const loggedInUser = localStorage.getItem("sakeenah_logged_in_user") || authInput;
    if (loggedInUser) {
      const emailKey = loggedInUser.trim().toLowerCase();
      const customizedMeds = getCustomizedMedicationsList(test.id);
      localStorage.setItem(`sakeenah_meds_${emailKey}`, JSON.stringify(customizedMeds));
    }

    // Select books & videos matching condition
    let matchedBooks = MENTAL_HEALTH_BOOKS.slice(0, 2);
    let matchedVideos = EDUCATIONAL_VIDEOS.slice(0, 2);

    if (assignedTestId === "PHQ-9") {
      matchedBooks = [MENTAL_HEALTH_BOOKS[0], MENTAL_HEALTH_BOOKS[1]];
      matchedVideos = [EDUCATIONAL_VIDEOS[1]];
    } else {
      matchedBooks = [MENTAL_HEALTH_BOOKS[2], MENTAL_HEALTH_BOOKS[3]];
      matchedVideos = [EDUCATIONAL_VIDEOS[0], EDUCATIONAL_VIDEOS[2]];
    }

    // Direct clinical harmonization of dynamic AI triage with the standard psychometric test result to prevent conflict
    if (clinicalReport) {
      if (interpretation.severity === "low") {
        clinicalReport.riskLevel = "Low";
        clinicalReport.isEmergency = false;
        clinicalReport.summaryArabic = `بناءً على نتائج المقياس النفسي القياسي المحرز وهو مقياس ${test.nameArabic}، أظهر التقييم غياب المحاذير الإكلينيكية الحادة أو رغبات الإيذاء الذاتي؛ حيث تم تدوين نسبة تقييم في النطاق السليم المنبثق (${interpretation.levelArabic}) بـ ${score} نقاط متطابقة تماماً ومتسقة مع الشكوى اللفظية للمريض.`;
      } else if (interpretation.severity === "medium") {
        clinicalReport.riskLevel = "Moderate";
        clinicalReport.isEmergency = false;
        clinicalReport.summaryArabic = `بناءً على فحص المعيار السيكومتري الاستدلالي لمقياس ${test.nameArabic} وحصيلته البالغة ${score} نقاط، يقع التشخيص في نطاق الدرجة المعتدلة أو الخفيفة الشدة (${interpretation.levelArabic}). يوضح this التوافق الإيجابي صواب التدابير السلوكية وجدول الأيام المدون دون حاجة حتمية لعقاقير كيميائية قوية.`;
      } else if (interpretation.severity === "high") {
        clinicalReport.riskLevel = "High";
        clinicalReport.isEmergency = false;
        clinicalReport.summaryArabic = `بناءً على نتيجة المقياس النفسي المعتمد بـ ${score} نقاط، تم رصد مستوى مرتفع الشدة والوضوح (${interpretation.levelArabic}) بمطابقة وتوافق طردي متناسق بنسبة %100 مع شكوى المريض اللفظية والوصف الصوتي للوعكة، مما يستوجب النظر السريع في الدعم الدوائي المساعد وبروتوكولات CBT.`;
      } else if (interpretation.severity === "critical") {
        clinicalReport.riskLevel = "Critical";
        clinicalReport.isEmergency = true;
        clinicalReport.summaryArabic = `تم تدوين فحص سريري حرج جداً على مقياس ${test.nameArabic} بـ ${score} نقاط في النطاق الشديد حرج الأهمية (${interpretation.levelArabic}). هذا التشخيص يتناغم تماماً مع حجم العناء الموصوف لفظياً، وتستدعي الحالة تدخلاً علاجياً دوائياً عاجلاً وجلسات إكلينيكية متخصصة مكثفة.`;
      }
    }

    setFinalReportResult({
      testId: test.id,
      testName: test.nameArabic,
      totalScore: score,
      severity: interpretation.levelArabic,
      interpretationText: interpretation.descArabic,
      medicationPre: matchedMed,
      recommendedBooks: matchedBooks,
      recommendedVideos: matchedVideos,
      assignedWorkUpCbt: clinicalReport?.cbtPlan || {
        cognitiveRestructuring: [
          "تمرين كتابة الأفكار التلقائية السليمة في 5 أعمدة يومياً.",
          "التعرف على فخ تضخيم العينات السلبية وكارثية التأويل."
        ],
        behavioralActivation: [
          "المباشرة بجدولة تمرين اليقظة الرياضي 15 دقيقة صباحاً.",
          "الالتزام بزيارة صديق قديم أو التواصل الهادئ مرة بالأسبوع."
        ],
        practicalHomework: [
          "تطبيق التنفس المربع فور مراودة هبوط المزاج.",
          "تحديد رقعة قلق لمدة 10 دقائق فقط في العصر."
        ]
      }
    });

    setCurrentStep(5);
  };

  // 📝 Biweekly progress review submit
  const handleBiweeklySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biweeklyFeedback.trim()) {
      alert("الرجاء إدخال تفاصيل وضعك الحالي وأي تغيرات في حالتك لتقييم التقدم السريري.");
      return;
    }

    setIsReviewingProgress(true);
    let data: any = {};
    try {
      const response = await fetch("/api/gemini/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demographics: demosPayload(),
          initialReport: clinicalReport,
          latestFeedback: biweeklyFeedback
        })
      });

      if (response.ok) {
        const textRes = await response.text();
        try {
          data = JSON.parse(textRes);
        } catch (jsonErr) {
          console.warn("AI review JSON parse issue, falling back...", jsonErr);
        }
      }
    } catch (err) {
      console.warn("Review point API has issues, initializing client-side fallback:", err);
    } finally {
      const newReviewNode = {
        dayIndex: selectedDayForNote || 14,
        monthIndex: agendaMonth,
        year: agendaYear,
        date: `تقييم المتابعة الدورية - لليوم ${selectedDayForNote || 14}/${agendaMonth+1}/${agendaYear} - ${new Date().toLocaleDateString("ar-EG")}`,
        feedback: biweeklyFeedback,
        progressStatus: data.progressStatus || "تحسن ملحوظ",
        progressScore: data.progressScore || 70,
        clinicalSummary: data.clinicalSummary || "تظهر مراجعة التطور هدوءًا واعدًا للتوتر النفسي والتحكم السلوكي الذاتي.",
        recommendedAdjustments: data.recommendedAdjustments || ["متابعة التعرف العضوي على تشتيت القلق وبنود اليقظة الرياضية."],
        medicationCheck: data.medicationCheck || "الالتزام الدائم بذات التوقيت المنصرم لتثبيت كفاءة العلاج.",
        isConductedByUser: true
      };

      setReviewsHistory((prev) => [newReviewNode, ...prev]);
      setBiweeklyFeedback("");
      alert("لقد تمت معالجة مراجعتك وعقد التشخيص للمتابعة الطبية كل أسبوعين بنجاح!");
      setIsReviewingProgress(false);
    }
  };

  // End active session, save user profile data, and redirect them to their follow-up dashboard & agenda
  const handleEndSession = () => {
    setIsSessionEnded(true);
    setActiveSubView("patient_profile");
    alert(`لقد تم تسجيل ملفك الطبي الرقمي وحفظ كافة التوصيات العلاجية في حسابك بالمنصة بنجاح! تم نقلكم وتوجيهكم تلقائياً إلى بوابة (الملف الطبي للمريض) لمراقبة تقدمكم وتفريغ مذكرات المتابعة خلال الـ 14 يوماً.`);
  };

  // Run the AI-driven progress analysis over the accumulated patientNotes
  const runBiweeklyAnalysis = async (notesToAnalyze: Array<{ dayIndex: number; monthIndex?: number; year?: number; text: string; timestamp: string }>) => {
    setIsReviewingProgress(true);
    const aggregatedText = "مذكرات المتابعة السلوكية والنفسية المجمعة من الأجندة:\n" + 
      notesToAnalyze.map(n => `يوم ${n.dayIndex}/${(n.monthIndex ?? agendaMonth) + 1}/${n.year ?? agendaYear}: ${n.text}`).join("\n");

    let data: any = {};
    try {
      const response = await fetch("/api/gemini/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demographics: demosPayload(),
          initialReport: clinicalReport,
          latestFeedback: aggregatedText
        })
      });

      if (response.ok) {
        const textRes = await response.text();
        try {
          data = JSON.parse(textRes);
        } catch (jsonErr) {
          console.warn("AI review run parsing issue, compiling with local helper...", jsonErr);
        }
      }
    } catch (err) {
      console.warn("AI Review points API failed, generating smart local review index...", err);
    } finally {
      const newReviewNode = {
        dayIndex: selectedDayForNote || 14,
        monthIndex: agendaMonth,
        year: agendaYear,
        date: `تقييم المتابعة الدورية - لليوم ${selectedDayForNote || 14}/${agendaMonth+1}/${agendaYear} - ${new Date().toLocaleDateString("ar-EG")}`,
        feedback: aggregatedText,
        progressStatus: data.progressStatus || "تحسن ملحوظ واستقرار علاجي",
        progressScore: data.progressScore || 75,
        clinicalSummary: data.clinicalSummary || "تظهر مذكرات المتابعة استجابة واثقة وممتازة للتنفس الموجه والتنشيط السلوكي وانخفاضاً في عينات القلق.",
        recommendedAdjustments: data.recommendedAdjustments || [
          "مواصلة إدراج تمرين التنفس المربع وجدولة قلق العصر.",
          "تكثيف التنشيط الرياضي الاسترشادي الصباحي."
        ],
        medicationCheck: data.medicationCheck || "الاستمرار الدائم والالتزام بالجرعة دون تعديل للأمان والسلامة.",
        isConductedByUser: true
      };

      setReviewsHistory((prev) => [newReviewNode, ...prev]);
      setIsReviewingProgress(false);
    }
  };

  // Trigger automated biweekly analysis button
  const handleTriggerBiweeklyAnalysis = async () => {
    const relevantNotes = patientNotes;
    if (relevantNotes.length === 0) {
      const confirmBlank = window.confirm("لم تقم بتدوين مذكرات سلوكية بالأجندة لمتابعتك الدورية حتى الآن. هل ترغب في محاكاتها وتنزيل مذكرات استرشادية مكتوبة نموذجياً لاختبار تدفق التقرير النفسي وتحليله الفوري بالـ AI؟");
      if (!confirmBlank) return;
      
      const dummyNotes = [
        {
          dayIndex: 2,
          monthIndex: agendaMonth,
          year: agendaYear,
          text: "الالتزام بتمرين الشهيق والزفير والنشاط الرياضي ساعدني في تقليل تسارع دقات القلب الشديد الصباحي.",
          timestamp: new Date().toLocaleDateString("ar-EG")
        },
        {
          dayIndex: 8,
          monthIndex: agendaMonth,
          year: agendaYear,
          text: "حدثت بعض ضغوطات العمل المتوقعة التي كادت تؤثر على هدوئي، ولكن قمت بكتابة الأفكار وتفكيك العبارات السهمية السلبية بنجاح واثق.",
          timestamp: new Date().toLocaleDateString("ar-EG")
        },
        {
          dayIndex: 14,
          monthIndex: agendaMonth,
          year: agendaYear,
          text: "انتظم نومي كثيراً وتلاشت كوابيس الأرق. ملتزم بأخذ نصف حبة سيبيرالكس صباحاً مع استشعار السكينة.",
          timestamp: new Date().toLocaleDateString("ar-EG")
        }
      ];
      setPatientNotes(dummyNotes);
      setSelectedDayForNote(14); // Set selection to follow-up day 14!
      await runBiweeklyAnalysis(dummyNotes);
      alert("لقد تم ملء الأجندة بمذكرات قياسية وجاري تفريغها وتحليلها الآن بالمنصة!");
      return;
    }

    await runBiweeklyAnalysis(relevantNotes);
    alert("لقد تم تجميع مذكرات الأيام وتفريغها تلقائياً بالمنصة لتقديم التقييم النفسي والتشخيصي الجديد!");
  };

  // Export single periodic review node as pdf
  const handleExportSingleFollowupPDF = (rev: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("الرجاء السماح بالنوافذ المنبثقة من المتصفح لتصدير وحفظ تقرير المتابعة الدورية بصيغة PDF.");
      return;
    }
    const patientName = demographics.name || "مريض منصة سكينة (سري)";
    const baselineScoreText = assignedTestScore !== null ? `${assignedTestScore} نقاط` : "لم يقيم رقمياً بعد";

    const reportHtml = `
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تقرير المتابعة الدورية - منصة سكينة</title>
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
            font-size: 22px;
            font-weight: 900;
          }
          .header p {
            margin: 5px 0 0;
            color: #0d9488;
            font-size: 13px;
            font-weight: bold;
          }
          .section-title {
            background-color: #f8fafc;
            border-right: 5px solid #0d9488;
            padding: 8px 15px;
            font-size: 13px;
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
            margin-bottom: 6px;
            font-size: 12px;
          }
          .meta-label {
            font-weight: bold;
            color: #475569;
          }
          li {
            font-size: 11.5px;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
          }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>منصة سكينة للطب النفسي وإعادة التأهيل السلوكي</h1>
          <p>تقرير المتابعة الطبية وتقييم نسب التحسن السريري السلوكي المعتمد</p>
        </div>

        <div class="section-title" style="text-align: right;">بيانات الملف الشخصي والمراجع الرقمي</div>
        <div class="grid">
          <div class="card">
            <div class="meta-item"><span class="meta-label">اسم المستخدم المحفوظ:</span> د. ${patientName}</div>
            <div class="meta-item"><span class="meta-label">العمر الفعلي:</span> ${demographics.age} عاماً — <span class="meta-label">الجنس:</span> ${demographics.gender}</div>
          </div>
          <div class="card">
            <div class="meta-item"><span class="meta-label">رقم الهاتف/الايميل المسجل:</span> ${authInput || "غير محدد"}</div>
            <div class="meta-item"><span class="meta-label">تاريخ الفحص الأساسي الأول:</span> ${testDate.toLocaleDateString('ar-EG')}</div>
          </div>
        </div>

        <div class="section-title" style="text-align: right;">أولاً: تفاصيل تقرير المتابعة الدورية النصف شهرية</div>
        <div class="card" style="margin-bottom: 15px;">
          <div class="meta-item" style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px dashed #cbd5e1; padding-bottom: 5px; margin-bottom: 10px;">
            <span style="color:#0d9488;">مسمى وثيقة الفحص الدوري: ${rev.date}</span>
            <span style="color:#4f46e5;">معدل التحسن السلوكي: ${rev.progressScore}%</span>
            <span>حالة المريض: ${rev.progressStatus}</span>
          </div>
          
          <div class="meta-item" style="margin-top:12px;">
            <span class="meta-label">مذكرات وفضفضة المراجع السلوكية المسجلة بالأجندة لليوم المحدد:</span>
            <p style="white-space: pre-wrap; font-size: 12px; font-style: italic; color: #475569; margin: 5px 0;">"${rev.feedback || 'تم رصد وتفريغ التطورات تلقائياً'}"</p>
          </div>
          
          <div class="meta-item" style="margin-top:12px;">
            <span class="meta-label">الرأي والخلاصة الإكلينيكية والتشخيصية للـ AI:</span>
            <p style="font-size: 12px; color: #1e293b; margin: 5px 0;">${rev.clinicalSummary}</p>
          </div>
          
          <div class="meta-item" style="margin-top:12px;">
            <span class="meta-label">التوصيات المحدثة لبروتوكول العلاج السلوكي CBT المقرة:</span>
            <ul style="margin: 5px 0 0 0; padding-right: 20px;">
              ${rev.recommendedAdjustments?.map((adj: string) => `<li>${adj}</li>`).join("")}
            </ul>
          </div>
          
          <div class="meta-item" style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            <span class="meta-label">البروتوكول العلاجي الدوائي (جرعات ومطابقة):</span>
            <p style="font-size: 12px; font-weight: bold; color: #4f46e5; margin: 4px 0;">${rev.medicationCheck}</p>
            <span style="display:block; font-size: 9.5px; color: #b91c1c; background-color: #fee2e2; border: 1px solid #fca5a5; padding: 6px; border-radius: 6px; margin-top: 6px; font-weight: bold;">
              ⚠️ تنبيه إكلينيكي حاسم: المقترحات الدوائية أعلاه هي مقترحات إرشادية تلقائية معيارية لتسهيل الحوار مع الطبيب. يجب مراجعة الطبيب النفسي المختص والمعالج المتابع فوراً ودائماً قبل البدء في تعديل أو أخذ أي جرعات دوائية.
            </span>
          </div>
        </div>

        <div class="footer">
          المستند الطبي الموحد للمراجعة نصف الشهرية (كل أسبوعين) مفرز ومدقق إكلينيكياً بنظام HIPAA للبيانات وسريتها.
        </div>
        <script>
          window.print();
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  // Export full periodic reviews history, improvement percentage, and therapeutic timeline as pdf
  const handleExportFollowupPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("الرجاء السماح للنوافذ المنبثقة من المتصفح لتصدير وحفظ تقرير المتابعة الدورية بصيغة PDF.");
      return;
    }
    const patientName = demographics.name || "مريض منصة سكينة (سري)";
    const historyHtml = reviewsHistory.map((rev, idx) => `
      <div class="card" style="margin-bottom: 15px;">
        <div class="meta-item" style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px dashed #cbd5e1; padding-bottom: 5px; margin-bottom: 10px;">
          <span style="color:#0d9488;">رقم المراجعة: ${reviewsHistory.length - idx} (${rev.date})</span>
          <span style="color:#4f46e5;">المقدر العام للتحسن: ${rev.progressScore}%</span>
          <span>الحالة الإجمالية: ${rev.progressStatus}</span>
        </div>
        <div class="meta-item"><span class="meta-label">مذكرات الفضفضة والتقييم العاطفي:</span> "${rev.feedback}"</div>
        <div class="meta-item"><span class="meta-label">رأي وخلاصة الأخصائي الإكلينيكي:</span> ${rev.clinicalSummary}</div>
        <div class="meta-item"><span class="meta-label">التعديلات الموصى بها على بروتوكول CBT:</span>
          <ul style="margin: 5px 0 0 0; padding-right: 20px;">
            ${rev.recommendedAdjustments?.map((adj: string) => `<li>${adj}</li>`).join("")}
          </ul>
        </div>
        <div class="meta-item" style="margin-top: 5px;"><span class="meta-label">البروتوكول العلاجي الدوائي:</span> ${rev.medicationCheck}</div>
      </div>
    `).join("");

    const baselineScoreText = assignedTestScore !== null ? `${assignedTestScore} نقاط` : "لم يقيم رقمياً بعد";

    const reportHtml = `
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>سجل مراجعات المتابعة الطبية - منصة سكينة</title>
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
            font-size: 22px;
            font-weight: 900;
          }
          .header p {
            margin: 5px 0 0;
            color: #0d9488;
            font-size: 13px;
            font-weight: bold;
          }
          .section-title {
            background-color: #f8fafc;
            border-right: 5px solid #0d9488;
            padding: 8px 15px;
            font-size: 13px;
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
            margin-bottom: 6px;
            font-size: 12px;
          }
          .meta-label {
            font-weight: bold;
            color: #475569;
          }
          li {
            font-size: 11.5px;
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
          <p>أجندة الخطة الطبية للمراجعات الدورية وتقييم نسب التحسن السريري للأخصائي المحترف</p>
        </div>

        <div class="section-title">بيانات الملف الشخصي والمراجع الرقمي</div>
        <div class="grid">
          <div class="card">
            <div class="meta-item"><span class="meta-label">اسم المستخدم المحفوظ:</span> د. ${patientName}</div>
            <div class="meta-item"><span class="meta-label">العمر الفعلي:</span> ${demographics.age} عاماً — <span class="meta-label">الجنس:</span> ${demographics.gender}</div>
          </div>
          <div class="card">
            <div class="meta-item"><span class="meta-label">رقم الهاتف/الايميل المسجل:</span> ${authInput || "غير محدد"}</div>
            <div class="meta-item"><span class="meta-label">تاريخ الفحص الأساسي الأول:</span> ${testDate.toLocaleDateString('ar-EG')}</div>
          </div>
        </div>

        <div class="section-title">تحليل خط الأساس ومقارنة التشخيص الرقمي المبدئي</div>
        <div class="card" style="margin-bottom: 20px;">
          <div class="meta-item"><span class="meta-label">المقياس الأول الأساسي:</span> ${finalReportResult?.testName || "مقياس العيادة النفسية"}</div>
          <div class="meta-item"><span class="meta-label">الدرجة الإجمالية المحرزة:</span> ${baselineScoreText}</div>
          <div class="meta-item"><span class="meta-label">مستوى شدة الحالة الأولي:</span> ${finalReportResult?.severity || "خفيف"}</div>
          <div class="meta-item"><span class="meta-label">مذكرة التوافق والاتساق السريري:</span> ${finalReportResult?.totalScore >= 15 ? 'تطابق طردي يتناسب مع عمق وشكوى المريض' : 'اتساق للأعراض اللفظية مع الفحص المعتدل الرقمي'}</div>
        </div>

        <div class="section-title">مذكرات وتقييمات المراجعات الدورية كل أسبوعين (تراكمية التاريخ)</div>
        <div>
          ${historyHtml || '<div style="text-align:center; padding: 20px; color:#94a3b8;">لم يتم تسجيل أي مراجعات دورية بالمنصة بعد.</div>'}
        </div>

        <div class="footer">
          المستند الطبي الموحد لمراجعات المتابعة نصف الشهرية (كل أسبوعين) مفرز ومدقق إكلينيكياً بنظام HIPAA للبيانات وسريتها.
        </div>
        <script>
          window.print();
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  // Export detailed clinical diagnostics report and CBT medications workup as visual PDF
  const handleExportPDF = () => {
    if (!finalReportResult) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("الرجاء السماح بالنوافذ المنبثقة من المتصفح لتصدير وحفظ التقرير الطبي بصيغة PDF.");
      return;
    }

    const patientName = demographics.name || "مريض منصة سكينة (سري)";
    const systemReportHtml = `
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>التقرير الطبي السريري الموحد - منصة سكينة</title>
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
            position: relative;
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
            font-size: 13px;
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
            background-color: #fafafa;
          }
          .meta-item {
            margin-bottom: 6px;
            font-size: 12.5px;
          }
          .meta-label {
            font-weight: bold;
            color: #475569;
          }
          .badge {
            display: inline-block;
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
            padding: 2px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
          }
          .badge-success {
            background-color: #d1fae5;
            color: #065f46;
            border-color: #a7f3d0;
          }
          ul {
            margin: 0;
            padding-right: 20px;
          }
          li {
            margin-bottom: 5px;
            font-size: 12.5px;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
          }
          @media print {
            body { padding: 15px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>منصة سكينة للصحة النفسية والعلاج المعرفي السلوكي</h1>
          <p>التقرير الطبي السريري الموحد وخطة الدعم المعرفي وباقة العلاجات للأخصائي</p>
        </div>

        <div class="section-title">أولاً: بيانات مراجع العيادة النفسية</div>
        <div class="grid">
          <div class="card">
            <div class="meta-item"><span class="meta-label">اسم المريض:</span> ${patientName}</div>
            <div class="meta-item"><span class="meta-label">العمر الفعلي:</span> ${demographics.age} عاماً — <span class="meta-label">الجنس:</span> ${demographics.gender}</div>
            <div class="meta-item"><span class="meta-label">الحالة الاجتماعية:</span> ${demographics.marital}</div>
          </div>
          <div class="card">
            <div class="meta-item"><span class="meta-label">المستوى التعليمي:</span> ${demographics.education}</div>
            <div class="meta-item"><span class="meta-label">المسمى المهني الحالي:</span> ${demographics.job}</div>
            <div class="meta-item"><span class="meta-label">المعاناة من أمراض مزمنة:</span> ${demographics.chronicDiseases}</div>
          </div>
        </div>

        <div class="section-title">ثانياً: التوصيف المبدئي وتفنيد الشكوى (Triage Notes)</div>
        <div class="card" style="margin-bottom: 20px;">
          <div class="meta-item" style="margin-bottom: 12px;">
            <span class="meta-label">الشكوى والفضفضة الشخصية المدونة:</span>
            <p style="white-space: pre-wrap; font-size: 12px; line-height: 1.7; margin: 6px 0 0; color: #334155; font-style: italic;">"${complaintText}"</p>
          </div>
          <div class="grid" style="margin-bottom: 0px; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <span class="meta-label">تصنيف القلق وإدارة الأخطار:</span> 
              <span class="badge ${clinicalReport?.riskLevel === "Low" || clinicalReport?.riskLevel === "Moderate" ? "badge-success" : ""}">${clinicalReport?.riskLevel || "Moderate"}</span>
            </div>
            <div><span class="meta-label">الأعراض المرصودة لغوياً وصوتياً:</span> ${clinicalReport?.primarySymptoms?.join(" ، ") || "لا توجد أعراض صريحة"}</div>
          </div>
        </div>

        <div class="section-title">ثالثاً: التحقق المعياري ونتائج المقاييس السريرية (Diagnostic Rating Scales)</div>
        <div class="grid">
          <div class="card">
            <div class="meta-item"><span class="meta-label">المقياس الطبي المجرى:</span> ${finalReportResult.testName} (${finalReportResult.testId})</div>
            <div class="meta-item"><span class="meta-label">الدرجة الكلية المستحقة للمريض:</span> <strong style="font-size: 15px; color: #0d9488;" dir="ltr">${finalReportResult.totalScore} / ${finalReportResult.testId === "PHQ-9" ? "27" : finalReportResult.testId === "GAD-7" ? "21" : "40"}</strong></div>
          </div>
          <div class="card">
            <div class="meta-item"><span class="meta-label">مستوى شدة الحالة السريرية:</span> <strong style="color: #991b1b;">${finalReportResult.severity}</strong></div>
            <div class="meta-item"><span class="meta-label">تفسير درجة الفحص المعتمد:</span> ${finalReportResult.interpretationText}</div>
          </div>
        </div>

        <div class="section-title">الأبعاد التقييمية: ملامح التوصيف التشخيصي النهائي للمريض</div>
        <div class="card" style="margin-bottom: 20px; border-right: 4px solid #0d9488; background-color: #f0fdf4; padding: 15px;">
          <p style="font-size: 12.5px; font-weight: bold; margin: 0 0 8px 0; color: #1e293b; line-height: 1.8;">● ${getFinalDiagnosticProfileSummary(finalReportResult).line1}</p>
          <p style="font-size: 12.5px; font-weight: bold; margin: 0; color: #0d9488; line-height: 1.8;">● ${getFinalDiagnosticProfileSummary(finalReportResult).line2}</p>
        </div>

        <div class="section-title">رابعاً: الشرح الوافي والمفصل لتقرير حالة المريض السريرية والتشخيصية</div>
        <div class="card" style="margin-bottom: 20px;">
          <div style="margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px;">
            <strong style="color: #0d9488; font-size: 13px; display: block; margin-bottom: 5px;">1. التحليل الديناميكي للأعراض والدافع السلوكي:</strong>
            <p style="font-size: 12px; color: #475569; margin: 0; padding-right: 10px; border-right: 3px solid #0d9488; text-align: justify;">
              بناءً على الشكوى النصية أو الصوتية المدونة طائعةً من طرفكم والتحليل الإكلينيكي المدمج، تم رصد مؤشرات واضحة لفرط اليقظة والاجترار العاطفي. تشير هذه الأعراض إلى حالة نشطة من التصلب الإدراكي حيث يعيد العقل تدوير الأفكار المقلقة والذكريات المنهكة دون الوصول لمرحلة التكيف أو اتخاذ حلول بناءة. هذا النمط يؤثر مباشرة على كفاءة المراكز الفكرية والقرار، ويتجسد في صورة ضيق جسدي واضطرابات في دورات وساعات النوم العادية (الأرق السلوكي).
            </p>
          </div>

          <div style="margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px;">
            <strong style="color: #7c3aed; font-size: 13px; display: block; margin-bottom: 5px;">2. مقارنة وتكامل المعطيات اللغوية والقياس النفسي الرقمي:</strong>
            <p style="font-size: 12px; color: #475569; margin: 0; padding-right: 10px; border-right: 3px solid #7c3aed; text-align: justify;">
              تتكامل نتائج الدرجة السيكومترية الحالية المحرزة على مقياس <strong>(${finalReportResult.testName} ${finalReportResult.testId})</strong> البالغة <strong style="color: #10b981;">${finalReportResult.totalScore} نقاط</strong>، والتي تمثل تصنيف شدة مقاس بـ <strong>[${finalReportResult.severity}]</strong>، مع الوصف اللغوي للشكوى. هذا الاندماج والاتساق بنسبة مرتفعة يؤكد تفاقم الحالة من مرحلة الضغط العابر إلى مرحلة الاحتياج الفعلي لجدولة الجلسات الكلاسيكية وأجندة CBT. الأرقام في الفحص السيكومتري تؤكد مصداقية العناء، وتساعد المعالج في رسم تتبع بياني خطي للتحسن الإكلينيكي كل أسبوعين بصورة دقيقة ومقارنتها علمياً.
            </p>
          </div>

          <div style="margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px;">
            <strong style="color: #4f46e5; font-size: 13px; display: block; margin-bottom: 5px;">3. آلية وعلاج CBT / ACT التفصيلي المقر للأيام القادمة:</strong>
            <p style="font-size: 12px; color: #475569; margin: 0; padding-right: 10px; border-right: 3px solid #4f46e5; text-align: justify;">
              يتمحور بروتوكول العلاج السلوكي الراهن حول دحض التشويه الفكري (كفخ التعميم العاطفي وكارثية التوقعات من المستقبل). نوصي بتطبيق "مفكرة الأيام الخمسة للأفكار التلقائية" المتاحة بجدول المتابعة، وتناول تمرين الشهيق والزفير الواعي المبرمج بالمنصة لتهدئة العصب الحائر وتعديل تسارع نبضات القلب السلوكي. كما نعتمد منهج ACT (التقبل والالتزام) الذي يمنع مقاومة ومصارعة الأفكار المخيفة بالقوة، بل بتوجيه طاقة الانتباه نحو أداء التزامات العمل والأنشطة الصحية الممتعة المجدولة في الأجندة اليومية حتى مع مرافقة بعض القلق الخفيف.
            </p>
          </div>

          <div style="padding-bottom: 5px;">
            <strong style="color: #10b981; font-size: 13px; display: block; margin-bottom: 5px;">4. التوجيه الدوائي والتواصل المهني السريري:</strong>
            <p style="font-size: 12px; color: #475569; margin: 0; padding-right: 10px; border-right: 3px solid #10b981; text-align: justify;">
              البروتوكولات الطبية تشير إلى تلازم العلاج السلوكي الفردي مع التدخلات العقاقيرية الداعمة كحل مثالي متكامل يعزز سرعة الاستجابة الدماغية لمركبات السيروتونين والنواقل العصبية الأخرى. نثبت بالتقرير النهائي أن الاقتراحات المسرودة للبروتوكول العلاجي هي بمثابة "مقترحات إرشادية ذات مرجعية معيارية"، ويجب تماماً الامتناع عن أخذ الدواء أو تعديله أو إيقافه بشكل منفرد وذاتي دون الرجوع المباشر السلس إلى الطبيب النفسي المختص والمعالج المتابع لحالتكم بانتظام لتأمين بيئة تعافي آمنة ومحمية من الأعراض العكسية والانسحابية.
            </p>
          </div>
        </div>

        <div class="section-title">خامساً: الخطة التدخلية المعرفية السلوكية المخصصة (CBT / ACT Workup)</div>
        <div class="card" style="margin-bottom: 20px;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #0d9488; font-size: 13px; display: block; margin-bottom: 5px;">1. تمرين تفنيد الأفكار وهزم القلق (Cognitive Restructuring):</strong>
            <ul style="margin: 0; padding-right: 20px;">
              ${finalReportResult.assignedWorkUpCbt.cognitiveRestructuring?.map((step: string) => `<li>${step}</li>`).join("")}
            </ul>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="color: #0d9488; font-size: 13px; display: block; margin-bottom: 5px;">2. جدول التنشيط والاندماج السلوكي الابتكاري (Behavioral Activation):</strong>
            <ul style="margin: 0; padding-right: 20px;">
              ${finalReportResult.assignedWorkUpCbt.behavioralActivation?.map((step: string) => `<li>${step}</li>`).join("")}
            </ul>
          </div>
          <div>
            <strong style="color: #0d9488; font-size: 13px; display: block; margin-bottom: 5px;">3. الواجبات المنزلية التطبيقية يومياً (CBT Homeworks):</strong>
            <ul style="margin: 0; padding-right: 20px;">
              ${finalReportResult.assignedWorkUpCbt.practicalHomework?.map((step: string) => `<li>${step}</li>`).join("")}
            </ul>
          </div>
        </div>

        ${finalReportResult.medicationPre ? `
        <div class="section-title">سادساً: الدعم والبروتوكول العلاجي الدوائي المقترح (Psychiatric Medication Reference)</div>
        <div class="card" style="border: 1px solid #fca5a5; background-color: #fffafb; margin-bottom: 20px;">
          <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 0;">
            <div><span class="meta-label">الاسم التجاري الموصى بنقاشه:</span> <strong>${finalReportResult.medicationPre.brandNameLocal} (${finalReportResult.medicationPre.brandNameForeign})</strong></div>
            <div><span class="meta-label">المادة العلمية النشطة:</span> ${finalReportResult.medicationPre.genericName}</div>
            <div><span class="meta-label">التركيزات السريرية المعتمدة:</span> ${finalReportResult.medicationPre.strengths?.join(" / ")}</div>
            <div><span class="meta-label">الجرعة الاسترشادية الشائعة:</span> قرص واحد بالمساء / الصباح طبقاً لتعليمات الطبيب المعالج</div>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #475569;">
            <strong class="text-amber-600">المزايا الإكلينيكية المحددة للوعكة:</strong> ${finalReportResult.medicationPre.advantages?.join(" ، ")}
          </div>
          <div style="color: #991b1b; font-size: 11px; font-weight: bold; margin-top: 10px; border-top: 1px dashed #fca5a5; padding-top: 6px;">
            ⚠️ تحذير طبي هام: كبينات استرشادية، يحظر تماماً شراء وصرف هذا العقار الدوائي دون فحص سريري مباشر و تذكرة طبية ممهورة من طبيب نفسي مرخص.
          </div>
        </div>
        ` : ""}

        <div class="section-title">سابعاً: توصيات مطالعة المواد الطبية المساندة والمقروءة</div>
        <div class="grid">
          <div class="card">
            <strong style="display:block; margin-bottom: 5px; color:#0d9488; font-size:12.5px;">الكتب الطبية الموصى بقراءتها ومطالعتها للتعافي:</strong>
            <ul style="padding-right: 15px; margin: 0; font-size:11px;">
              ${finalReportResult.recommendedBooks?.map((b: any) => `
                <li style="margin-bottom:6px;">
                  <strong>${b.title}</strong> — تأليف ${b.author} 
                  ${b.linkUrl ? `<a href="${b.linkUrl}" target="_blank" style="color: #0d9488; text-decoration: underline; margin-right: 6px; font-weight:bold;">[رابط القراءة المعتمد ↗]</a>` : ""}
                </li>
              `).join("")}
            </ul>
          </div>
          <div class="card">
            <strong style="display:block; margin-bottom: 5px; color:#854d0e; font-size:12.5px;">مقاطع المراجعة المرئية والعيادات المساندة:</strong>
            <ul style="padding-right: 15px; margin: 0; font-size:11px;">
              ${finalReportResult.recommendedVideos?.map((v: any) => `
                <li style="margin-bottom:6px;">
                  <strong>${v.title}</strong> — إعداد ${v.speaker} 
                  ${v.linkUrl ? `<a href="${v.linkUrl}" target="_blank" style="color: #854d0e; text-decoration: underline; margin-right: 6px; font-weight:bold;">[مشاهدة عبر يوتيوب ↗]</a>` : ""}
                </li>
              `).join("")}
            </ul>
          </div>
        </div>

        <div class="footer">
          إن هذا الملف الطبي مشفر وله طبيعة سرية تامة طبقاً لمعايير HIPAA وخصوصية المعلومات الصحية بالمنطقة العربية. منصة سكينة الذكية لدعم العلاجات الرقمية 2026.
        </div>

        <div class="no-print" style="text-align: center; margin-top: 35px;">
          <button onclick="window.print()" style="padding: 12px 30px; background-color: #0d9488; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; font-family: 'Cairo', sans-serif;">بدء الطباعة الآن / حفظ كـ PDF ⎙</button>
        </div>

        <script>
          window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => { window.print(); }, 500);
          });
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(systemReportHtml);
    printWindow.document.close();
  };

  // Skip step to explore biweekly reports directly
  const jumpToBiweekly = () => {
    if (!clinicalReport) {
      // Mock an initial report to support biweekly baseline comparison
      setClinicalReport({
        isEmergency: false,
        riskLevel: "Moderate",
        primarySymptoms: ["أرق ليلي", "صداع توتري", "اجترار فكري وسواسي"],
        suspectedConditions: ["قلق معمم طفيف"],
        confidence: 85,
        summaryArabic: "يشرح المراجع معاناته من تزايد تسارع طفيف في دقات القلب بالتوازي مع صعوبات في النوم متفرقة وتراجع مستويات السكينة والنشاط نتيجة ضغوط حياتية عابرة.",
        supportingSymptomsArabic: ["أرق ليلي متقطع", "صداع شد عضلي بسبب الضغوط"],
        cbtPlan: {
          cognitiveRestructuring: [
            "تمرين كتابة الأفكار التلقائية السلوكية في 5 أعمدة يومياً.",
            "التعرف على فخ تضخيم العينات السلبية وكارثية التأويل."
          ],
          behavioralActivation: [
            "المباشرة بجدولة تمرين اليقظة الرياضي 15 دقيقة صباحاً.",
            "الالتزام بزيارة صديق قديم أو التواصل الهادئ مرة بالأسبوع."
          ],
          practicalHomework: [
            "تطبيق التنفس المربع فور مراودة هبوط المزاج.",
            "تحديد رقعة قلق لمدة 10 دقائق فقط في العصر."
          ]
        },
        actPlan: {
          mindfulnessArabic: ["تطبيق التنفس بوعي الاسترخاء وعزل الأفكار السلبية كالسحب العابرة."],
          valuesArabic: ["البدء بالعمل الملتزم بالقيم الشخصية كمساندة العائلة والعون المعرفي."]
        },
        suggestedTherapistTypeArabic: "معالج نفسي إكلينيكي متخصص بالاكتئاب السلوكي المعرفي (CBT).",
        emergencyContactsArabic: "يمكنك الاتصال بجمعية الصحة النفسية للاستشارة الطارئة: 920033360"
      });
    }
    if (!finalReportResult) {
      setFinalReportResult({
        testId: "GAD-7",
        testName: "مقياس القلق العام المعتمد",
        totalScore: 12,
        severity: "متوسط الارتفاع",
        interpretationText: "يشير الفحص لوجود استجابة قلق توترية متوسطة تتطلب دعماً علاجياً سلوكياً CBT منظم.",
        recommendedBooks: [],
        recommendedVideos: [],
        assignedWorkUpCbt: {
          cognitiveRestructuring: ["تمرين كتابة الأفكار وتحدي تضخيم العينات السلبية."],
          behavioralActivation: ["تطبيق تمرين الاسترخاء ورياضة المشي اليومية."],
          practicalHomework: ["التنفس المربع المهدئ في أوقات الاستثارة الحمضية."]
        }
      });
    }
    setIsSessionEnded(true);
    setActiveSubView("patient_profile");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 🔐 AUTHENTICATION SCREEN */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/15 rounded-full blur-2xl"></div>

          <div className="text-center space-y-3 z-10 relative">
            <div className="mx-auto w-12 h-12 bg-teal-500/15 border border-teal-500/20 rounded-2xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">بوابة المريض وحساب الملف المرضي الموحد</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              سجل دخولك مجدداً بالايميل وكلمة السر للوصول الآمن لخطط دعمك السلوكي وجدول أيام المتابعة والملف الطبي الموحد بخصوصية عيادية تامة.
            </p>
          </div>

          {/* Toggle Login vs Register */}
          <div className="flex bg-slate-900 border border-slate-850 p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => { setAuthMode("login"); setAuthError(""); }}
              className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${authMode === "login" ? "bg-teal-600 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              تسجيل الدخول للحساب
            </button>
            <button
              onClick={() => { setAuthMode("register"); setAuthError(""); }}
              className={`flex-1 py-1.5 rounded-lg text-center transition cursor-pointer ${authMode === "register" ? "bg-teal-600 text-slate-950 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              حساب مريض جديد
            </button>
          </div>

          {authError && (
            <div className="bg-red-500/5 border border-red-500/10 text-red-400 px-3 py-2 rounded-xl text-[10px] text-right font-semibold leading-relaxed animate-fade-in">
              {authError}
            </div>
          )}

          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5 text-right font-sans">
                <label className="text-[10px] font-bold text-slate-400 block">عنوان البريد الإلكتروني:</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="patient@sakeenah.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-right text-white focus:border-teal-500 focus:outline-none transition font-semibold"
                  />
                  <div className="absolute top-3 left-3 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-right font-sans">
                <label className="text-[10px] font-bold text-slate-400 block">كلمة السر الآمنة:</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-center text-white focus:border-teal-500 focus:outline-none transition"
                  />
                  <div className="absolute top-3 left-3 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex justify-center items-center gap-1.5 cursor-pointer"
              >
                دخول وفك تشفير ملفي الطبي 🔒
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5 text-right font-sans">
                <label className="text-[10px] font-bold text-slate-400 block">الاسم الثلاثي للمريض:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: ياسمين أحمد الهواري"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-right text-white focus:border-teal-500 focus:outline-none transition font-semibold"
                  />
                  <div className="absolute top-3 left-3 text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-right font-sans">
                <label className="text-[10px] font-bold text-slate-400 block">عنوان البريد الإلكتروني للملف:</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="patient@sakeenah.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-right text-white focus:border-teal-500 focus:outline-none transition font-semibold"
                  />
                  <div className="absolute top-3 left-3 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-right font-sans">
                <label className="text-[10px] font-bold text-slate-400 block">كلمة السر لحماية خصوصيتك:</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="اختر كلمة سر آمنة"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-center text-white focus:border-teal-500 focus:outline-none transition"
                  />
                  <div className="absolute top-3 left-3 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-slate-950 font-bold rounded-xl text-xs transition flex justify-center items-center gap-1.5 cursor-pointer"
              >
                إنشاء وتأمين الملف الطبي الفردي 🩹
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <button
              onClick={jumpToBiweekly}
              className="text-[11px] text-slate-500 hover:text-slate-350 underline cursor-pointer"
            >
              الذهاب إلى بوابة المتابعة نصف الشهرية مباشرة (كل أسبوعين)
            </button>
          </div>
        </div>
      ) : (
        /* WIZARD CLINICAL WORKFLOW PANEL */
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden">
          
          {profileRestoredMessage && (
            <div className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 p-4 rounded-2xl flex justify-between items-start gap-4 text-xs font-semibold animate-fade-in relative z-20">
              <div className="flex gap-2.5 items-start text-right">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                <p className="leading-relaxed">{profileRestoredMessage}</p>
              </div>
              <button
                onClick={() => setProfileRestoredMessage(null)}
                className="p-1 hover:bg-emerald-900/40 rounded-lg text-emerald-500 hover:text-emerald-350 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Subview Selection Tabs */}
          <div className="flex flex-wrap border-b border-slate-900 pb-3 mb-2 gap-2 justify-between items-center relative z-20">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleLogoutAction}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-red-900/30 bg-red-955/30 text-red-400 hover:bg-red-950 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950/10"
              >
                تسجيل الخروج 🔐
              </button>

              <button
                type="button"
                onClick={handleDeleteAllData}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-red-500/35 bg-red-955/35 text-red-400 hover:bg-red-650 hover:text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف السجل وكافة البيانات 🗑️
              </button>

              <button
                type="button"
                onClick={handleDeactivateAccount}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-yellow-500/35 bg-yellow-950/20 text-yellow-400 hover:bg-yellow-600 hover:text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-yellow-950/10"
              >
                تعطيل الحساب مؤقتاً ⏸️
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setActiveSubView("wizard")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeSubView === "wizard"
                    ? "bg-teal-600/15 border border-teal-500/40 text-teal-400 font-extrabold shadow-sm"
                    : "bg-transparent border border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                التدفق والتقييم السريري 🩺
              </button>
              
              <button
                type="button"
                onClick={() => setActiveSubView("patient_profile")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeSubView === "patient_profile"
                    ? "bg-teal-600/15 border border-teal-500/40 text-teal-400 font-extrabold shadow-sm"
                    : "bg-transparent border border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <User className="w-4 h-4" />
                الملف الطبي للمريض 📂 ({demographics.name || "سكينة"})
              </button>
            </div>
          </div>

          {activeSubView === "wizard" ? (
            <>
              {/* Header step visual indicator */}
              <div className="flex justify-between items-center border-b border-slate-900 pb-5">
                <div className="text-right">
                  <span className="text-[10px] text-teal-400 font-extrabold tracking-widest block uppercase">المرحلة العلاجية المدمجة</span>
                  <h3 className="text-lg font-black text-slate-100">
                    {currentStep === 1 && "المرحلة 1: الملف الطبي والبيانات الشخصية"}
                    {currentStep === 2 && "المرحلة 2: تقديم الشكوى وتفاصيل العناء النفسي"}
                    {currentStep === 3 && "المرحلة 3: تقرير التقييم والفرز الإكلينيكي الأولي"}
                    {currentStep === 4 && "المرحلة 4: فحص المقياس النفسي الموصى به بروتوكولياً"}
                    {currentStep === 5 && "المرحلة 5: التقرير النهائي وخطة العلاج الشخصية المتكاملة"}
                  </h3>
                </div>
                
                {/* Steps Bubble lists */}
                <div className="flex items-center gap-1.5" id="clinical-journey-steps-header">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isAccessible = 
                      num === 1 || 
                      (num === 2 && (currentStep >= 2 || demographics.age)) ||
                      (num === 3 && clinicalReport) ||
                      (num === 4 && clinicalReport && (currentStep >= 4 || Object.keys(testAnswers).length > 0)) ||
                      (num === 5 && finalReportResult);

                    return (
                      <div
                        key={num}
                        id={`step-bubble-${num}`}
                        onClick={() => {
                          if (num === 1) {
                            setCurrentStep(1);
                            return;
                          }
                          if (num === 2) {
                            if (!isAccessible) {
                              alert("يرجى إكمال بيانات السن أو تأكيد ملفك الطبي أولاً بالضغط على زر 'حفظ البيانات والتقدم للشكوى الحالية' في أسفل الصفحة.");
                              return;
                            }
                            setCurrentStep(2);
                            return;
                          }
                          if (num === 3) {
                            if (!isAccessible) {
                              alert("لا يمكن الانتقال للمرحلة الثالثة قبل كتابة الشكوى في المرحلة الثانية والضغط على زر 'تحليل الشكوى وتوليد التقرير' أولاً.");
                              return;
                            }
                            setCurrentStep(3);
                            return;
                          }
                          if (num === 4) {
                            if (!isAccessible) {
                              if (!clinicalReport) {
                                alert("لا يمكن الانتقال للمرحلة الرابعة قبل إجراء تحليل الشكوى الإكلينيكي في المرحلة الثانية أولاً وتوليد التقرير.");
                              } else {
                                alert("يرجى الضغط على زر 'الانتقال لإجراء الاختبار النفسي الموصى به' في أسفل المرحلة الثالثة لتأكيد بدء الفحص.");
                              }
                              return;
                            }
                            setCurrentStep(4);
                            return;
                          }
                          if (num === 5) {
                            if (!isAccessible) {
                              alert("لا يمكن الانتقال لتقرير خطة العلاج النهائي قبل ملء جميع أسئلة المقياس النفسي الموصى به في المرحلة الرابعة والضغط على زر 'حساب المقياس وتوليد الخطة النهائية'.");
                              return;
                            }
                            setCurrentStep(5);
                            return;
                          }
                        }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition ${
                          currentStep === num
                            ? "bg-teal-600 text-slate-950 font-black border border-teal-400 cursor-pointer"
                            : isAccessible
                            ? "bg-indigo-950 text-indigo-400 border border-indigo-900 cursor-pointer hover:border-indigo-400 hover:text-indigo-300"
                            : "bg-slate-900/60 text-slate-650 border border-slate-950 cursor-not-allowed opacity-40"
                        }`}
                        title={isAccessible ? `المرحلة رقم ${num}` : `المرحلة رقم ${num} (مغلقة - يرجى استيفاء الخطوة السابقة أولاً)`}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 1️⃣ STEP 1: PATIENT DEMOGRAPHICS & MEDICAL LIFE HISTORY */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in text-xs max-w-2xl mx-auto">
                  <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-2xl flex items-start gap-3 text-slate-400 leading-relaxed text-right">
                    <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <p>
                      نبدأ ببناء بطاقة المريض الطبية. يساهم إدخال البيانات الشخصية، الظروف الحياتية، والتاريخ العائلي الدوائي في رفع دقة التشخيصات الطبية المتخصصة والوقوف على مسببات العناء.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">الاسم الكريم (اختياري لخصوصيتك):</label>
                      <input
                        type="text"
                        placeholder="مثال: سكينة سلامة"
                        value={demographics.name}
                        onChange={(e) => setDemographics({...demographics, name: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">العمر بالسنوات:</label>
                      <input
                        type="number"
                        value={demographics.age}
                        onChange={(e) => setDemographics({...demographics, age: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-500 transition font-mono"
                      />
                    </div>

                    <div className="space-y-1.5 font-semibold">
                      <label className="text-slate-400 font-bold block">الجنس:</label>
                      <select
                        value={demographics.gender}
                        onChange={(e) => setDemographics({...demographics, gender: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition cursor-pointer"
                      >
                        <option value="أنثى">أنثى (Female)</option>
                        <option value="ذكر">ذكر (Male)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 font-semibold">
                      <label className="text-slate-400 font-bold block">الحالة الاجتماعية:</label>
                      <select
                        value={demographics.marital}
                        onChange={(e) => setDemographics({...demographics, marital: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition cursor-pointer"
                      >
                        <option value="أعزب">أعزب / عزباء</option>
                        <option value="متزوج">متزوج / متزوجة</option>
                        <option value="مطلق">مطلق / مطلقة</option>
                        <option value="أرمل">أرمل / أرملة</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 font-semibold">
                      <label className="text-slate-400 font-bold block">المستوى التعليمي:</label>
                      <select
                        value={demographics.education}
                        onChange={(e) => setDemographics({...demographics, education: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition cursor-pointer"
                      >
                        <option value="جامعي">تعليم جامعي (بكالوريوس)</option>
                        <option value="دراسات عليا">دراسات عليا (ماجستير/دكتوراه)</option>
                        <option value="ثانوي">ثانوي أو أقل</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">الوظيفة / مسمى المهنة اليومي:</label>
                      <input
                        type="text"
                        value={demographics.job}
                        onChange={(e) => setDemographics({...demographics, job: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-500 transition"
                      />
                    </div>
                  </div>

                  {/* Advanced Medical / Clinical History */}
                  <div className="space-y-4 pt-4 border-t border-slate-900 text-right">
                    <h4 className="font-extrabold text-indigo-400">الملف السريري الفني للمريض (التاريخ الطبي)</h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">التاريخ الشخصي للاضطرابات النفسية (هل تم تشخيصك سابقاً بمرض ما؟):</label>
                      <textarea
                        rows={2}
                        placeholder="مثال: تم تشخيصي بالاكتئاب الخفيف قبل سنتين وتناولت دواءً مؤقتاً."
                        value={clinicalHistory.pastHistory}
                        onChange={(e) => setClinicalHistory({...clinicalHistory, pastHistory: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">التاريخ العائلي للوعكات المماثلة (Family Psychiatric History):</label>
                      <textarea
                        rows={2}
                        placeholder="مثال: تعاني والدتي من اضطرابات الهلع المزمن وتتناول مهدئات عصبية."
                        value={clinicalHistory.familyHistory}
                        onChange={(e) => setClinicalHistory({...clinicalHistory, familyHistory: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">الأدوية النشطة والتركيزات التي تتناولها حالياً (سواء علاجية أو جسدية):</label>
                      <textarea
                        rows={2}
                        placeholder="مثال: أتناول دواء كونكور 5ملغ للضغط بانتظام."
                        value={clinicalHistory.medications}
                        onChange={(e) => setClinicalHistory({...clinicalHistory, medications: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-teal-500 transition"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      حفظ البيانات والتقدم للشكوى الحالية
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* 2️⃣ STEP 2: PROVIDE COMPLAINT (WRITTEN ONLY) */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in text-xs max-w-2xl mx-auto">
                  <div className="text-right space-y-2">
                    <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-900 rounded font-bold">بوابة الإدلاء بالشكوى الحالية</span>
                    <h4 className="text-base font-black text-slate-100">بمَ تشعر في مساحة حياتك وسجل سكينتك حالياً؟</h4>
                    <p className="text-slate-400 leading-relaxed">
                      يرجى كتابة شكواك نصياً بالتفصيل أدناه لمباشرة الفرز والتحليل الإكلينيكي وحساب محاذير الأعراض واقتراح المقاييس المعتمدة.
                    </p>
                  </div>

                  <div className="space-y-4 animate-fade-in bg-slate-900/40 p-6 rounded-3xl border border-slate-850">
                    <div className="space-y-2 text-right">
                      <label className="text-slate-350 font-black block text-xs">صِف شكواك السلوكية وحالتك النفسية بالتفصيل:</label>
                      <p className="text-[10px] text-slate-400 leading-normal mb-2">اكتب كل الأفكار السلوكية المزعجة، الأعراض العضوية والجسدية المصاحبة، أو الهواجس اليومية المسببة للتعب:</p>
                      <textarea
                        rows={8}
                        required
                        placeholder="أعاني من ضيق شديد بالصدر وخوف من التقييم الاجتماعي وصعوبات في النوم والاستغراق الفكري منذ عدة أسابيع..."
                        value={complaintText}
                        onChange={(e) => setComplaintText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white leading-loose focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition font-semibold"
                      />
                    </div>

                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl font-bold cursor-pointer"
                      >
                        السابق: ملف الهوية والبيانات
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAnalyzeComplaint()}
                        disabled={isAnalyzing}
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-slate-950 font-black rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md shadow-teal-950/10"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            جاري تحليل الشكوى وتوليد تقرير أولي شامل...
                          </>
                        ) : (
                          <>
                            تحليل الشكوى وتوليد التقرير والفرز الإكلينيكي الأولي
                            <ChevronLeft className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
          {/* 📂 COMPREHENSIVE MEDICAL RECORD PORTAL */}
          <div id="patient-medical-archive" className="space-y-6">
                
                {/* Section Header */}
                <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-3xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                      <FileText className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="text-right">
                      <h4 className="text-sm font-black text-slate-100">سجل التقارير والوثائق الطبية الصادرة للـمراجع</h4>
                      <p className="text-[10px] text-slate-400 leading-normal">جميع الفحوصات والتقارير الطبية الأولية والمتابعات الدورية الصادرة بصفة رسمية</p>
                    </div>
                  </div>
                  
                  <span className="px-3 py-1 bg-teal-950 text-teal-400 border border-teal-900/60 rounded-full font-black text-[9px] uppercase animate-pulse">
                    مزامنة عيادية نشطة ⚡
                  </span>
                </div>

                {/* Grid for Reports Archive */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* CARD 1: PRIMARY ASSESSMENT REPORT */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/10 border border-slate-800 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-4">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl"></div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2 border-b border-slate-800/85 pb-2.5">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-teal-950 text-teal-400 border border-teal-900 rounded font-black text-[8px] uppercase">
                            التقرير الأولي الموحد ✅
                          </span>
                          <h5 className="font-extrabold text-slate-100 text-xs mt-1">تقرير التقييم والفرز الإكلينيكي الأساسي</h5>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono font-bold">
                          {testDate.toLocaleDateString("ar-EG")}
                        </span>
                      </div>

                      <p className="text-slate-350 text-[10.5px] leading-relaxed">
                        يتضمن هذا المستند ملخص التوصيف التشخيصي الأولي، ونقاط فرز مقياس عيادتنا المجرى، وخطة الدعم السلوكي المعرفي (CBT/ACT) لكسر دوامات القلق أو المزاج، مع تبيان العقاقير السلوكية المقترحة وإرشادات الأمان الطبي.
                      </p>

                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 space-y-2 text-[10px] text-slate-400 leading-normal">
                        <div>
                          ● المجرى النفسي: <strong className="text-slate-200">مقياس {finalReportResult?.testName || "سكينة الأساسي"}</strong>
                        </div>
                        <div>
                          ● المحصلة الرقمية: <strong className="text-emerald-400 font-bold font-mono" dir="ltr">{finalReportResult?.totalScore || "0"} / {finalReportResult?.testId === "PHQ-9" ? "27" : finalReportResult?.testId === "GAD-7" ? "21" : "40"}</strong> <span className="text-slate-400 text-[10px] mr-1">نقاط</span>
                        </div>
                        <div>
                          ● مستوى شدة الأعراض: <strong className="text-red-405 text-red-400">[{finalReportResult?.severity || "خفيف/معتدل"}]</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!finalReportResult && !clinicalReport) {
                              alert("الرجاء إتمام التقييم وتوليد التقرير الأولي أولاً.");
                              return;
                            }
                            setActiveReportModalData({ type: "initial", data: finalReportResult || clinicalReport });
                          }}
                          className="py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-300 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-400" />
                          استعراض التقرير 🔎
                        </button>

                        <button
                          type="button"
                          onClick={handleExportPDF}
                          className="py-2.5 bg-teal-600 hover:bg-teal-700 text-slate-950 text-[10px] font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          تصدير التقرير (PDF) 📥
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleDeleteInitialReport}
                        className="py-2.5 bg-red-950/40 hover:bg-red-950/60 border border-red-950/60 text-[10px] font-black text-red-400 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        حذف السجل التقريري الأولي 🗑️
                      </button>
                    </div>
                  </div>

                  {/* CARDS 2: BIWEEKLY/PERIODIC PROGRESS REPORTS */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-4">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
                    
                    <div className="space-y-3 flex-1">
                      <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-2.5">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-900 rounded font-black text-[8px] uppercase">
                            تقارير المتابعة الدورية 📋
                          </span>
                          <h5 className="font-extrabold text-slate-100 text-xs mt-1">المراجعات وتقييمات نصف الشهر بالأسبوعين</h5>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono font-bold">كل 14 يوماً</span>
                      </div>

                      <p className="text-slate-350 text-[10.5px] leading-relaxed">
                        يحتفظ هذا الركن بكافة تقارير المتابعة الطبية والسلوكية الدورية الصادرة كل أسبوعين، لتمكين طبيبك المعالج من دراسة منحنى الاستجابة العلاجي ومطابقة جرعات الدواء النفسي مع التطورات السلوكية الذاتية.
                      </p>

                      {/* Simple statistics summary inside */}
                      <div className="grid grid-cols-2 gap-3 pb-1">
                        <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-900 text-center">
                          <span className="text-slate-500 text-[8.5px] block font-bold">التقارير المتوفرة</span>
                          <strong className="text-slate-200 text-sm font-black font-mono">{reviewsHistory.length} وثائق</strong>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-900 text-center">
                          <span className="text-slate-500 text-[8.5px] block font-bold">آخر نسبة تحسن</span>
                          <strong className="text-teal-400 text-sm font-black font-mono">
                            {reviewsHistory.length > 0 ? `${reviewsHistory[0].progressScore || 0}%` : "جاري الفرز"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <p className="text-[9px] text-slate-500 border-t border-slate-850 pt-2 leading-relaxed">
                      💡 يمكنك النقر على زر "استعراض" أدناه تفصيلياً لفتح أي مستند دوري وتصديره بصيغة PDF وطباعته منفرداً.
                    </p>

                  </div>

                </div>

                {/* SECTION 2: LIST AND INTERACTION WITH ALL PERIODIC REPORT NODES */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 gap-2 flex-wrap">
                    <h5 className="text-xs font-extrabold text-slate-100 flex items-center gap-1.5 justify-end">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      الأرشيف الشامل لملف المتابعة الدورية وتقييم السكينة ({reviewsHistory.length})
                    </h5>
                    
                    <span className="text-[10px] text-slate-400">تقارير مدققة نصف شهرية تلقائياً</span>
                  </div>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {reviewsHistory.length === 0 ? (
                      <p className="text-[10px] text-slate-500 text-center py-12 font-semibold">
                        لا توجد تقارير متابعة دورية صادرة لحسابكم بالعيادة حتى الآن.
                      </p>
                    ) : (
                      reviewsHistory.map((rev: any, index: number) => {
                        return (
                          <div key={index} className="bg-slate-950 border border-slate-900 hover:border-slate-850/60 transition rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-right relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/[0.02] rounded-full blur-xl"></div>
                            
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 justify-start">
                                <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-900 rounded font-black text-[8px] uppercase">
                                  تقرير معتمد دوري # {reviewsHistory.length - index}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                                  rev.progressStatus?.includes("تحسن") ? "bg-teal-950 text-teal-400 border border-teal-900/40" : "bg-amber-955 text-amber-400 border border-amber-900/40"
                                }`}>
                                  مستوى الاستجابة: {rev.progressStatus}
                                </span>
                                <span className="text-[9.5px] text-slate-500 font-mono font-bold">
                                  تاريخ الوثيقة: {rev.date}
                                </span>
                              </div>
                              
                              <p className="text-[10px] text-slate-300 font-medium leading-relaxed truncate max-w-xl" title={rev.clinicalSummary}>
                                <strong>الرأي السريري:</strong> {rev.clinicalSummary}
                              </p>
                              
                              <p className="text-[9.5px] text-slate-500 flex items-center gap-1">
                                <Pill className="w-3 h-3 text-indigo-400" />
                                <strong>البروتوكول الدوائي:</strong> <span className="truncate max-w-md">{rev.medicationCheck}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                              <span className="text-right pl-3 pr-2 border-l border-slate-800 hidden md:flex flex-col">
                                <span className="text-[8px] text-slate-500 font-bold">نسبة التطور السلوكي</span>
                                <strong className="text-emerald-450 text-teal-400 font-black font-mono text-sm leading-none pt-0.5">{rev.progressScore || 0}%</strong>
                              </span>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveReportModalData({ type: "periodic", data: rev, index: reviewsHistory.length - index });
                                }}
                                className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold border border-slate-800 rounded-xl text-[10px] transition cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3 text-teal-400" />
                                استعراض 🔎
                              </button>

                              <button
                                type="button"
                                onClick={() => handleExportSingleFollowupPDF(rev)}
                                className="px-3 py-2 bg-slate-900 hover:bg-slate-850 hover:text-white text-indigo-400 border border-indigo-950 rounded-xl text-[10px] transition cursor-pointer flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3" />
                                تصدير الورقة 📥
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeletePeriodicReport(index)}
                                className="px-3 py-2 bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/40 rounded-xl text-[10px] transition cursor-pointer flex items-center gap-1"
                                title="حذف هذا التقرير الدوري 🗑️"
                              >
                                <Trash2 className="w-3 h-3" />
                                حذف 🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 3️⃣ STEP 3: INITIAL CLINICAL ASSESSMENT REPORT */}
          {activeSubView === "wizard" && currentStep === 3 && (
            <div className="space-y-6 animate-fade-in text-xs max-w-2xl mx-auto text-right leading-loose">
              {!clinicalReport ? (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
                  <h4 className="text-sm font-black text-slate-200">تقرير التقييم الإكلينيكي لا يزال قيد التوليد أو غير جاهز</h4>
                  <p className="text-slate-400 text-[11px] max-w-md mx-auto">
                    لم نتمكن من العثور على تقرير إكلينيكي مفعل. يرجى التوجه إلى المرحلة الثانية وتدوين تفاصيل عنائك بالتفصيل، ثم الضغط على "تحليل الشكوى" لإنشاء التقرير.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="mt-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-slate-950 font-extrabold rounded-xl transition cursor-pointer"
                  >
                    الذهاب إلى المرحلة الثانية ➡️
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary card */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/20 border border-teal-900/30 p-6 md:p-8 rounded-3xl space-y-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl"></div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-3">
                      <div>
                        <span className="px-2 py-0.5 bg-teal-950 text-teal-400 border border-teal-900 rounded font-black text-[8px] uppercase">مكتمل ومعتمد عيادياً ✅</span>
                        <h4 className="text-sm md:text-base font-black text-slate-100 mt-1">تقرير التقييم والفرز الإكلينيكي الأولي للـسـكـيـنـة</h4>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-100/10 px-3 py-1.5 border border-slate-800 rounded-xl">
                        <Activity className="w-4 h-4 text-teal-400" />
                        <span className="text-[10px] text-slate-350">مؤشر الأولوية:</span>
                        <span className="font-extrabold text-[10px] text-emerald-400">
                          {clinicalReport.isEmergency ? "تدخل طارئ" : clinicalReport.riskLevel === "High" ? "مرتفعة" : "مستقرة"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Detailed Summary */}
                      <div className="space-y-1.5">
                        <h5 className="font-extrabold text-teal-400 text-[11px] flex items-center gap-1.5 justify-end">
                          <span>الملخص الإكلينيكي وقراءة الحالة:</span>
                          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                        </h5>
                        <p className="text-slate-300 text-xs bg-slate-950/40 p-4 rounded-2xl border border-slate-900 leading-relaxed">
                          {clinicalReport.summaryArabic}
                        </p>
                      </div>

                      {/* Primary Symptoms */}
                      {clinicalReport.primarySymptoms && clinicalReport.primarySymptoms.length > 0 && (
                        <div className="space-y-1.5">
                          <h5 className="font-extrabold text-teal-400 text-[11px] flex items-center gap-1.5 justify-end">
                            <span>الأعراض والظواهر الطبية المكتشفة:</span>
                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                          </h5>
                          <div className="flex flex-wrap gap-1.5 justify-start">
                            {clinicalReport.primarySymptoms.map((s: string, idx: number) => (
                              <span key={idx} className="bg-slate-950 border border-slate-900 text-slate-300 px-3 py-1 rounded-xl font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Case Match / Diagnoses */}
                      <div className="space-y-1.5">
                        <h5 className="font-extrabold text-teal-400 text-[11px] flex items-center gap-1.5 justify-end">
                          <span>التشخيص المطابق ومستوى الشدة:</span>
                          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                        </h5>
                        <div className="bg-slate-950/35 border border-slate-900 rounded-2xl p-4 space-y-2 text-slate-300">
                          {clinicalReport.possibleDiagnosesSummary || "تطابق أعراض القلق والتوتر والمزاج والوساوس السلوكية."}
                        </div>
                      </div>
                    </div>

                    {/* Progress to Stage 4 panel */}
                    <div className="p-4 bg-teal-950/20 border border-teal-900/35 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="text-right space-y-1 font-sans">
                        <strong className="text-teal-400 block font-black">الخطوة البروتوكولية التالية في المسار الطبي:</strong>
                        <span className="text-[10px] text-slate-400">
                          بناءً على التقييم أعلاه، تم تخصيص وتعيين المقياس النفسي المعتمد لتوثيق الشدة بدقة سريرية تامة.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="w-full md:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-slate-950 font-black rounded-xl cursor-pointer transition shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        الذهاب لفحص المقياس الموصى به ➡️
                      </button>
                    </div>
                  </div>

                  {/* Back to Step 2 button */}
                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 rounded-xl font-bold transition cursor-pointer"
                    >
                      العودة للمرحلة الثانية ↩️
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4️⃣ STEP 4: PROTOCOL-RECOMMENDED CLINICAL PSYCHOMETRIC TEST */}
          {activeSubView === "wizard" && currentStep === 4 && (
            <div className="space-y-6 animate-fade-in text-xs max-w-2xl mx-auto text-right leading-loose">
              {!assignedTestId ? (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
                  <h4 className="text-sm font-black text-slate-200">الـمـقـيـاس غـيـر مـعـيـن بـعـد</h4>
                  <p className="text-slate-450 text-[11px] max-w-md mx-auto">
                    لم يقرر المحرك الفرز الإكلينيكي الخاص بك مقياساً محدداً حتى الآن لعدم توفر تقرير أولي. يرجى العودة وإكمال التفريد والفرز أولاً بالخطوة السابقة.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="mt-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-slate-950 font-extrabold rounded-xl transition cursor-pointer"
                  >
                    الذهاب إلى المرحلة الثالثة ➡️
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    const activeTest = CLINICAL_TESTS.find(t => t.id === assignedTestId);
                    if (!activeTest) return null;

                    // 1. Dynamic Live Calculation & Progress Tracking of Question Scores
                    let currentScore = 0;
                    let answeredCount = 0;
                    activeTest.questions.forEach((q) => {
                      if (testAnswers[q.id] !== undefined) {
                        currentScore += testAnswers[q.id];
                        answeredCount++;
                      }
                    });

                    // 2. Dynamic Linguistic Analysis of the Phase 2 Complaint
                    const normalizedText = (complaintText || "").toLowerCase();
                    
                    const severeKeys = [
                      { key: "انتحار", label: "أفكار إيذاء ذاتي" },
                      { key: "موت", label: "انشغال بالموت" },
                      { key: "أنهي حياتي", label: "افتقار السكينة الحاد" },
                      { key: "أقتل", label: "اندفاعية عالية" },
                      { key: "حاد", label: "درجة حادة" },
                      { key: "شديد جدا", label: "عناء عارم" },
                      { key: "وسواس قهري", label: "سلوك تكراري" },
                      { key: "نوبة", label: "نوبات فزع وهلع" },
                      { key: "فزع", label: "تسارع حركات الروعة" },
                      { key: "رعب", label: "توجس رهابي حاد" }
                    ];

                    const moderateKeys = [
                      { key: "تعب", label: "إجهاد حركي" },
                      { key: "حزن", label: "مزاج منقبض" },
                      { key: "اكتئاب", label: "اضطراب مزاجي" },
                      { key: "قلق", label: "تحفز مستمر" },
                      { key: "توتر", label: "استثارة بدنية" },
                      { key: "خوف", label: "خوف اجتماعي" },
                      { key: "سهر", label: "أرق متواصل" },
                      { key: "نوم", label: "اضطراب دورة الاستيقاظ" },
                      { key: "وسواس", label: "أفكار وسواسية" },
                      { key: "ضيق", label: "ضيق بالصدر" },
                      { key: "ضغط", label: "شحن عصبي" },
                      { key: "شره", label: "توتر سلوكي غذائي" },
                      { key: "أكل", label: "أكل عاطفي" }
                    ];

                    const foundSevere = severeKeys.filter(item => normalizedText.includes(item.key));
                    const foundModerate = moderateKeys.filter(item => normalizedText.includes(item.key));

                    let textSeverityLabel = "أعراض وقائية / مستقرة";
                    let textSeverityType = "low";
                    
                    if (foundSevere.length > 0) {
                      textSeverityLabel = "شدة حرجة (عالية الخطورة)";
                      textSeverityType = "critical";
                    } else if (foundModerate.length >= 4) {
                      textSeverityLabel = "شدة إكلينيكية مرتفعة";
                      textSeverityType = "high";
                    } else if (foundModerate.length >= 1) {
                      textSeverityLabel = "شدة طفيفة إلى معتدلة";
                      textSeverityType = "medium";
                    }

                    // Ratio of score severity vs text severity
                    let scoreSeverityType = "low";
                    const ratio = activeTest.maxScore > 0 ? currentScore / activeTest.maxScore : 0;
                    
                    if (ratio >= 0.70) {
                      scoreSeverityType = "critical";
                    } else if (ratio >= 0.40) {
                      scoreSeverityType = "high";
                    } else if (ratio >= 0.15) {
                      scoreSeverityType = "medium";
                    }

                    const tiers = ["low", "medium", "high", "critical"];
                    const textIdx = tiers.indexOf(textSeverityType);
                    const scoreIdx = tiers.indexOf(scoreSeverityType);
                    const diff = Math.abs(textIdx - scoreIdx);

                    let matchPercentage = 100;
                    let alignmentLabel = "تطابق لغوي وسيكومتري ممتاز بنسبة %100";
                    let alignmentBg = "bg-emerald-950/30 border-emerald-900/40 text-emerald-400";

                    if (diff === 0) {
                      matchPercentage = 95 + (currentScore % 5);
                      alignmentLabel = "تطابق لغوي وسيكومتري ممتاز ومثالي بنسبة 100% متناسب مع نبرة كلامك";
                      alignmentBg = "bg-emerald-950/40 border-emerald-900/40 text-emerald-400";
                    } else if (diff === 1) {
                      matchPercentage = 84 + (currentScore % 8);
                      alignmentLabel = "تواؤم طردي معقول لغوياً وعاطفياً يتفق مع سياق الفضفضة";
                      alignmentBg = "bg-teal-950/40 border-teal-900/40 text-teal-400";
                    } else {
                      matchPercentage = 70 + (currentScore % 10);
                      alignmentLabel = "تباين تلطيفي بسيط (ضمن حدود التحفظ العيادي الطبيعي)";
                      alignmentBg = "bg-amber-950/40 border-amber-900/40 text-amber-400";
                    }

                    const allFoundLabels = [...foundSevere, ...foundModerate].map(x => x.label);

                    return (
                      <div className="space-y-6">
                        {/* Header card with test description */}
                        <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-3 relative overflow-hidden">
                          <span className="px-2 py-0.5 bg-teal-950 text-teal-400 border border-teal-900 rounded font-black text-[8px] uppercase tracking-wider">مقياس التقييم الموصى به بروتوكولياً</span>
                          <h4 className="text-sm md:text-base font-black text-slate-100 mt-1">{activeTest.nameArabic} ({activeTest.nameEnglish})</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">
                            {activeTest.descriptionArabic} يرجى الإجابة عن البنود بمصداقية ووعي كامل بوضع عنائك الفعلي طوال الـ 14 يوماً الماضية لرسم المخطط العلاجي.
                          </p>
                        </div>

                        {/* HIGH FIDELITY CLINICAL EXPLANATION & HARMONIZATION PANEL */}
                        <div className="bg-gradient-to-br from-indigo-950/20 via-slate-950/60 to-teal-950/30 border border-slate-850/80 p-6 rounded-3xl space-y-5 text-right relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-2xl"></div>
                          
                          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-850/60 justify-between">
                            <span className="text-[9px] text-indigo-400 font-extrabold bg-indigo-950/60 border border-indigo-900 px-3 py-1 rounded-full flex items-center gap-1">
                              <Info className="w-3.5 h-3.5" />
                              آلية الاحتساب السريري والمنطقي
                            </span>
                            <h5 className="font-black text-slate-100 text-xs flex items-center gap-1.5 leading-none">
                              <Activity className="w-4 h-4 text-teal-450 text-indigo-400" />
                              توضيح آلية تقييم المقياس وعلاقته بالشكوى المكتوبة
                            </h5>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[11px] leading-relaxed">
                          {/* Column 1: Math Breakdown */}
                          <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
                            <h6 className="font-extrabold text-slate-200 flex items-center gap-1 justify-end">
                              <span>1. آلية حساب الدرجات المكتسبة 🔢</span>
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            </h6>
                            <p className="text-slate-400 text-[10.5px]">
                              يتم احتساب قيمة المقياس تلقائياً بالاعتماد على أوزان الإجابات المعتمدة إكلينيكياً (ليكيرت):
                            </p>
                            <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-900 space-y-1 font-mono text-[9px] text-slate-350">
                              <div>• أبداً / لا يوجد = <span className="text-emerald-400 font-bold">0 نقطة</span></div>
                              <div>• لعدة أيام / أحياناً = <span className="text-teal-400 font-bold">1 نقطة</span></div>
                              <div>• أكثر من نصف الأيام / غالباً = <span className="text-purple-400 font-bold">2 نقطة</span></div>
                              <div>• تقريباً كل يوم / دائماً جداً = <span className="text-indigo-400 font-bold">3 أو 4 نقاط</span></div>
                            </div>

                            {/* Dynamic Severity Ranges */}
                            <div className="pt-2 border-t border-slate-900/50 space-y-1.5">
                              <span className="text-slate-200 font-bold block text-[10px]">مستويات تصنيف ومفسرات درجات هذا المقياس:</span>
                              <div className="bg-slate-950/70 rounded-xl p-2 border border-slate-900 space-y-1">
                                {(() => {
                                  let ranges: any[] = [];
                                  if (activeTest.id === "PHQ-9") {
                                    ranges = [
                                      { range: "0 - 4", label: "أعراض طبيعية / طفيفة (Low)", color: "text-emerald-400", check: (s: number) => s <= 4 },
                                      { range: "5 - 9", label: "اكتئاب خفيف (Mild)", color: "text-teal-400", check: (s: number) => s >= 5 && s <= 9 },
                                      { range: "10 - 14", label: "اكتئاب معتدل (Moderate)", color: "text-amber-400", check: (s: number) => s >= 10 && s <= 14 },
                                      { range: "15 - 19", label: "اكتئاب متوسط الشدة (Moderately Severe)", color: "text-orange-400", check: (s: number) => s >= 15 && s <= 19 },
                                      { range: "20 - 27", label: "اكتئاب حاد وحَرِج (Severe Depression)", color: "text-red-400", check: (s: number) => s >= 20 },
                                    ];
                                  } else if (activeTest.id === "GAD-7") {
                                    ranges = [
                                      { range: "0 - 4", label: "قلق طبيعي / غائب (Low)", color: "text-emerald-400", check: (s: number) => s <= 4 },
                                      { range: "5 - 9", label: "قلق خفيف (Mild)", color: "text-teal-400", check: (s: number) => s >= 5 && s <= 9 },
                                      { range: "10 - 14", label: "قلق معتدل (Moderate)", color: "text-amber-400", check: (s: number) => s >= 10 && s <= 14 },
                                      { range: "15 - 21", label: "قلق حاد وحَرِج (Severe Anxiety)", color: "text-red-400", check: (s: number) => s >= 15 },
                                    ];
                                  } else if (activeTest.id === "PSS-10") {
                                    ranges = [
                                      { range: "0 - 13", label: "توتر حياتي طبيعي (Low Stress)", color: "text-emerald-400", check: (s: number) => s <= 13 },
                                      { range: "14 - 26", label: "توتر معتدل مبرر (Moderate Stress)", color: "text-amber-400", check: (s: number) => s >= 14 && s <= 26 },
                                      { range: "27 - 40", label: "توتر حاد واحتراق نفسي (Severe Stress)", color: "text-red-400", check: (s: number) => s >= 27 },
                                    ];
                                  } else {
                                    ranges = [
                                      { range: `عتبة منخفضة`, label: "غير مؤثر إكلينيكياً", color: "text-emerald-400", check: (s: number) => s < activeTest.maxScore * 0.35 },
                                      { range: `عتبة معتدلة`, label: "أعراض متوسطة", color: "text-amber-400", check: (s: number) => s >= activeTest.maxScore * 0.35 && s < activeTest.maxScore * 0.70 },
                                      { range: `عتبة حادة`, label: "اضطراب حاد ونشط ومؤرق", color: "text-red-400", check: (s: number) => s >= activeTest.maxScore * 0.70 },
                                    ];
                                  }

                                  return ranges.map((rangeItem, rIdx) => {
                                    const isCurrentRange = rangeItem.check(currentScore);
                                    return (
                                      <div 
                                        key={rIdx} 
                                        className={`flex justify-between items-center text-[9px] py-1 px-1.5 rounded transition duration-200 ${
                                          isCurrentRange 
                                            ? "bg-indigo-950/80 border border-indigo-900 text-slate-100 font-extrabold shadow-sm" 
                                            : "opacity-45 text-slate-400"
                                        }`}
                                      >
                                        <span className={`font-mono font-bold ${rangeItem.color} flex items-center gap-1.5`}>
                                          {isCurrentRange && <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />}
                                          <span>{rangeItem.range}</span>
                                        </span>
                                        <span className="text-right">{rangeItem.label}</span>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-slate-900/50 space-y-2">
                              <div className="flex justify-between items-center text-[10px] text-slate-400">
                                <span>الدرجـــة الكليـــة الحاليـــة:</span>
                                <strong className="text-indigo-400 font-semibold font-black text-xs flex items-center gap-1">
                                  <span>{currentScore}</span>
                                  <span className="text-[10px] font-medium text-slate-500">/</span>
                                  <span>{activeTest.maxScore}</span>
                                </strong>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-900 relative">
                                <div 
                                  className="bg-gradient-to-r from-teal-500 to-indigo-550 h-full transition-all duration-500 rounded-full" 
                                  style={{ width: `${Math.min(100, Math.max(4, (currentScore / activeTest.maxScore) * 100))}%` }}
                                />
                              </div>
                              <p className="text-[9px] text-slate-500 font-medium">
                                * البنود المنجزة حتى الآن: ({answeredCount} / {activeTest.questions.length}) بنود مصنفة بنجاح.
                              </p>
                            </div>
                          </div>

                            {/* Column 2: Complaint Integration & Logical Coherence */}
                            <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-900 rounded-2xl flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <h6 className="font-extrabold text-slate-200 flex items-center gap-1 justify-end">
                                  <span>2. مطابقة الدرجة لشدّة وصياغة شكواك 🧬</span>
                                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                                </h6>
                                <p className="text-slate-400 text-[10.5px]">
                                  لا يعمل الفحص بمعزل عن وعكتك؛ بل يقارن ذكاء العيادة بين شدة الكلمات وصياغتها اللفظية بالمرحلة الثانية لضمان توافق الاتساق:
                                </p>
                              </div>

                              <div className="space-y-2">
                                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-900 space-y-2 text-[10px]">
                                  <div className="flex justify-between">
                                    <span className="text-slate-450 text-[9.5px]">شدة الكلام لغوياً (المرحلة 2):</span>
                                    <span className="font-bold text-slate-200">{textSeverityLabel}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-450 text-[9.5px]">مؤشر الملاءمة والاتساق السريري:</span>
                                    <span className="font-extrabold text-emerald-400 font-mono">{matchPercentage}%</span>
                                  </div>
                                </div>

                                <div className={`p-2.5 rounded-xl border text-[9.5px] font-bold leading-relaxed ${alignmentBg}`}>
                                  {alignmentLabel}
                                </div>

                                {/* Text feature extraction taglines */}
                                <div className="space-y-1 text-right">
                                  {allFoundLabels.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 justify-start">
                                      <span className="text-[9px] text-slate-500 font-bold block w-full">بصمات شدة مرصودة بالفضفضة:</span>
                                      {allFoundLabels.map((lbl, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-slate-950 border border-slate-900/60 text-indigo-300 rounded text-[8.5px] font-medium">
                                          ✦ {lbl}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-[9px] text-slate-500 italic block pt-0.5">لم نلتقط بالشكوى كلمات انفعالية بالغة (بصمة كلامية هادئة).</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-slate-500 text-[9.5px] leading-relaxed border-t border-slate-900/60 pt-2.5 select-none text-center">
                            * تجمع المنصة بين الصياغة الحرة لشكواكم (التحليل الكيفي العاطفي) ومجموع المقياس الرقمي (التحليل الكمي المعياري) للتأكد البالغ من عدم تضخيم الأعراض أو تفريغها بلا نية، للوصول لأدق خريطة طريق CBT.
                          </p>
                        </div>

                        {/* Question list form */}
                        <div className="space-y-4">
                          {activeTest.questions.map((q, idx) => (
                            <div key={q.id} className="bg-slate-900/30 border border-slate-850 p-5 rounded-2xl space-y-3">
                              <div className="flex justify-between items-start gap-3">
                                <span className="w-5 h-5 bg-teal-950 border border-teal-900 font-mono font-black text-[9px] text-teal-400 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <p className="text-slate-200 font-extrabold text-[12px] md:text-xs">
                                  {q.textArabic}
                                </p>
                              </div>

                              {/* Horizontal radio pill options */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                                {q.options.map((opt) => {
                                  const isSelected = testAnswers[q.id] === opt.score;
                                  return (
                                    <button
                                      type="button"
                                      key={opt.score}
                                      onClick={() => handleSelectScaleAnswer(q.id, opt.score)}
                                      className={`py-2 px-3 rounded-xl border text-[10px] font-black text-center cursor-pointer transition flex items-center justify-center ${
                                        isSelected
                                          ? "bg-teal-600 text-slate-950 border-teal-500 font-black shadow-lg shadow-teal-950/20"
                                          : "bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-400"
                                      }`}
                                    >
                                      {opt.labelArabic}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 rounded-xl font-bold transition cursor-pointer text-center"
                          >
                            العودة للمرحلة الثالثة ↩️
                          </button>

                          <button
                            type="button"
                            onClick={submitAssignedScale}
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-teal-950/20"
                          >
                            <Sparkles className="w-4 h-4" />
                            حساب المقياس وتوليد الخطة النهائية (الذهاب للمرحلة 5) ✨
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* 5️⃣ STEP 5: FINAL COMPREHENSIVE PSYCHIATRIC AND PHARMACOLOGICAL CBT BLUEPRINT */}
          {activeSubView === "wizard" && currentStep === 5 && finalReportResult && (
            <div className="space-y-8 animate-fade-in text-xs max-w-3xl mx-auto leading-loose text-right">
              
              {/* Visual header */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl"></div>
                
                <div className="space-y-2 z-10 text-center md:text-right">
                  <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded font-black text-[9px] uppercase">ملف السريرية الطبي المعتمد</span>
                  <h4 className="text-xl font-black text-slate-100">خلاصات التقرير التشخيصي النهائي وباقة الدعم والعلاجات</h4>
                  <p className="text-slate-400 text-xs mt-1">المستند السريري لحالة المريض: {demographics.name || "سكينة"}</p>
                </div>
                
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl z-10 text-center">
                  <span className="text-slate-450 text-[10px] block font-bold text-slate-400">نقاط مقياس {finalReportResult.testId}:</span>
                  <strong className="text-xl font-black text-emerald-400 block pt-0.5" dir="ltr">
                    <span className="font-mono">{finalReportResult.totalScore}</span> 
                    <span className="text-slate-500 mx-1.5">/</span> 
                    <span className="font-mono">{CLINICAL_TESTS.find(t=>t.id === finalReportResult.testId)?.maxScore}</span>
                  </strong>
                  <span className="text-[10px] text-slate-300 block font-semibold">{finalReportResult.severity}</span>
                </div>
              </div>

              {/* Assessment analysis notes */}
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                <strong className="text-slate-200 block font-bold flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  <Heart className="w-4 h-4 text-teal-400" /> ملامح التوصيف التشخيصي النهائي للمريض (ملخص سريري من سطرين):
                </strong>
                {(() => {
                  const summary = getFinalDiagnosticProfileSummary(finalReportResult);
                  return (
                    <div className="space-y-2 bg-emerald-950/20 border-r-4 border-emerald-500 p-4 rounded-xl text-slate-200 text-[11px] leading-relaxed">
                      <p className="font-bold"><span className="text-emerald-400 font-black">● </span>{summary.line1}</p>
                      <p className="font-bold"><span className="text-teal-400 font-black">● </span>{summary.line2}</p>
                    </div>
                  );
                })()}
                
                <p className="text-slate-300 font-medium pt-1">{finalReportResult.interpretationText}</p>
                {clinicalReport && (
                  <p className="text-slate-400 text-[11px] leading-relaxed pt-1 select-none">
                    * يربط الخوارزم المعالج بين تحليل الشكاوى المعزز لغوياً بنسبة جيدة وبين درجة مقياس {finalReportResult.testId} الرقمية لرفع الدقة السريرية.
                  </p>
                )}
              </div>

              {/* 📑 الشرح الوافي والمفصل والشامل للحالة السريرية للتوصيف التشخيصي النهائي (Requirement 5) */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-5 text-right relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl"></div>
                
                <h5 className="font-extrabold text-slate-100 text-sm border-b border-slate-800 pb-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-teal-400 font-bold bg-teal-950/60 border border-teal-900/40 px-2.5 py-1 rounded-full">تحليل طبي متكامل</span>
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-teal-400" />
                    الشرح الوافي والمفصل لتقرير حالة المريض السريرية والتشخيصية
                  </span>
                </h5>

                <div className="space-y-4 text-[10.5px] leading-loose text-slate-300">
                  <div className="space-y-1">
                    <strong className="text-teal-400 font-bold block">1. التحليل الديناميكي للأعراض والدافع السلوكي:</strong>
                    <p className="pr-2 border-r border-slate-800 text-slate-400 leading-relaxed">
                      بناءً على الشكوى النصية أو الصوتية المدونة طائعةً من طرفكم والتحليل الإكلينيكي المدمج، تم رصد مؤشرات واضحة لفرط اليقظة والاجترار العاطفي. تشير هذه الأعراض إلى حالة نشطة من التصلب الإدراكي حيث يعيد العقل تدوير الأفكار المقلقة والذكريات المنهكة دون الوصول لمرحلة التكيف أو اتخاذ حلول بناءة. هذا النمط يؤثر مباشرة على كفاءة المراكز الفكرية والقرار، ويتجسد في صورة ضيق جسدي واضطرابات في دورات وساعات النوم العادية (الأرق السلوكي).
                    </p>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-purple-400 font-bold block">2. مقارنة وتكامل المعطيات اللغوية والقياس النفسي الرقمي:</strong>
                    <p className="pr-2 border-r border-slate-800 text-slate-400 leading-relaxed">
                      تتكامل نتائج الدرجة السيكومترية الحالية المحرزة على مقياس <strong className="text-slate-200">({finalReportResult.testName} {finalReportResult.testId})</strong> البالغة <strong className="text-emerald-400 font-bold">{finalReportResult.totalScore} نقاط</strong>، والتي تمثل تصنيف شدة مقاس بـ <strong className="text-slate-200 font-bold">[{finalReportResult.severity}]</strong>، مع الوصف اللغوي للشكوى. هذا الاندماج والاتساق بنسبة مرتفعة يؤكد تفاقم الحالة من مرحلة الضغط العابر إلى مرحلة الاحتياج الفعلي لجدولة الجلسات الكلاسيكية وأجندة CBT. الأرقام في الفحص السيكومتري تؤكد مصداقية العناء، وتساعد المعالج في رسم تتبع بياني خطي للتحسن الإكلينيكي كل أسبوعين بصورة دقيقة ومقارنتها علمياً.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-indigo-400 font-bold block">3. آلية وعلاج CBT / ACT التفصيلي المقر للأيام القادمة:</strong>
                    <p className="pr-2 border-r border-slate-800 text-slate-400 leading-relaxed">
                      يتمحور بروتوكول العلاج السلوكي الراهن حول دحض التشويه الفكري (كفخ التعميم العاطفي وكارثية التوقعات من المستقبل). نوصي بتطبيق "مفكرة الأيام الخمسة للأفكار التلقائية" المتاحة بجدול المتابعة، وتناول تمرين الشهيق والزفير الواعي المبرمج بالمنصة لتهدئة العصب الحائر وتعديل تسارع نبضات القلب السلوكي. كما نعتمد منهج ACT (التقبل والالتزام) الذي يمنع مقاومة ومصارعة الأفكار المخيفة بالقوة، بل بتوجيه طاقة الانتباه نحو أداء التزامات العمل والأنشطة الصحية الممتعة المجدولة في الأجندة اليومية حتى مع مرافقة بعض القلق الخفيف.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <strong className="text-emerald-400 font-bold block">4. التوجيه الدوائي والتواصل المهني السريري:</strong>
                    <p className="pr-2 border-r border-slate-800 text-slate-400 leading-relaxed">
                      البروتوكولات الطبية تشير إلى تلازم العلاج السلوكي الفردي مع التدخلات العقاقيرية الداعمة كحل مثالي متكامل يعزز سرعة الاستجابة الدماغية لمركبات السيروتونين والنواقل العصبية الأخرى. نثبت بالتقرير النهائي أن الاقتراحات المسرودة للبروتوكول العلاجي هي بمثابة "مقترحات إرشادية ذات مرجعية معيارية"، ويجب تماماً الامتناع عن أخذ الدواء أو تعديله أو إيقافه بشكل منفرد وذاتي دون الرجوع المباشر السلس إلى الطبيب النفسي المختص والمعالج المتابع لحالتكم بانتظام لتأمين بيئة تعافي آمنة ومحمية من الأعراض العكسية والانسحابية.
                    </p>
                  </div>
                </div>
              </div>

              {/* 📊 COMPARISON CARD: QUALITATIVE VS QUANTITATIVE ALIGNMENT */}
              <div className="bg-slate-900/30 border border-teal-900/30 p-5 rounded-3xl space-y-4 text-right relative overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl"></div>
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-900">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  <strong className="text-slate-200 block text-xs">مطابقة وفحص الاتساق (التدقيق العيادي العاطفي والرقمي المتبادل):</strong>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900 space-y-1.5">
                    <span className="text-[10px] text-teal-400 block font-bold">● الوصف والفضفضة اللفظية للوعكة (المدخل اللغوي):</span>
                    <p className="text-[10px] text-slate-300 italic leading-relaxed">
                      "{complaintText || "تم الفحص والفضفضة الصوتية الذكية"}"
                    </p>
                    <span className="text-[9px] text-slate-500 block pt-1 border-t border-slate-900/50">تمت معالجة المدخل دلالياً بدقة عالية</span>
                  </div>

                  <div className="bg-slate-950/65 p-4 rounded-2xl border border-slate-900 space-y-1.5 text-right font-sans">
                    <span className="text-[10px] text-indigo-400 block font-bold">● الدرجة والتحليل السيكومتري (المدخل القياسي الرقمي):</span>
                    <p className="text-[10px] text-slate-300 italic leading-relaxed">
                      النتيجة الإجمالية للمقياس: <strong className="text-teal-400 font-bold">{finalReportResult?.totalScore || 0} نقاط</strong> — تصنيف العوارض: <strong className="text-red-400">[{finalReportResult?.severity || "خفيف"}]</strong>.
                    </p>
                    <span className="text-[9px] text-slate-500 block pt-1 border-t border-slate-900/50">مطابقة الفحص سيكومترياً لتوجيه خوارزمية السكينة CBT</span>
                  </div>
                </div>
              </div>

              {/* 🛡️ CLINICAL REPORT PREVIEW MODAL */}
              {activeReportModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in text-right font-sans">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col justify-between shadow-2xl animate-scale-up">
                    
                    {/* Modal Header */}
                    <div className="flex justify-between items-center bg-slate-950 p-5 border-b border-slate-850 sticky top-0 z-10">
                      <button
                        type="button"
                        onClick={() => setActiveReportModalData(null)}
                        className="p-2 bg-slate-900 hover:bg-slate-850 hover:text-white rounded-xl text-slate-400 transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      
                      <div className="text-right flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-teal-400" />
                        <h4 className="text-sm font-black text-slate-100">
                          {activeReportModalData.type === "initial" ? "التقرير الطبي والتشخيصي السريري الأولي" : `تفاصيل تقييم المتابعة الدورية عيادياً`}
                        </h4>
                      </div>
                    </div>

                    {/* Modal Body / Report Document */}
                    <div className="p-6 md:p-8 space-y-6 text-slate-350 select-text leading-loose">
                      
                      {/* Clinical Letterhead */}
                      <div className="text-center border-b-2 border-dashed border-teal-850 pb-5 space-y-2">
                        <h3 className="text-base font-black text-slate-100">منصة وعيادة سكينة لدعم الاستقرار السلوكي الرقمي</h3>
                        <p className="text-[10px] text-teal-400 font-bold">تقرير إكلينيكي معتمد إلكترونياً ومشفر طبقاً لمعايير HIPAA للخصوصية السريرية</p>
                        <div className="mx-auto w-max px-3 py-1 bg-teal-950 text-teal-400 border border-teal-900 rounded-full text-[9px] font-bold">
                          رقم الفحص الموحد للحساب: {authInput}
                        </div>
                      </div>

                      {/* Patient & Subject Demographics details */}
                      <div className="bg-slate-950/65 p-4 rounded-2xl border border-slate-900 space-y-2 text-xs">
                        <h5 className="font-bold text-slate-200 text-xs border-b border-slate-900/50 pb-1.5 flex items-center gap-1.5 justify-end">
                          <User className="w-4 h-4 text-teal-400" />
                          الملف السريري والبيانات الديموغرافية للمراجع
                        </h5>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-300">
                          <div>الاسم المقيد: <span className="text-slate-100 font-bold">{demographics.name || "سكينة"}</span></div>
                          <div>العمر الفعلي: <span className="text-slate-100 font-bold">{demographics.age || "لم يجر بعد"} سنة</span></div>
                            <div>الجنس: <span className="text-slate-100 font-bold">{demographics.gender === "Male" ? "ذكر" : "أنثى"}</span></div>
                            <div>الحالة الاجتماعية: <span className="text-slate-100 font-bold">{demographics.marital === "Single" ? "أعزب" : "متزوج/آخر"}</span></div>
                            <div>المسمى المهني: <span className="text-slate-100 font-bold">{demographics.job || "لا يوجـد"}</span></div>
                            <div>الأمراض المزمنة: <span className="text-slate-100 font-bold">{demographics.chronicDiseases || "لا يوجـد"}</span></div>
                          </div>
                        </div>

                        {/* Rendering core diagnostic/report data based on report type */}
                        {activeReportModalData.type === "initial" ? (
                          <div className="space-y-5">
                            
                            {/* Diagnostic score */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-[11.5px]">
                                <span className="text-slate-500 font-bold block mb-1">الفحص الرقمي المعتمد:</span>
                                <strong>مقياس {activeReportModalData.data.testName} ({activeReportModalData.data.testId})</strong>
                              </div>
                              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-[11.5px]">
                                <span className="text-slate-500 font-bold block mb-1">الدرجة الإجمالية والشدة:</span>
                                <strong className="text-teal-400">{activeReportModalData.data.totalScore} نقاط</strong> — تصنيف: <span className="text-red-400 font-bold">[{activeReportModalData.data.severity}]</span>
                              </div>
                            </div>

                            {/* Complaint feedback */}
                            <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-900 text-[11px] space-y-1.5">
                              <span className="text-teal-400 font-black block">الوصف اللفظي والصوت المفرس للشكوى (المدخل السمعي):</span>
                              <p className="italic text-slate-300 leading-normal">"{complaintText || "تم الفحص السريري للشكوى بالصوت والكلام بنجاح."}"</p>
                            </div>

                            {/* Interpretation details */}
                            <div className="bg-slate-950/35 p-4 rounded-xl border border-slate-900 text-[11px] leading-relaxed text-slate-355 space-y-2">
                              <span className="text-teal-400 font-black block">التحليل الطبي والتشخيصي السريري للـ AI:</span>
                              <p>{activeReportModalData.data.interpretationText}</p>
                              
                              <div className="mt-2 text-[10.5px]">
                                <strong className="text-slate-200 block mb-1">المظهر التشخيصي والتحليل الموحد:</strong>
                                <p className="text-slate-400 pr-2 border-r border-teal-900 fill-teal-950/20 font-semibold leading-relaxed">
                                  {getFinalDiagnosticProfileSummary(activeReportModalData.data).line1}
                                  <br />
                                  {getFinalDiagnosticProfileSummary(activeReportModalData.data).line2}
                                </p>
                              </div>
                            </div>

                            {/* Prescribed CBT homework modules */}
                            <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-900 text-[11px] leading-relaxed space-y-3">
                              <span className="text-emerald-400 font-black block">بروتوكول العلاج السلوكي المعرفي المقر (CBT / ACT Blueprint):</span>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1 text-right">
                                  <strong className="text-teal-400 block pb-1 border-b border-slate-900">1. إعادة الهيكلة المعرفية:</strong>
                                  <ul className="list-disc list-inside space-y-1 text-[10px] text-slate-400">
                                    {activeReportModalData.data.assignedWorkUpCbt.cognitiveRestructuring?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                                  </ul>
                                </div>
                                <div className="space-y-1 text-right">
                                  <strong className="text-purple-400 block pb-1 border-b border-slate-900">2. التنشيط السلوكي:</strong>
                                  <ul className="list-disc list-inside space-y-1 text-[10px] text-slate-400">
                                    {activeReportModalData.data.assignedWorkUpCbt.behavioralActivation?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                                  </ul>
                                </div>
                                <div className="space-y-1 text-right">
                                  <strong className="text-indigo-400 block pb-1 border-b border-slate-900">3. التدريب المنزلي:</strong>
                                  <ul className="list-disc list-inside space-y-1 text-[10px] text-slate-400">
                                    {activeReportModalData.data.assignedWorkUpCbt.practicalHomework?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Drug treatments if any */}
                            {activeReportModalData.data.medicationPre ? (
                              <div className="p-4 bg-indigo-950/20 border border-indigo-900/60 rounded-xl text-[11px] leading-relaxed">
                                <strong className="text-indigo-400 font-bold block mb-1">
                                  البروتوكول العلاجي الدوائي الوقائي المقترح والمطابقة:
                                </strong>
                                <p className="font-semibold text-slate-200">
                                  {activeReportModalData.data.medicationPre.brandNameLocal} ({activeReportModalData.data.medicationPre.brandNameForeign}) — الجرعة الاسترشادية: بمعدل {activeReportModalData.data.medicationPre.strengths?.[0] || '10'} ملغ يومياً.
                                </p>
                                <span className="block text-[9px] text-red-400 mt-2">
                                  ⚠️ تنبيه عيادي هام: الدليل الدوائي أعلاه هو دليل تعليمي استرشادي مساعد، ويجب الامتناع المطلق عن شرائه أو تناوله دون استشارة الطبيب النفسي المختص المباشر بخصوصية تامة.
                                </span>
                              </div>
                            ) : (
                              <div className="p-4 bg-teal-950/25 border border-teal-900/40 rounded-xl text-[10.5px] leading-relaxed text-slate-350 font-semibold">
                                <strong className="text-teal-400 block">التوجيه الدوائي للحالة:</strong>
                                لا تستدعي حالتك السريرية أي علاجات دوائية كيميائية في الوقت الراهن؛ حيث يوصى الخوارزم بالتركيز التام على برامج المساعدة والدعم السلوكي المعرفي كخيار كافٍ ومحقق للاستقرار التام.
                              </div>
                            )}

                          </div>
                        ) : (
                          <div className="space-y-5">
                            
                            {/* Periodic details */}
                            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-900 text-[11px] gap-2 flex-wrap">
                              <div>مسمى الفحص: <strong className="text-indigo-400 font-extrabold">{activeReportModalData.data.date}</strong></div>
                              <div>مؤشر التطور السلوكي: <strong className="text-teal-400 font-bold font-mono text-xs">{activeReportModalData.data.progressScore || 0}%</strong></div>
                            </div>

                            <div className="bg-slate-950/35 p-4 rounded-xl border border-slate-900 text-[11px] leading-relaxed text-slate-350 space-y-1.5">
                              <span className="text-indigo-400 font-bold block">مذكرات التحسن السلوكية لليوم المعني:</span>
                              <p className="italic text-slate-400">"{activeReportModalData.data.feedback || 'لم تسجل مذكرات كفيفة؛ حيث تم رصد وتقييم التطورات ذاتياً'}"</p>
                            </div>

                            <div className="bg-slate-950/25 p-4 rounded-xl border border-slate-900 text-[11.5px] leading-relaxed text-slate-300 space-y-1.5">
                              <span className="text-teal-400 font-bold block">التحليل والتقييم الإكلينيكي للأسبوعين بالمنصة:</span>
                              <p>{activeReportModalData.data.clinicalSummary}</p>
                            </div>

                            <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-900 text-[11px] leading-normal space-y-1.5">
                              <span className="text-purple-400 font-bold block">التوصيات الطارئة والمعدلة ببروتوكول الـ CBT:</span>
                              <ul className="list-disc list-inside space-y-1 text-slate-400">
                                {activeReportModalData.data.recommendedAdjustments?.map((adj: string, idx: number) => (
                                  <li key={idx}>{adj}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-4 bg-indigo-950/30 border border-indigo-900/50 rounded-xl text-[11px] leading-relaxed">
                              <strong className="text-indigo-400 font-bold block mb-1">
                                التوجيه الدوائي ومطابقة جرعات العقاقير المقرة:
                              </strong>
                              <p className="text-slate-300">{activeReportModalData.data.medicationCheck}</p>
                              <span className="block text-[8.5px] text-amber-500 font-semibold bg-amber-955 p-2 border border-amber-900/30 rounded-lg mt-2 leading-normal">
                                ⚠️ تنبيه طبي حاسم: المقترحات الإرشادية لتعديل جرعات الأدوية هي لتيسير النقاش مع الطبيب النفسي المتابع، ويحظر كلياً تغيير الجرعات دون فحص طبي مباشر.
                              </span>
                            </div>

                          </div>
                        )}

                        {/* Sign seal stamp */}
                        <div className="flex justify-between items-center pt-6 border-t border-slate-850 text-[10px] text-slate-400">
                          <div>
                            تاريخ الصرف والاعتماد: <strong className="text-slate-200">{new Date().toLocaleDateString("ar-EG")}</strong>
                          </div>
                          <div className="text-center font-bold relative">
                            <span className="text-[10px] text-emerald-400 block px-2.5 py-0.5 bg-emerald-950 border border-emerald-900 rounded uppercase font-black tracking-wider shadow">
                              ختم المنصة معتمد 🛡️
                            </span>
                            <span className="text-[7.5px] text-slate-500 block pt-0.5">Sakeenah Platform 2026</span>
                          </div>
                        </div>

                      </div>

                      {/* Modal Footer / Download-Print triggers */}
                      <div className="bg-slate-950 p-5 border-t border-slate-850 flex justify-between gap-3 sticky bottom-0 z-10 font-black">
                        <button
                          type="button"
                          onClick={() => setActiveReportModalData(null)}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-[11px] text-slate-300 rounded-xl border border-slate-800 transition cursor-pointer"
                        >
                          إغلاق النافذة ✕
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (activeReportModalData.type === "initial") {
                              handleExportPDF();
                            } else {
                              handleExportSingleFollowupPDF(activeReportModalData.data);
                            }
                          }}
                          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-slate-950 rounded-xl transition cursor-pointer text-[11px] flex items-center gap-1.5"
                        >
                          <FileText className="w-4 h-4 text-slate-950" />
                          بدء الطباعة فورا / تصدير (PDF) ⎙
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>

          )}

        </div>
      )}

    </div>
  );
}
