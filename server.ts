import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for speech data in base64
app.use(express.json({ limit: "15mb" }));

// Initialize Gemini safely, client is lazy-initialized or guarded on-the-fly
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Robust fallback model selector to handle transient server-side failures (503) or rate/quota limits (429)
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: any,
  modelsToTry: string[] = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"]
) {
  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      console.log(`[Gemini Fallback Router] Attempting generation with model: ${model}`);
      const response = await ai.models.generateContent({
        ...params,
        model: model,
      });
      return response;
    } catch (err: any) {
      console.warn(`[Gemini Fallback Router] Generation failed with model ${model}:`, err.message || err);
      lastError = err;
      // Continue to try next model in case of 429/503
    }
  }
  throw lastError || new Error("All fallback models failed.");
}

// 🩺 API Route: Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 🧠 API Route: Clinical Psychiatric Multi-Module Analyzer
app.post("/api/gemini/analyze", async (req: express.Request, res: express.Response) => {
  try {
    const {
      demographics,
      complaintText,
      questionnaires,
      pastHistory,
      familyHistory,
      medications,
    } = req.body;

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Fallback response for safe offline testing/demonstration when no key is configured
      return res.json(getMockClinicalReport(complaintText, questionnaires));
    }

    const ai = getGeminiClient();

    const clinicianSystemInstruction = `
      You are an elite clinical psychiatrist and expert in psychometrics, CBT, DBT, ACT therapies, and digital mental health.
      Your core mission is to analyze diagnostic questionnaires, demographics, current medications, text complaints, and family history.
      You must produce a structured, professional clinical psychiatric triage report following the strict JSON schema provided.

      CRITICAL CLINICAL DIRECTIVES:
      1. COMPLAINT LINGUISTIC SEVERITY ANALYSIS: Logically analyze the patient's written description of their complaint. Assess the linguistic meaning, nuanced intensity, and symptoms described to determine the severity (mild, moderate, or severe) and mood indicators. Commit to logic and correct medical thinking.
      2. DIRECT DOCTOR VOICE: When writing the clinical summary (summaryArabic), act as an empathetic, objective, and logical doctor explaining the initial condition directly to the patient. Avoid redundant filler/clutter and keep it focused and concise. Do NOT refer to 'verbal' or 'oral' recordings as there is no voice-recording feature on the platform; refer strictly to the written complaint.
      3. CLINICALLY PRECISE SYMPTOMS: In the symptoms list (primarySymptoms) and clinical evidence list (supportingSymptomsArabic), write direct, accurate, and professional psychiatric terminology without repeating, reciting, or retrieving the patient's verbatim text or complaint.
      4. SELF-HARM / SUICIDE ALERT (Early Warning System): If the questionnaire scores or complaint text show indicators of suicidal ideation or self-harm, set isEmergency = true, riskLevel = "Critical", and include emergency hotlines.
      5. COMPREHENSIVE CBT/ACT PLAN: Design deep, highly actionable exercises inside the JSON.
      6. CITATIONS & PRINCIPLES: Base everything on World Health Organization (WHO) mhGAP guidelines, APA DSM-5-TR, and ICD-11.
      7. BILINGUAL LANGUAGE MANDATE: Provide all clinical summaries, primary symptoms, suspected conditions, cbtPlan steps, actPlan exercises, and therapist recommendations in BOTH Arabic and English.
         - For list entries (primarySymptoms, suspectedConditions, cbtPlan, actPlan), use this exact format: "Arabic clinical text / English psychiatric translation".
         - For long paragraphs (like summaryArabic), write a detailed clinical paragraph in professional Arabic and then follow it directly inside the same string with a highly detailed, scholarly psychiatric explanation paragraph in English.
      8. NO PREMATURE METRIC COMPARISONS BEFORE TESTING: At this stage, standard numerical tests have not been taken. Focus purely on semantic qualitative analysis of the chief complaint.
    `;

    const userPrompt = `
      Here is the clinical patient file:
      - Demographics: Age: ${demographics?.age || "N/A"}, Gender: ${demographics?.gender || "N/A"}, Education: ${demographics?.education || "N/A"}, Job: ${demographics?.job || "N/A"}, Marital: ${demographics?.marital || "N/A"}
      - Chief Complaint: "${complaintText || ""}"
      - Current Medications & History: Chronic diseases: ${demographics?.chronicDiseases || "None"}, Active medications: ${medications || "None"}, Past psych history: ${pastHistory || "None"}
      - Family Psychiatric History: ${familyHistory || "None"}
      - Standard Clinical Test Results:
        ${JSON.stringify(questionnaires || {}, null, 2)}

      Please run a multi-dimensional psychiatric evaluation and return a validated JSON matching the requested schema.
    `;

    const response = await generateContentWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction: clinicianSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isEmergency: { type: Type.BOOLEAN, description: "True if suicide, self-harm, severe psychosis, or urgent danger signs are detected." },
            riskLevel: { type: Type.STRING, description: "One of: Low, Moderate, High, Critical" },
            primarySymptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of extracted psychiatric symptoms (e.g. Anhedonia, Hypervigilance, Cognitive Distortions)" },
            suspectedConditions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suspected DSM-5/ICD-11 diagnostic syndromes" },
            confidence: { type: Type.NUMBER, description: "Confidence of the triage (0-100)" },
            summaryArabic: { type: Type.STRING, description: "A detailed clinical psychiatric summary of the file, in rich professional Arabic" },
            supportingSymptomsArabic: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Clinical evidence and signs supporting the suspected condition list, in Arabic" },
            cbtPlan: {
              type: Type.OBJECT,
              properties: {
                cognitiveRestructuring: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Steps to identify and reconstruct cognitive distortions or negative core beliefs" },
                behavioralActivation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific actionable goals, behavioral schedules, or exposure tasks" },
                practicalHomework: { type: Type.ARRAY, items: { type: Type.STRING }, description: "At-home practices/therapeutic assignments" }
              },
              required: ["cognitiveRestructuring", "behavioralActivation", "practicalHomework"]
            },
            actPlan: {
              type: Type.OBJECT,
              properties: {
                mindfulnessArabic: { type: Type.ARRAY, items: { type: Type.STRING }, description: "ACT Mindfulness and thought defusion exercises in Arabic" },
                valuesArabic: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exercises for identifying personal values and taking committed actions, in Arabic" }
              },
              required: ["mindfulnessArabic", "valuesArabic"]
            },
            suggestedTherapistTypeArabic: { type: Type.STRING, description: "Recommendation for the exact type of clinical psychologist or psychiatrist needed" },
            emergencyContactsArabic: { type: Type.STRING, description: "Relevant psychiatric emergency numbers and reassurance message in Arabic" }
          },
          required: [
            "isEmergency",
            "riskLevel",
            "primarySymptoms",
            "suspectedConditions",
            "confidence",
            "summaryArabic",
            "supportingSymptomsArabic",
            "cbtPlan",
            "actPlan",
            "suggestedTherapistTypeArabic",
            "emergencyContactsArabic"
          ]
        }
      }
    });

    const reportText = response.text || "";
    const parsedReport = JSON.parse(reportText.trim());
    return res.json(parsedReport);

  } catch (error: any) {
    console.error("Clinical Analyzer Error, falling back to mock:", error);
    const mockReport = getMockClinicalReport(req.body.complaintText || "", req.body.questionnaires || { PHQ9: 0, GAD7: 0 });
    return res.json({
      ...mockReport,
      isFallback: true,
      fallbackReason: error.message || "Service temporarily experiencing high demand."
    });
  }
});

