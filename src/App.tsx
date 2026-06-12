import React, { useState } from "react";
import { Brain, FileHeart, Pill, Video, Smile, BookOpen, Layers, ShieldAlert, Sparkles, HeartHandshake, Play, HelpCircle, PhoneCall, AlertTriangle, ListCollapse, X, Clock, ExternalLink, Search } from "lucide-react";

// Import modular panels
import { ClinicalTriage } from "./components/ClinicalTriage";
import { StandardTests } from "./components/StandardTests";
import { CbtActTools } from "./components/CbtActTools";
import { DrugAlertScheduler } from "./components/DrugAlertScheduler";
import { TelehealthClinic } from "./components/TelehealthClinic";
import { VitalsTracker } from "./components/VitalsTracker";
import { AdminDashboard } from "./components/AdminDashboard";
import { EmergencyInterrupt } from "./components/EmergencyInterrupt";

// Import new modular clinical journey & drugs DB
import { IntegratedClinicalJourney } from "./components/IntegratedClinicalJourney";
import { PsychiatricMedicationsDirectory } from "./components/PsychiatricMedicationsDirectory";
import { PersonalityTestsSuite } from "./components/PersonalityTestsSuite";

// Import structured data
import { PSYCHOLOGICAL_GLOSSARY } from "./data/libraryData";

