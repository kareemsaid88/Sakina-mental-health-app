import { MedicationReminder } from "../types";

// 💊 Comprehensive Psychiatric Medications Directory (الموسوعة الشاملة للأدوية النفسية)
// Contains local/regional Arab names, international generic active molecules, concentrations, advantages, side effects, and standard treatment times.

export interface PsychiatricMedication {
  id: string;
  brandNameLocal: string;     // الاسم التجاري المحلي والإقليمي
  brandNameForeign: string;   // المثيل أو الاسم التجاري الأجنبي/العالمي
  genericName: string;        // المادة الفعالة
  category: "antidepressant" | "anxiolytic" | "mood_stabilizer" | "antipsychotic" | "adhd_cognition";
  categoryArabic: string;
  indicationsArabic: string;  // دواعي الاستعمال
  strengths: string[];        // التركيزات المتاحة
  advantages: string[];       // المزايا والآلية الإيجابية
  sideEffects: string[];      // العيوب والآثار الجانبية والتحذيرات
  standardDurationArabic: string; // المدة الزمنية المعتادة للعلاج
  manufacturerInfo: string;   // بلد الصنع أو جهة الترخيص
}

export const PSYCHIATRIC_MEDICATIONS: PsychiatricMedication[] = [
  {
    id: "med-1",
    brandNameLocal: "سيبرالكس (Cipralex) / البديل المصري: إستيكان (Estikan) أو سيبرا برو (Cipra-Pro)",
    brandNameForeign: "ليكسابرو (Lexapro)",
    genericName: "إسيتالوبرام (Escitalopram)",
    category: "antidepressant",
    categoryArabic: "مضادات الاكتئاب والقلق والهلع والوسواس (SSRIs)",
    indicationsArabic: "الاكتئاب أحادي القطب، اضطراب القلق العام (GAD)، نوبات الهلع والذعر (Panic Disorder)، الوسواس القهري (OCD)، والرهاب الاجتماعي.",
    strengths: ["10 ملغ (10mg)", "20 ملغ (20mg)"],
    advantages: [
      "عالي النقاوة والنوعية وله فاعلية متفوقة على النواقل دون تحفيز القلق الأولي بشكل حاد.",
      "أقل تسبباً في التأثيرات القلبية الوعائية مقارنة بغيره.",
      "آمن نسبياً للاستخدام طويل الأجل في بروتوكولات CBT المدمجة.",
      "لا يؤثر بشكل حاسم على مستويات اليقظة أثناء القيادة أو العمل اليومي بجرعة 10 ملغ."
    ],
    sideEffects: [
      "اضطرابات معوية بسيطة كالغثيان العابر في الأيام العشرة الأولى.",
      "تأخر طفيف وعابر في عملية القذف لمصابي القلق.",
      "زيادة طفيفة في الشهية لتناول السكريات على المدى المتوسط.",
      "تنبيه: يجب التدرج اللطيف عند السحب لمنع أعراض الانقطاع (Discontinuation)."
    ],
    standardDurationArabic: "من 6 أشهر إلى سنة كاملة كعلامة فارقة لثبات مستويات السيروتونين الدماغية ومنع الانتكاسة السريرية.",
    manufacturerInfo: "لوندبيك الدنماركية (Lundbeck) / وشركة حكمة وماركريل بمصر"
  },
  {
    id: "med-2",
    brandNameLocal: "بروزاك (Prozac) / البديل المصري: فيلوزاك (Philozac) أو فلوكتين (Fluoctin)",
    brandNameForeign: "ديبريبان / سارافيم (Sarafem)",
    genericName: "فلوكسيتين (Fluoxetine)",
    category: "antidepressant",
    categoryArabic: "مضادات الاكتئاب والوسواس واضطرابات الشهية (SSRIs)",
    indicationsArabic: "الاكتئاب المصحوب بخمول ونعاس مفرط، اضطراب الوسواس القهري (OCD)، الشره العصبي (Bulimia)، والاضطرابات المزاجية المصاحبة للدورة الشهرية.",
    strengths: ["10 ملغ", "20 ملغ (20mg)"],
    advantages: [
      "محفز رائع للطاقة الجسدية المفقودة، ويقضي على الخمول الصباحي بكفاءة.",
      "العمر النصفي طويل جداً بالدم، مما يضمن خلو الجسم من الهبوط المفاجئ عند السحب أو النسيان العابر للجرعة.",
      "يساعد في كبح الشهية العاطفية المفتوحة ويسهم في ثبات وضبط الوزن السريري."
    ],
    sideEffects: [
      "أرق وصعوبة استغراق في النوم إذا تم بلعه في المساء المتأخر.",
      "رعشة خفيفة بالأطراف وجفاف في الحلق وتشنج معوي مبدئي متوقع.",
      "زيادة بسيطة في النشاط البدني قد تفسر على أنها قلق مؤقت في الأيام الأولى."
    ],
    standardDurationArabic: "6 إلى 9 أشهر متتالية بحد أدنى لدورات العلاج النفسي الدوائي تحت الرقابة الطبية.",
    manufacturerInfo: "إيلي ليلي الأمريكية (Eli Lilly) / شركة الأندلس والأميرية للأدوية بمصر"
  },
  {
    id: "med-3",
    brandNameLocal: "لوسترال (Lustral) / البديل المصري: مودابكس (Modapex) أو سيرتو (Serto)",
    brandNameForeign: "زولوفت (Zoloft)",
    genericName: "سيرترالين (Sertraline)",
    category: "antidepressant",
    categoryArabic: "مضادات الاكتئاب والرهاب الاجتماعي والوساوس (SSRIs)",
    indicationsArabic: "الرهاب الاجتماعي المزمن الشديد، اضطراب ما بعد الصدمة (PTSD)، نوبات الهلع المتكررة، والاكتئاب والوسواس القهري.",
    strengths: ["50 ملغ (50mg)", "100 ملغ (100mg)"],
    advantages: [
      "أفضل دواء نفسي لعلاج الرهاب وتخوف الحديث الاجتماعي والخجل المرضي.",
      "آمن للغاية على عضلة القلب لمرضى الضغط والسكر وكبار السن.",
      "فعالية ممتازة جداً لمقاومة أعراض الصدمات والاجترار الفكري المزمن."
    ],
    sideEffects: [
      "لخبطة معوية خفيفة أو إسهال عابر في بداية الكورس الدوائي.",
      "فقدان مؤقت للرغبة الحميمة يزول مع استقرار مستويات الدماغ بالنواقل.",
      "صداع وتعب خفيف في أسبوع التهيئة الأول."
    ],
    standardDurationArabic: "سنة كاملة لمقاومة النكسات الرهابية والصدمات النفسية، أو حسب رؤية الاستشاري المعالج.",
    manufacturerInfo: "فايزر العالمية (Pfizer) / شركة كيميفارم وشركة دلتا للصناعات الدوائية بمصر"
  },
  {
    id: "med-4",
    brandNameLocal: "سيروكسات (Seroxat) / البديل المصري: باكستين (Paxetin) أو زاندول (Xandol)",
    brandNameForeign: "باكسيل (Paxil)",
    genericName: "باروكسيتين (Paroxetine)",
    category: "antidepressant",
    categoryArabic: "مضادات الاكتئاب والتوتر الهلعي والرهاب (SSRIs)",
    indicationsArabic: "اضطراب الهلع الحاد المتكرر المصحوب بهروب اجتماعي، القلق العام الحاسم، الاكتئاب المرضي ثنائي القلق.",
    strengths: ["12.5 ملغ مُحكم ومتحكم بالإطلاق", "20 ملغ", "25 ملغ CR", "30 ملغ"],
    advantages: [
      "من أقوى مضادات القلق في عائلتها الدوائية وأسرعها مفعولاً هدوئياً.",
      "الصيغة ممتدة المفعول (CR) تقلل تماماً من المشاكل والاضطرابات المعوية.",
      "خافض قوي جداً وممتاز لنوبات القلق الجسدي المتسارعة مثل آلام الظهر ومغص القولون العصبي النفسي."
    ],
    sideEffects: [
      "احتمالية لزيادة الوزن بسبب تفتيح الشهية وتبطين الاستقلاب الغذائي.",
      "خمول ونعاس خفيف وتثاقل نهاراً لولا تناوله ليلاً.",
      "أعراض انسحاب حادة إذا تم إيقافه فجأة دون جدول تدرج صارم للغاية وطبابة مستمرة."
    ],
    standardDurationArabic: "6 أشهر إلى سنة كاملة بناءً على زوال حدة الهلع والخجل الاجتماعي والاجترار.",
    manufacturerInfo: "جلاكسو سميث كلاين (GSK) / شركة إيفا فارما وشركة أدكو بمصر"
  },
  {
    id: "med-5",
    brandNameLocal: "أنافرانيل (Anafranil) / المادة الوطنية: كلوميبرامين (Clomipramine)",
    brandNameForeign: "أنافرانيل SR (Anafranil SR)",
    genericName: "كلوميبرامين (Clomipramine)",
    category: "antidepressant",
    categoryArabic: "مضادات الاكتئاب والوسواسات الشديدة (Tricyclics)",
    indicationsArabic: "الوسواس القهري المقاوم (Refractory OCD)، نوبات الفزع الشديدة، والآلام الجسدية العصبية مجهولة المنشأ العضوي.",
    strengths: ["25 ملغ (25mg)", "75 ملغ ممتد التحرر (75mg SR)"],
    advantages: [
      "قوة فائقة واستثنائية لكبح الهواجس والأفكار القهرية والطقوس المتكررة.",
      "زهيد السعر ومتوفر في المستشفيات الحكومية والصيدليات الإقليمية بمصر.",
      "يعالج بفاعلية سرعة القذف والقلق المصحوب بصداع عصبي مستمر."
    ],
    sideEffects: [
      "أعراض جفاف واضحة باللعاب بالفم، زغللة مؤقتة فترات الليل، وإمساك في أول الأسابيع.",
      "نعاس صباحي ورغبة بالراحة والاستلقاء.",
      "تغيرات خفيفة في ضغط الدم الانتصابي عند الاستيقاظ الفجائي من النوم للوقوف."
    ],
    standardDurationArabic: "سنة إلى سنتين متواصلتين بالتوافق مع خطة علاج CBT السلوكية لدحض الأفكار وإيقاف الاستجابة القهرية.",
    manufacturerInfo: "نوفارتس السويسرية (Novartis) / مع توفر بدائل مصرية وطنية ممتازة"
  },
  {
    id: "med-6",
    brandNameLocal: "إيفكسور (Effexor) / البديل المصري: إيفكسور XR أو فينلاترست (Venlatrust)",
    brandNameForeign: "فينلافاكسين (Venlafaxine XR)",
    genericName: "فينلافاكسين (Venlafaxine)",
    category: "antidepressant",
    categoryArabic: "مضادات الاكتئاب والقلق المستعصي (SNRIs)",
    indicationsArabic: "الاكتئاب الجسيم المقاوم، القلق العام المزمن المقاوم للـ SSRIs، الرهاب والهلع الحاد الشديد.",
    strengths: ["75 ملغ ممتد المفعول XR", "150 ملغ XR"],
    advantages: [
      "يعمل كمثبط مزدوج للسيروتونين والنورأدرينالين مما يعطي تأثيراً مضاعفاً لعلاج الخذلان وقلة التركيز.",
      "أداء مميز جداً في تطهير الجسم من الخدر الروحي والانفصال العاطفي النفسي.",
      "صياغة الكبسولات ممتدة المفعول لطيفة بمرورها عبر المريء والأمعاء."
    ],
    sideEffects: [
      "قد يسبب ارتفاعاً طفيفاً بضغط الدم لدى بعض المرضى، لذا يوصى بفحص دوري للضغط.",
      "غثيان وتعرق خفيف بالأيدي أو هبات حرارية عابرة.",
      "سحب هذا الدواء يحتاج تدرجاً شديد الدقة والبطء نظراً لحساسية الجهاز للنورأدرينالين."
    ],
    standardDurationArabic: "من 9 أشهر إلى عام ونصف في الحالات المزمنة والمعقدة إكلينيكياً.",
    manufacturerInfo: "وايث / فايزر العالمية (Pfizer) / وتصنيع محلي متميز بمصر"
  },
  {
    id: "med-7",
    brandNameLocal: "زانكس (Xanax) / البديل المصري: ألبراكس (Alprax) أو ريستولام (Restolam) أو زونام (Zonam)",
    brandNameForeign: "ألبرازولام (Alprazolam)",
    genericName: "ألبرازولام (Alprazolam)",
    category: "anxiolytic",
    categoryArabic: "مهدئات ومضادات القلق الفورية والهلع الحاد (Benzodiazepines)",
    indicationsArabic: "التحكم اللحظي الفوري العاجل في نوبات الهلع الطارئة والذعر الشديد والتوتر النفسي المشلول.",
    strengths: ["0.25 ملغ", "0.5 ملغ (0.5mg)", "1 ملغ"],
    advantages: [
      "دواء إسعافي إسعاف فوري وقاطع لنوبة الهلع والذعر المطلق خلال 15 دقيقة فقط.",
      "يزيل الهرع ويهدئ ركض ضربات القلب المذعورة والارتجاف العضلي بالصدر.",
      "آمن وفعال في فترات الأزمات الكبرى والصدمات القصيرة جداً المحدودة."
    ],
    sideEffects: [
      "امكانية عالية للتأقلم الفسيولوجي والإدمان النفسي/الجسدي عند تجاوز الجداول المقررة.",
      "دوخة خفيفة ونعاس ورغبة بالاسترخاء وثقل موقت باللسان.",
      "تراجع بالذاكرة القريبة خلال فترة تواجده الفعال في الدم."
    ],
    standardDurationArabic: "استخدام طارئ مؤقت جداً: لا يتجاوز 10 أيام إلى 3 أسابيع على أقصى تقدير تفادياً للتعود المستودعي.",
    manufacturerInfo: "فايزر (Pfizer) / شركة إيبيكو المصرية الرائدة للصناعات الدوائية"
  },
  {
    id: "med-8",
    brandNameLocal: "كالميبام (Calmepam) / البديل الأجنبي: ليكسوتانيل (Lexotanil)",
    brandNameForeign: "برومازيبام (Bromazepam)",
    genericName: "برومازيبام (Bromazepam)",
    category: "anxiolytic",
    categoryArabic: "مهدئات التشنج والتوتر النفسي (Benzodiazepines)",
    indicationsArabic: "التشنجات الجسدية الناجمة عن ضغوط العمل النفسية، القلق الداخلي المصحوب بقرصات المعدة والتوتر العضلي.",
    strengths: ["1.5 ملغ", "3 ملغ (3mg)"],
    advantages: [
      "مضاد تشنج ومرخٍ عائلي للعضلات الهيكلية المتصلبة بسبب الغضب والتوتر.",
      "مريح جداً للقولون العصبي النفسي وتشنج الحجاب الحاجز وضيق الصدر العابر.",
      "أخف وطأة من زانكس في إرباك المهارات الذهنية الدقيقة والتركيز الدراسي."
    ],
    sideEffects: [
      "قابلية للاعتياد الفيزيائي عند الاستمرار لشهور دون متابعة وتوجيه مباشر.",
      "بلادة واسترخاء العضلات وخمول صباحي طفيف.",
      "تراجع جزئي في ردات فعل القيادة للمعدات الثقيلة."
    ],
    standardDurationArabic: "من أسبوع إلى أسبوعين فقط كعامل مساعد لتغطية فترات القلق الشاهقة الأولية.",
    manufacturerInfo: "روجر الدوائية / شركة غلوبال نابي للأدوية بمصر"
  },
  {
    id: "med-9",
    brandNameLocal: "أموتريل (Amotril) / البديل الأجنبي: ريفوتريل (Rivotril)",
    brandNameForeign: "كلونازيبام / ابنيول",
    genericName: "كلونازيبام (Clonazepam)",
    category: "anxiolytic",
    categoryArabic: "مهدئات ومضادات الهلع وحرائق التوتر العصبي (Benzodiazepines)",
    indicationsArabic: "نوبات الهلع والاجتياح القلقي الشديد، الوسواس الحركي المصحوب بتوتر، نوبات الصرع والارتجاج.",
    strengths: ["0.5 ملغ", "2 ملغ (2mg)"],
    advantages: [
      "عمر ممتد وطويل بالدم يعطي راحة وهدوءاً مستمراً يمتد لأكثر من 24 ساعة من الحماية ضد الهلع.",
      "مضاد قوي للاختلاجات والرجفات الحركية لليدين والتوتر العضلي الحلقي.",
      "أفضل مهدئ في التحكم بالأزمات المصاحبة لاضطراب القلق الجسدي الطاغي."
    ],
    sideEffects: [
      "تأخر الفطام الدوائي وصعوبة معقولة في السحب إلا بخطة خفض تدريجية بطيئة.",
      "ميل دائم للنوم الطويل والراحة العضلية الزائدة عن الحاجة.",
      "خمول وصعوبة مؤقتة في التنسيق البصري الحركي الدقيق."
    ],
    standardDurationArabic: "يفصل فيه الطبيب النفسي المختص بحذر تام، وغالباً للمدد الحادة من 10 إلى 30 يوماً متواصلة فقط.",
    manufacturerInfo: "روش السويسرية (Roche) / شركة آمون للأدوية بمصر"
  },
  {
    id: "med-10",
    brandNameLocal: "ديباكين كرونو (Depakine Chrono) / البديل المصري الوطني: فالبروات الصوديوم",
    brandNameForeign: "كنفيوليك / إبيفال (Epival)",
    genericName: "فالبروات الصوديوم (Sodium Valproate)",
    category: "mood_stabilizer",
    categoryArabic: "مثبتات وموازنات المزاج ومضادات الاضطراب ثنائي القطب",
    indicationsArabic: "الاضطراب الوجداني ثنائي القطب (Bipolar I & II) للتحكم في النوبات وموازنة الهوس والاكتئاب ومنع التحولات المفاجئة.",
    strengths: ["200 ملغ", "500 ملغ ممتد التحرر (500mg Chrono)"],
    advantages: [
      "موازن فائق الفاعلية والسيطرة يزيل تقلبات المزاج القاسية والهوس الشاهق والغضب اللحظي.",
      "يحمي وينشط كفاءة خلايا الدماغ والناقل العصبي الكابح للقلق (GABA).",
      "الصيغة ممتدة المفعول تحافظ على تركيزات دوائية عادلة طوال الـ 24 ساعة دون الحاجة لأقراص متعددة."
    ],
    sideEffects: [
      "خطورة التشوهات الجنينية لدى الحوامل، ويُحظر للمرأة دون مانع حمل معتمد وصارم.",
      "قد يسبب تساقطاً خفيفاً للشعر في الربع الأول وتفتيح حاد للشهية وزيادة وزن.",
      "يستلزم فحوص الكبد والدم والتحقق بانتظام من تركيز الدوائي بالدم (Valproate level)."
    ],
    standardDurationArabic: "يستعمل للمدد الطويلة الممتدة لسنوات كحارس وقائي مانع للتحول القطبي والهوس لأصحاب ثنائي القطب.",
    manufacturerInfo: "سانوفي الفرنسية (Sanofi) / شركة فاركو للأدوية بمصر"
  },
  {
    id: "med-11",
    brandNameLocal: "لاميكتال (Lamictal) / البديل المصري: لاميكت (Lamict) أو لاروجين (Larogin)",
    brandNameForeign: "لاموتريجين / لاميبتيل (Lameptil)",
    genericName: "لاموتريجين (Lamotrigine)",
    category: "mood_stabilizer",
    categoryArabic: "مثبتات المزاج المضادة للاكتئاب الوجداني",
    indicationsArabic: "الوقاية من نوبات الاكتئاب المصاحبة لمرض ثنائي القطب، موازنة العاطفة المتقلبة المستعصية.",
    strengths: ["25 ملغ", "50 ملغ", "100 ملغ (100mg)", "200 ملغ"],
    advantages: [
      "موازن المزاج الأكثر أماناً وقدرة على جرف كآبة ثنائي القطب دون التسبب بنوبات هوس.",
      "لا يسبب سمنة أو زيادة بالوزن أو تساقط بالشعر مطلقاً.",
      "لا يتطلب عمل كشوف دورية متكررة للدم مقارنة بالليثيوم والديباكين."
    ],
    sideEffects: [
      "خطر الحروق الجلدية والطفح المهدد للحياة (Stevens-Johnson) عند رفعه بسرعة، ولذا يرفع بحذر مالي بطيء جداً (مثال: البدء بـ 25 ملغ لأول أسبوعين).",
      "صداع وتوعك عابر ومؤقت.",
      "تغيرات خفيفة في الرؤية بالأيام الأولى."
    ],
    standardDurationArabic: "علاج وقائي دائم يمتد بحسب المرجعية السريرية لسنوات مع بروتوكول المحافظة الصباحي.",
    manufacturerInfo: "جلاكسو سميث كلاين (GSK) / شركة إيبسكو وشركة فارماسيوتيكال بمصر"
  },
  {
    id: "med-12",
    brandNameLocal: "سيروكويل (Seroquel) / البديل المصري: كويتابكس (Quitapex) أو أداتسيو (Adazio)",
    brandNameForeign: "كيتيابين / كويتيابين (Quetiapine)",
    genericName: "كويتيابين (Quetiapine)",
    category: "antipsychotic",
    categoryArabic: "مضادات الذهان وثنائي القطب وتحسين الأرق بجرعات واطئة",
    indicationsArabic: "الفصام العصبي، نوبات الشكوك والأفكار الاضطهادية، الهوس الحاد، والمساعدة في علاج الأرق المستعصي بجرعة بالغة الصغر.",
    strengths: ["25 ملغ (للنوم والأرق)", "100 ملغ (مضاد الهوس والشك)", "200 ملغ", "300 ملغ ممتد XR"],
    advantages: [
      "مضاد متميز لظلال الهلوسة السمعية والاضطهاد والوساوس الطاغية فكرياً.",
      "بجرعة 25 ملغ يفرز هدنة نوم عميقة ومقاومة قاسية للأرق الشديد دون التسبب بإدمان.",
      "آمن نسبياً من المشاكل الحركية والرجفان العصبي لليدين والفك."
    ],
    sideEffects: [
      "خمول وهبوط شديد وصعوبة بالغة جداً في الاستيقاظ المبكر بالصباح في أول أسبوعين.",
      "تحفيز هائل للشهية لتناول الأطعمة الدسمة والمخبوزات، ومخاطر السمنة ومتلازمة التمثيل الغذائي.",
      "جفاف عميق بالحلق واللسان وضبابية بصرية مسائية موقتة."
    ],
    standardDurationArabic: "من عدة أشهر للحالات الاضطرابية الحادة وحتى سنوات طويلة لمرضى الفصام والهوس المزمن.",
    manufacturerInfo: "أسترازينيكا (AstraZeneca) / شركة مالتي إيبيكس وشركة ماركيرل بمصر"
  },
  {
    id: "med-13",
    brandNameLocal: "أولينز (Oleanz) / البديل المصري: أنزابي (Anzapy) أو زيبريكسا (Zyprexa)",
    brandNameForeign: "أولانزابين (Olanzapine)",
    genericName: "أولانزابين (Olanzapine)",
    category: "antipsychotic",
    categoryArabic: "مضادات الذهان القوية والهواجس الطاغية",
    indicationsArabic: "السيطرة الفورية العنيفة على الهوس الحاد، الهلاوس البصرية والفصام، التغلب على الهياج النفسي الشديد.",
    strengths: ["5 ملغ", "10 ملغ (10mg)"],
    advantages: [
      "يعد المطرقة الذهانية الأقوى لإسكات جميع الأفكار الانفصام الضلالية الكبرى فوراً.",
      "تحسين ملحوظ في الهيكل المزاجي المتقلب المصاحب للاكتئاب الحاد والذهان.",
      "يساعد في استقرار المرضى ذوي السلوكيات الاندفاعية الخطرة."
    ],
    sideEffects: [
      "قد يتسبب في زيادة وزن سريعة وحتمية في غضون أول 30 يوماً من الاستخدام المستمر.",
      "كسل تام وخمول مفرط نهاراً، وكسل تمثيلي في حرق السكريات.",
      "جفاف الفم وصداع وكسل عاطفي عابر."
    ],
    standardDurationArabic: "6 أشهر إلى فترات طويلة دائمة مستقرة بمتابعة مستمرة للاستشاري المعالج والتحليلات الكيميائية.",
    manufacturerInfo: "إيلي ليلي (Eli Lilly) / شركة الأندلس الطبية لتصنيع الدواء بمصر"
  },
  {
    id: "med-14",
    brandNameLocal: "كونسيرتا (Concerta) / بدائل الصرف بمصر: كولوريتالين / ميثيل فينيدات (Methylphenidate)",
    brandNameForeign: "ريتالين (Ritalin LA) / أديرال الموازي",
    genericName: "ميثيل فينيدات (Methylphenidate)",
    category: "adhd_cognition",
    categoryArabic: "المنشطات العصبية لعلاج فرط الحركة وتشتت الانتباه وADHD",
    indicationsArabic: "اضطراب فرط الحركة وتشتت الانتباه الحاد (ADHD) عند الصغار المدرسين والمراهقين والبالغين من أصحاب الأعمال، ونوبات النعاس الفجائي الكسلية.",
    strengths: ["18 ملغ ممتد الإطلاق", "36 ملغ (36mg)", "54 ملغ"],
    advantages: [
      "صياغة تكنولوجية (OROS) تحرر المادة الفعالة ببطء متناهي على مدار 12 ساعة تامة لمنع الصدمات العصبية وفجوات الطاقة.",
      "تحسين رهيب وغير مسبوق لمستويات التركيز، الجدولة، إكمال الأبحاث، والتحصيل الدراسي.",
      "يلبي رغبة مريض التشتت بتهدئة العقل وصقله وإيقاف الاندفاع والثرثرة والنسيان الشائع."
    ],
    sideEffects: [
      "فقدان حاد في الشهية للوجبات وتناقص بالوزن مبدئياً وصداع خفيف طائر.",
      "أرق حاد وقاهر يمنع سبل النوم الهانئ في حال بلعه بالمساء.",
      "تسارع بسيط بنبضات القلب وارتفاع خفيف عابر في ضغط الدم."
    ],
    standardDurationArabic: "يستعمل بالتوافق مع فصول الكورسات المدرسية والجامعية تحت مراقبة طبية لجدولة الصرف وعقوده.",
    manufacturerInfo: "جانسين الدوائية (Janssen) / خاضع لإجراءات الجداول الرقابية الصارمة بمصر والدول العربية"
  },
  {
    id: "med-15",
    brandNameLocal: "أتنتيرا (Attentera) / البديل الأجنبي: ستراتيرا (Strattera)",
    brandNameForeign: "أتوموكسيتين / كيميريكا (Kimerica)",
    genericName: "أتوموكسيتين (Atomoxetine)",
    category: "adhd_cognition",
    categoryArabic: "معدلات الانتباه غير المنبهة لـ ADHD والتركيز الفكري",
    indicationsArabic: "فرط الحركة ونقص الانتباه للبالغين، خصوصاً الحالات المصابة بقلق وتوتر وتخاف المنشطات العصبية.",
    strengths: ["18 ملغ", "25 ملغ", "40 ملغ (40mg)", "60 ملغ"],
    advantages: [
      "دواء غير منبه عصبي إطلاقاً ولا يسبب تعوداً أو اعتماداً أو إدماناً.",
      "يرفع مستويات النورأدرينالين بالدماغ مما يهدئ التشويش الفكري ويصقل التركيز.",
      "يمنع تهيج الأطفال والمراهقين وافتعال الشغب الأكاديمي."
    ],
    sideEffects: [
      "تغيرات بالجهاز الهضمي وشعور بالغثيان الخفيف عند البلع على معدة فارغة.",
      "شعور مؤقت بالنوم في بداية أيام العلاج، خلافاً للمنشطات الزائفة.",
      "تأخر طفيف مؤقت في تنظيم الهبات الحرارية."
    ],
    standardDurationArabic: "يمتد من 6 أشهر إلى عامين للتأثير المستقر على بنية الشخصية والسلوك التنظيمي.",
    manufacturerInfo: "إيلي ليلي (Eli Lilly) / شركة ليدرز الدوائية وكيميريكا بمصر"
  }
];