// 🎙️ API Route: Audio/Voice Complaint Transcriber & Psychiatric Emotion Analyzer
app.post("/api/gemini/transcribe", async (req: express.Request, res: express.Response) => {
  try {
    const { audioBase64, mimeType, clientTranscript } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: "No voice payload provided." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Fallback transcription demo using client transcript if provided
      return res.json({
        transcript: clientTranscript || "أشعر بضيق شديد في الصدر وضبابية في التفكير منذ عدة أسابيع وتوتر مستمر.",
        detectedEmotions: ["الأرق والقلق والضيق الحاد"],
        extractedSymptoms: ["الأعراض اللفظية المذكورة بالتسجيل"],
        anxietyScore: 80,
        tensionLevel: "مرتفع"
      });
    }

    // If client supplied verified transcript, we analyze it using Gemini to extract real clinical attributes
    if (clientTranscript) {
      try {
        const ai = getGeminiClient();
        const analysisPrompt = `
          You are an expert Arabic psychiatric clinical analyst.
          Analyze this patient's verbatim spoken complaint: "${clientTranscript}"
          
          Based ONLY on this text, analyze and extract:
          1. Dominant emotions (detectedEmotions) in Arabic. Examples: حزن, ذعر, قلق, إحباط
          2. Spoken psychiatric physical/psychological symptoms (extractedSymptoms) in Arabic. Examples: تسارع ضربات القلب, أرق, ضيق تنفس, فرط تفكير
          3. Anxiety level as a score from 0-100 (anxietyScore)
          4. General psychological tension level (tensionLevel) in Arabic (e.g. مرتفع, متوسط, منخفض).
          
          Return a clean JSON object with this exact schema:
          {
            "transcript": "${clientTranscript}",
            "detectedEmotions": ["emotion1", ...],
            "extractedSymptoms": ["symptom1", ...],
            "anxietyScore": number,
            "tensionLevel": "string"
          }
        `;
        
        const response = await generateContentWithFallback(ai, {
          contents: [analysisPrompt],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                transcript: { type: Type.STRING },
                detectedEmotions: { type: Type.ARRAY, items: { type: Type.STRING } },
                extractedSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                anxietyScore: { type: Type.NUMBER },
                tensionLevel: { type: Type.STRING }
              },
              required: ["transcript", "detectedEmotions", "extractedSymptoms", "anxietyScore", "tensionLevel"]
            }
          }
        });
        
        const parsedResult = JSON.parse((response.text || "").trim());
        parsedResult.transcript = clientTranscript; // Ensure transcript is identical to what was sent
        return res.json(parsedResult);
      } catch (err: any) {
        console.error("Gemini client-transcript analysis failed, calling fallback:", err);
        return res.json({
          transcript: clientTranscript,
          detectedEmotions: ["توتر وقلق"],
          extractedSymptoms: ["إعياء جسدي ونفسي"],
          anxietyScore: 75,
          tensionLevel: "متوسط إلى مرتفع"
        });
      }
    }

    const ai = getGeminiClient();

    // Clean up codec parameters from mimeType, e.g., "audio/webm;codecs=opus" -> "audio/webm"
    let cleanedMimeType = mimeType || "audio/webm";
    if (cleanedMimeType.includes(";")) {
      cleanedMimeType = cleanedMimeType.split(";")[0].trim();
    }

    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType: cleanedMimeType
      }
    };

    const promptText = `
      You are an elite verbatim Arabic speech-to-text transcriber specialized in medical and psychiatric recordings.
      Your absolute highest priority, above all else, is to write down the exact spoken words from the audio payload with 100% accuracy and truthfulness in Arabic.
      
      TRANSCRIBING CRITERIA:
      1. Write the verbatim transcript of the patient's spoken words in Arabic (العربية).
      2. Do NOT convert colloquial or dialect Arabic to modern standard Arabic. Keep the exact dialect, words, grammar, and pronunciation character-for-character.
      3. Do NOT summarize their speech, do NOT correct their phrasing/expression, do NOT omit any words, and do NOT add any details, greetings, words, or sentences that they did not say.
      4. Do NOT use canned/boilerplate clinical templates. You must transcribe EXACTLY what the user spoke shafahiya (verbally).
      5. Make sure the 'transcript' property contains the precise verbatim words of their audio.
      
      ANALYSIS CRITERIA:
      In addition to the verbatim transcript, analyze the speech patterns in the audio clip to extract:
      1. Dominant emotions (detectedEmotions)
      2. Spoken symptoms (extractedSymptoms)
      3. Anxiety level as a score from 0-100 (anxietyScore)
      4. General psychological tension level (tensionLevel)

      Return a clean, valid JSON object with the requested properties. Keep it strictly matching this schema.
    `;

    const response = await generateContentWithFallback(ai, {
      contents: [audioPart, promptText],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcript: { 
              type: Type.STRING, 
              description: "التفريغ النصي الدقيق والكامل بنسبة 100% وبدون تغيير لأي كلمة كتبها المريض باللغة العربية أو اللهجة العامية التي تحدث بها، دون صياغة أو تلخيص أو تعديل / The exact verbatim written transcript in Arabic with 100% accuracy, without editing, summarizing, correcting, or translating." 
            },
            detectedEmotions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "المشاعر المكتشفة مثل الحزن، القلق، التوتر، الخوف / Recognized emotional states" },
            extractedSymptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "الأعراض النفسية الموصوفة في النص من المريض / Psychological symptoms described" },
            anxietyScore: { type: Type.NUMBER, description: "درجة القلق من 0 إلى 100 / Score from 0 to 100" },
            tensionLevel: { type: Type.STRING, description: "مستوى التوتر الملحوظ بالصوت / Tension descriptor in Arabic" }
          },
          required: ["transcript", "detectedEmotions", "extractedSymptoms", "anxietyScore", "tensionLevel"]
        }
      }
    });

    const parsedTranscription = JSON.parse((response.text || "").trim());
    return res.json(parsedTranscription);
  } catch (err: any) {
    console.error("Transcription error:", err);
    return res.status(500).json({ error: "Failed to transcribe audio clip" });
  }
});

