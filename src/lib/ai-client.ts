import { getPersonalityConfig } from "@/lib/modes";
import {
  AIProvider,
  AnalysisMode,
  AnalysisResult,
  ChatMessage,
  NextActionOutput,
  PersonalityMode,
  UploadedFilePayload,
} from "@/types/analysis";

export interface ResolvedCredentials {
  provider: AIProvider;
  apiKey: string | null;
}

export function resolveCredentials(headers: Headers): ResolvedCredentials {
  const headerKey = headers.get("x-api-key")?.trim();
  const headerProvider = headers.get("x-provider")?.trim() as AIProvider | undefined;

  if (headerKey && (headerProvider === "gemini" || headerProvider === "openai")) {
    return { provider: headerProvider, apiKey: headerKey };
  }

  if (process.env.GEMINI_API_KEY?.trim()) {
    return { provider: "gemini", apiKey: process.env.GEMINI_API_KEY.trim() };
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    return { provider: "openai", apiKey: process.env.OPENAI_API_KEY.trim() };
  }

  return { provider: "demo", apiKey: null };
}

function parseDataUrl(
  dataUrl: string
): { mimeType: string; base64: string; isSvg: boolean; decodedText?: string } | null {
  if (dataUrl.startsWith("data:image/svg+xml;utf8,")) {
    const decoded = decodeURIComponent(dataUrl.slice("data:image/svg+xml;utf8,".length));
    return { mimeType: "image/svg+xml", base64: "", isSvg: true, decodedText: decoded };
  }
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const base64 = match[2];
  if (mimeType === "image/svg+xml") {
    const decoded = Buffer.from(base64, "base64").toString("utf8");
    return { mimeType, base64, isSvg: true, decodedText: decoded };
  }
  return { mimeType, base64, isSvg: false };
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

interface GeminiModelCandidate {
  model: string;
  thinkingConfig?: Record<string, unknown>;
  timeoutMs: number;
}

const FAST_FLASH_CANDIDATES: GeminiModelCandidate[] = [
  { model: "gemini-3.5-flash-lite", thinkingConfig: { thinkingLevel: "MINIMAL" }, timeoutMs: 12000 },
  { model: "gemini-3.5-flash", thinkingConfig: { thinkingBudget: 0 }, timeoutMs: 14000 },
  { model: "gemini-3.6-flash", thinkingConfig: { thinkingBudget: 0 }, timeoutMs: 15000 },
];

async function callGemini(
  apiKey: string,
  prompt: string,
  file: UploadedFilePayload,
  expectJson: boolean,
  skipBinary = false
): Promise<string> {
  const parts: Record<string, unknown>[] = [{ text: prompt }];

  if (file.textContent) {
    parts.push({
      text: `\n\n--- UPLOADED DOCUMENT CONTENT (${file.name}) ---\n${file.textContent.slice(0, 45000)}`,
    });
  }

  if (file.dataUrl && !skipBinary) {
    const parsed = parseDataUrl(file.dataUrl);
    if (parsed) {
      if (parsed.isSvg && parsed.decodedText) {
        parts.push({
          text: `\n\n--- SVG IMAGE SOURCE (${file.name}) ---\n${parsed.decodedText}`,
        });
      } else if (parsed.base64) {
        parts.push({
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.base64,
          },
        });
      }
    }
  }

  let lastError = "Gemini request failed.";

  for (const candidate of FAST_FLASH_CANDIDATES) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          candidate.model
        )}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(candidate.timeoutMs),
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
            generationConfig: {
              ...(expectJson ? { responseMimeType: "application/json" } : {}),
              temperature: 0.15,
              maxOutputTokens: 2048,
              ...(candidate.thinkingConfig ? { thinkingConfig: candidate.thinkingConfig } : {}),
            },
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        lastError = `${candidate.model} (${res.status}): ${errText.slice(0, 240)}`;
        continue;
      }

      const data = await res.json();
      const candidateParts = (data?.candidates?.[0]?.content?.parts ?? []) as {
        text?: string;
        thought?: boolean;
      }[];

      const text = candidateParts
        .filter((p) => !p.thought && typeof p.text === "string")
        .map((p) => p.text)
        .join("")
        .trim();

      if (!text) {
        lastError = `${candidate.model} returned an empty response.`;
        continue;
      }

      return text;
    } catch (err) {
      lastError = `${candidate.model}: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  throw new Error(`Gemini Flash failed: ${lastError}`);
}

async function callOpenAI(
  apiKey: string,
  prompt: string,
  file: UploadedFilePayload,
  expectJson: boolean,
  skipBinary = false
): Promise<string> {
  const content: Record<string, unknown>[] = [{ type: "text", text: prompt }];

  if (file.textContent) {
    content.push({
      type: "text",
      text: `\n\n--- DOCUMENT CONTENT (${file.name}) ---\n${file.textContent.slice(0, 30000)}`,
    });
  }

  if (file.dataUrl && !skipBinary) {
    const parsed = parseDataUrl(file.dataUrl);
    if (parsed?.isSvg && parsed.decodedText) {
      content.push({
        type: "text",
        text: `\n\n--- SVG IMAGE SOURCE (${file.name}) ---\n${parsed.decodedText}`,
      });
    } else if (file.mimeType.startsWith("image/")) {
      content.push({
        type: "image_url",
        image_url: { url: file.dataUrl },
      });
    }
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.25,
      ...(expectJson ? { response_format: { type: "json_object" } } : {}),
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned an empty response.");
  return text;
}

export async function runLiveAnalysis(
  creds: ResolvedCredentials,
  file: UploadedFilePayload,
  mode: AnalysisMode,
  personality: PersonalityMode
): Promise<AnalysisResult> {
  if (!creds.apiKey || creds.provider === "demo") {
    throw new Error("No API key configured.");
  }

  const p = getPersonalityConfig(personality);
  const prompt = `You are DocuLens AI. Inspect "${file.name}" (${file.mimeType}).
TONE: ${p.label} (${p.instruction}) | FOCUS: ${mode}

SPEED & CONCISENESS RULES:
- Be concise and direct. Max 3-4 items per array.
- Populate overview, flashcards (2-3), quiz (2), and nextActions (3) always.
- For handwriting, screenshot, and everyday sections: ONLY populate the fields that genuinely apply to this file; leave non-applicable arrays as [] and objects as null.

Return ONLY valid JSON matching this schema:
{
  "detectedCategory": "string",
  "recommendedTab": "overview" | "handwriting" | "visual_learning" | "screenshot" | "everyday",
  "summary": "string in ${p.label} tone",
  "keyPoints": ["string"],
  "extractedInfo": [{ "label": "string", "value": "string", "category": "date" | "amount" | "contact" | "entity" | "other" }],
  "handwriting": {
    "editableText": "transcribed text if notes/handwriting/document",
    "equations": [{ "expression": "string", "explanation": "string" }],
    "chapters": [{ "title": "string", "content": "string" }],
    "calculationMistakes": [{ "line": "string", "issue": "string", "correction": "string" }]
  },
  "visualLearning": {
    "diagramExplanation": "string",
    "mathSteps": [{ "step": "string", "detail": "string" }],
    "flashcards": [{ "id": "fc-1", "front": "string", "back": "string" }],
    "quiz": [{ "id": "q-1", "question": "string", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "string" }]
  },
  "screenshot": {
    "errorDiagnosis": { "error": "string", "rootCause": "string", "fixSteps": ["string"] } | null,
    "codeTranscription": { "language": "string", "code": "string", "explanation": "string" } | null,
    "uiBreakdown": [{ "element": "string", "purpose": "string" }],
    "websiteOrMessageSummary": "string"
  },
  "everyday": {
    "documentType": "string",
    "lineItems": [{ "item": "string", "amount": "string" }],
    "importantDates": [{ "label": "string", "date": "string", "urgency": "high" | "normal" }],
    "plainLanguageFormGuide": [{ "field": "string", "meaning": "string", "example": "string" }],
    "warrantyOrPurchase": { "product": "string", "serialOrModel": "string", "coverage": "string", "expires": "string" } | null
  },
  "nextActions": [
    { "id": "slug", "title": "string", "description": "string", "actionType": "string" }
  ]
}`;

  const raw =
    creds.provider === "gemini"
      ? await callGemini(creds.apiKey, prompt, file, true)
      : await callOpenAI(creds.apiKey, prompt, file, true);

  return JSON.parse(extractJson(raw)) as AnalysisResult;
}

export async function runFastAnalysis(
  creds: ResolvedCredentials,
  file: UploadedFilePayload,
  mode: AnalysisMode,
  personality: PersonalityMode
): Promise<AnalysisResult> {
  if (!creds.apiKey || creds.provider === "demo") {
    throw new Error("No API key configured.");
  }

  const p = getPersonalityConfig(personality);
  const prompt = `You are DocuLens AI. Quickly scan "${file.name}" (${file.mimeType}).
TONE: ${p.label} (${p.instruction}) | FOCUS: ${mode}

Return ONLY a compact JSON object with the core overview so the user sees results immediately:
{
  "detectedCategory": "short label (e.g. Receipt, Study Notes, Code Screenshot, Invoice, Resume)",
  "recommendedTab": "overview" | "handwriting" | "visual_learning" | "screenshot" | "everyday",
  "summary": "2-4 sentence summary in ${p.label} tone",
  "keyPoints": ["3 to 4 concise key takeaways"],
  "extractedInfo": [{ "label": "string", "value": "string", "category": "date" | "amount" | "contact" | "entity" | "other" }],
  "transcribedText": "concise plain-text transcription of main visible text in the document/image",
  "nextActions": [
    { "id": "slug-1", "title": "short action title", "description": "1-sentence description", "actionType": "action" }
  ]
}`;

  const raw =
    creds.provider === "gemini"
      ? await callGemini(creds.apiKey, prompt, file, true)
      : await callOpenAI(creds.apiKey, prompt, file, true);

  const parsed = JSON.parse(extractJson(raw)) as {
    detectedCategory?: string;
    recommendedTab?: AnalysisResult["recommendedTab"];
    summary?: string;
    keyPoints?: string[];
    extractedInfo?: AnalysisResult["extractedInfo"];
    transcribedText?: string;
    nextActions?: AnalysisResult["nextActions"];
  };

  return {
    detectedCategory: parsed.detectedCategory || "Document",
    recommendedTab: parsed.recommendedTab || "overview",
    summary: parsed.summary || "",
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    extractedInfo: Array.isArray(parsed.extractedInfo) ? parsed.extractedInfo : [],
    handwriting: {
      editableText: parsed.transcribedText || "",
      equations: [],
      chapters: [],
      calculationMistakes: [],
    },
    visualLearning: {
      diagramExplanation: "",
      mathSteps: [],
      flashcards: [],
      quiz: [],
    },
    screenshot: {
      errorDiagnosis: null,
      codeTranscription: null,
      uiBreakdown: [],
      websiteOrMessageSummary: "",
    },
    everyday: {
      documentType: parsed.detectedCategory || "Document",
      lineItems: [],
      importantDates: [],
      plainLanguageFormGuide: [],
      warrantyOrPurchase: null,
    },
    nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions : [],
  };
}

export async function runDeepAnalysis(
  creds: ResolvedCredentials,
  file: UploadedFilePayload,
  mode: AnalysisMode,
  personality: PersonalityMode,
  fastResult: AnalysisResult
): Promise<AnalysisResult> {
  if (!creds.apiKey || creds.provider === "demo") {
    throw new Error("No API key configured.");
  }

  const p = getPersonalityConfig(personality);
  const contextSnippet = [
    `Category: ${fastResult.detectedCategory}`,
    `Summary: ${fastResult.summary}`,
    fastResult.handwriting?.editableText
      ? `Transcribed Text:\n${fastResult.handwriting.editableText}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  // If we already have substantial transcribed text or textContent, skip re-sending heavy image binary for speed!
  const hasGoodTextContext =
    Boolean(file.textContent) || (fastResult.handwriting?.editableText?.length ?? 0) > 120;

  const prompt = `You are DocuLens AI completing Stage-2 deep tabs for "${file.name}".
TONE: ${p.label} (${p.instruction}) | FOCUS: ${mode}
KNOWN CONTEXT:
${contextSnippet}

Generate ONLY the deep tab details in concise JSON (2-3 flashcards, 2 quiz questions, and ONLY populate handwriting/screenshot/everyday fields that genuinely apply to this file; leave others as [] or null):
{
  "handwriting": {
    "editableText": "full clean transcription if notes/handwriting/document, else empty string",
    "equations": [{ "expression": "string", "explanation": "string" }],
    "chapters": [{ "title": "string", "content": "string" }],
    "calculationMistakes": [{ "line": "string", "issue": "string", "correction": "string" }]
  },
  "visualLearning": {
    "diagramExplanation": "explanation of diagram/concept",
    "mathSteps": [{ "step": "string", "detail": "string" }],
    "flashcards": [{ "id": "fc-1", "front": "string", "back": "string" }],
    "quiz": [{ "id": "q-1", "question": "string", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "string" }]
  },
  "screenshot": {
    "errorDiagnosis": { "error": "string", "rootCause": "string", "fixSteps": ["string"] } | null,
    "codeTranscription": { "language": "string", "code": "string", "explanation": "string" } | null,
    "uiBreakdown": [{ "element": "string", "purpose": "string" }],
    "websiteOrMessageSummary": "string"
  },
  "everyday": {
    "documentType": "${fastResult.detectedCategory}",
    "lineItems": [{ "item": "string", "amount": "string" }],
    "importantDates": [{ "label": "string", "date": "string", "urgency": "high" | "normal" }],
    "plainLanguageFormGuide": [{ "field": "string", "meaning": "string", "example": "string" }],
    "warrantyOrPurchase": { "product": "string", "serialOrModel": "string", "coverage": "string", "expires": "string" } | null
  }
}`;

  const raw =
    creds.provider === "gemini"
      ? await callGemini(creds.apiKey, prompt, file, true, hasGoodTextContext)
      : await callOpenAI(creds.apiKey, prompt, file, true, hasGoodTextContext);

  const deep = JSON.parse(extractJson(raw)) as Partial<AnalysisResult>;

  return {
    ...fastResult,
    handwriting: {
      editableText:
        deep.handwriting?.editableText || fastResult.handwriting?.editableText || "",
      equations: deep.handwriting?.equations ?? [],
      chapters: deep.handwriting?.chapters ?? [],
      calculationMistakes: deep.handwriting?.calculationMistakes ?? [],
    },
    visualLearning: {
      diagramExplanation: deep.visualLearning?.diagramExplanation || "",
      mathSteps: deep.visualLearning?.mathSteps ?? [],
      flashcards: deep.visualLearning?.flashcards ?? [],
      quiz: deep.visualLearning?.quiz ?? [],
    },
    screenshot: {
      errorDiagnosis: deep.screenshot?.errorDiagnosis ?? null,
      codeTranscription: deep.screenshot?.codeTranscription ?? null,
      uiBreakdown: deep.screenshot?.uiBreakdown ?? [],
      websiteOrMessageSummary: deep.screenshot?.websiteOrMessageSummary || "",
    },
    everyday: {
      documentType: deep.everyday?.documentType || fastResult.detectedCategory,
      lineItems: deep.everyday?.lineItems ?? [],
      importantDates: deep.everyday?.importantDates ?? [],
      plainLanguageFormGuide: deep.everyday?.plainLanguageFormGuide ?? [],
      warrantyOrPurchase: deep.everyday?.warrantyOrPurchase ?? null,
    },
  };
}

