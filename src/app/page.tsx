"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  FileText,
  Loader2,
  Moon,
  Plus,
  RotateCw,
  Settings,
  Sun,
  WifiOff,
  X,
} from "lucide-react";
import { AskAIPanel } from "@/components/AskAIPanel";
import { DocumentViewer } from "@/components/DocumentViewer";
import { ActiveTab, IntelligenceTabs } from "@/components/IntelligenceTabs";
import { NextActionsPanel } from "@/components/NextActionsPanel";
import { SettingsModal } from "@/components/SettingsModal";
import { normalizeImageFile, UploadZone } from "@/components/UploadZone";
import { RecentsList } from "@/components/RecentsList";
import { ToneSelect } from "@/components/ToneSelect";
import {
  clearRecents,
  deleteRecent,
  getRecent,
  listRecents,
  RecentSummary,
  saveRecent,
  updateRecentChat,
} from "@/lib/recents";
import { getPersonalityConfig } from "@/lib/modes";
import {
  AIProvider,
  AnalysisMode,
  AnalysisResult,
  ChatMessage,
  NextActionOutput,
  PersonalityMode,
  SuggestedNextAction,
  UploadedFilePayload,
} from "@/types/analysis";

const STORAGE_KEY_PROVIDER = "doculens_provider_v2";
const STORAGE_KEY_API = "doculens_api_key_v2";
const STORAGE_KEY_THEME = "doculens_theme";

const LOADING_STAGES = [
  "Reading document...",
  "Extracting key facts and structure...",
  "Preparing summary and next steps...",
];