export function getReportSuggestedMedication(testId: string): PsychiatricMedication {
  if (testId === "PHQ-9") {
    return PSYCHIATRIC_MEDICATIONS.find(m => m.id === "med-2")!; // Prozac
  } else if (testId === "GAD-7") {
    return PSYCHIATRIC_MEDICATIONS.find(m => m.id === "med-1")!; // Cipralex
  } else if (testId === "PSS-10") {
    return PSYCHIATRIC_MEDICATIONS.find(m => m.id === "med-3")!; // Lustral
  }
  return PSYCHIATRIC_MEDICATIONS.find(m => m.id === "med-1")!; // Default Cipralex
}

export function getCustomizedMedicationsList(testId: string): MedicationReminder[] {
  if (testId === "PHQ-9") {
    const medPrimary = PSYCHIATRIC_MEDICATIONS.find(m => m.id === "med-2")!; // Prozac
    const medSecondary = PSYCHIATRIC_MEDICATIONS.find(m => m.id === "med-12")!; // Seroquel sleep helper
    
    return [
      {
        id: "cust-m1",
        nameArabic: `${medPrimary.brandNameLocal} (مضاد اكتئاب وتحسين دافع النشاط)`,
        nameEnglish: `${medPrimary.brandNameForeign} (${medPrimary.genericName})`,
        dosage: "20 ملغ (حبة واحدة)",
        frequency: "يومياً صباحاً بعد الأكل",
        timesOfDay: ["08:30"],
        isActive: true,
        takenToday: []
      },
      {
        id: "cust-m2",
        nameArabic: `${medSecondary.brandNameLocal} (مساعد وعلاج الأرق بجرعة مخصصة)`,
        nameEnglish: `${medSecondary.brandNameForeign} (${medSecondary.genericName})`,
        dosage: "25 ملغ (حبة واحدة قبل النوم)",
        frequency: "يومياً قبل النوم بـ 30 دقيقة",
        timesOfDay: ["22:30"],
        isActive: true,
        takenToday: []
      }
    ];
  } else if (testId === "GAD-7") {
    const medPrimary = PSYCHIATRIC_MEDICATIONS.find(m => m.id === "med-1")!; // Cipralex
    const medSecondary = PSYCHIATRIC_MEDICATIONS.find(m => m.id === "med-8")!; // Calmepam mdr/PRN
    
    return [
      {
        id: "cust-m1",
        nameArabic: `${medPrimary.brandNameLocal} (مضاد قلق وتوتر معمم وموجات الهلع)`,
        nameEnglish: `${medPrimary.brandNameForeign} (${medPrimary.genericName})`,
        dosage: "10 ملغ (نصف حبة صباحاً)",
        frequency: "يومياً صباحاً",
        timesOfDay: ["09:00"],
        isActive: true,
        takenToday: []
      },
      {
        id: "cust-m2",
        nameArabic: `${medSecondary.brandNameLocal} (للتحكم في أعراض خفقان وتسارع ضربات القلب السلوكي عند اللزوم)`,
        nameEnglish: `${medSecondary.brandNameForeign} (${medSecondary.genericName})`,
        dosage: "1.5 ملغ (حبة واحدة عند اللزوم)",
        frequency: "عند اللزوم النفسي والشعور بنوبة تسارع أو ضيق تنفس",
        timesOfDay: ["11:00", "21:00"],
        isActive: true,
        takenToday: []
      }
    ];
  } else if (testId === "PSS-10") {
    const medPrimary = PSYCHIATRIC_MEDICATIONS.find(m => m.id === "med-3")!; // Lustral
    const medSecondary = PSYCHIATRIC_MEDICATIONS.find(m => m.id === "med-8")!; // Calmepam
    
    return [
      {
        id: "cust-m1",
        nameArabic: `${medPrimary.brandNameLocal} (انحلال وتخفيف وساوس الضغوط والتوتر وعصب الصدر)`,
        nameEnglish: `${medPrimary.brandNameForeign} (${medPrimary.genericName})`,
        dosage: "50 ملغ (حبة واحدة)",
        frequency: "يومياً صباحاً ومساءً",
        timesOfDay: ["08:00", "20:00"],
        isActive: true,
        takenToday: []
      },
      {
        id: "cust-m2",
        nameArabic: `${medSecondary.brandNameLocal} (منظم تسارع ضربات القلب السلوكية وتشنج القولون العصبي)`,
        nameEnglish: `${medSecondary.brandNameForeign} (${medSecondary.genericName})`,
        dosage: "1.50 ملغ (حبة واحدة عند اللزوم)",
        frequency: "عند اشتداد رغبة التوتر أو نوبات انقباض المعدة العصبي",
        timesOfDay: ["13:00"],
        isActive: true,
        takenToday: []
      }
    ];
  }
  
  // Default mixed list using Cipralex
  const medDefault = PSYCHIATRIC_MEDICATIONS.find(m => m.id === "med-1")!;
  return [
    {
      id: "cust-m1",
      nameArabic: `${medDefault.brandNameLocal} (مضاد اكتئاب وقلق خفيف المتابعة)`,
      nameEnglish: `${medDefault.brandNameForeign} (${medDefault.genericName})`,
      dosage: "10 ملغ (نصف حبة)",
      frequency: "يومياً صباحاً",
      timesOfDay: ["09:00"],
      isActive: true,
      takenToday: []
    }
  ];
}