export async function runToneRewrite(
  creds: ResolvedCredentials,
  file: UploadedFilePayload,
  previousAnalysis: AnalysisResult,
  personality: PersonalityMode
): Promise<AnalysisResult> {
  if (!creds.apiKey || creds.provider === "demo") {
    throw new Error("No API key configured.");
  }

  const p = getPersonalityConfig(personality);
  const context = JSON.stringify({
    category: previousAnalysis.detectedCategory,
    previousSummary: previousAnalysis.summary,
    keyPoints: previousAnalysis.keyPoints,
    extractedInfo: previousAnalysis.extractedInfo,
    transcribedText: previousAnalysis.handwriting?.editableText?.slice(0, 2000),
  });

  const prompt = `Rewrite this document's summary, keyPoints, and diagramExplanation in "${p.label}" mode (${p.instruction}).
Do NOT invent facts. Keep it crisp.
DOCUMENT FACTS:
${context}

Return ONLY valid JSON:
{
  "summary": "rewritten summary in ${p.label} mode",
  "keyPoints": ["3 to 4 rewritten key takeaways in ${p.label} mode"],
  "diagramExplanation": "rewritten explanation in ${p.label} mode (or empty string if none)"
}`;

  const raw =
    creds.provider === "gemini"
      ? await callGemini(creds.apiKey, prompt, file, true, true)
      : await callOpenAI(creds.apiKey, prompt, file, true, true);

  const rewritten = JSON.parse(extractJson(raw)) as {
    summary?: string;
    keyPoints?: string[];
    diagramExplanation?: string;
  };

  return {
    ...previousAnalysis,
    summary: rewritten.summary || previousAnalysis.summary,
    keyPoints: Array.isArray(rewritten.keyPoints)
      ? rewritten.keyPoints
      : previousAnalysis.keyPoints,
    visualLearning: {
      diagramExplanation:
        rewritten.diagramExplanation ??
        previousAnalysis.visualLearning?.diagramExplanation ??
        "",
      mathSteps: previousAnalysis.visualLearning?.mathSteps ?? [],
      flashcards: previousAnalysis.visualLearning?.flashcards ?? [],
      quiz: previousAnalysis.visualLearning?.quiz ?? [],
    },
  };
}

