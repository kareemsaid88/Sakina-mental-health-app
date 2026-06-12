import { StandardTest } from "../types";

export const CLINICAL_TESTS: StandardTest[] = [
  {
    id: "PHQ-9",
    nameArabic: "مقياس الاكتئاب PHQ-9",
    nameEnglish: "Patient Health Questionnaire-9",
    descriptionArabic: "المقياس الأوسع استخداماً إكلينيكياً لتقييم وجود الأعراض الاكتئابية ومراقبة شدتها.",
    maxScore: 27,
    interpret: (score: number) => {
      if (score <= 4) return { levelArabic: "أعراض طبيعية / طفيفة جداً", severity: "low", descArabic: "المؤشرات تبين عدم وجود مستويات تتطلب تدخل علاجي نشط. استمر في رعاية صحتك النفسية العامة." };
      if (score <= 9) return { levelArabic: "اكتئاب خفيف (Mild Depression)", severity: "medium", descArabic: "هناك بوادر اضطراب مزاجي طفيف. قد يكون من المفيد تطبيق تقنيات CBT للتنشيط السلوكي." };
      if (score <= 14) return { levelArabic: "اكتئاب معتدل (Moderate Depression)", severity: "high", descArabic: "درجاتك تقع في النطاق السريري المتوسط الشدة. يُنصح بشدة بطلب استشارة تفصيلية وطرح خطط CBT." };
      if (score <= 19) return { levelArabic: "اكتئاب متوسط الشدة (Moderately Severe)", severity: "critical", descArabic: "مستويات الاكتئاب مرتفعة. ينبغي مناقشة الأمر مع طبيب أو أخصائي نفسي للتقييم الإكلينيكي الشامل." };
      return { levelArabic: "اكتئاب حاد (Severe Depression)", severity: "critical", descArabic: "درجة حادة تتطلب رعاية إكلينيكية فورية ومتابعة من طبيب نفسي مرخص." };
    },
    questions: [
      {
        id: 1,
        textArabic: "قلة الاهتمام أو المتعة في القيام بالأشياء اليومية المعتادة؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 2,
        textArabic: "الشعور بالاحباط، اليأس، أو الحزن والاكتئاب؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 3,
        textArabic: "صعوبة في الدخول في النوم، الاستمرار فيه، أو النوم الزائد عن الحد؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 4,
        textArabic: "الشعور بالتعب، الإجهاد، أو الخمول ونقص الطاقة الحاد؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 5,
        textArabic: "ضعف الشهية لتناول الطعام، أو الأكل المفرط والزائد؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 6,
        textArabic: "الشعور بالسوء اتجاه نفسك، أو الفشل، أو خيبة أمل عائلتك؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 7,
        textArabic: "صعوبة التركيز على موضوعات يومية كقراءة الصحف أو مشاهدة التلفاز أو العمل؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 8,
        textArabic: "تثاقل أو بطء في الحركات والأفعال، أو العكس: فرط الحركة والتململ لدرجة يلاحظها الآخرون؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 9,
        textArabic: "وجود أفكار بأنه من الأفضل لو كنت ميتاً، أو إيذاء وتأدية نفسك بأي شكل؟ (مؤشر خطر)",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      }
    ]
  },
  {
    id: "GAD-7",
    nameArabic: "مقياس القلق GAD-7",
    nameEnglish: "Generalized Anxiety Disorder-7",
    descriptionArabic: "المقياس الإكلينيكي المعتمد للكشف عن ملامح اضطراب القلق العام والهلع.",
    maxScore: 21,
    interpret: (score: number) => {
      if (score <= 4) return { levelArabic: "قلق طبيعي / غائب", severity: "low", descArabic: "حالتك تقع في الإطار الطبيعي. لا تظهر مؤشرات دالة على القلق المرضي." };
      if (score <= 9) return { levelArabic: "قلق خفيف (Mild Anxiety)", severity: "medium", descArabic: "توتر خفيف قد ينبثق من ضغوط العمل المؤقتة. ينصح بتمارين التأمل والاسترخاء بالتنفس." };
      if (score <= 14) return { levelArabic: "قلق معتدل (Moderate Anxiety)", severity: "high", descArabic: "درجة قلق متوسطة الشدة تؤثر غالباً على حياتك اليومية. يُفضل جدولة مهارات تنظيم المشاعر وجلسات CBT." };
      return { levelArabic: "قلق حاد (Severe Anxiety)", severity: "critical", descArabic: "درجة قلق حادة ومقلقة. يوصى بمراجعة مختص نفسي لعمل استثارة عصبية هادئة وبدء خطة تدريبية علاجية." };
    },
    questions: [
      {
        id: 1,
        textArabic: "الشعور بالعصبية، القلق، أو التحفز الزائد والتوتر الشديد؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 2,
        textArabic: "عدم القدرة على التوقف عن القلق أو التحكم في الأفكار المقلقة والسيطرة عليها؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 3,
        textArabic: "المبالغة في القلق والهم بشأن الكثير من الأمور الحياتية المختلفة بشكل متزامن؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 4,
        textArabic: "مواجهة صعوبات بالغة في الاسترخاء وتهدئة الأعصاب والجسد؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 5,
        textArabic: "الشعور بتململ وضيق لدرجة تجعل من الصعب الاستقرار في مكان واحد؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 6,
        textArabic: "الشعور السريع بالضجر، استثارة الغضب، أو العصبية الحادة من أبسط الأشياء؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      },
      {
        id: 7,
        textArabic: "الشعور بالخوف والرعب المستمر كما لو أن شيئاً فظيعاً مقرب الوقوع قريباً؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدة أيام" },
          { score: 2, labelArabic: "أكثر من نصف الأيام" },
          { score: 3, labelArabic: "تقريباً كل يوم" }
        ]
      }
    ]
  },
  {
    id: "PSS-10",
    nameArabic: "مقياس إدراك التوتر PSS-10",
    nameEnglish: "Perceived Stress Scale",
    descriptionArabic: "المقياس المرجعي العالمي الأكثر دقة للكشف عن تأثير ضغوط الحياة ونسبة مرونتك النفسية.",
    maxScore: 40,
    interpret: (score: number) => {
      if (score <= 13) return { levelArabic: "إدراك توتر منخفض / طبيعي", severity: "low", descArabic: "تتعامل مع متطلبات الحياة بمرونة ومرونة جيدة دون اهتزاز السكينة الداخلية." };
      if (score <= 26) return { levelArabic: "توتر حياتي معتدل (Moderate Stress)", severity: "medium", descArabic: "طاقة تحملك تواجه بعض الإنهاك. ننصحك بترتيب الأولويات والراحة الإيجابية واليقظة الذهنية." };
      return { levelArabic: "توتر حياتي حاد (Severe Stress)", severity: "high", descArabic: "وصلت لمرحلة الاحتراق النفسي والضغط الكثيف. حان الوقت لتهدئة روتينك وتقليل الأعباء." };
    },
    questions: [
      {
        id: 1,
        textArabic: "خلال الشهر الماضي، كم مرة غضبت بسبب شيء حدث بشكل غير متوقع؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "تقريباً أبداً" },
          { score: 2, labelArabic: "أحياناً" },
          { score: 3, labelArabic: "غالباً" },
          { score: 4, labelArabic: "دائماً جداً" }
        ]
      },
      {
        id: 2,
        textArabic: "كم مرة شعرت أنك غير قادر على التحكم في الأمور الهامة في حياتك؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "تقريباً أبداً" },
          { score: 2, labelArabic: "أحياناً" },
          { score: 3, labelArabic: "غالباً" },
          { score: 4, labelArabic: "دائماً جداً" }
        ]
      },
      {
        id: 3,
        textArabic: "كم مرة شعرت بالتوتر والضغط النفسي في الشهر الماضي؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "تقريباً أبداً" },
          { score: 2, labelArabic: "أحياناً" },
          { score: 3, labelArabic: "غالباً" },
          { score: 4, labelArabic: "دائماً جداً" }
        ]
      },
      {
        id: 4,
        textArabic: "كم مرة شعرت بالثقة والقدرة على التعامل مع مشاكلك الشخصية؟ (عكسي)",
        options: [
          { score: 4, labelArabic: "أبداً" },
          { score: 3, labelArabic: "تقريباً أبداً" },
          { score: 2, labelArabic: "أحياناً" },
          { score: 1, labelArabic: "غالباً" },
          { score: 0, labelArabic: "دائماً جداً" }
        ]
      },
      {
        id: 5,
        textArabic: "كم مرة شعرت أن الأشياء تسير بدقة وفق رغباتك وخططك؟ (عكسي)",
        options: [
          { score: 4, labelArabic: "أبداً" },
          { score: 3, labelArabic: "تقريباً أبداً" },
          { score: 2, labelArabic: "أحياناً" },
          { score: 1, labelArabic: "غالباً" },
          { score: 0, labelArabic: "دائماً جداً" }
        ]
      }
    ]
  },
  {
    id: "EDEQ-4",
    nameArabic: "مقياس اضطراب السلوك الغذائي والأكل (EDEQ-4)",
    nameEnglish: "Eating Disorder Examination Questionnaire-Short",
    descriptionArabic: "المقياس الإكلينيكي الأكثر وثوقية وغربلة لتقييم عادات الأكل المصاصة للقلق وصورة الجسد.",
    maxScore: 16,
    interpret: (score: number) => {
      if (score <= 3) return { levelArabic: "سلوك غذائي طبيعي جداً", severity: "low", descArabic: "تتمتع بعلاقة متوازنة وطبيعية مع الأكل والغداء وتأكيد الذات وصورة الجسد المريحة." };
      if (score <= 8) return { levelArabic: "اضطراب أكل خفيف النطاق", severity: "medium", descArabic: "هناك ملامح أولية لتوتر غذائي أو لجوء للأكل العاطفي عند القلق. ينصح بممارسة الرعاية السلوكية المتوازنة." };
      if (score <= 12) return { levelArabic: "اضطراب أكل معتدل الشدة (Moderate ED)", severity: "high", descArabic: "مؤشرات قوية على عادات تجنب أو شره عاطفي للأكل تتطلب إعادة صياغة المفاهيم مع معالج نفسي إكلينيكي متخصص." };
      return { levelArabic: "اضطراب سلوك غذائي حاد (Severe ED)", severity: "critical", descArabic: "سلوك تغذوي حاد يتطلب تدخلاً عاجلاً لتقييم المخاطر العضوية والنفسية وإحراز مستويات الاستقرار الجسدي." };
    },
    questions: [
      {
        id: 1,
        textArabic: "هل حاولت استبعاد أطعمة معينة أو تقليص كمياتها بشدة للتأثير على وزنك أو مظهرك؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 3, labelArabic: "بشكل يومي وقاسٍ" }
        ]
      },
      {
        id: 2,
        textArabic: "هل تشعر برعب أو خوف شديد من زيادة الوزن الداهمة أو البدانة وصعوبة تقبّل التغيير؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 3, labelArabic: "بشكل يومي وقاسٍ" }
        ]
      },
      {
        id: 3,
        textArabic: "هل عانيت من نوبات شراهة مفرطة تفقد فيها السيطرة تماماً على طاقة المقاومة وكميات الطعام؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 3, labelArabic: "بشكل يومي وقاسٍ" }
        ]
      },
      {
        id: 4,
        textArabic: "هل تعتقد أن وزنك وشكل جسمك هما المحددان الأساسيان لتقييمك الذاتي لنفسك كإنسان لدرجة جلد الذات؟",
        options: [
          { score: 0, labelArabic: "لا على الإطلاق" },
          { score: 1, labelArabic: "بشكل طفيف" },
          { score: 2, labelArabic: "بشكل ظاهر ومزعج" },
          { score: 4, labelArabic: "بشكل تام ومطلق" }
        ]
      }
    ]
  },
  {
    id: "MSI-BPD",
    nameArabic: "مقياس اضطراب الشخصية الحدية (MSI-BPD)",
    nameEnglish: "McLean Screening Instrument for Borderline Personality Disorder",
    descriptionArabic: "مقياس غربلة عيادي دقيق لتقييم سمات الذات المتقلبة، والاندفاعية، والتشوهات العاطفية البينية.",
    maxScore: 12,
    interpret: (score: number) => {
      if (score <= 3) return { levelArabic: "سمات بينية طبيعية مستقرة", severity: "low", descArabic: "لا تظهر لديك معالم تدل على اضطراب الشخصية الحدية أو غياب الهوية المستقرة البينية." };
      if (score <= 6) return { levelArabic: "تقلبات انفعالية حدودية خفيفة", severity: "medium", descArabic: "هناك سمات اندفاعية أو تقلبات خفيفة في التنظيم العاطفي وعلاقتك بالغير. ينصح بممارسة تنظيم الانفعالات السلوكية." };
      if (score <= 9) return { levelArabic: "ملامح حادة لاضطراب الشخصية الحدية", severity: "high", descArabic: "نقاط عالية سريرياً على مؤشر MSI-BPD. يُنصح بقوة البدء في بروتوكولات العلاج السلوكي الجدلي (DBT)." };
      return { levelArabic: "اضطراب شخصية حدية تام ونشط (Severe BPD)", severity: "critical", descArabic: "مستويات عدم الاستقرار شديدة ومصحوبة بسلوكيات إيذاء نفسي. تتطلب متابعة فورية لتأمين بيئة نفسية آمنة وعقد جلسات تخصصية." };
    },
    questions: [
      {
        id: 1,
        textArabic: "هل تعاني من تقلبات مزاجية سريعة وحادة جداً (تتراوح بين الغضب العارم، الحزن الشديد، أو القلق خلال ساعات)؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 3, labelArabic: "بشكل يومي وقاسٍ" }
        ]
      },
      {
        id: 2,
        textArabic: "هل تشعر بخوف ورعب دائم ومستمر من فكرة الهجر أو الفراق أو الوحدة والابتعاد عن الأشخاص المقربين؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 3, labelArabic: "بشكل يومي وقاسٍ" }
        ]
      },
      {
        id: 3,
        textArabic: "هل تشعر في كثير من الأوقات بفراغ داخلي عميق ومؤلم أو غياب الهوية وتأرجح نظرتك لنفسك؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 3, labelArabic: "بشكل يومي وقاسٍ" }
        ]
      },
      {
        id: 4,
        textArabic: "هل قمت بتصرفات اندفاعية أو سلوكيات تدمير ذاتي (كاضطرابات الإنفاق المفرط، أو سلوكيات خطرة في أوقات الضغط)؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "مرة واحدة" },
          { score: 2, labelArabic: "مرات متكررة" },
          { score: 3, labelArabic: "بشكل خطير ومستمر" }
        ]
      }
    ]
  },
  {
    id: "PANSS-6",
    nameArabic: "مقياس غربلة أعراض طيف الفصام (PANSS-6)",
    nameEnglish: "Positive and Negative Syndrome Scale - Short Screening",
    descriptionArabic: "مقياس عيادي موحد لتقييم وجود الهواسات أو الضلالات الاضطهادية والانسحاب الذهاني العصبي.",
    maxScore: 16,
    interpret: (score: number) => {
      if (score <= 3) return { levelArabic: "مؤشرات ذهانية غائبة تماماً", severity: "low", descArabic: "أفكارك وتواصلك الإدراكي في قمة الترابط والواقعية الطبيعية ولا يوجد أي علامات لقصور ذهاني." };
      if (score <= 6) return { levelArabic: "أعراض ذهانية خفيفة أو شكوك مؤقتة", severity: "medium", descArabic: "هناك سمات اضطراب في الترابط أو هواجس وساوس عابرة. مفيد المتابعة مع معالج معرفي لفحص الواقعية." };
      if (score <= 10) return { levelArabic: "أعراض فصامية نشطة معتدلة (Moderate Psychosis)", severity: "high", descArabic: "مستويات الفحص عالية تتلاقى مع علامات الانسحاب العصبي. يوصى بالمتابعة الفورية لدى عيادة طبية لتقييم الدوائي." };
      return { levelArabic: "اضطراب طيف الفصام والذهان الحاد (Severe Schizophrenia)", severity: "critical", descArabic: "تدافع الهواجس والصدمات العارمة يتطلب رعاية طبية مستعمرة لوصف مضادات الذهان وإصلاح النواقل النورونية." };
    },
    questions: [
      {
        id: 1,
        textArabic: "هل تشعر أحياناً بوجود أو تصديق قناعات أو شكوك قوية يجدها الآخرون غريبة أو اضطهادية (كالشعور بمراقبتك بجهد)؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 3, labelArabic: "بشكل يومي وقاسٍ" }
        ]
      },
      {
        id: 2,
        textArabic: "هل تسمع أو ترى أشياء غير مرئية أو مسموعة للبقية في محيطك (مثل أصوات تهمس باسمك أو تناديك)؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 3, labelArabic: "بشكل يومي وقاسٍ" }
        ]
      },
      {
        id: 3,
        textArabic: "هل تجد صعوبة بالغة في إبداء عواطفك أو التعبير عنها، أو تشعر بفتور وجداني كامل وانسحاب من البشر؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 3, labelArabic: "بشكل يومي وقاسٍ" }
        ]
      },
      {
        id: 4,
        textArabic: "هل تشعر أحياناً أن أفكارك ليست ملكك بالكامل، أو أنك تشوشت وفقدت القدرة على ترابط أفكارك بشكل عقلاني؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 4, labelArabic: "بشكل تام ومطلق" }
        ]
      }
    ]
  },
  {
    id: "MDQ",
    nameArabic: "مقياس الاضطراب ثنائي القطب (MDQ)",
    nameEnglish: "Mood Disorder Questionnaire",
    descriptionArabic: "الأداة المرجعية العالمية لتحديد تتابع نوبات هبوط الاكتئاب وارتفاع الهوس وتقلبات المزاج الجسيمة.",
    maxScore: 12,
    interpret: (score: number) => {
      if (score <= 3) return { levelArabic: "تقلبات مزاج عام طبيعية ومثالية", severity: "low", descArabic: "تحولاتك المزاجية دورية متوافقة طبيعياً ولا معالم دالة على صعود ثنائي القطب." };
      if (score <= 6) return { levelArabic: "تقلبات مزاجية دورية خفيفة (Cyclothymia)", severity: "medium", descArabic: "هناك سمات حركة دورية للمزاج والإنتاجية. ينصح بتمارين التوازن السلوكي وجدولة تنظيم الحياة اليومية." };
      if (score <= 9) return { levelArabic: "مؤشرات قوية للاضطراب ثنائي القطب", severity: "high", descArabic: "صيغة الفلترة تظهر علامات صاعدة ومستقرة سريرياً. من الضروري جداً استشارة طبيب لتقييم استخدام موازنات ومثبتات المزاج." };
      return { levelArabic: "اضطراب وجداني ثنائي القطب نشط وحاد (Severe Bipolar)", severity: "critical", descArabic: "تقلب قطبي هرموني حاد يعرض الاستقرار الاجتماعي والمادي عيادياً للخطر، يستوجب التدبيع السلوكي والمتابعة العلاجية العاجلة." };
    },
    questions: [
      {
        id: 1,
        textArabic: "هل مررت بفترات طاقة زائدة جداً وصاخبة، شعرت فيها أنك 'فوق السحاب' ولا تحتاج للنوم إلا لساعات قليلة دون تعب؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 3, labelArabic: "بشكل يومي وقاسٍ" }
        ]
      },
      {
        id: 2,
        textArabic: "هل لاحظت فترات يتسارع فيها ذهنك وتتدفق الأفكار والخطط المتسلسلة برأسك بسرعة تفوق نطقك؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 3, labelArabic: "بشكل يومي وقاسٍ" }
        ]
      },
      {
        id: 3,
        textArabic: "هل عانيت من دورات تعاقبية واضحة تفصل بين نشاط بدني وثقة بالغة، تتبعها فترات إحباط واكتئاب كلي؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "لعدّة أيام" },
          { score: 2, labelArabic: "في معظم الأيام" },
          { score: 3, labelArabic: "بشكل يومي وقاسٍ" }
        ]
      },
      {
        id: 4,
        textArabic: "هل أبدى المحيطون بك استغراباً من تصرفات متسرعة أو ثقة مفرطة بالذات غير مبررة في بعض الأيام؟",
        options: [
          { score: 0, labelArabic: "أبداً" },
          { score: 1, labelArabic: "مرة واحدة" },
          { score: 2, labelArabic: "مرات متكررة" },
          { score: 3, labelArabic: "بشكل مستمر" }
        ]
      }
    ]
  }
];
