"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Loader2,
  RotateCw,
  XCircle,
} from "lucide-react";
import { AnalysisResult } from "@/types/analysis";

export type ActiveTab = "overview" | "handwriting" | "visual_learning" | "screenshot" | "everyday";

interface IntelligenceTabsProps {
  analysis: AnalysisResult;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isEnriching?: boolean;
  headerAction?: React.ReactNode;
}

export function IntelligenceTabs({
  analysis,
  activeTab,
  onTabChange,
  isEnriching = false,
  headerAction,
}: IntelligenceTabsProps) {
  const [editableText, setEditableText] = useState(
    analysis.handwriting?.editableText || ""
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  function downloadHandwritingTxt() {
    const blob = new Blob([editableText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcribed-notes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const tabs: { id: ActiveTab; label: string; hasData: boolean }[] = [
    { id: "overview", label: "Overview", hasData: true },
    {
      id: "handwriting",
      label: "Handwriting",
      hasData: Boolean(
        analysis.handwriting &&
          (analysis.handwriting.editableText ||
            analysis.handwriting.equations?.length ||
            analysis.handwriting.calculationMistakes?.length)
      ),
    },
    {
      id: "visual_learning",
      label: "Study & Quiz",
      hasData: Boolean(
        analysis.visualLearning &&
          (analysis.visualLearning.diagramExplanation ||
            analysis.visualLearning.flashcards?.length ||
            analysis.visualLearning.quiz?.length)
      ),
    },
    {
      id: "screenshot",
      label: "Code & UI",
      hasData: Boolean(
        analysis.screenshot &&
          (analysis.screenshot.errorDiagnosis ||
            analysis.screenshot.codeTranscription ||
            analysis.screenshot.uiBreakdown?.length ||
            analysis.screenshot.websiteOrMessageSummary)
      ),
    },
    {
      id: "everyday",
      label: "Dates & Details",
      hasData: Boolean(
        analysis.everyday &&
          (analysis.everyday.lineItems?.length ||
            analysis.everyday.importantDates?.length ||
            analysis.everyday.plainLanguageFormGuide?.length ||
            analysis.everyday.warrantyOrPurchase)
      ),
    },
  ];

  const flashcards = analysis.visualLearning?.flashcards ?? [];
  const currentCard = flashcards[cardIndex];
  const quiz = analysis.visualLearning?.quiz ?? [];
  const quizScore = quiz.reduce(
    (acc, q) => (quizAnswers[q.id] === q.correctIndex ? acc + 1 : acc),
    0
  );

  return (
    <div className="sheet rounded-xl overflow-hidden">
      {/* Header & Underline Tablist */}
      <div className="border-b border-[var(--border-hairline)] bg-[var(--bg-inset)] px-5 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-base font-semibold text-[var(--text-primary)] truncate">
              {analysis.detectedCategory}
            </div>
            {isEnriching && (
              <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                <span className="hidden sm:inline">Loading more…</span>
              </div>
            )}
          </div>
          {headerAction}
        </div>

        <div
          role="tablist"
          aria-label="Analysis sections"
          className="flex items-center gap-5 overflow-x-auto -mb-px"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 pb-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-[var(--text-primary)] text-[var(--text-primary)] font-semibold"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.hasData && tab.id !== "overview" && !isActive && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Body */}
      <div role="tabpanel" className="divide-y divide-[var(--border-hairline)]">
        {activeTab === "overview" && (
          <>
            <section className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-[var(--text-secondary)]">Summary</h3>
                <button
                  type="button"
                  onClick={() => copyText("summary", analysis.summary)}
                  className="btn-press inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                >
                  {copiedKey === "summary" ? (
                    <Check className="h-3.5 w-3.5 text-[var(--status-success)]" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{copiedKey === "summary" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-primary)] max-w-[72ch]">
                {analysis.summary}
              </p>
            </section>

            {analysis.keyPoints?.length > 0 && (
              <section className="p-5">
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3">
                  Key takeaways
                </h3>
                <ul className="space-y-2">
                  {analysis.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-primary)]">
                      <span
                        className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] shrink-0"
                        aria-hidden="true"
                      />
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {analysis.extractedInfo?.length > 0 && (
              <section className="p-5">
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3">
                  Extracted information
                </h3>
                <div className="divide-y divide-[var(--border-hairline)] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-inset)]">
                  {analysis.extractedInfo.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs"
                    >
                      <span className="text-[var(--text-muted)]">{item.label}</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="tabular-nums truncate font-medium text-[var(--text-primary)]">
                          {item.value}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(`ext-${idx}`, item.value)}
                          aria-label={`Copy ${item.label}`}
                          className="btn-press rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] shrink-0"
                          title="Copy value"
                        >
                          {copiedKey === `ext-${idx}` ? (
                            <Check
                              className="h-3 w-3 text-[var(--status-success)]"
                              aria-hidden="true"
                            />
                          ) : (
                            <Copy className="h-3 w-3" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {activeTab === "handwriting" && (
          <>
            {!analysis.handwriting ||
            (!analysis.handwriting.editableText &&
              !analysis.handwriting.equations?.length &&
              !analysis.handwriting.chapters?.length &&
              !analysis.handwriting.calculationMistakes?.length) ? (
              <EmptyTabState message="No handwritten notes or equations were found in this file." />
            ) : (
              <>
                {analysis.handwriting.calculationMistakes?.length > 0 && (
                  <section className="p-5 bg-[var(--status-danger-bg)]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--status-danger)] mb-3">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      <span>
                        Calculation mistakes detected (
                        {analysis.handwriting.calculationMistakes.length})
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {analysis.handwriting.calculationMistakes.map((m, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-3 text-xs space-y-1"
                        >
                          <div className="font-mono text-[var(--status-danger)] line-through">
                            {m.line}
                          </div>
                          <p className="text-[var(--text-secondary)]">{m.issue}</p>
                          <div className="font-mono text-[var(--status-success)] font-medium pt-0.5">
                            Correction: {m.correction}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {analysis.handwriting.editableText && (
                  <section className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="handwriting-editable-text"
                        className="text-xs font-semibold text-[var(--text-secondary)]"
                      >
                        Editable transcription
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => copyText("hw", editableText)}
                          className="btn-press inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                        >
                          {copiedKey === "hw" ? (
                            <Check
                              className="h-3 w-3 text-[var(--status-success)]"
                              aria-hidden="true"
                            />
                          ) : (
                            <Copy className="h-3 w-3" aria-hidden="true" />
                          )}
                          <span>{copiedKey === "hw" ? "Copied" : "Copy"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={downloadHandwritingTxt}
                          className="btn-press inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                        >
                          <Download className="h-3 w-3" aria-hidden="true" />
                          <span>Download .txt</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      id="handwriting-editable-text"
                      value={editableText}
                      onChange={(e) => setEditableText(e.target.value)}
                      rows={8}
                      className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-inset)] p-3 font-mono text-xs leading-relaxed text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                    />
                  </section>
                )}

                {analysis.handwriting.equations?.length > 0 && (
                  <section className="p-5">
                    <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3">
                      Equations
                    </h3>
                    <div className="divide-y divide-[var(--border-hairline)] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-inset)]">
                      {analysis.handwriting.equations.map((eq, i) => (
                        <div key={i} className="p-3">
                          <div className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                            {eq.expression}
                          </div>
                          <div className="mt-1 text-xs text-[var(--text-secondary)]">
                            {eq.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {analysis.handwriting.chapters?.length > 0 && (
                  <section className="p-5">
                    <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3">
                      Organized chapters
                    </h3>
                    <div className="space-y-3">
                      {analysis.handwriting.chapters.map((ch, i) => (
                        <div key={i}>
                          <div className="text-sm font-medium text-[var(--text-primary)]">
                            {ch.title}
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                            {ch.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "visual_learning" && (
          <>
            {!analysis.visualLearning ||
            (!analysis.visualLearning.diagramExplanation &&
              !analysis.visualLearning.mathSteps?.length &&
              !flashcards.length &&
              !quiz.length) ? (
              <EmptyTabState message="No diagrams, flashcards, or study questions were generated for this file." />
            ) : (
              <>
                {analysis.visualLearning.diagramExplanation && (
                  <section className="p-5">
                    <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">
                      Concept &amp; diagram explanation
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--text-primary)] max-w-[72ch]">
                      {analysis.visualLearning.diagramExplanation}
                    </p>
                  </section>
                )}

                {analysis.visualLearning.mathSteps?.length > 0 && (
                  <section className="p-5">
                    <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3">
                      Step-by-step breakdown
                    </h3>
                    <ol className="space-y-2.5">
                      {analysis.visualLearning.mathSteps.map((s, i) => (
                        <li key={i} className="flex gap-3 text-xs">
                          <span className="tabular-nums font-mono font-semibold text-[var(--text-muted)] pt-0.5">
                            {i + 1}.
                          </span>
                          <div>
                            <div className="font-medium text-[var(--text-primary)]">{s.step}</div>
                            <div className="text-[var(--text-secondary)] mt-0.5">{s.detail}</div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {flashcards.length > 0 && currentCard && (
                  <section className="p-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-xs font-semibold text-[var(--text-secondary)]">
                        Flashcards{" "}
                        <span className="tabular-nums font-normal text-[var(--text-muted)]">
                          ({cardIndex + 1} / {flashcards.length})
                        </span>
                      </h3>
                      <span className="text-xs text-[var(--text-muted)]">Click card to flip</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFlipped((f) => !f)}
                      className="btn-press w-full min-h-[130px] rounded-xl border border-[var(--border-strong)] bg-[var(--bg-inset)] p-6 text-center hover:bg-[var(--bg-subtle)]"
                    >
                      <div className="text-xs text-[var(--text-muted)] mb-1.5">
                        {flipped ? "Answer" : "Question"}
                      </div>
                      <div className="text-base font-medium text-[var(--text-primary)]">
                        {flipped ? currentCard.back : currentCard.front}
                      </div>
                      <div className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <RotateCw className="h-3 w-3" aria-hidden="true" />
                        <span>Flip</span>
                      </div>
                    </button>

                    <div className="mt-2.5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setFlipped(false);
                          setCardIndex((i) => (i - 1 + flashcards.length) % flashcards.length);
                        }}
                        className="btn-press inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Previous</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFlipped(false);
                          setCardIndex((i) => (i + 1) % flashcards.length);
                        }}
                        className="btn-press inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </section>
                )}

                {quiz.length > 0 && (
                  <section className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-[var(--text-secondary)]">
                        Self-check quiz
                      </h3>
                      <span className="tabular-nums text-xs font-medium text-[var(--text-primary)]">
                        Score: {quizScore} / {quiz.length}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {quiz.map((q, qi) => {
                        const chosen = quizAnswers[q.id];
                        const answered = chosen !== undefined;
                        return (
                          <div key={q.id} className="space-y-2">
                            <div className="text-sm font-medium text-[var(--text-primary)]">
                              <span className="tabular-nums">{qi + 1}.</span> {q.question}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt, oi) => {
                                const isSelected = chosen === oi;
                                const isCorrect = q.correctIndex === oi;
                                let cls =
                                  "border-[var(--border-hairline)] bg-[var(--bg-inset)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]";
                                if (answered) {
                                  if (isCorrect) {
                                    cls =
                                      "border-[var(--status-success)] bg-[var(--status-success-bg)] text-[var(--text-primary)] font-medium";
                                  } else if (isSelected) {
                                    cls =
                                      "border-[var(--status-danger)] bg-[var(--status-danger-bg)] text-[var(--text-primary)]";
                                  }
                                }
                                return (
                                  <button
                                    key={oi}
                                    type="button"
                                    onClick={() =>
                                      setQuizAnswers((prev) => ({ ...prev, [q.id]: oi }))
                                    }
                                    className={`btn-press flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs ${cls}`}
                                  >
                                    <span>{opt}</span>
                                    {answered && isCorrect && (
                                      <CheckCircle2
                                        className="h-3.5 w-3.5 text-[var(--status-success)] shrink-0"
                                        aria-hidden="true"
                                      />
                                    )}
                                    {answered && isSelected && !isCorrect && (
                                      <XCircle
                                        className="h-3.5 w-3.5 text-[var(--status-danger)] shrink-0"
                                        aria-hidden="true"
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            {answered && (
                              <p className="text-xs text-[var(--text-secondary)]">
                                {q.explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "screenshot" && (
          <>
            {!analysis.screenshot ||
            (!analysis.screenshot.errorDiagnosis &&
              !analysis.screenshot.codeTranscription &&
              !analysis.screenshot.uiBreakdown?.length &&
              !analysis.screenshot.websiteOrMessageSummary) ? (
              <EmptyTabState message="No error messages, code blocks, or UI elements were found in this file." />
            ) : (
              <>
                {analysis.screenshot.errorDiagnosis && (
                  <section className="p-5 space-y-2.5">
                    <h3 className="text-xs font-semibold text-[var(--status-danger)]">
                      Error diagnosis
                    </h3>
                    <div className="font-mono text-xs text-[var(--text-primary)] bg-[var(--bg-inset)] border border-[var(--border-hairline)] rounded-lg p-3">
                      {analysis.screenshot.errorDiagnosis.error}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      <strong className="text-[var(--text-primary)]">Root cause:</strong>{" "}
                      {analysis.screenshot.errorDiagnosis.rootCause}
                    </p>
                    <div className="space-y-1.5 pt-1">
                      <div className="text-xs font-semibold text-[var(--text-primary)]">
                        Fix steps:
                      </div>
                      {analysis.screenshot.errorDiagnosis.fixSteps.map((step, i) => (
                        <div key={i} className="text-xs text-[var(--text-secondary)] flex gap-2">
                          <span className="tabular-nums font-semibold text-[var(--text-primary)]">
                            {i + 1}.
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {analysis.screenshot.codeTranscription && (
                  <section className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-[var(--text-secondary)]">
                        Code ({analysis.screenshot.codeTranscription.language})
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          copyText("code", analysis.screenshot!.codeTranscription!.code)
                        }
                        className="btn-press inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                      >
                        {copiedKey === "code" ? (
                          <Check
                            className="h-3 w-3 text-[var(--status-success)]"
                            aria-hidden="true"
                          />
                        ) : (
                          <Copy className="h-3 w-3" aria-hidden="true" />
                        )}
                        <span>{copiedKey === "code" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <pre className="overflow-x-auto rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-inset)] p-3.5 font-mono text-xs text-[var(--text-primary)]">
                      {analysis.screenshot.codeTranscription.code}
                    </pre>
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      {analysis.screenshot.codeTranscription.explanation}
                    </p>
                  </section>
                )}

                {analysis.screenshot.uiBreakdown?.length > 0 && (
                  <section className="p-5">
                    <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3">
                      Interface breakdown
                    </h3>
                    <div className="space-y-2">
                      {analysis.screenshot.uiBreakdown.map((u, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {u.element}:{" "}
                          </span>
                          <span className="text-[var(--text-secondary)]">{u.purpose}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {analysis.screenshot.websiteOrMessageSummary && (
                  <section className="p-5">
                    <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Screen summary
                    </h3>
                    <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                      {analysis.screenshot.websiteOrMessageSummary}
                    </p>
                  </section>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "everyday" && (
          <>
            {!analysis.everyday ||
            (!analysis.everyday.lineItems?.length &&
              !analysis.everyday.importantDates?.length &&
              !analysis.everyday.plainLanguageFormGuide?.length &&
              !analysis.everyday.warrantyOrPurchase) ? (
              <EmptyTabState message="No receipt, invoice, warranty, or form items were detected in this file." />
            ) : (
              <>
                {analysis.everyday.importantDates?.length > 0 && (
                  <section className="p-5">
                    <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3">
                      Important dates &amp; deadlines
                    </h3>
                    <div className="divide-y divide-[var(--border-hairline)] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-inset)]">
                      {analysis.everyday.importantDates.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                        >
                          <span className="text-[var(--text-secondary)]">{d.label}</span>
                          <span
                            className={`tabular-nums font-medium ${
                              d.urgency === "high"
                                ? "text-[var(--status-danger)]"
                                : "text-[var(--text-primary)]"
                            }`}
                          >
                            {d.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {analysis.everyday.lineItems?.length > 0 && (
                  <section className="p-5">
                    <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3">
                      Line items &amp; charges
                    </h3>
                    <div className="divide-y divide-[var(--border-hairline)] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-inset)]">
                      {analysis.everyday.lineItems.map((li, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                        >
                          <span className="text-[var(--text-primary)]">{li.item}</span>
                          {li.amount && (
                            <span className="tabular-nums font-mono font-medium text-[var(--text-primary)]">
                              {li.amount}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {analysis.everyday.warrantyOrPurchase && (
                  <section className="p-5 space-y-1.5 text-xs">
                    <h3 className="font-semibold text-[var(--text-secondary)] mb-2">
                      Warranty &amp; purchase record
                    </h3>
                    {analysis.everyday.warrantyOrPurchase.product && (
                      <div className="text-[var(--text-secondary)]">
                        Product:{" "}
                        <strong className="text-[var(--text-primary)]">
                          {analysis.everyday.warrantyOrPurchase.product}
                        </strong>
                      </div>
                    )}
                    {analysis.everyday.warrantyOrPurchase.serialOrModel && (
                      <div className="font-mono text-[var(--text-secondary)]">
                        Serial / Model: {analysis.everyday.warrantyOrPurchase.serialOrModel}
                      </div>
                    )}
                    {analysis.everyday.warrantyOrPurchase.coverage && (
                      <div className="text-[var(--text-secondary)]">
                        Coverage: {analysis.everyday.warrantyOrPurchase.coverage}
                      </div>
                    )}
                    {analysis.everyday.warrantyOrPurchase.expires && (
                      <div className="tabular-nums text-[var(--status-warn)] font-medium">
                        Expires: {analysis.everyday.warrantyOrPurchase.expires}
                      </div>
                    )}
                  </section>
                )}

                {analysis.everyday.plainLanguageFormGuide?.length > 0 && (
                  <section className="p-5">
                    <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3">
                      Plain-language form guide
                    </h3>
                    <div className="space-y-3">
                      {analysis.everyday.plainLanguageFormGuide.map((f, i) => (
                        <div key={i} className="text-xs">
                          <div className="font-medium text-[var(--text-primary)]">{f.field}</div>
                          <div className="text-[var(--text-secondary)] mt-0.5">{f.meaning}</div>
                          {f.example && (
                            <div className="font-mono text-[11px] text-[var(--text-muted)] mt-0.5">
                              Example: {f.example}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyTabState({ message }: { message: string }) {
  return (
    <div className="p-8 text-center text-xs text-[var(--text-muted)]">
      {message}
    </div>
  );
}