export async function runLiveChat(
  creds: ResolvedCredentials,
  file: UploadedFilePayload,
  analysisSummary: string,
  history: ChatMessage[],
  question: string,
  personality: PersonalityMode,
  transcript = ""
): Promise<string> {
  if (!creds.apiKey || creds.provider === "demo") {
    throw new Error("No API key configured.");
  }

  const p = getPersonalityConfig(personality);
  const recentHistory = history
    .slice(-6)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  // Reuse the text we already extracted instead of re-sending the image on every question.
  const useTranscript = !file.textContent && transcript.trim().length > 120;

  const prompt = `You are DocuLens AI answering a user's question about their uploaded file ("${file.name}").
PERSONALITY MODE: ${p.label} — ${p.instruction}
Previous Summary: ${analysisSummary}
${useTranscript ? `\nExtracted Text From File:\n${transcript.slice(0, 12000)}\n` : ""}${recentHistory ? `\nRecent Conversation:\n${recentHistory}` : ""}

USER QUESTION: ${question}
Answer directly and concisely based on the uploaded content. Use short paragraphs or a short list. No markdown headings.`;

  return creds.provider === "gemini"
    ? await callGemini(creds.apiKey, prompt, file, false, useTranscript)
    : await callOpenAI(creds.apiKey, prompt, file, false, useTranscript);
}

