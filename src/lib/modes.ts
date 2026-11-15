import { AnalysisMode, PersonalityMode } from "@/types/analysis";

export interface PersonalityConfig {
  id: PersonalityMode;
  label: string;
  tagline: string;
  instruction: string;
  badgeColor: string;
}

export const PERSONALITIES: PersonalityConfig[] = [
  {
    id: "beginner",
    label: "Beginner",
    tagline: "Explain everything simply",
    instruction:
      "Explain everything in plain, friendly, everyday language with zero unexplained jargon. Use simple analogies where helpful.",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "expert",
    label: "Expert",
    tagline: "Technical explanations",
    instruction:
      "Provide deep, precise, technical explanations using domain-accurate terminology, edge cases, and architectural or mathematical rigor.",
    badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  {
    id: "student",
    label: "Student",
    tagline: "Teach & quiz concepts",
    instruction:
      "Act as an encouraging tutor: teach the underlying concepts step-by-step, highlight common pitfalls, and reinforce learning with questions.",
    badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  {
    id: "professional",
    label: "Professional",
    tagline: "Actionable takeaways",
    instruction:
      "Focus on executive clarity, deliverables, deadlines, risks, and concrete actionable next steps.",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  {
    id: "short",
    label: "Short",
    tagline: "Only key info",
    instruction:
      "Be ultra-concise. Return only the most critical facts, numbers, and bullet points with zero fluff.",
    badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
];

export interface ModeConfig {
  id: AnalysisMode;
  label: string;
  shortLabel: string;
  description: string;
}

export const ANALYSIS_MODES: ModeConfig[] = [
  {
    id: "auto",
    label: "Auto-Detect Scan",
    shortLabel: "Auto",
    description: "Automatically detects document type and runs all relevant intelligence modules.",
  },
  {
    id: "handwriting",
    label: "Handwriting Intelligence",
    shortLabel: "Handwriting",
    description: "Transcribe handwriting, extract equations, organize chapters, and catch math mistakes.",
  },
  {
    id: "visual_learning",
    label: "Visual Learning Mode",
    shortLabel: "Visual Learning",
    description: "Explain diagrams, break down math, and generate flashcards & interactive quizzes.",
  },
  {
    id: "screenshot",
    label: "Screenshot Intelligence",
    shortLabel: "Screenshot",
    description: "Diagnose error messages, explain code screenshots, UI interfaces, and notifications.",
  },
  {
    id: "everyday",
    label: "Everyday Life Assistant",
    shortLabel: "Everyday Life",
    description: "Parse receipts, bills, invoices, warranties, important deadlines, and complex forms.",
  },
];

export function getPersonalityConfig(id: PersonalityMode): PersonalityConfig {
  return PERSONALITIES.find((p) => p.id === id) ?? PERSONALITIES[0];
}
