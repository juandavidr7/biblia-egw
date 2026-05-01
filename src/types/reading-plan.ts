export interface Section {
  title: string;
  insight: string;
  verseNumbers: number[];
}

export interface Verse {
  number: number;
  text: string;
}

export interface BiblePassage {
  book: string;
  reference: string;
  bibleGatewayUrl: string;
  verses: Verse[];
  sections?: Section[];
  reflectionQuestions?: string[];
  note?: string;
}

export interface EGWReference {
  book: string;
  chapter: string;
  url: string;
  connection: string;
  excerpts: string[];
  note: string | null;
}

export interface ReadingDay {
  day: number;
  globalDay: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  central: BiblePassage;
  parallels: BiblePassage[];
  parallelNote: string | null;
  egw: EGWReference;
}

export interface WeekMeta {
  week: number;
  title: string;
  description: string;
  dayRange: [number, number];
  dataFile?: string;
}

export interface PlanIndex {
  totalWeeks: number;
  totalDays: number;
  weeks: WeekMeta[];
}

export interface WeekData {
  week: number;
  title: string;
  description: string;
  days: ReadingDay[];
}

export interface UserProfile {
  completedDays: number[];
  currentDay: number;
  lastSeen: string;
}