export async function runLiveNextAction(
  creds: ResolvedCredentials,
  file: UploadedFilePayload,
  analysisSummary: string,
  actionId: string,
  actionTitle: string,
  actionDescription: string,
  personality: PersonalityMode,
  transcript = ""
): Promise<NextActionOutput> {
  if (!creds.apiKey || creds.provider === "demo") {
    throw new Error("No API key configured.");
  }

  const useTranscript = !file.textContent && transcript.trim().length > 120;

  const p = getPersonalityConfig(personality);
  const prompt = `You are DocuLens AI executing "${actionTitle}" (${actionDescription}) for "${file.name}".
PERSONALITY MODE: ${p.label} — ${p.instruction}
SUMMARY: ${analysisSummary}
${useTranscript ? `EXTRACTED TEXT:\n${transcript.slice(0, 12000)}\n` : ""}
Return ONLY valid JSON:
{
  "actionId": "${actionId}",
  "title": "${actionTitle}",
  "summary": "1-2 sentence overview",
  "items": [
    { "title": "Item heading", "detail": "Concrete, useful content", "meta": "Optional tag" }
  ]
}
Provide 4 to 5 items.`;

  const raw =
    creds.provider === "gemini"
      ? await callGemini(creds.apiKey, prompt, file, true, useTranscript)
      : await callOpenAI(creds.apiKey, prompt, file, true, useTranscript);

  return JSON.parse(extractJson(raw)) as NextActionOutput;
}