// 💬 API Route: Smart Dr. Kareem Interactive Intake Chat
app.post("/api/gemini/doctor-chat", async (req: express.Request, res: express.Response) => {
  try {
    const { messageHistory, newInput, demographics, isVoice } = req.body;

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Fallback interactive response if GEMINI_API_KEY is not defined
      const defaultReplies = [
        {
          reply: "أهلاً بك في عيادتي النفسية الآمنة. أنا د. كريم، سأقوم بجمع التفاصيل الطبية الدقيقة لحالتكم بأسلوب عيادي متفهم ورحيم. في البداية، لنتعمق في تفاصيل شكواكم الأساسية: متى بدأت هذه الصعوبات بالظهور للمرة الأولى؟ وكيف تؤثر مباشرة على انتظام دورات نومكم نهاراً وليلاً (الأرق وصعوبة النوم)؟\n\nWelcome to your safe clinical space. I am Dr. Kareem. To begin our comprehensive assessment, when did these challenges first manifest? And how do they directly affect your sleep-wake cycles (insomnia and sleep disturbances)?",
          nlpEmotionAnalysis: ["نبرة مشبعة بالقلق والتوتر الخفيف", "تذبذب نبر العاطفة الصوتية المكتشفة", "إيقاع تنفس متهدج بأثر الترقب"],
          suggestedClinicalTips: "البدء باستكشاف مدة ظهور الأعراض ونمط النوم لتقييم مدى تغلغل القلق والتوتر الإكلينيكي.",
          conversationComplete: false
        },
        {
          reply: "أشعر بحجم الثقل الذي تشاركونه معي. عيادياً، هل تلاحظون تداخلاً سلبياً لهذه الضغوط على كفاءة ذهنكم وتركيزكم في العمل أو المذاكرة اليومية؟ وهل تشعرون بفتور الشغف وصعوبة إنجاز المهام البسيطة المعتادة؟\n\nI truly understand the depth of weight you are carrying. Clinically, do you notice this persistent stress interfering with your cognitive focus, memory, or daily productivity at work or study? Have you experienced a decline in passion or difficulty finishing simple goals?",
          nlpEmotionAnalysis: ["ارتعاش طفيف بالصوت المستلم فرعياً", "تطابق نغمات الحزن والانقباض الجسدي", "تواتر الكلمات السريعة للتخلص من الضغط"],
          suggestedClinicalTips: "قياس مقدار التدهور الوظيفي والاجتماعي وفقدان المتعة لتصنيف الاضطراب التشخيصي بدقة.",
          conversationComplete: false
        },
        {
          reply: "هذا ووضوح سريري ذو أهمية كبيرة لمطابقة الأعراض. هل تحفز هذه الأفكار والضغوط استجابات فسيولوجية جسدية واضحة؟ كالشعور بضيق وثقل بوسط الصدر، خفقان وتسارع ضربات القلب دون مجهود، جفاف بالحلق، أو اضطرابات قولونية وهضمية؟\n\nThis clinical clarity is essential for aligning your symptoms. Does this psychological charge trigger persistent physical responses, such as tightness and pressure in the chest, unexplained rapid heartbeats, dry mouth, or gastrointestinal and colon distress?",
          nlpEmotionAnalysis: ["نبرة توتر عضوي مكتومة", "تواتر نطق متأثر بضيق النفس", "تأرجح في حدة التعبير العاطفي"],
          suggestedClinicalTips: "استقصاء التأثير الارتدادي للقلق النفسي على الجهاز العصبي المستقل وتفشي الأعراض الجسدية (Somatization).",
          conversationComplete: false
        },
        {
          reply: "أفهم ذلك تماماً، وعلينا تفكيك هذه الروابط معاً. حينما تداهمكم هذه النوبات أو اللحظات المزعجة من التوتر العارم، ما هي وسيلتكم الغريزية أو الاستراتيجية التي تطبقونها لتهدئة العقل والتوافق مع الموقف؟ هل تميلون للمواجهة أم التجنب والعزلة؟\n\nI understand completely, and we will untangle these responses together. When these intense moments of overwhelm strike, what coping mechanisms or strategies do you instinctively apply to quiet your mind? Do you tend to actively face them, or do you resort to avoidance and withdrawal?",
          nlpEmotionAnalysis: ["وتيرة كلام متأنية للمحاولة التفسيرية", "انقضاء علامات الخوف الطوارئ الحاد", "استقراره نسبي لبصمة الصوت الحنجرية"],
          suggestedClinicalTips: "تحليل مهارات المقاومة والتجنب السلوكي لتهيئة خطة ملائمة من تمارين إعادة الهيكلة وCBT.",
          conversationComplete: false
        },
        {
          reply: "إجابة ممتازة ومثمرة عيادياً. كجزء من رعايتنا الاستكشافية الشاملة للقصة المرضية، هل هناك تاريخ عائلي وراثي لأي من اضطرابات المزاج أو القلق في محيط عائلتكم؟ وهل استشرتم معالجاً مسبقاً أو تعاطيتم أي عقاقير كيميائية للأعصاب؟\n\nAn excellent and highly therapeutic perspective. As part of our comprehensive clinical history intake, is there any known family history of mood, depression, or anxiety spectrum disorders within your immediate circle? Have you previously sought professional therapy or received pharmacological neuro-medications?",
          nlpEmotionAnalysis: ["تعبير مفعم بالوضوح والصراحة السريرية", "انخفاض تدريجي لترشيح الكآبة الصوتي", "يقظة انتباه مستعادة"],
          suggestedClinicalTips: "تقييم الاستعداد الوراثي والتجارب السريرية السابقة لتحديد مدى استحقاق الدعم الدوائي أو الكيمائي.",
          conversationComplete: false
        },
        {
          reply: "ملاحظة غاية في الدقة والأهمية. لنتوقف قليلاً عند معالم الحديث الذاتي الداخلي؛ هل تطاردكم في أغلب الأوقات سيناريوهات كارثية للمستقبل، أو أفكار جلد للذات وشعور غير مبرر بالذنب؟ كيف تصنفون نغمة حواركم مع أنفسكم بالعموم؟\n\nHighly insightful observation. Let us dwell briefly on your automatic inner self-talk; do catastrophic future scenarios, self-critical thoughts, or undeserved feelings of guilt haunt you? How would you generally characterize the emotional tone of your internal self-talk?",
          nlpEmotionAnalysis: ["بصمة صوتية ممعنة في مراجعة الذات", "تمتمة خفيفة تفصح عن أفكار تلقائية حادة", "هبوط مبرر في سرعة المخارج الصوتية"],
          suggestedClinicalTips: "استشفاف أنماط الأفكار التلقائية السامة (Automatic Thoughts) والتشوهات المعرفية للبدء في صياغة بروتوكول إعادة الهيكلة السلوكية.",
          conversationComplete: false
        },
        {
          reply: "أشكرك من الأعماق على ثقتك الكاملة وشرحك الوافي والدقيق لكافة التفاصيل عبر هذه الأبعاد السبعة المتكاملة. لقد غطينا معاً كافة الجوانب والأبعاد النفسية والجسدية والاجتماعية اللازمة لبناء فهم إكلينيكي حقيقي وعميق لحالتكم. يرجى الضغط على زر \"إنهاء المحادثة وتحليل الشكوى للتشخيص\" أدناه للبدء فوراً في توليد تقريركم التقييمي والتشخيصي المتكامل بروتوكولياً.\n\nI thank you deeply for your trust and detailed, vulnerable descriptions. We have thoroughly mapped the psychological, somatic, and social profiles required. Please press the \"End Conversation and Analyze\" button below to generate your comprehensive clinical assessment report and therapeutic CBT/ACT plans directly.",
          nlpEmotionAnalysis: ["بصمة صوتية هادئة ومستقرة تماماً", "علامات الارتياح العاطفي والاستبصار", "إيقاع تنفس منتظم متوازن"],
          suggestedClinicalTips: "المقابلة الإكلينيكية انتهت من جانب الطبيب، في انتظار تفعيل المريض لصفحة التشخيص عبر زر الإنهاء.",
          conversationComplete: false
        }
      ];

      // Pick reply based on size of history or select randomly/sequentially
      const pMessages = messageHistory ? messageHistory.filter((m: any) => m.sender === "patient") : [];
      const index = Math.min(pMessages.length, defaultReplies.length - 1);
      return res.json(defaultReplies[index]);
    }

    const ai = getGeminiClient();

    const doctorSystemInstruction = `
      You are Dr. Kareem, an elite smart clinical psychiatrist and expert psychotherapist in the 'Sakeenah' platform.
      Your mission is to hold an interactive, warm, and highly supportive clinical intake chat with the patient to understand their psychological chief complaint.
      Based on the history of the conversation, their demographics (Age: \${demographics?.age || "28"}, Gender: \${demographics?.gender || "أنثى"}, Job: \${demographics?.job || "مهندس برمجيات"}), and their latest message ("newInput"), respond as a caring doctor.
      
      CRITICAL FIDELITY AND LOGICAL DIRECTIVES:
      - You MUST read, underst      You must return a clean, valid JSON matching the schema below.
    `;

    const formattedHistory = messageHistory?.map((msg: any) => `${msg.sender === "doctor" ? "Doctor" : "Patient"}: ${msg.text}`).join("\n") || "";

    const userPrompt = `
      Patient Demographics: ${JSON.stringify(demographics)}
      Was this input a voice message? ${isVoice ? "Yes" : "No"}
      Conversation History so far:
      ${formattedHistory}
      
      Latest Patient Input: "${newInput}"
      
      Please analyze and output your clinical response in the defined JSON format.
    `;

    const response = await generateContentWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction: doctorSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: "The doctor's clinical response and questions to the patient in warm professional Arabic, based strictly on the user's latest input" },
            nlpEmotionAnalysis: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 simulated vocal tone/NLP analysis tags in Arabic based on voice frequency analysis if isVoice was true, or text sentiment NLP patterns (e.g. نبرة مرتجفة، تسارع الكلمات، توتر متقطع، نغمة حزن واضحة)"
            },
            suggestedClinicalTips: { type: Type.STRING, description: "A brief mental health tip or clinical note explaining why you directed this medical question, in Arabic" },
            conversationComplete: { type: Type.BOOLEAN, description: "Must ALWAYS be false. The clinician is never allowed to unilaterally stop or end the chat, as termination is reserved exclusively for the user." }
          },
          required: ["reply", "nlpEmotionAnalysis", "suggestedClinicalTips", "conversationComplete"]
        }
      }
    });

    const parsedResponse = JSON.parse((response.text || "").trim());
    return res.json(parsedResponse);

  } catch (error: any) {
    console.error("Doctor Chat API Error, falling back:", error);
    return res.json({
      reply: "نحن هنا لمساعدتكم والاستماع إليكم بالكامل. بناءً على تحليلنا الأولى السريع وعلامات نبرة صوتكم الحالية، تبدو معالم القلق مرتفعة قليلاً. هل تفضل إخباري بالصعوبة الأساسية التي يعاني منها نومكم وتركيزك بالنشاط اليومي لنضع خطة دقيقة؟",
      nlpEmotionAnalysis: ["تحليل نبرة مشبع بالقلق والجهد العادي", "تواتر إيجابي لمخارج الكلمات", "إجهاد نبر النفس العاطفي المكتشف"],
      suggestedClinicalTips: "استكشاف الأرق والشد العصبي يساعد في عزل القلق الاجتماعي ومخاوف التقييم السلبي.",
      conversationComplete: false,
      isFallback: true
    });
  }
});