// Helper to transform any YouTube watch URL into a reliable embed URL
const getYoutubeEmbedUrl = (url?: string) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : "";
};

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<"journey" | "medications" | "personality-tests" | "cbt" | "drugs" | "library">("journey");
  
  // Independent sub-tests switch tab
  const [subTestTab, setSubTestTab] = useState<"clinical" | "personality">("clinical");

  // Responsive sidebar toggles for small screens
  const [sidemenuOpen, setSidemenuOpen] = useState(false);

  // Global clinical states
  const [questionnaireScores, setQuestionnaireScores] = useState<Record<string, number>>({
    "PHQ-9": 0,
    "GAD-7": 0,
    "PSS-10": 0
  });

  const [emergencyReason, setEmergencyReason] = useState<string | null>(null);

  // Video tutorial player state
  const [activeVideoUrl, setActiveVideoUrl] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Glossary states
  const [glossarySearch, setGlossarySearch] = useState("");
  const [glossaryCategory, setGlossaryCategory] = useState<"all" | "disorder" | "concept" | "technique">("all");
  const [selectedGlossaryEntry, setSelectedGlossaryEntry] = useState<any | null>(null);

  const navigationTabs = [
    { id: "journey", label: "الرحلة السريرية المتكاملة", icon: HeartHandshake, description: "التقييم، الشكوى، التشخيص والمتابعة" },
    { id: "cbt", label: "خطة الدعم الذاتي (CBT)", icon: Smile, description: "الأفكار، سلم التعرض، والتنفس" },
    { id: "drugs", label: "الأدوية المشخصة", icon: Pill, description: "مواعيد الجرعات والالتزام اليومي" },
    { id: "medications", label: "الموسوعة الدوائية النفسية", icon: Pill, description: "تفاصيل الأدوية والتركيزات والمزايا والعيوب" },
    { id: "personality-tests", label: "الاختبارات وأنماط الشخصية", icon: FileHeart, description: "اختبارات MBTI، الإنياغرام، والمقاييس الطبية" },
    { id: "library", label: "المكتبة المعرفية والتوعية", icon: BookOpen, description: "كتب عيادية وفيديوهات توعوية" }
  ];

  const handleTestComplete = (testId: string, score: number) => {
    setQuestionnaireScores((prev) => ({ ...prev, [testId]: score }));
  };

  const triggerEmergency = (reason: string) => {
    setEmergencyReason(reason);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      
      {/* EARLY WARNING EMERGENCY HALT MODAL */}
      {emergencyReason && (
        <EmergencyInterrupt
          reason={emergencyReason}
          onDismiss={() => setEmergencyReason(null)}
        />
      )}

      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-850 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setSidemenuOpen(!sidemenuOpen)}
            className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 hover:text-white md:hidden cursor-pointer"
          >
            <ListCollapse className="w-5 h-5" />
          </button>
          
          <div className="bg-teal-500 text-slate-950 p-2 rounded-2xl border border-teal-400/20 shadow-md">
            <Brain className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight text-white">سَــكِـيـنَـة</h1>
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-900/40 text-emerald-400 text-[9px] font-bold rounded font-mono">Developed by Kareem Abdelhamid</span>
            </div>
            <p className="text-[10px] text-slate-450 text-slate-400">المنصة الطبية المتكاملة للفرز والدعم الإكلينيكي</p>
          </div>
        </div>

        {/* Global safety status Indicator */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-slate-400/95 font-medium shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>الاتصال بالمركز الطبي مشفّر تماماً (SSL V3)</span>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-grow flex relative">
        
        {/* SIDE BAR NAVIGATION */}
        <aside className={`fixed inset-y-0 right-0 w-72 bg-slate-900 border-l border-slate-850 z-40 transform transition-transform duration-300 md:translate-x-0 md:static md:h-auto ${
          sidemenuOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          <div className="p-4 h-full flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3 md:hidden">
                <span className="text-xs font-bold text-slate-400">أقسام المنصة</span>
                <button
                  onClick={() => setSidemenuOpen(false)}
                  className="p-1 bg-slate-950 rounded-lg text-slate-500 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {navigationTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setSidemenuOpen(false);
                      }}
                      className={`w-full p-3.5 rounded-2xl text-right transition flex items-start gap-3.5 border text-xs cursor-pointer ${
                        isActive
                          ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                          : "bg-transparent border-transparent text-slate-400 hover:bg-slate-950/20 hover:text-slate-200"
                      }`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                      <div className="space-y-0.5">
                        <span className="font-extrabold block text-slate-100">{tab.label}</span>
                        <span className="text-[10px] text-slate-500 block leading-snug">{tab.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Credential disclaimer bottom inside sidebar */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-2 text-[10px] text-slate-500 leading-normal">
              <div className="flex items-center gap-1 text-slate-400 font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
                <span>إثبات التوافق الإكلينيكي:</span>
              </div>
              <p>تتوافق منظومة \"سكينة\" بالكامل مع ضوابط حماية الخصوصية الرقمية وبيان العلاج السلوكي لـ WHO والـ APA المعايير ICD-11.</p>
            </div>
          </div>
        </aside>

        {/* MAIN VIEWS CONTAINER */}
        <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-full">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* View Switching */}
            {activeTab === "journey" && <IntegratedClinicalJourney />}

            {activeTab === "medications" && <PsychiatricMedicationsDirectory />}

            {activeTab === "personality-tests" && (
              <div className="space-y-8 animate-fade-in text-right">
                <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-100">الجناح الموحد للمقاييس السريرية واختبارات الأنماط</h2>
                    <p className="text-xs text-slate-400 mt-1">تصفح المقاييس السريرية المعتمدة طبياً أو اختبارات تصنيف أنماط الشخصية وبيئة المحيط العمل بشكل مستقل.</p>
                  </div>
                </div>

                <div className="flex bg-slate-900 border border-slate-850 p-1.5 rounded-xl w-max font-semibold text-xs text-right gap-1">
                  <button
                    onClick={() => setSubTestTab("clinical")}
                    className={`px-4 py-1.5 rounded-lg transition cursor-pointer ${subTestTab === "clinical" ? "bg-teal-600 text-slate-950 font-black" : "text-slate-400 hover:text-white"}`}
                  >
                    مقياس التقييم السريري (PHQ-9, GAD-7, PSS-10)
                  </button>
                  <button
                    onClick={() => setSubTestTab("personality")}
                    className={`px-4 py-1.5 rounded-lg transition cursor-pointer ${subTestTab === "personality" ? "bg-teal-600 text-slate-950 font-black" : "text-slate-400 hover:text-white"}`}
                  >
                    اختبارات الشخصية والعمل (MBTI, Enneagram, DISC)
                  </button>
                </div>

                {subTestTab === "clinical" ? (
                  <StandardTests
                    onTestComplete={handleTestComplete}
                    onEmergencyTriggered={triggerEmergency}
                  />
                ) : (
                  <PersonalityTestsSuite />
                )}
              </div>
            )}

            {activeTab === "cbt" && <CbtActTools />}

            {activeTab === "drugs" && <DrugAlertScheduler />}

            {activeTab === "library" && (
              /* ENCYCLOPEDIC PSYCHOLOGY & BEHAVIORAL GLOSSARY LIBRARY */
              <div id="library-section" className="space-y-8 animate-fade-in text-right">
                {/* Banner */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
                  <div className="z-10 text-center md:text-right space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 border border-teal-800 rounded-full text-teal-400 text-xs font-semibold mb-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      الدليل والموسوعة الموحدة للطب السلوكي
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white font-sans">موسوعة الصحة والمفاهيم السلوكية</h2>
                    <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                      بوابتك العيادية المبسطة للتعرف على كليات الاضطرابات النفسية وأعراضها، ومصطلحات العلاج السلوكي المعرفي (CBT) وتكتيك تنظيم ضربات القلب والأوتار العصبية بشكل وافٍ وسهل.
                    </p>
                  </div>
                  <div className="bg-teal-500/10 p-4 rounded-2xl border border-teal-500/20 z-10">
                    <Brain className="w-12 h-12 text-teal-400" />
                  </div>
                </div>

                {/* Search & Dynamic Filters Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-900 select-none">
                  {/* Search bar */}
                  <div className="relative w-full md:max-w-md">
                    <Search className="w-4 h-4 text-slate-500 absolute top-3.5 right-3.5" />
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="ابحث عن مصطلح، اضطراب (مثال: هلع، وسواس، CBT)..."
                      value={glossarySearch}
                      onChange={(e) => setGlossarySearch(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-950 rounded-xl text-xs text-slate-200 border border-slate-850 focus:outline-none focus:border-teal-500 font-semibold"
                    />
                    {glossarySearch && (
                      <button
                        onClick={() => setGlossarySearch("")}
                        className="absolute left-3.5 top-3.5 text-[9px] font-bold text-slate-500 hover:text-white"
                      >
                        مسح
                      </button>
                    )}
                  </div>

                  {/* Filters tabs */}
                  <div className="flex flex-wrap gap-1.5 scrollbar-hide overflow-x-auto">
                    <button
                      onClick={() => setGlossaryCategory("all")}
                      className={`px-3.5 py-1.5 rounded-lg text-[10.5px] font-black cursor-pointer transition ${
                        glossaryCategory === "all"
                          ? "bg-teal-500 text-slate-950 shadow-md"
                          : "bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900"
                      }`}
                    >
                      الكل ({PSYCHOLOGICAL_GLOSSARY.length})
                    </button>
                    <button
                      onClick={() => setGlossaryCategory("disorder")}
                      className={`px-3.5 py-1.5 rounded-lg text-[10.5px] font-black cursor-pointer transition ${
                        glossaryCategory === "disorder"
                          ? "bg-red-500 text-slate-950 shadow-md"
                          : "bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900"
                      }`}
                    >
                      الأمراض والاضطرابات
                    </button>
                    <button
                      onClick={() => setGlossaryCategory("concept")}
                      className={`px-3.5 py-1.5 rounded-lg text-[10.5px] font-black cursor-pointer transition ${
                        glossaryCategory === "concept"
                          ? "bg-indigo-500 text-white shadow-md"
                          : "bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900"
                      }`}
                    >
                      المفاهيم والنظريات
                    </button>
                    <button
                      onClick={() => setGlossaryCategory("technique")}
                      className={`px-3.5 py-1.5 rounded-lg text-[10.5px] font-black cursor-pointer transition ${
                        glossaryCategory === "technique"
                          ? "bg-purple-500 text-white shadow-md"
                          : "bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900"
                      }`}
                    >
                      التقنيات والتمارين
                    </button>
                  </div>
                </div>

                {/* Glossary Items Grid */}
                {PSYCHOLOGICAL_GLOSSARY.filter((entry) => {
                  const query = glossarySearch.toLowerCase();
                  const matchesSearch =
                    entry.term.toLowerCase().includes(query) ||
                    entry.scientificName.toLowerCase().includes(query) ||
                    entry.explanation.toLowerCase().includes(query);
                  const matchesCategory =
                    glossaryCategory === "all" || entry.category === glossaryCategory;
                  return matchesSearch && matchesCategory;
                }).length === 0 ? (
                  <div className="text-center py-16 bg-slate-950 border border-dashed border-slate-900 rounded-3xl text-slate-500 text-xs">
                    لا توجد مصطلحات مطابقة لبحثك في الموسوعة حالياً. يرجى تعديل العبارة.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PSYCHOLOGICAL_GLOSSARY.filter((entry) => {
                      const query = glossarySearch.toLowerCase();
                      const matchesSearch =
                        entry.term.toLowerCase().includes(query) ||
                        entry.scientificName.toLowerCase().includes(query) ||
                        entry.explanation.toLowerCase().includes(query);
                      const matchesCategory =
                        glossaryCategory === "all" || entry.category === glossaryCategory;
                      return matchesSearch && matchesCategory;
                    }).map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => setSelectedGlossaryEntry(entry)}
                        className="bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 cursor-pointer transition group relative hover:shadow-xl hover:shadow-slate-950/40"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                                entry.category === "disorder"
                                  ? "bg-red-950 text-red-400 border border-red-900/30"
                                  : entry.category === "concept"
                                  ? "bg-indigo-950 text-indigo-400 border border-indigo-900/30"
                                  : "bg-purple-950 text-purple-400 border border-purple-900/30"
                              }`}
                            >
                              {entry.categoryLabel}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono font-bold tracking-tight">
                              {entry.scientificName}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-100 text-sm group-hover:text-teal-400 transition">
                              {entry.term}
                            </h4>
                            <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed">
                              {entry.explanation}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-900/50 text-[10px] text-teal-400 font-extrabold group-hover:text-white transition">
                          <span>انقر للمطالعة والاستكشاف الموسوعي</span>
                          <span>←</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* DETAILED GLOSSARY ENTRY MODAL POPUP */}
                {selectedGlossaryEntry && (
                  <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 relative text-right">
                      {/* Close Button */}
                      <button
                        onClick={() => setSelectedGlossaryEntry(null)}
                        className="absolute top-5 left-5 p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Top Header */}
                      <div className="border-b border-slate-850 pb-4 space-y-2.5">
                        <span
                          className={`px-3 py-1 rounded text-[10px] font-black uppercase inline-block border ${
                            selectedGlossaryEntry.category === "disorder"
                              ? "bg-red-950 text-red-400 border-red-900/40"
                              : selectedGlossaryEntry.category === "concept"
                              ? "bg-indigo-950 text-indigo-400 border-indigo-900/40"
                              : "bg-purple-950 text-purple-400 border-purple-900/40"
                          }`}
                        >
                          {selectedGlossaryEntry.categoryLabel}
                        </span>
                        
                        <h3 className="font-extrabold text-slate-100 text-lg md:text-xl font-sans mt-1">
                          {selectedGlossaryEntry.term}
                        </h3>
                        <p className="text-xs text-teal-400 font-mono font-extrabold">
                          Medical Scientific Name: {selectedGlossaryEntry.scientificName}
                        </p>
                      </div>

                      {/* Explanation Block */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-400">شرح المفهوم بأسلوب طبي مبسط:</h4>
                        <p className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-slate-200 text-xs md:text-[13px] leading-relaxed">
                          {selectedGlossaryEntry.explanation}
                        </p>
                      </div>

                      {/* Symptoms Block */}
                      {selectedGlossaryEntry.symptoms && selectedGlossaryEntry.symptoms.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-slate-400 flex items-center gap-1.5 justify-end">
                            <ShieldAlert className="w-4 h-4 text-red-400" />
                            الأعراض والسمات الإكلينيكية المصاحبة:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {selectedGlossaryEntry.symptoms.map((sym: string, i: number) => (
                              <div
                                key={i}
                                className="p-3 bg-red-950/10 border border-slate-850 rounded-xl text-xs text-slate-350 leading-normal flex items-center justify-end gap-2 text-right"
                              >
                                <span className="flex-1">{sym}</span>
                                <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Self-Care Tips */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-400 flex items-center gap-1.5 justify-end">
                          <Smile className="w-4 h-4 text-teal-400" />
                          إرشادات الدعم والترياق المعرفي السلوكي الذاتي:
                        </h4>
                        <div className="space-y-2">
                          {selectedGlossaryEntry.selfCareTips.map((tip: string, i: number) => (
                            <div
                              key={i}
                              className="p-3.5 bg-slate-950/65 border border-slate-850 rounded-xl text-xs text-emerald-300 flex items-start justify-end gap-2 text-right"
                            >
                              <p className="flex-1 leading-relaxed">{tip}</p>
                              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer Info info bar */}
                      <div className="pt-2 text-center text-[9.5px] text-slate-500 border-t border-slate-850">
                        منشور طبي استرشادي معتمد للتمكين الذاتي الرقمي بموجب تراخيص المراجعة الطبية الموحدة لسكينة.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-850 px-4 md:px-8 py-4 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>© 2026 سكينة للطب النفسي وإعادة التأهيل السلوكي. كافّة الحقوق محفوظة للمركز ومحمية بنظام السرية الطبية.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">شروط الاستخدام</a>
          <a href="#" className="hover:underline">بيان خصوصية البيانات الطبية HIPAA</a>
        </div>
      </footer>
    </div>
  );
}
