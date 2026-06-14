import React, { useState, useRef } from "react";
import { Brain, Mic, MicOff, Play, Send, ShieldCheck, HeartHandshake, RefreshCw, Sparkles, User, FileText, AlertTriangle } from "lucide-react";
import { Demographics, ClinicalAnalysisResult } from "../types";

interface ClinicalTriageProps {
  questionnaireScores: Record<string, number>;
  onEmergencyTriggered: (reason: string) => void;
}

export function ClinicalTriage({ questionnaireScores, onEmergencyTriggered }: ClinicalTriageProps) {
  const [demographics, setDemographics] = useState<Demographics>({
    age: "28",
    gender: "أنثى",
    marital: "أعزب",
    education: "بكالوريوس",
    job: "مصممة واجهات رقمية",
    chronicDiseases: "لا توجد أمراض مزمنة بفضل الله"
  });

  const [complaintText, setComplaintText] = useState("");
  const [pastHistory, setPastHistory] = useState("لا يوجد تاريخ كبوات أو علاج نفسي سابق");
  const [familyHistory, setFamilyHistory] = useState("لا يوجد أمراض نفسية سائدة في العائلة");
  const [medications, setMedications] = useState("لم يتم وصف أدوية نفسية حالية");

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("جاهز للتسجيل");
  const [voiceEmotionAnalysis, setVoiceEmotionAnalysis] = useState<any | null>(null);
  
  // Ref for local web audio capture
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // AI analysis target reports state
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ClinicalAnalysisResult | null>(null);

  // Standard clinics voice presets for fallback testing or rapid demonstration
  const audioPresets = [
    {
      title: "نوبة خوف حاد (قلق/هلع)",
      transcript: "أشعر منذ أسابيع بضيق مفاجئ شديد في التنفس وصدر متشنج، مع تسارع رهيب ومفاجئ في ضربات القلب، يأتيني ومعه ذعر هائل وكأني سأموت حالاً دون سبب واضح.",
      emotions: ["Severe Anxiety / panic", "Fear of death"],
      symptoms: ["Dyspnea / chest tightness", "Tachycardia / heart racing", "Hyperventilation"]
    },
    {
      title: "عزلة وخمول (اكتئاب حاد)",
      transcript: "مربوط في فراشي منذ أيام، لا رغبة لي في رؤية أحد أو الأكل، فقدت المتعة تماماً في الأشياء التي كنت أحبها، مع رغبة مستمرة في البكاء وصعوبة تامة في التركيز.",
      emotions: ["Depressive dysphoria", "Helplessness / Grief"],
      symptoms: ["Anhedonia / loss of joy", "Hypersomnia / fatigue", "Loss of appetite"]
    }
  ];

  const [isTriageMicSimulated, setIsTriageMicSimulated] = useState(false);

  // Start real web-mic recording if allowed
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const actualMime = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });
        setRecordingStatus("جاري تحويل الصوت إلى نص وتحليله إكلينيكياً...");
        
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(",")[1];
          try {
            const res = await fetch("/api/gemini/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audioBase64: base64Audio, mimeType: actualMime })
            });
            const data = await res.json();
            if (data.transcript) {
              setComplaintText((prev) => prev ? prev + "\n" + data.transcript : data.transcript);
              setVoiceEmotionAnalysis(data);
              setRecordingStatus("تم تدوين المقطع وتحليله بنجاح!");
            } else {
              setRecordingStatus("فشل تحويل الصوت. تم تفعيل التدوين اليدوي بدلاً منه.");
            }
          } catch (err) {
            console.error("Transcription error:", err);
            setRecordingStatus("خطأ بالخادم. يرجي كتابة الشكوى يدوياً.");
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsTriageMicSimulated(false);
      setRecordingStatus("جاري تسجيل صوتك الآن... تكلم بفضفضة وبراحة تامة عن معاناتك.");
    } catch (err: any) {
      console.warn("Camera or Microphone are blocked or unsupported, entering simulation mode:", err);
      setIsTriageMicSimulated(true);
      setIsRecording(true);
      setRecordingStatus("نمط المحاكاة الصوتية مفعل بسبب عوائق الميكروفون بالمعاينة...");
    }
  };

  const stopRecording = () => {
    if (isTriageMicSimulated) {
      setIsRecording(false);
      
      const defaultPreset = "أعاني منذ أشهر من نوبات هلع مفاجئة مرافقة لضيق تنفس وتسارع كبير في ضربات قلبي مع قلق دائم.";
      const customizedText = window.prompt(
        "من فضلك، اكتب أو عدل شكواك الطبية المكتوبة أدناه ليتم تقييمها واستخلاص الأعراض موضوعياً وبدقة:",
        defaultPreset
      );
      
      const textToUse = customizedText !== null ? customizedText : defaultPreset;
      
      setRecordingStatus("جاري تحويل الصوت المحاكي للنظام عيادياً...");
      
      setTimeout(() => {
        setComplaintText((prev) => prev ? prev + "\n" + textToUse : textToUse);
        setVoiceEmotionAnalysis({
          transcript: textToUse,
          detectedEmotions: ["انفعال قلق ذعر مقنع", "Clinical Distress"],
          extractedSymptoms: ["Anxiety / panic", "Emotional fluctuations"],
          anxietyScore: textToUse.includes("هلع") || textToUse.includes("قلق") ? 92 : 45,
          tensionLevel: textToUse.includes("هلع") || textToUse.includes("قلق") ? "مرتفع جداً (High Tension)" : "متوسط (Mild Contentment)"
        });
        setRecordingStatus("تم تدوين وتحليل محاكاة الصوت بنجاح!");
      }, 1200);
    } else {
      if (mediaRecorderRef.current && isRecording) {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.warn(e);
        }
        setIsRecording(false);
      }
    }
  };

  const handleApplyPreset = (preset: typeof audioPresets[0]) => {
    setComplaintText((prev) => prev ? prev + "\n" + preset.transcript : preset.transcript);
    setVoiceEmotionAnalysis({
      transcript: preset.transcript,
      detectedEmotions: preset.emotions,
      extractedSymptoms: preset.symptoms,
      anxietyScore: preset.title.includes("خوف") ? 92 : 45,
      tensionLevel: preset.title.includes("خوف") ? "مرتفع جداً (High Tension)" : "متوسط (Mild Contentment)"
    });
    setRecordingStatus(`تم تطبيق عينة: ${preset.title}`);
  };

  // Triggers main Gemini assessment
  const handlePerformAnalysis = async () => {
    if (!complaintText.trim()) {
      alert("يرجى إدخال الشكوى النفسية أو تسجيل مقطع صوت أولاً قبل تفعيل محرك التحليل.");
      return;
    }

    setLoading(true);
    setReport(null);

    // PHQ-9 integration client check prior to API call
    const triggers = ["انتحار", "أنتحر", "أقتل نفسي", "إيذاء", "suicide", "end my life"];
    const triggerWords = triggers.find(t => complaintText.toLowerCase().includes(t));
    if (triggerWords) {
      onEmergencyTriggered(`كشفت الصياغة النصية لـ الشكوى عن نية أو قرائن إيذاء نفسي وحرج ("${triggerWords}").`);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        demographics,
        complaintText,
        questionnaires: questionnaireScores,
        pastHistory,
        familyHistory,
        medications
      };

      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const reportData = await res.json();
      
      if (reportData.isEmergency) {
        onEmergencyTriggered(reportData.emergencyContactsArabic || "تم الكشف عن مؤشرات خطر عالية على محددات الأمن النفسي.");
      } else {
        setReport(reportData);
      }
    } catch (err) {
      console.error("Clinical analyzer prompt failed:", err);
      alert("حدث فشل طارئ بالاتصال بالخادم العيادي الخاص بالتحليل.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="psych-triage-section" className="space-y-8">
      {/* Clinician Hub Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="z-10 text-center md:text-right space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950 border border-emerald-800 rounded-full text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            توليد التقارير المتوافقة مع DSM-5-TR
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">محرك التقييم الإكلينيكي الشامل والفرز النفسي</h2>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            املأ ملفك الديموغرافي والطبي، وسجل شكوتك الأساسية بالصوت أو النص، ليدمج النظام نتائج استبياناتك ويولّد تقريراً فرزياً مع توصيات عيادية مفصلة.
          </p>
        </div>
        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 z-10">
          <Brain className="w-12 h-12 text-emerald-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Patient File completion (Col 5) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-5 max-w-full">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
            <User className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base text-slate-100">بيانات السيرة والملف الطبي المرفق</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs leading-normal">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">العمر الحالي</label>
              <input
                type="text"
                value={demographics.age}
                onChange={(e) => setDemographics({ ...demographics, age: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-200 border border-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">الجنس</label>
              <select
                value={demographics.gender}
                onChange={(e) => setDemographics({ ...demographics, gender: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-200 border border-slate-800 focus:outline-none"
              >
                <option value="أنثى">أنثى</option>
                <option value="ذكر">ذكر</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">الحالة الاجتماعية</label>
              <input
                type="text"
                value={demographics.marital}
                onChange={(e) => setDemographics({ ...demographics, marital: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-200 border border-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">المستوى التعليمي</label>
              <input
                type="text"
                value={demographics.education}
                onChange={(e) => setDemographics({ ...demographics, education: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-200 border border-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-bold text-slate-400">الوظيفة أو مجال العمل</label>
              <input
                type="text"
                value={demographics.job}
                onChange={(e) => setDemographics({ ...demographics, job: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-200 border border-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-bold text-slate-400">التاريخ المرضي العضوي والأدوية العامة</label>
              <input
                type="text"
                value={demographics.chronicDiseases}
                onChange={(e) => setDemographics({ ...demographics, chronicDiseases: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-200 border border-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-bold text-slate-400">التاريخ النفسي الشخصي السابق</label>
              <input
                type="text"
                value={pastHistory}
                onChange={(e) => setPastHistory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-200 border border-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-bold text-slate-400">التاريخ النفسي للعائلة (وراثي)</label>
              <input
                type="text"
                value={familyHistory}
                onChange={(e) => setFamilyHistory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-200 border border-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-bold text-slate-500">الأدوية العلاجية الحالية الموصوفة</label>
              <input
                type="text"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-200 border border-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Written & Vocal Complainer Area (Col 7) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-base text-slate-100">تفصيل الشكوى ونبض الفضفضة النفسية</h3>
            </div>
            <span className="text-[9px] font-bold px-2.5 py-0.5 bg-sky-950 rounded text-sky-400">تشفير إكلينيكي كامل</span>
          </div>

          <div className="space-y-4">
            {/* Written text Box */}
            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-bold text-slate-400">1. صف شكوتك وحالتك النفسية بكل حرية وعفوية وبأدق تفاصيل تشعر بها:</label>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="اكتب بأريحية ما يجوب في خلدك من ألم نفسي، أو توتر غامر، أو أرق يداعب جفونك، وسجل متى بدأ وما المثيرات من حولك..."
                className="w-full bg-slate-900 rounded-xl text-xs text-slate-150 p-4 border border-slate-800 h-32 focus:outline-none focus:border-teal-500 font-medium leading-relaxed resize-none"
              />
            </div>

            {/* Vocal Microphone recorder Area */}
            <div className="bg-slate-900/60 p-4 border border-slate-900 rounded-2xl space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <Mic className="w-4 h-4 text-teal-400" /> أو سجل الشكوى بصوتك مباشرة للتسهيل والترجمة التعبيرية:
                </span>
                <span className="text-[9px] text-slate-505 font-bold text-slate-500 font-mono">{recordingStatus}</span>
              </div>

              {/* Action record buttons */}
              <div className="flex items-center gap-3">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs transition flex items-center gap-1.5 animate-pulse"
                  >
                    <MicOff className="w-4 h-4" /> اضغط لإيقاف التسجيل والتحليل
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="py-2.5 px-4 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow"
                  >
                    <Mic className="w-4 h-4" /> ابدأ التسجيل الميكروفوني
                  </button>
                )}
              </div>

              {/* Audio clinical presets fallback */}
              <div className="pt-2 border-t border-slate-850">
                <span className="text-[10px] text-slate-400 block mb-2 font-bold">للتجربة السريعة (انقر لتطبيق عينة صوتية مسجلة مسبقاً):</span>
                <div className="flex flex-wrap gap-2">
                  {audioPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-300 font-semibold rounded-lg text-[10px] transition border border-slate-850 flex items-center gap-1"
                    >
                      <Play className="w-2.5 h-2.5 fill-slate-300 text-transparent" />
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice emotion index metadata visualization */}
              {voiceEmotionAnalysis && (
                <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl space-y-2.5 text-[10px] leading-normal animate-fade-in text-slate-400">
                  <div className="flex justify-between font-bold border-b border-slate-900 pb-1.5 text-teal-400">
                    <span>تحليل الميكانيزم التعبيري ونبرة الصوت:</span>
                    <span>معدل التوتر المكتشف: {voiceEmotionAnalysis.anxietyScore}%</span>
                  </div>
                  <div>
                    <span className="font-bold">المشاعر الطاغية المترجمة:</span>
                    <p className="text-slate-300">{voiceEmotionAnalysis.detectedEmotions.join(" ، ")}</p>
                  </div>
                  <div>
                    <span className="font-bold">أعراض الصدمة الجسدية المنبثقة حديثاً:</span>
                    <p className="text-slate-300">{voiceEmotionAnalysis.extractedSymptoms.join(" ، ")}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Run comprehensive assess button */}
            <button
              type="button"
              onClick={handlePerformAnalysis}
              disabled={loading}
              className="w-full py-3 bg-teal-500 hover:bg-teal-605 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition hover:bg-teal-600 disabled:bg-slate-900 disabled:text-slate-600 shadow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                  <span>جاري فك رموز الشكوى وإعداد تقرير الطبي الرعائي المعتمد...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 fill-slate-950 text-teal-500" />
                  <span>تفعيل محرك التحليل السريري وتوليد التقرير الأولي النفسي الشامل</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RENDER THE MAJESTIC MULTI-DIALECTED CLINICAL REPORT */}
      {report && (
        <div className="bg-slate-950 border-2 border-emerald-500/50 rounded-3xl p-6 space-y-8 animate-fade-in relative overflow-hidden">
          {/* Subtle green ambient light */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Report Metadata */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-6">
            <div className="space-y-1.5 text-center md:text-right">
              <span className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-900/40 rounded text-emerald-400 font-extrabold text-[10px] tracking-wider uppercase">تقرير تشخيص عيادي أولي رسمي</span>
              <h3 className="text-xl md:text-2xl font-black text-slate-100">صحيفة الفرز الأولي والدعم النفسي الذاتي</h3>
              <p className="text-[10px] text-slate-450 text-slate-500">مبني بالاعتماد الفوقي على المراجعات المنهجية DSM-5-TR والـ ICD-11 لمنظمة الصحة العالمية.</p>
            </div>

            <div className="flex gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-center flex flex-col justify-center">
                <span className="text-[9px] text-slate-500 font-bold block">مؤشر نطاق الخطورة</span>
                <span className={`text-xs font-black uppercase tracking-wide ${
                  report.riskLevel.toLowerCase() === "low" ? "text-emerald-400" : report.riskLevel.toLowerCase() === "moderate" ? "text-amber-400" : "text-rose-450 text-rose-500"
                }`}>{report.riskLevel}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-center flex flex-col justify-center">
                <span className="text-[9px] text-slate-500 font-bold block">دقة المحرك التوليدية</span>
                <span className="text-xs font-black text-teal-400 font-mono">{report.confidence}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs leading-relaxed max-w-full">
            {/* Condition suspected (Probability logs) (Col 5) */}
            <div className="md:col-span-5 space-y-6">
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-200 border-r-2 border-teal-500 pr-2">الاضطرابات والأعراض الأكثر احتمالاً:</h4>
                <div className="space-y-2 text-[11px]">
                  {report.suspectedConditions.map((cond, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-900 p-3 rounded-xl flex items-center justify-between font-bold text-slate-200">
                      <span>{cond}</span>
                      <span className="px-2 py-0.5 bg-slate-950 text-teal-400 font-extrabold rounded">محتمل</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-200 border-r-2 border-teal-500 pr-2">أعراض الدعم الإكلينيكي المكتشفة:</h4>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {report.primarySymptoms.map((sym, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-900 border border-slate-850 rounded-lg font-bold text-slate-400">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Therapist Type Recommendation */}
              <div className="bg-teal-500/5 border border-teal-500/10 p-4 rounded-3xl space-y-2">
                <strong className="text-teal-400 font-extrabold block text-xs flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-teal-400" /> التوجيه الإكلينيكي للمعالجة البشرية:
                </strong>
                <p className="text-slate-350 text-[11px] leading-relaxed text-slate-300">
                  {report.suggestedTherapistTypeArabic}
                </p>
              </div>
            </div>

            {/* Analysis narrative and summaries (Col 7) */}
            <div className="md:col-span-7 space-y-5">
              <h4 className="font-extrabold text-sm text-slate-200 border-r-2 border-teal-500 pr-2">الملخص وتوصيف الحالة الإكلينيكي:</h4>
              <p className="text-slate-300 font-medium leading-relaxed leading-loose text-[11.5px] bg-slate-900/50 border border-slate-900/60 p-4 rounded-2xl">
                {report.summaryArabic}
              </p>

              <div className="space-y-2.5">
                <h4 className="font-extrabold text-sm text-slate-200">أدلة وقرائن التشخيص المستخرجة من الفايل:</h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-400 pl-1 text-[11px]">
                  {report.supportingSymptomsArabic.map((point, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Deep personalized Treatment Action CBT & ACT modules */}
          <div className="border-t border-slate-900 pt-8 space-y-6">
            <h3 className="font-black text-base text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-teal-400" /> بروتوكول العلاج الذاتي المعرفي والسلوكي التفاعلي الموصى به:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-normal">
              {/* CBT Restructuring Homework list */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5 text-xs text-slate-200 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>خطوات العلاج المعرفي السلوكي (CBT Guide)</span>
                </div>
                <div className="space-y-3 text-[11px] leading-relaxed">
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">دحض الأفكار التلقائية المشوهة والمقاومة:</span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                      {report.cbtPlan?.cognitiveRestructuring.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-slate-850/50 pt-2.5">
                    <span className="text-emerald-400 font-bold block mb-1">التنشيط السلوكي وجداول المهام العملية:</span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                      {report.cbtPlan?.behavioralActivation.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-slate-850/50 pt-2.5">
                    <span className="text-emerald-405 text-emerald-400 font-bold block mb-1">التمرين المنزلي العلاجي المعروض:</span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                      {report.cbtPlan?.practicalHomework.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* ACT Defusion mindfulness homework list */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5 text-xs text-slate-200 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                  <span>العلاج بالقبول والالتزام واليقظة (ACT Guide)</span>
                </div>
                <div className="space-y-3 text-[11px] leading-relaxed">
                  <div>
                    <span className="text-teal-400 font-bold block mb-1">تدريبات الفصل والتباعد الذهني والقبول:</span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                      {report.actPlan?.mindfulnessArabic.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-slate-850/50 pt-2.5">
                    <span className="text-teal-400 font-bold block mb-1">بناء القيم السامية والتعهد السلوكي بالالتزام:</span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                      {report.actPlan?.valuesArabic.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinician Human validation warning stamp */}
          <div className="bg-amber-950/15 border border-amber-900/30 p-4 rounded-3xl flex gap-3 text-[10.5px] leading-normal text-amber-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-extrabold block">إخلاء مسؤولية تنظيمي وقانوني هام:</span>
              هذا التقرير هو نتاج الفرز الأولي الذكي المبسط ويعتبر توجيهاً استئناسياً وسلوكياً حراً وليس تشخيصاً طبياً نهائياً، ولا يغني بأي شكل من الأشكال عن مقابلة الطبيب النفسي المعالج أو الأخصائي الإكلينيكي البشري المعتمد. لا تقم بتعديل دوائك أو بدء بروتوكول عقاقير بناءً على هذا التقدير المحوسب.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
