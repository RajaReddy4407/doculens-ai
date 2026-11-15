import { NextRequest, NextResponse } from "next/server";
import { resolveCredentials, runLiveChat } from "@/lib/ai-client";
import { buildDemoChatReply } from "@/lib/demo-presets";
import { AnalysisResult, ChatMessage, PersonalityMode, UploadedFilePayload } from "@/types/analysis";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const file = body.file as UploadedFilePayload | undefined;
    const analysis = body.analysis as AnalysisResult | undefined;
    const history = (body.history as ChatMessage[]) || [];
    const question = (body.question as string)?.trim();
    const personality = (body.personality as PersonalityMode) || "beginner";

    if (!file || !question || !analysis) {
      return NextResponse.json(
        { error: "Upload a file and enter a question before sending." },
        { status: 400 }
      );
    }

    const creds = resolveCredentials(req.headers);

    if (creds.provider === "demo" || !creds.apiKey) {
      const reply = buildDemoChatReply(question, file, analysis, personality);
      return NextResponse.json({ reply, isDemo: true, provider: "demo" });
    }

    const reply = await runLiveChat(
      creds,
      file,
      analysis.summary,
      history,
      question,
      personality,
      analysis.handwriting?.editableText || ""
    );
    return NextResponse.json({ reply, isDemo: false, provider: creds.provider });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
