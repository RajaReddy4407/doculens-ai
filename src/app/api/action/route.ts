import { NextRequest, NextResponse } from "next/server";
import { resolveCredentials, runLiveNextAction } from "@/lib/ai-client";
import { buildDemoNextAction } from "@/lib/demo-presets";
import { PersonalityMode, UploadedFilePayload } from "@/types/analysis";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const file = body.file as UploadedFilePayload | undefined;
    const analysisSummary = (body.analysisSummary as string) || "";
    const actionId = (body.actionId as string) || "";
    const actionTitle = (body.actionTitle as string) || "";
    const actionDescription = (body.actionDescription as string) || "";
    const personality = (body.personality as PersonalityMode) || "beginner";
    const transcript = (body.transcript as string) || "";

    if (!file || !actionId || !actionTitle) {
      return NextResponse.json(
        { error: "Missing file or selected next action." },
        { status: 400 }
      );
    }

    const creds = resolveCredentials(req.headers);

    if (creds.provider === "demo" || !creds.apiKey) {
      const output = buildDemoNextAction(actionId, actionTitle, file, personality);
      return NextResponse.json({ output, isDemo: true, provider: "demo" });
    }

    const output = await runLiveNextAction(
      creds,
      file,
      analysisSummary,
      actionId,
      actionTitle,
      actionDescription,
      personality,
      transcript
    );
    return NextResponse.json({ output, isDemo: false, provider: creds.provider });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Next action failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
