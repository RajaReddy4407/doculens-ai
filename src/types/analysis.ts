export type AnalysisMode =
  | "auto"
  | "handwriting"
  | "visual_learning"
  | "screenshot"
  | "everyday";

export type PersonalityMode =
  | "beginner"
  | "expert"
  | "student"
  | "professional"
  | "short";

export type AIProvider = "gemini" | "openai" | "demo";

export interface UploadedFilePayload {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl?: string;
  textContent?: string;
  presetId?: string;
}

export interface ExtractedInfoItem {
  label: string;
  value: string;
  category?: "date" | "amount" | "contact" | "entity" | "other";
}

export interface HandwritingEquation {
  expression: string;
  explanation: string;
}

export interface HandwritingChapter {
  title: string;
  content: string;
}

export interface CalculationMistake {
  line: string;
  issue: string;
  correction: string;
}

export interface HandwritingAnalysis {
  editableText: string;
  equations: HandwritingEquation[];
  chapters: HandwritingChapter[];
  calculationMistakes: CalculationMistake[];
}

export interface MathStep {
  step: string;
  detail: string;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VisualLearningAnalysis {
  diagramExplanation: string;
  mathSteps: MathStep[];
  flashcards: FlashcardItem[];
  quiz: QuizQuestion[];
}

export interface ScreenshotErrorDiagnosis {
  error: string;
  rootCause: string;
  fixSteps: string[];
}

export interface ScreenshotCodeTranscription {
  language: string;
  code: string;
  explanation: string;
}

export interface ScreenshotUIElement {
  element: string;
  purpose: string;
}

export interface ScreenshotAnalysis {
  errorDiagnosis: ScreenshotErrorDiagnosis | null;
  codeTranscription: ScreenshotCodeTranscription | null;
  uiBreakdown: ScreenshotUIElement[];
  websiteOrMessageSummary: string;
}

export interface EverydayLineItem {
  item: string;
  amount?: string;
}

export interface EverydayDateItem {
  label: string;
  date: string;
  urgency?: "high" | "normal";
}

export interface EverydayFormField {
  field: string;
  meaning: string;
  example?: string;
}

export interface EverydayWarrantyInfo {
  product?: string;
  serialOrModel?: string;
  coverage?: string;
  expires?: string;
}

export interface EverydayAnalysis {
  documentType: string;
  lineItems: EverydayLineItem[];
  importantDates: EverydayDateItem[];
  plainLanguageFormGuide: EverydayFormField[];
  warrantyOrPurchase: EverydayWarrantyInfo | null;
}

export interface SuggestedNextAction {
  id: string;
  title: string;
  description: string;
  actionType: string;
}

export interface AnalysisResult {
  detectedCategory: string;
  recommendedTab: Exclude<AnalysisMode, "auto"> | "overview";
  summary: string;
  keyPoints: string[];
  extractedInfo: ExtractedInfoItem[];
  handwriting?: HandwritingAnalysis;
  visualLearning?: VisualLearningAnalysis;
  screenshot?: ScreenshotAnalysis;
  everyday?: EverydayAnalysis;
  nextActions: SuggestedNextAction[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface NextActionOutput {
  actionId: string;
  title: string;
  summary: string;
  items: {
    title: string;
    detail: string;
    meta?: string;
  }[];
}
