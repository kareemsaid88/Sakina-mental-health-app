import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
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
      Your core mission is to analyze diagnostic questionnaires (PHQ-9, GAD-7, DASS-21, etc.), demographics, current medications, text complaints, and family history.
      You must produce a structured, professional clinical psychiatric triage report following the strict JSON schema provided.

      CRITICAL CLINICAL DIRECTIVES:
      1. SELF-HARM / SUICIDE ALERT (Early Warning System): If the questionnaire scores or complaint text show direct or indirect indicators of suicidal ideation, self-harm, or severe psychosis, you MUST set isEmergency = true, riskLevel = "Critical", and include emergency hotlines.
      2. COMPREHENSIVE CBT/ACT PLAN: Design deep, highly actionable exercises inside the JSON.
      3. CITATIONS & PRINCIPLES: Base everything on World Health Organization (WHO) mhGAP guidelines, American Psychiatric Association (APA) DSM-5-TR, and ICD-11.
      4. BILINGUAL LANGUAGE MANDATE: Provide all clinical summaries, primary symptoms, suspected conditions, cbtPlan steps, actPlan exercises, and therapist recommendations in BOTH Arabic and English.
         - For list entries (primarySymptoms, suspectedConditions, cbtPlan, actPlan), use this exact format: "Arabic clinical text / English psychiatric translation" (e.g. "الأرق العضوي الفكري / Latency-Onset Insomnia and Sleep Fragmentation").
         - For long paragraphs (like summaryArabic), write a detailed clinical paragraph in professional Arabic and then follow it directly inside the same string with a highly detailed, scholarly psychiatric explanation paragraph in English.
         - Ensure excellent scientific accuracy without exaggeration to support clinical triangulation.
      5. NO PREMATURE METRIC COMPARISONS:
         At this initial triage/assessment stage, standard numerical tests (PHQ-9, GAD-7, PSS-10) have NOT yet been answered by the patient. 
         Do NOT mention, assume, or compare any score discrepancies or results of standardized scales with the chief complaint, because the test has not been performed yet. 
         Focus purely on the semantic qualitative analysis of the chief complaint itself.
         يُحظر تماماً الإشارة إلى وجود أي تعارض أو تطابق أو تباين بين الشكوى والمقاييس الرقمية في هذا التقرير الأولي، نظراً لأنه لم يتم إجراء المقاييس الرقمية حتى هذه اللحظة. يجب أن تتم هذه المقارنة حصراً في مراحل لاحقة بعد إجراء الاختبار النفسي الموصى به.
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
    const { audioBase64, mimeType } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: "No voice payload provided." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Fallback transcription demo if no API Key is provided
      return res.json({
        transcript: "أشعر بضيق شديد في الصدر وضبابية في التفكير منذ عدة أسابيع وتوتر مستمر.",
        detectedEmotions: ["الأرق والقلق والضيق الحاد"],
        extractedSymptoms: ["ضيق التنفس والتوتر وضبابية التفكير"],
        anxietyScore: 78,
        tensionLevel: "مرتفع"
      });
    }

    const ai = getGeminiClient();

    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType: mimeType || "audio/webm"
      }
    };

    const promptText = `
      You are an elite verbatim Arabic speech-to-text transcriber specialized in medical and psychiatric recordings.
      Your absolute highest priority, above all else, is to write down the exact spoken words from the audio payload with 100% accuracy and truthfulness in Arabic.
      
      TRANSCRIBING CRITERIA:
      1. Write the verbatim transcript of the patient's spoken words in Arabic (العربية).
      2. Do NOT summarize their speech, do NOT correct their phrasing/expression, do NOT omit any words, and do NOT add any details or sentences that they did not say.
      3. Do NOT use canned/boilerplate clinical templates. You must transcribe EXACTLY what the user spoke shafahiya (verbally).
      4. Make sure the 'transcript' property contains the precise verbal layout of their audio.
      
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
            transcript: { type: Type.STRING, description: "The verbatim spoken transcript in Arabic with 100% accuracy, matching the exact words of the patient in the audio" },
            detectedEmotions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recognized emotional states like grief, anger, anxiety, panic" },
            extractedSymptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Psychological symptoms described" },
            anxietyScore: { type: Type.NUMBER, description: "Score from 0 to 100" },
            tensionLevel: { type: Type.STRING, description: "Tension descriptor in Arabic" }
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
          reply: "رائع جداً؛ تفصيل غني بالقيمة العيادية. والآن، كيف تصفون شبكة الدعم الاجتماعي في محيطكم الحالي؟ وهل تجدون تفهماً وموثوقية في حواركم مع عائلتكم أو أصدقائكم المقربين عند تفاقم تلك الأزمات، أم تشعرون بالعزلة الصامتة؟\n\nMarvelous; an extremely valuable clinical detail. Now, how would you describe your current social support system? Do you find genuine understanding and safety when talking with your family or close friends during peak crises, or do you tend to resort to silent isolation?",
          nlpEmotionAnalysis: ["غصة عاطفية خفيفة أثناء الحديث عن العلاقات", "توجه صريح للتعبير الوجداني الصادق", "بصمة متزنة تعكس رغبة واعية في التعافي"],
          suggestedClinicalTips: "تحليل وتتبع الدوائر الاجتماعية الداعمة أو العقبات البيئية المباشرة لفرز مخرجات العلاج السلوكي الاجتماعي بمهارة.",
          conversationComplete: false
        },
        {
          reply: "أشكرك من الأعماق على ثقتك الكاملة وشرحك الوافي والدقيق لكافة التفاصيل عبر هذه الأبعاد السبعة المتكاملة. لقد غطينا معاً كافة الجوانب والأبعاد النفسية والجسدية والاجتماعية اللازمة لبناء فهم إكلينيكي حقيقي وعميق لحالتكم. أنا الآن بكامل المعطيات لصياغة التشخيص الدقيق والبروتوكول العلاجي الدوائي وخطط CBT المناسبة لمساندتكم. هيا بنا لنطالع خطتنا المخصصة وعملك السيكومتري القادم!\n\nI thank you deeply for your trust and detailed, vulnerable descriptions across these 7 integrated clinical dimensions. We have thoroughly mapped the psychological, somatic, and social profiles required for an optimal diagnosis. I now possess the complete clinical picture to formulate your precise diagnosis, CBT protocols, and pharmacological directions. Let us proceed to review your customized roadmap and your dedicated psychometric test!",
          nlpEmotionAnalysis: ["بصمة صوتية هادئة ومستقرة تماماً", "علامات الارتياح العاطفي والاستبصار", "إيقاع تنفس منتظم متوازن"],
          suggestedClinicalTips: "المقابلة الإكلينيكية اكتملت بالمعايير، مع ترشيد الحالة للمقياس النفسي المطابق تمهيداً للبروتوكول العلاجي.",
          conversationComplete: true
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
      Based on the history of the conversation, their demographics (Age: ${demographics?.age || "28"}, Gender: ${demographics?.gender || "أنثى"}, Job: ${demographics?.job || "مهندس برمجيات"}), and their latest message ("newInput"), respond as a caring doctor.
      
      CRITICAL FIDELITY AND LOGICAL DIRECTIVES:
      - You must understand the patient's latest input ("newInput") fully and correctly.
      - Reply directly and logically to their absolute words, in 100% agreement with their described experience.
      - Under no circumstances should you add external facts they didn't mention, nor remove the core meaning or any symptom of what the patient explicitly expressed.
      - Your response must be logically and medically consistent with their stated experiences, validating them accurately without any deviation from their spoken/written input.
      
      COMPULSORY INSTRUCTION ON NLP & ACOUSTIC/TONE ANALYSIS:
      Analyze the text / transcript of the patient. Using Natural Language Processing, word frequency, and semantic markers, simulate the acoustic pitch or vocal tonality features of their voice.
      If the parameter 'isVoice' is true, pretend you analyzed their voice audio stream frequency and return tags that capture a realistic psychiatric analysis of their speech tone (e.g., trembling, speed, pauses, shortness of breath, flatness, pitch instability). If 'isVoice' is false, evaluate their word patterns textually to find matching emotional state tags.
      
      THERAPEUTIC CHAT RULES AND PROGRESSIVE QUESTIONING:
      1. Always reply in clear, comforting, warm, and extremely professional Arabic (العربية).
      2. Keep your response brief and therapeutic: express empathy/validation for their feelings in 1-2 lines.
      3. Ask exactly ONE or TWO highly focused clinical or diagnostic concerns to explore their condition deeper.
      4. To understand their case fully and diagnosis correctly, you MUST NOT end the conversation (do not set 'conversationComplete' to true) before the message history contains at least 5 patient messages (aim to ask at least 5 distinct diagnostic questions).
      5. SYSTEMATICALLY explore critical clinical spheres over the course of the chat:
         - Sleep fragmentation & onset latency (الأرق وصعوبات النوم)
         - Physical autonomic somatization (like chest pressure, heart racing, muscle tension, stomach distress)
         - Cognitive attention & occupational concentration (تأثر التركيز والوظيفة والإنتاجية)
         - Patient's inner coping adaptations and defensive avoidance mechanisms
         - Family psychiatric history & past psychiatric treatments/medications
      
      CONVERSATION ENDING LOGIC (conversationComplete):
      Evaluate the dialogue history. If you have gathered sufficient clinical details across the crucial spheres mentioned above, and the patient has provided at least 5 messages in total, you may set 'conversationComplete' to true and state in your reply that you have gathered all the needed details and you are now completing the active dialogue to start generating their clinical evaluation report.
      - Set 'conversationComplete' to false if less than 5 patient messages are in the history, unless the patient explicitly requests to terminate immediately / states they have explained everything.

      You must return a clean, valid JSON matching the schema below.
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
            conversationComplete: { type: Type.BOOLEAN, description: "True if you have gathered enough medical/psychiatric information about the patient's condition to end the dialogue and transition to the full psychological analysis, diagnostics, and treatment recommendations. Otherwise false." }
          },
          required: ["reply", "nlpEmotionAnalysis", "suggestedClinicalTips", "conversationComplete"]
        }
      }
    });

    const parsedResponse = JSON.parse((response.text || "").trim());
    return res.json(parsedResponse);

  } catch (error: any) {
    console.error("Doctor Chat API Error, falling back:", error);
    const pCount = req.body.messageHistory ? req.body.messageHistory.filter((m: any) => m.sender === "patient").length : 0;
    return res.json({
      reply: "نحن هنا لمساعدتكم والاستماع إليكم بالكامل. بناءً على تحليلنا الأولى السريع وعلامات نبرة صوتكم الحالية، تبدو معالم القلق مرتفعة قليلاً. هل تفضل إخباري بالصعوبة الأساسية التي يعاني منها نومكم وتركيزك بالنشاط اليومي لنضع خطة دقيقة؟",
      nlpEmotionAnalysis: ["تحليل نبرة مشبع بالقلق والجهد العادي", "تواتر إيجابي لمخارج الكلمات", "إجهاد نبر النفس العاطفي المكتشف"],
      suggestedClinicalTips: "استكشاف الأرق والشد العصبي يساعد في عزل القلق الاجتماعي ومخاوف التقييم السلبي.",
      conversationComplete: pCount >= 5,
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
          "تكثيف التنشيط الرياضي الاسترشادي الصباحي."
        ],
        medicationCheck: "الاستمرار الدائم والالتزام بالجرعة دون تعديل للأمان والسلامة."
      });
    }

    const ai = getGeminiClient();

    const reviewerSystemInstruction = `
      You are an elite clinical psychiatrist and psychotherapy progress reviewer.
      Your job is to analyze a patient's demographics, their initial psychiatric assessment report, and their latest 2-week active feedback or behavioral agenda logs.
      You must produce a structured, professional clinical progress review report following the strict JSON schema provided.

      CRITICAL CLINICAL DIRECTIVES:
      1. CRITICAL STATUS EVALUATION: Assess how well the patient has responded to CBT/ACT interventions, sleeping habits, and coping mechanisms.
      2. LOGICAL STRATEGIC PROTOCOLS: Provide practical adjustment actions for the next 14 days and check overall compliance/safety regarding therapeutic tasks and any stated medication.
      3. BILINGUAL SCHOLARSHIP: Return explanations, summaries, and recommendations in warm, comforting, yet highly scholarly bilingual clinical style (mainly Arabic with helpful English diagnostic references where relevant).

      You must return a clean, valid JSON matching the schema below. Refer to standard diagnostic classifications (DSM-5-TR, ICD-11).
    `;

    const userPrompt = `
      Review File:
      - Demographics: ${JSON.stringify(demographics)}
      - Initial Psychiatric Report: ${JSON.stringify(initialReport)}
      - Latest 14-day Patient Feedback & Log Notes: "${latestFeedback || ""}"

      Please run a multi-dimensional progress review and output a validated JSON following this schema:
      - progressStatus: "clinical status indicator after 2 weeks, in Arabic"
      - progressScore: number (overall progress gauge from 0 to 100)
      - clinicalSummary: "detailed psychiatric progress review explaining improvements/ruminations in professional Arabic & English"
      - recommendedAdjustments: array of strings (3-4 specific homework/routine refinements in Arabic)
      - medicationCheck: "clinical safety message, compliance check, or guidance regarding medicines / therapist follow-up in Arabic"
    `;

    const response = await generateContentWithFallback(ai, {
      contents: userPrompt,
      config: {
        systemInstruction: reviewerSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            progressStatus: { type: Type.STRING, description: "One-sentence clinical summary status in Arabic (e.g., تحسن ملحوظ واستقرار علاجي)" },
            progressScore: { type: Type.NUMBER, description: "A progress score indicator out of 100" },
            clinicalSummary: { type: Type.STRING, description: "Comprehensive progress evaluation narrative detailing change/recovery in Arabic & English" },
            recommendedAdjustments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable exercises or routine adjustments for the coming two weeks in Arabic"
            },
            medicationCheck: { type: Type.STRING, description: "Reassurance or warning message regarding treatment/medication compliance in Arabic" }
          },
          required: ["progressStatus", "progressScore", "clinicalSummary", "recommendedAdjustments", "medicationCheck"]
        }
      }
    });

    const parsedResponse = JSON.parse((response.text || "").trim());
    return res.json(parsedResponse);

  } catch (error: any) {
    console.error("Clinical Review Point Error, falling back to mock:", error);
    return res.json({
      progressStatus: "مستقر مع تحسن تدريجي",
      progressScore: 70,
      clinicalSummary: "يظهر التقييم استقراراً نسبياً في معالم التوتر والقلق اليومي مع حاجة للاستمرار في التدريب النفسي وإتمام المقياس السلوكي الموصى به للتوجيه والضبط الإكلينيكي الملائم.",
      recommendedAdjustments: [
        "متابعة التعرف العضوي على تشتيت القلق وتجنبه السلوكي.",
        "التدريب الحسي لتمارين اليقظة الوجدانيّة."
      ],
      medicationCheck: "الالتزام الدائم والالتزام بالجرعة دون تعديل ومراجعة المعالج المختص عند الاقتضاء.",
      isFallback: true,
      fallbackReason: error.message || "Service temporarily experiencing high demand."
    });
  }
});

// Helper function to supply clinically logical demo reports when GEMINI_API_KEY is not defined
function getMockClinicalReport(complaintText: string, questionnaires: any) {
  const textCheck = (complaintText || "").toLowerCase() + " " + JSON.stringify(questionnaires);
  const isEmergency = textCheck.includes("انتحار") || textCheck.includes("suicide") || textCheck.includes("أقتل") || textCheck.includes("harm");

  return {
    isEmergency: isEmergency,
    riskLevel: isEmergency ? "Critical" : "Moderate",
    primarySymptoms: [
      "نقص اليقظة والتركيز",
      "قلق وتوتر نفسي مستمر",
      "أفكار اجترارية سلبية",
      "صعوبة في النوم العادئ (الأرق)"
    ],
    suspectedConditions: [
      isEmergency ? "نوبة اكتئاب حادة مع أفكار انتحارية" : "اضطراب القلق المعمم (GAD)",
      "أعراض قلق مصاحبة لضغوط الحياة"
    ],
    confidence: 85,
    summaryArabic: `التقييم الأولي يعبر عن مراجعة سريرية لحالة ${isEmergency ? 'حرجة للغاية تتطلب تدخلاً عاجلاً' : 'متوسطة الشدة من الضغوط والتوتر النفسي'}. بناءً على الشكوى والوصف الذاتي المدون: "${complaintText || 'لم يتم إدخال شكوى نصية تفصيلية'}"، يتبين وجود مؤشرات لتركز الأفكار الاجترارية السلبية وفقدان مؤقت لمتعة الحياة اليومية والنشاط السلوكي المعتاد.`,
    supportingSymptomsArabic: [
      "تداخل الأفكار المقلقة وتأثيرها على جودة أداء العمل اليومي.",
      "اضطرابات وصعوبة الدخول في النوم والاستيقاظ المتكرر.",
      "أعراض جسدية مصاحبة للتوتر مثل الخفقان البسيط وصداع التوتر."
    ],
    cbtPlan: {
      cognitiveRestructuring: [
        "تحديد الفكرة التلقائية السامة (مثل:أنا فاشل تماماً أو الأمور لن تتحسن أبداً).",
        "تحدي الفكرة بالدليل والبديل الواقعي: ما نسبة صحة هذا الاعتقاد؟ وما الاحتمال الأكثر توازناً؟",
        "ملء جدول مراقبة الأفكار السلبيّة اليومي (الأفكار - العواطف - التشوهات الإدراكية - الفكرة البديلة)."
      ],
      behavioralActivation: [
        "التنشيط السلوكي: تخصيص 20 دقيقة يومياً لعمل نشاط ممتع بسيط حتى لو لم يكن هناك رغبة.",
        "تمارين التعرض التدريجي للأشخاص أو المواقف المسببة لتجنب القلق الاجتماعي.",
        "وضع جدول روتيني ثابت للنوم والأنشطة البدنية."
      ],
      practicalHomework: [
        "تدوين ثلاثة أشياء إيجابية حدثت في اليوم بامتنان (مفكرة الامتنان).",
        "تطبيق تقنية إدارة وقت القلق (تخصيص 15 دقيقة فقط في العصر للقلق، وتأجيل باقي الأفكار)."
      ]
    },
    actPlan: {
      mindfulnessArabic: [
        "الفصل المعرفي: قل لنفسك 'أنا أشعر بالخوف حالياً' بدلاً من 'أنا خائف وضائع'. أنت لست مشاعرك.",
        "القبول التام: اسمح لمشاعر القلق بالتواجد في جسدك كأمواج دون الغرق فيها أو مقاومتها بعنف.",
        "تمرين اليقظة والتركيز (5-4-3-2-1): حدد 5 أشياء تراها، 4 تلمسها، 3 تسمعها، 2 تشمها، و1 تتذوقها."
      ],
      valuesArabic: [
        "تحديد القيم السامية: ما هي المبادئ التي تهمك أكثر؟ (مثل: الرحمة، الشجاعة، خدمة الآخرين، التطور الشخصي).",
        "التعهد بالالتزام: القيام بخطوة واحدة صغيرة يومياً تنبثق مباشرة من هذه القيم حتى لو كان القلق متواجداً."
      ]
    },
    suggestedTherapistTypeArabic: "أخصائي نفسي عيادي/إكلينيكي متخصص في العلاج المعرفي السلوكي (CBT)، أو طبيب نفسي مرخص للمتابعة عند الحاجة لتقييم الدواء.",
    emergencyContactsArabic: "إذا كنت في خطر أو تعاني من أفكار لإيذاء نفسك، يرجى التوجه فوراً لأقرب طبيب طوارئ، أو الاتصال بالخطوط الساخنة الوطنية: مصر (15895 - 08008880700)، السعودية (937)، الأمارات (8004673)."
  };
}

// Vite and static asset integrations
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Serving application in Development Mode using Vite custom middleware.");
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

initServer().catch((err) => {
  console.error("Failed to start full-stack server instance:", err);
});
