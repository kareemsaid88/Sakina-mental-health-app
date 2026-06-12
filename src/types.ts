// 🩺 Type Definitions for Sakeenah Clinical assessment and psychiatric platform

export interface Demographics {
  age: string;
  gender: string;
  marital: string;
  education: string;
  job: string;
  chronicDiseases: string;
}

export interface PatientFile {
  demographics: Demographics;
  complaintText: string;
  questionnaires: Record<string, number>; // Maps testId to total score
  pastHistory: string;
  familyHistory: string;
  medications: string;
}

export interface TestQuestion {
  id: number;
  textArabic: string;
  options: { score: number; labelArabic: string }[];
}

export interface StandardTest {
  id: string; // "PHQ-9", "GAD-7", "PSS", "DASS-21", "BDI", "BAI", "WHO-5"
  nameArabic: string;
  nameEnglish: string;
  descriptionArabic: string;
  questions: TestQuestion[];
  interpret: (score: number) => { levelArabic: string; severity: "low" | "medium" | "high" | "critical"; descArabic: string };
  maxScore: number;
}

export interface MoodLog {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  moodScore: number; // 1 to 5 (Depressed to Joyful)
  anxietyScore: number; // 1 to 5 (Calm to Severe Panic)
  happinessScore: number; // 1 to 5
  sleepHours: number;
  physicalActivityMin: number;
  notes: string;
}

export interface MedicationReminder {
  id: string;
  nameArabic: string;
  nameEnglish: string;
  dosage: string; // "5mg", "1 tablet"
  frequency: string; // "Daily", "Twice a day"
  timesOfDay: string[]; // ["10:00", "22:00"]
  isActive: boolean;
  takenToday: string[]; // List of times checked off today
}

export interface ConsultationSession {
  id: string;
  doctorNameArabic: string;
  doctorTitleArabic: string;
  doctorSpecialty: string;
  doctorImage: string;
  date: string;
  time: string;
  price: string;
  status: "Scheduled" | "Completed" | "Pending";
  meetingLink?: string;
  category: "psychiatrist" | "therapist";
}

export interface BookResource {
  id: string;
  title: string;
  author: string;
  lang: "Arabic" | "English";
  summary: string;
  coverColor: string;
  readTime: string;
  linkUrl?: string;
}

export interface VideoResource {
  id: string;
  title: string;
  duration: string;
  speaker: string;
  summary: string;
  category: string;
  linkUrl?: string;
}

export interface ThoughtLog {
  id: string;
  date: string;
  situation: string;
  automaticThought: string;
  emotion: string;
  distortion: string;
  rationalResponse: string;
}

export interface ExposureStep {
  id: string;
  stepName: string;
  difficulty: number; // 1-10 hierarchy
  completed: boolean;
}

export interface ClinicalAnalysisResult {
  isEmergency: boolean;
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  primarySymptoms: string[];
  suspectedConditions: string[];
  confidence: number;
  summaryArabic: string;
  supportingSymptomsArabic: string[];
  cbtPlan: {
    cognitiveRestructuring: string[];
    behavioralActivation: string[];
    practicalHomework: string[];
  };
  actPlan: {
    mindfulnessArabic: string[];
    valuesArabic: string[];
  };
  suggestedTherapistTypeArabic: string;
  emergencyContactsArabic: string;
}