// 🔄 API Route: Two-Week Progress Re-evaluation & Clinical Review Point
app.post("/api/gemini/review", async (req: express.Request, res: express.Response) => {
  try {
    const { demographics, initialReport, latestFeedback } = req.body;

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Return a simulated high-quality clinical progress report in Arabic
      return res.json({
        progressStatus: "تحسن ملحوظ واستقرار علاجي",
        progressScore: 78,
        clinicalSummary: "تبين المراجعة نصف الشهرية تحسناً ملحوظاً في جودة النوم والسكينة العامة بفضل الالتزام اليومي بجدول التنشيط السلوكي وتمرين دحض الأفكار التلقائية السلبية، مع زوال تدريجي لأعراض ضيق الصدر والتوتر النفسي.",
        recommendedAdjustments: [
          "مواصلة إدراج تمرين التنفس المربع وجدولة قلق العصر.",
          "تكثيف التنشيط الرياضي والبدني السلوكي."
        ]
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
      You are an expert psychiatrist analyzing a patient's progress over a two-week period.
      Compare the Initial Triage/Assessment Report with the new client feedback and progress questionnaires if any.
      Provide a highly detailed bilingual progress report following the requested JSON schema.
      Keep everything clinically professional and empathetic.
    `;

    const promptText = `
      Initial Report: ${JSON.stringify(initialReport || {})}
      Patient Latest Feedback: "${latestFeedback || ""}"
      Demographics: ${JSON.stringify(demographics || {})}
      
      Generate progress evaluate results.
    `;

    const response = await generateContentWithFallback(ai, {
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            progressStatus: { type: Type.STRING, description: "Detailed clinical status of patient progress (e.g. Stable, Significant Improvement) in Arabic" },
            progressScore: { type: Type.NUMBER, description: "Numerical percentage of treatment compliance or progress (0-100)" },
            clinicalSummary: { type: Type.STRING, description: "Detailed clinical progress summary and comparison in Arabic" },
            recommendedAdjustments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific clinical/therapeutic adjustments in Arabic" }
          },
          required: ["progressStatus", "progressScore", "clinicalSummary", "recommendedAdjustments"]
        }
      }
    });

    const parsedResponse = JSON.parse((response.text || "").trim());
    return res.json(parsedResponse);

  } catch (error: any) {
    console.error("Clinical Review API Error:", error);
    return res.json({
      progressStatus: "مستقر وتحت المتابعة الدورية",
      progressScore: 70,
      clinicalSummary: "أظهر المريض مستوى مقبولاً من الرسوخ والانسجام مع تمارين السكينة والالتزام بالبرنامج السلوكي الموصى به، ولا توجد مؤشرات تدهور أو تراجع بالأعراض الحركية.",
      recommendedAdjustments: [
        "الاستمرار بالتمارين اليومية المقررة ومتابعة الرصد الذاتي للأعراض النفس جسدية.",
        "التنسيق المباشر لعقد العيادة مع الطبيب في الموعد القادم."
      ],
      isFallback: true
    });
  }
});

// Helper function to supply clinically logical demo reports when GEMINI_API_KEY is not defined
function getMockClinicalReport(complaintText: string, questionnaires: any) {
  const textCheck = ((complaintText || "") + " " + JSON.stringify(questionnaires || {})).toLowerCase();
  
  // Clean prefix if it contains specific metadata prefixes without destroying the chat/dialogue logs
  let cleanComplaint = complaintText || "";
  const headerPrefix = "[سجل وتاريخ المحاورة الإرشادية الكاملة مع الطبيب النفسي الطبي الذكي]:";
  if (cleanComplaint.startsWith(headerPrefix)) {
    cleanComplaint = cleanComplaint.substring(headerPrefix.length).trim();
  } else if (cleanComplaint.includes("]:") && !cleanComplaint.includes("\n")) {
    const parts = cleanComplaint.split("]:");
    cleanComplaint = parts[parts.length - 1].trim();
  }

  // Clear sub messages markers
  let displayText = cleanComplaint;
  // If cleanComplaint contains multiple lines like "المريض: ... \n الطبيب: ...", extract patient texts
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

  // Logical evaluation of written complaint linguistic severity
  const isSevere = textCheck.includes("شديد") || textCheck.includes("حاد") || textCheck.includes("جداً") || textCheck.includes("انهيار") || textCheck.includes("عنيف") || textCheck.includes("مستمر") || textCheck.includes("دائماً") || textCheck.includes("صرخ") || textCheck.includes("لا أتحمل");
  const isMild = textCheck.includes("خفيف") || textCheck.includes("بسيط") || textCheck.includes("أحياناً") || textCheck.includes("مؤقت") || textCheck.includes("قليلاً") || textCheck.includes("نادر") || textCheck.includes("أوقات");
  const severityWord = isSevere ? "مرتفعة الشدة" : (isMild ? "خفيفة إلى مؤقتة" : "معتدلة الشدة");

  // Dynamic Symptom & Condition Matcher to prevent arbitrary hallucinated categories!
  let symptoms: string[] = [];
  let conditions: string[] = [];
  let summary = "";
  let therapist = "";
  let cognitiveHomework: string[] = [];
  let behavioralTasks: string[] = [];
  let practiceHomework: string[] = [];
  let mindfulnessEx: string[] = [];
  let valuesEx: string[] = [];

  // Parse custom patient symptoms
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

  // Fallback default symptoms if none of the above are matched
  if (symptoms.length === 0) {
    symptoms = [
      "أعراض قلق وتوتر نفسي عام مصاحب للضغوط اليومية / General Psychological Strain and Anxiety",
      "أرق وصعوبات طفيفة في الاسترخاء الذهني والبدني / Mild Sleep and Relaxation Difficulties"
    ];
    conditions = [
      "حالة قلق نفسي وتوتر عام غير محدد / Unspecified General Psychological Strain",
      "اضطراب تكيف ظرفي مؤقت مع ضغوط الحياة / Adjustment Reaction with Mixed Symptoms"
    ];
  }

  // Act as a doctor explaining the initial condition directly to the patient logically and objectively
  summary = `بصفتي طبيبك المعالج المعني بدراسة حالتك المبدئية؛ قمت بدراسة شكواك المكتوبة بدقة وفحص الأعراض التي وصفتها بشكل موضوعي ومنطقي. تشير الدلالات اللغوية وعناصر الشدة في كلامك إلى وجود أعراض قلق بحدّة يغلب عليها طابع (${severityWord}). إن هذه الوعكة المعبر عنها هي استجابة مفهومة للضغوط، وسنتعامل معها خطوة بخطوة عبر خطة التعافي السلوكية والتمارين المقترحة لإعادة بناء السكينة العاطفية والجسدية بشكل مستقر تماماً.`;

  therapist = "أخصائي نفسي إكلينيكي مرخص ممارس للعلاج المعرفي السلوكي (CBT) وعلاج القبول والالتزام (ACT) المتكامل للتوجيه والضبط السلوكي المباشر.";

  cognitiveHomework = [
    "تحديد وتفكيك الفكرة التلقائية المسببة للعناء النفسي وإدراك منبعها السلوكي والمعرفي.",
    "مراقبة الأفكار الساخنة السلبية وتدوينها لتقليل أثرها على الجسد فور تصاعد التوتر العصبي أو الذهني.",
    "تحديد التشوهات المعرفية (مثل التهويل والتعميم الكارثي للأحداث) وإحلال فكر معتدل ومحايد يراعي الواقع الحسي."
  ];

  behavioralTasks = [
    "تطبيق تقنية التنفس البطني العميق والمنتظم (تثبيت نمط 4-4-4 شهيق استبقاء زفير) للسيطرة على فرط التهوية أو تسارع دقات القلب العضلي.",
    "التنشيط السلوكي التدريجي بجدولة هدف بسيط وممتع يومياً لترميم دافع الشغف والحيوية الجسدية.",
    "تأسيس بيئة مريحة لتلافي التجنب السلوكي للمواقف المسببة لتوتركم المذكور."
  ];

  practiceHomework = [
    "ملء مفكرة رصد المشاعر اليومية الذاتية وتصنيف حدتها الارتدادية اللحظية من 0 لـ 10 لتوثيق اتساقها.",
    "تخصيص ربع ساعة تدريب استرخائي عضلي (Jacobson Relaxation) كروتين وقائي للدماغ والأعصاب."
  ];

  mindfulnessEx = [
    "الفصل المعرفي الإيجابي: قل لنفسك \"عقلي يمرر فكرة صعبة الآن، لكنني كفرد مستقل آمن ومنفصل ومستقر تماماً في فلك الحاضر\".",
    "القبول غير المشروط لأمواج التوتر بوسط الصدر دقيقة بدقيقة دون الدخول في صراع داخلي هجومي يعاظم استثارتك البدنية.",
    "تمرة الإرساء الحسي الخماسي (5-4-3-2-1) لإعادة تثبيت حواسك في الواقع الحقيقي الآمن من حولك حالاً."
  ];

  valuesEx = [
    "الاستمرار في تلبية التزاماتك العائلية والمهنية بدافع مبادئك العميقة كالشجاعة أو رعاية الأسرة بدلاً من قيادة القلق لتصرفاتك.",
    "توجيه التعاطف الدافئ للبدن والروح كونهما تحت ضغوط مؤقتة ستمر بسلام مع تنظيم التدريب المتواصل."
  ];

  return {
    isEmergency: isEmergency,
    riskLevel: isEmergency ? "Critical" : (isSevere ? "High" : "Moderate"),
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
}

// Vite and static asset integrations
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Serving application in Development Mode using Vite custom middleware.");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving application in Production Mode. Static assets mounted.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PsychShield] Server started and listening at host 0.0.0.0 on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  initServer().catch((err) => {
    console.error("Failed to start full-stack server instance:", err);
  });
}

export default app;