function persistRecent(
  file: UploadedFilePayload,
  analysis: AnalysisResult,
  mode: AnalysisMode,
  personality: PersonalityMode
) {
  // Built-in sample documents don't belong in the user's history.
  if (file.presetId) return;
  void saveRecent({ id: file.id, file, analysis, mode, personality });
}

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>("auto");
  const [personality, setPersonality] = useState<PersonalityMode>("beginner");
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [currentFile, setCurrentFile] = useState<UploadedFilePayload | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  const [runningActionId, setRunningActionId] = useState<string | null>(null);
  const [actionOutput, setActionOutput] = useState<NextActionOutput | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const analysisCacheRef = useRef<Map<string, AnalysisResult>>(new Map());

  const [recents, setRecents] = useState<RecentSummary[]>([]);
  const [openingRecentId, setOpeningRecentId] = useState<string | null>(null);

  // Refresh the recents list whenever we land on the home screen.
  useEffect(() => {
    if (currentFile) return;
    let cancelled = false;
    listRecents().then((items) => {
      if (!cancelled) setRecents(items);
    });
    return () => {
      cancelled = true;
    };
  }, [currentFile]);

  // Keep the saved conversation in sync so reopening a recent restores the chat.
  useEffect(() => {
    if (!currentFile || currentFile.presetId || isChatting || chatMessages.length === 0) return;
    void updateRecentChat(currentFile.id, chatMessages);
  }, [chatMessages, currentFile, isChatting]);

  async function handleOpenRecent(id: string) {
    setOpeningRecentId(id);
    try {
      const entry = await getRecent(id);
      if (!entry) {
        setRecents((prev) => prev.filter((r) => r.id !== id));
        setErrorMsg("That file is no longer in your recents.");
        return;
      }
      abortRef.current?.abort();
      analysisCacheRef.current.set(
        `${entry.file.id}:${entry.mode}:${entry.personality}`,
        entry.analysis
      );
      setSelectedMode(entry.mode);
      setPersonality(entry.personality);
      setCurrentFile(entry.file);
      setAnalysis(entry.analysis);
      setChatMessages(entry.chat ?? []);
      setActionOutput(null);
      setActiveTab("overview");
      setErrorMsg(null);
      void saveRecent({ ...entry, chat: entry.chat }); // bump to top
    } finally {
      setOpeningRecentId(null);
    }
  }

  async function handleDeleteRecent(id: string) {
    setRecents((prev) => prev.filter((r) => r.id !== id));
    await deleteRecent(id);
  }

  async function handleClearRecents() {
    setRecents([]);
    await clearRecents();
  }

  useEffect(() => {
    localStorage.removeItem("doculens_provider");
    localStorage.removeItem("doculens_api_key");

    const savedProvider = localStorage.getItem(STORAGE_KEY_PROVIDER) as AIProvider | null;
    const savedKey = localStorage.getItem(STORAGE_KEY_API) || "";
    if (savedProvider && savedKey) {
      setProvider(savedProvider);
      setApiKey(savedKey);
    }

    const domTheme = document.documentElement.getAttribute("data-theme");
    const initialTheme = domTheme === "dark" ? "dark" : "light";
    setTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
  }

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  useEffect(() => {
    if (!isAnalyzing) {
      setLoadingStageIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setLoadingStageIndex((idx) => (idx + 1) % LOADING_STAGES.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  const buildHeaders = useCallback(() => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey.trim() && (provider === "gemini" || provider === "openai")) {
      headers["x-api-key"] = apiKey.trim();
      headers["x-provider"] = provider;
    }
    return headers;
  }, [apiKey, provider]);

  const analyzeFile = useCallback(
    async (
      file: UploadedFilePayload,
      modeToUse: AnalysisMode,
      personalityToUse: PersonalityMode,
      resetChat = true,
      existingAnalysisForRewrite?: AnalysisResult | null
    ) => {
      const cacheKey = `${file.id}:${modeToUse}:${personalityToUse}`;
      const cached = analysisCacheRef.current.get(cacheKey);
      if (cached) {
        setCurrentFile(file);
        setAnalysis(cached);
        setErrorMsg(null);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setCurrentFile(file);
      setErrorMsg(null);
      setActionOutput(null);
      if (resetChat) setChatMessages([]);

      // Fast path when switching Tone on an already-scanned file (~1s, no image re-upload)
      if (existingAnalysisForRewrite) {
        setIsEnriching(true);
        try {
          const res = await fetch("/api/analyze", {
            method: "POST",
            headers: buildHeaders(),
            signal: controller.signal,
            body: JSON.stringify({
              file: { ...file, dataUrl: undefined },
              mode: modeToUse,
              personality: personalityToUse,
              stage: "rewrite",
              previousAnalysis: existingAnalysisForRewrite,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Tone rewrite failed.");
          setAnalysis(data.analysis);
          analysisCacheRef.current.set(cacheKey, data.analysis);
          persistRecent(file, data.analysis, modeToUse, personalityToUse);
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setErrorMsg(err instanceof Error ? err.message : "Failed to switch tone.");
        } finally {
          if (abortRef.current === controller) {
            setIsEnriching(false);
          }
        }
        return;
      }

      // Stage 1: Fast Overview (~1.2–1.8s)
      setIsAnalyzing(true);
      setIsEnriching(false);

      try {
        const fastRes = await fetch("/api/analyze", {
          method: "POST",
          headers: buildHeaders(),
          signal: controller.signal,
          body: JSON.stringify({
            file,
            mode: modeToUse,
            personality: personalityToUse,
            stage: "fast",
          }),
        });
        const fastData = await fastRes.json();
        if (!fastRes.ok) throw new Error(fastData.error || "Analysis failed.");

        const stage1Analysis = fastData.analysis as AnalysisResult;
        setAnalysis(stage1Analysis);
        setActiveTab("overview");
        setIsAnalyzing(false);
        persistRecent(file, stage1Analysis, modeToUse, personalityToUse);

        if (fastData.stage !== "fast") {
          analysisCacheRef.current.set(cacheKey, stage1Analysis);
          return;
        }

        // Stage 2: Non-blocking Background Deep Tabs (Flashcards, Quiz, Equations, Line Items)
        setIsEnriching(true);
        const deepRes = await fetch("/api/analyze", {
          method: "POST",
          headers: buildHeaders(),
          signal: controller.signal,
          body: JSON.stringify({
            file,
            mode: modeToUse,
            personality: personalityToUse,
            stage: "deep",
            previousAnalysis: stage1Analysis,
          }),
        });
        if (deepRes.ok) {
          const deepData = await deepRes.json();
          if (deepData.analysis) {
            setAnalysis(deepData.analysis);
            analysisCacheRef.current.set(cacheKey, deepData.analysis);
            persistRecent(file, deepData.analysis, modeToUse, personalityToUse);
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setErrorMsg(err instanceof Error ? err.message : "Failed to analyze upload.");
      } finally {
        if (abortRef.current === controller) {
          setIsAnalyzing(false);
          setIsEnriching(false);
        }
      }
    },
    [buildHeaders]
  );

  // Global Ctrl+V clipboard paste support for images/screenshots
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (!blob) continue;
          normalizeImageFile(blob)
            .then(({ dataUrl, mimeType }) =>
              analyzeFile(
                {
                  id: crypto.randomUUID(),
                  name: `pasted-screenshot-${Date.now()}.${mimeType === "image/jpeg" ? "jpg" : "png"}`,
                  mimeType,
                  size: blob.size,
                  dataUrl,
                },
                selectedMode,
                personality
              )
            )
            .catch(() => setErrorMsg("Could not read the pasted image."));
          break;
        }
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [analyzeFile, selectedMode, personality]);

  function handlePersonalityChange(nextPersonality: PersonalityMode) {
    setPersonality(nextPersonality);
    if (currentFile) {
      analyzeFile(currentFile, selectedMode, nextPersonality, false, analysis);
    }
  }

  async function handleSendChat(question: string) {
    if (!currentFile || !analysis) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };
    const nextHistory = [...chatMessages, userMsg];
    setChatMessages(nextHistory);
    setIsChatting(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({
          file: currentFile,
          analysis,
          history: nextHistory,
          question,
          personality,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed.");

      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Could not complete answer: ${
            err instanceof Error ? err.message : "Unknown error."
          }`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  }

  async function handleRunAction(action: SuggestedNextAction) {
    if (!currentFile || !analysis) return;
    setRunningActionId(action.id);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({
          file: currentFile,
          analysisSummary: analysis.summary,
          actionId: action.id,
          actionTitle: action.title,
          actionDescription: action.description,
          personality,
          transcript: analysis.handwriting?.editableText || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      setActionOutput(data.output);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to execute next action.");
    } finally {
      setRunningActionId(null);
    }
  }

  function handleSaveSettings(nextProvider: AIProvider, nextKey: string) {
    setProvider(nextProvider);
    setApiKey(nextKey);
    if (nextKey) {
      localStorage.setItem(STORAGE_KEY_PROVIDER, nextProvider);
      localStorage.setItem(STORAGE_KEY_API, nextKey);
    } else {
      localStorage.removeItem(STORAGE_KEY_PROVIDER);
      localStorage.removeItem(STORAGE_KEY_API);
    }
  }

  function handleResetUpload() {
    abortRef.current?.abort();
    setIsAnalyzing(false);
    setIsEnriching(false);
    setCurrentFile(null);
    setAnalysis(null);
    setChatMessages([]);
    setActionOutput(null);
    setErrorMsg(null);
  }

  const activePersonalityConfig = getPersonalityConfig(personality);

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Clean Top Bar */}
      <header
        className="sticky top-0 z-30 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 backdrop-blur-xs"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2.5 px-4 py-2.5">
          {/* Left: Wordmark & Active Document Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={handleResetUpload}
              className="btn-press inline-flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 text-sm font-semibold tracking-tight text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            >
              <FileText className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden="true" />
              <span>DocuLens</span>
            </button>

            {currentFile && (
              <>
                <span className="text-[var(--text-muted)] text-xs" aria-hidden="true">
                  /
                </span>
                <span className="truncate max-w-[140px] sm:max-w-[220px] text-xs text-[var(--text-secondary)]">
                  {currentFile.name}
                </span>
                <button
                  type="button"
                  onClick={handleResetUpload}
                  className="btn-press ml-1 inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-2 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  <span>New</span>
                </button>
              </>
            )}
          </div>

          {/* Right: Day/Night Toggle + Settings */}
          <div className="flex items-center gap-1.5">
            {/* Day / Night Mode Button (icon only) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Switch to Night mode" : "Switch to Day mode"}
              title={theme === "light" ? "Night mode" : "Day mode"}
              className="btn-press inline-flex items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Sun className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="API settings"
              title="API settings"
              className="btn-press inline-flex items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {isOffline && (
          <div className="mx-auto max-w-6xl px-4 pt-4">
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--status-warn-bg)] px-4 py-2.5 text-xs text-[var(--status-warn)]"
            >
              <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>You appear to be offline. Reconnect to scan new files.</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mx-auto max-w-6xl px-4 pt-4">
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--status-danger-bg)] px-4 py-2.5 text-xs text-[var(--status-danger)]"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
              <div className="flex items-center gap-3">
                {currentFile && (
                  <button
                    type="button"
                    onClick={() => analyzeFile(currentFile, selectedMode, personality, false)}
                    className="btn-press inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 font-medium text-[var(--text-primary)]"
                  >
                    <RotateCw className="h-3 w-3" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="underline hover:opacity-80"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {!currentFile ? (
          <UploadZone
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
            personality={personality}
            onPersonalityChange={setPersonality}
            onFileSelected={(file, modeOverride) =>
              analyzeFile(file, modeOverride ?? selectedMode, personality)
            }
            isAnalyzing={isAnalyzing}
            recentsSlot={
              <RecentsList
                items={recents}
                openingId={openingRecentId}
                onOpen={handleOpenRecent}
                onDelete={handleDeleteRecent}
                onClearAll={handleClearRecents}
              />
            }
          />
        ) : (
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Pane: Document Preview + (Desktop) Ask AI */}
              <div className="lg:col-span-5 space-y-5">
                <DocumentViewer file={currentFile} onReset={handleResetUpload} />
                {analysis && !isAnalyzing && (
                  <div className="hidden lg:block">
                    <AskAIPanel
                      messages={chatMessages}
                      isSending={isChatting}
                      onSend={handleSendChat}
                      personalityLabel={activePersonalityConfig.label}
                    />
                  </div>
                )}
              </div>

              {/* Right Pane: Intelligence Tabs + Next Actions */}
              <div className="lg:col-span-7 space-y-5">
                {isAnalyzing ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="sheet rounded-xl p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Loader2
                          className="h-4 w-4 animate-spin text-[var(--text-secondary)] shrink-0"
                          aria-hidden="true"
                        />
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)]">
                            {LOADING_STAGES[loadingStageIndex]}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {activePersonalityConfig.label} mode
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetUpload}
                        className="btn-press inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Cancel</span>
                      </button>
                    </div>
                    <div className="space-y-2.5 animate-pulse">
                      <div className="h-20 rounded-lg bg-[var(--bg-subtle)]" />
                      <div className="h-10 rounded-lg bg-[var(--bg-subtle)]" />
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="h-14 rounded-lg bg-[var(--bg-subtle)]" />
                        <div className="h-14 rounded-lg bg-[var(--bg-subtle)]" />
                      </div>
                    </div>
                  </div>
                ) : analysis ? (
                  <>
                    <IntelligenceTabs
                      key={`${currentFile.id}-${personality}-${analysis.handwriting?.editableText?.length ?? 0}`}
                      analysis={analysis}
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                      isEnriching={isEnriching}
                      headerAction={
                        <ToneSelect
                          id="results-tone-select"
                          compact
                          value={personality}
                          onChange={handlePersonalityChange}
                        />
                      }
                    />
                    <NextActionsPanel
                      actions={analysis.nextActions}
                      activeActionOutput={actionOutput}
                      runningActionId={runningActionId}
                      onRunAction={handleRunAction}
                    />
                    <div className="lg:hidden">
                      <AskAIPanel
                        messages={chatMessages}
                        isSending={isChatting}
                        onSend={handleSendChat}
                        personalityLabel={activePersonalityConfig.label}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </main>

      {settingsOpen && (
        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          provider={provider}
          apiKey={apiKey}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}
