import { NextRequest, NextResponse } from "next/server";
import {
  resolveCredentials,
  runDeepAnalysis,
  runFastAnalysis,
  runLiveAnalysis,
  runToneRewrite,
} from "@/lib/ai-client";
import { buildDemoAnalysis } from "@/lib/demo-presets";
import {
  AnalysisMode,
  AnalysisResult,
  PersonalityMode,
  UploadedFilePayload,
} from "@/types/analysis";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const file = body.file as UploadedFilePayload | undefined;
    const mode = (body.mode as AnalysisMode) || "auto";
    const personality = (body.personality as PersonalityMode) || "beginner";
    const stage = (body.stage as "fast" | "deep" | "rewrite" | "full" | undefined) || "full";
    const previousAnalysis = body.previousAnalysis as AnalysisResult | undefined;

    if (!file || !file.name) {
      return NextResponse.json(
        { error: "No file was provided. Upload an image, PDF, or text document to scan." },
        { status: 400 }
      );
    }

    if (!file.dataUrl && !file.textContent && !previousAnalysis) {
      return NextResponse.json(
        { error: "The uploaded file could not be read. Try a PNG, JPG, WebP, PDF, or text file." },
        { status: 400 }
      );
    }

    const creds = resolveCredentials(req.headers);

    if (creds.provider === "demo" || !creds.apiKey) {
      const analysis = buildDemoAnalysis(file, mode, personality);
      return NextResponse.json({ analysis, isDemo: true, provider: "demo", stage: "full" });
    }

    if (stage === "rewrite" && previousAnalysis) {
      const analysis = await runToneRewrite(creds, file, previousAnalysis, personality);
      return NextResponse.json({ analysis, isDemo: false, provider: creds.provider, stage });
    }

    if (stage === "fast") {
      const analysis = await runFastAnalysis(creds, file, mode, personality);
      return NextResponse.json({ analysis, isDemo: false, provider: creds.provider, stage });
    }

    if (stage === "deep" && previousAnalysis) {
      const analysis = await runDeepAnalysis(creds, file, mode, personality, previousAnalysis);
      return NextResponse.json({ analysis, isDemo: false, provider: creds.provider, stage });
    }

    const analysis = await runLiveAnalysis(creds, file, mode, personality);
    return NextResponse.json({ analysis, isDemo: false, provider: creds.provider, stage: "full" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to analyze document.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
