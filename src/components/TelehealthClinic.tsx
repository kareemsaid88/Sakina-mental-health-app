import React, { useState } from "react";
import { Video, Calendar, Clock, DollarSign, ArrowLeft, Mic, MicOff, VideoOff, Send, Clipboard, ShieldCheck, Sparkles } from "lucide-react";
import { CERTIFIED_DOCTORS } from "../data/libraryData";
import { ConsultationSession } from "../types";

export function TelehealthClinic() {
  const [sessions, setSessions] = useState<ConsultationSession[]>([
    {
      id: "s1",
      doctorNameArabic: "أ.د. عادل الصاوي",
      doctorTitleArabic: "استشاري الطب النفسي الإكلينيكي",
      doctorSpecialty: "دكتوراه الطب النفسي وعلاج الإدمان - جامعة القاهرة، زميل الكلية الملكية للأطباء النفسيين بلندن.",
      doctorImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop",
      date: "2026-06-15",
      time: "20:00",
      price: "450 جنيه / 150 ريال",
      status: "Scheduled",
      meetingLink: "#",
      category: "psychiatrist"
    }
  ]);

  const [bookingDoc, setBookingDoc] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState("2026-06-12");
  const [selectedTime, setSelectedTime] = useState("18:00");

  // Telehealth Consultation Room States
  const [activeCallSession, setActiveCallSession] = useState<ConsultationSession | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [notepadContent, setNotepadContent] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatLog, setChatLog] = useState([
    { sender: "doctor", text: "أهلاً بك في جلستنا الاستشارية الآمنة لليوم. أنا هنا للاستماع إليك بكل دقة وحفظ لأسرارك." },
    { sender: "patient", text: "أهلاً يا دكتور، أشعر بالامتنان والراحة لوجود هذه المقابلة المشفرة." }
  ]);

  const handleBookSession = () => {
    if (!bookingDoc) return;
    const newSession: ConsultationSession = {
      id: "sess_" + Date.now(),
      doctorNameArabic: bookingDoc.doctorNameArabic,
      doctorTitleArabic: bookingDoc.doctorTitleArabic,
      doctorSpecialty: bookingDoc.doctorSpecialty,
      doctorImage: bookingDoc.doctorImage,
      date: selectedDate,
      time: selectedTime,
      price: bookingDoc.price,
      status: "Scheduled",
      meetingLink: "#",
      category: bookingDoc.category
    };

    setSessions([newSession, ...sessions]);
    setBookingDoc(null);
    alert("تم حجز جلستك بنجاح! ستجدها مضافة في سجل تاريخ الجلسات.");
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatLog([...chatLog, { sender: "patient", text: chatMessage }]);
    setChatMessage("");
    
    // Simulate smart psychiatric auto-responses
    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        { sender: "doctor", text: "أفهمك تماماً. هذا الشعور طبيعي وسنعمل سوياً في هذه الجلسة على إعداد تمارين التعرض المناسبة وتجاوز هذه العقبة المعرفية السلوكية." }
      ]);
    }, 1500);
  };

  return (
    <div id="telehealth-clinic-section" className="space-y-8">
      {/* Clinician Hub Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="z-10 text-center md:text-right space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950 border border-cyan-800 rounded-full text-cyan-400 text-xs font-semibold mb-2">
            <Video className="w-3.5 h-3.5 animate-pulse" />
            استشارات علاجية مشفرة بخصوصية مطلقة HIPAA Compliant
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">العيادة المرئية والربط الطبي المعتمد</h2>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            احجز استشارات مرئية فورية مع نخبة الاستشاريين والمعالجين السلوكيين المعتمدين في الوطن العربي. غرف اتصال مباشر مشفرة تماماً مع تدوين للملاحظات الطبية.
          </p>
        </div>
        <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20 z-10 animate-spin-slow">
          <ShieldCheck className="w-12 h-12 text-cyan-400" />
        </div>
      </div>

      {activeCallSession ? (
        /* TELEHEALTH SECURE VIDEO ROOM (Simulated E2E Clinical Portal) */
        <div className="bg-slate-950 border-2 border-cyan-500 rounded-3xl p-4 md:p-6 space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
              <span className="text-xs font-semibold text-slate-100">جلسة علاجية مرئية نشطة ومؤمنة بالكامل</span>
            </div>
            <button
              onClick={() => setActiveCallSession(null)}
              className="py-1.5 px-4 bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1 border border-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> مغادرة الغرفة والعودة للعيادة
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
            {/* The Video Call feeds layout (Col 8) */}
            <div className="lg:col-span-8 flex flex-col justify-between gap-4 h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full flex-grow">
                {/* Peer Therapist feed */}
                <div className="bg-slate-900 rounded-2xl relative border border-slate-800 overflow-hidden min-h-[220px]">
                  <img
                    src={activeCallSession.doctorImage}
                    alt={activeCallSession.doctorNameArabic}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-teal-400 font-bold border border-teal-800/20">
                    الاستشاري (عن بعد)
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950/80 px-3 py-1 rounded-lg text-xs font-bold text-white">
                    {activeCallSession.doctorNameArabic}
                  </div>
                </div>

                {/* Patient's local camera preview */}
                <div className="bg-slate-900 rounded-2xl relative border border-slate-800 overflow-hidden min-h-[220px] flex items-center justify-center">
                  {videoOn ? (
                    <div className="w-full h-full bg-slate-850 flex items-center justify-center flex-col text-slate-400 text-xs">
                      {/* Realistic graphic representation of web stream if no cam available */}
                      <div className="w-16 h-16 rounded-full bg-cyan-950/40 border border-cyan-800 flex items-center justify-center text-cyan-400 text-lg font-black animate-pulse mb-3">
                        أنت
                      </div>
                      <p className="font-semibold text-slate-100 mb-1">كاميرا الويب مفعَّلة بنجاح</p>
                      <p className="text-[10px] text-slate-500">ميزة الحفاظ على الخصوصية والمحاذاة الشفافة مفعّلة.</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2 text-slate-500">
                      <VideoOff className="w-10 h-10 mx-auto" />
                      <p className="text-xs">جرى إغلاق بث الفيديو الخاص بك</p>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-teal-400 font-bold border border-teal-800/20">
                    أنت (بث محلي مشفر)
                  </div>
                </div>
              </div>

              {/* In-Call controls bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-center gap-4">
                <button
                  onClick={() => setMicOn(!micOn)}
                  className={`p-3 rounded-full border transition ${
                    micOn ? "bg-slate-950 border-slate-800 text-slate-300 hover:text-white" : "bg-red-950 border-red-900 text-red-400"
                  }`}
                >
                  {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setVideoOn(!videoOn)}
                  className={`p-3 rounded-full border transition ${
                    videoOn ? "bg-slate-950 border-slate-800 text-slate-300 hover:text-white" : "bg-red-950 border-red-900 text-red-300"
                  }`}
                >
                  {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    setActiveCallSession(null);
                    alert("لقد انتهت الجلسة العلاجية بنجاح. سنقوم بحفظ تقريرها الطبي وتصديره لملفك.");
                  }}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition"
                >
                  إنهاء الجلسة واستلام الملاحظات
                </button>
              </div>
            </div>

            {/* Chat and Coping notepad (Col 4) */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-full justify-between">
              {/* Coping strategy clinician notepad */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col flex-grow min-h-[220px]">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2 font-bold text-xs text-slate-200">
                  <Clipboard className="w-4 h-4 text-cyan-400" />
                  <span>مفكرة الجلسة (اكتب إرشادات المعالج هنا)</span>
                </div>
                <textarea
                  placeholder="سرِّع تدوين التوصيات السلوكية هنا.. مثال: التنفس المربع مرتين قبل الاجتماعات الحاشدة."
                  value={notepadContent}
                  onChange={(e) => setNotepadContent(e.target.value)}
                  className="w-full flex-grow bg-slate-950 text-xs text-slate-200 p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none h-[120px]"
                />
              </div>

              {/* Chat log with the doctor */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[230px]">
                <div className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2 mb-2">منصة المحادثة الفورية للغرفة</div>
                <div className="flex-grow overflow-y-auto space-y-2.5 text-[11px] pr-1">
                  {chatLog.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl max-w-[85%] ${
                        chat.sender === "doctor"
                          ? "bg-slate-950 text-slate-300 border border-slate-850"
                          : "bg-teal-500/10 border border-teal-500/20 text-teal-400 self-end ml-auto"
                      }`}
                    >
                      <span className="font-extrabold text-[9px] block mb-0.5 text-slate-500">
                        {chat.sender === "doctor" ? "المعالج" : "أنت"}
                      </span>
                      <p>{chat.text}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendChatMessage} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="اكتبي رسالتك للمعالج هنا..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-grow px-2.5 py-1.5 bg-slate-950 rounded-lg text-[10px] text-slate-100 border border-slate-800 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-1.5 bg-teal-500 text-slate-900 rounded-lg font-bold"
                  >
                    <Send className="w-3 px-0.5 h-3" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* REGULAR VIEWS: Booking Directory + Booked History */
        <div className="space-y-8">
          {bookingDoc ? (
            /* Selected Calendar details booking popup */
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
                <button
                  onClick={() => setBookingDoc(null)}
                  className="p-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-extrabold text-slate-100">تفاصيل حجز جلستك المرئية المباشرة</h3>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-xs">
                <img
                  src={bookingDoc.doctorImage}
                  alt={bookingDoc.doctorNameArabic}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{bookingDoc.doctorNameArabic}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{bookingDoc.doctorTitleArabic}</p>
                  <p className="text-[10px] text-slate-500 max-w-xl mt-1">{bookingDoc.doctorSpecialty}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> اختر تاريخ اليوم المتاح
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-100 border border-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> التوقيت المتاح لجدول الطبيب
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl text-slate-100 border border-slate-800 focus:outline-none"
                  >
                    <option value="09:00">09:00 صباحاً</option>
                    <option value="12:00">12:00 ظهراً</option>
                    <option value="15:30">15:30 عصراً</option>
                    <option value="18:00">18:00 مساءً</option>
                    <option value="20:00">20:00 مساءً (مفضّل)</option>
                    <option value="22:30">22:30 ليلاً</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl flex items-center justify-between text-xs text-slate-300">
                <span>رسوم المساهمة بالجلسة (شامل البث وملاحظات HIPAA):</span>
                <span className="font-extrabold text-teal-400 text-sm">{bookingDoc.price}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBookSession}
                  className="flex-grow py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl text-xs transition"
                >
                  تأكيد وحجز اللقاء عبر الخزنة الآمنة للمنصة
                </button>
                <button
                  onClick={() => setBookingDoc(null)}
                  className="py-3 px-6 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-bold border border-slate-800"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            /* Certified clinicians directory slider / list */
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-slate-100">هيئة الاستشارات والمعالجين المعتمدين</h3>
                <p className="text-xs text-slate-400 mt-1">تصفح السير الذاتية لأطبائنا الشركاء والمرخصين قانوناً لعلاج اضطرابات القلق والاكتئاب والصدمات.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CERTIFIED_DOCTORS.map((doc, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3.5">
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-900">
                        <img
                          src={doc.doctorImage}
                          alt={doc.doctorNameArabic}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-teal-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-md">
                          {doc.category === "psychiatrist" ? "طبيب استشاري" : "أخصائي سلوكي"}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-100 text-sm">{doc.doctorNameArabic}</h4>
                        <p className="text-xs text-slate-400 font-semibold">{doc.doctorTitleArabic}</p>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-relaxed min-h-[50px]">
                        {doc.doctorSpecialty}
                      </p>
                    </div>

                    <div className="border-t border-slate-900 pt-4 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-100 text-xs">{doc.price}</span>
                      <button
                        onClick={() => setBookingDoc(doc)}
                        className="py-1.5 px-3.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-[10px] transition"
                      >
                        احجز الجلسة الآن
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sessions schedule history section */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-100">قائمة وتاريخ استشاراتك المرئية الجارية والسابقة</h3>
              <p className="text-xs text-slate-400/90 mt-0.5">انقر على زر البث المباشر للولوج لجلستك المجدولة عند حلول الوقت لتبدأ المناقشة الآمنة.</p>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div key={sess.id} className="bg-slate-900/60 border border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={sess.doctorImage}
                      alt={sess.doctorNameArabic}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-100">{sess.doctorNameArabic}</h4>
                        <span className="px-1.5 py-0.5 text-[8px] bg-sky-950 rounded border border-sky-800 text-sky-400 font-bold">
                          {sess.category === "psychiatrist" ? "طبيب نفسي" : "أخصائي معالج"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {sess.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {sess.time}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {sess.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Live streaming simulated videocall room button */}
                    <button
                      onClick={() => setActiveCallSession(sess)}
                      className="py-2 px-4 bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition"
                    >
                      <Video className="w-4 h-4 fill-slate-950" /> الولوج لغرفة الاستشارة المرئية (آمنة)
                    </button>
                    <span className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-950/20 border border-emerald-900/20 text-emerald-400 rounded-lg">
                      مؤكدة (Active)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
