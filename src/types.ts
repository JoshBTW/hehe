export type ThemeColor = 'pink' | 'purple' | 'rose' | 'cream';

export type SlideType = 'envelope' | 'counter' | 'memory' | 'letter' | 'quiz' | 'ending';

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  description: string;
  image?: string; // Optional image URL or preset key
  video?: string; // Optional video URL or base64
  date?: string; // Optional milestone/memory date
  letterBody?: string; // For letters
  quizQuestion?: string; // For quizzes
  quizAnswers?: string[]; // Options
  correctAnswerIndex?: number; // Index of correct answer
  successMessage?: string; // Message on correct quiz answer
  lockedUntilCompleted?: boolean;
}

export interface JournalConfig {
  partnerName: string;
  senderName: string;
  relationshipDate: string; // YYYY-MM-DD
  themeColor: ThemeColor;
  musicEnabled: boolean;
  slides: Slide[];
}
