"use client";

import { useState } from "react";
import { ArrowRight, Check, Copy, Loader2 } from "lucide-react";
import { NextActionOutput, SuggestedNextAction } from "@/types/analysis";

interface NextActionsPanelProps {
  actions: SuggestedNextAction[];
  activeActionOutput: NextActionOutput | null;
  runningActionId: string | null;
  onRunAction: (action: SuggestedNextAction) => void;
}

export function NextActionsPanel({
  actions,
  activeActionOutput,
  runningActionId,
  onRunAction,
}: NextActionsPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!actions?.length) return null;

  function copyOutput() {
    if (!activeActionOutput) return;
    const text = [
      activeActionOutput.title,
      activeActionOutput.summary,
      "",
      ...activeActionOutput.items.map(
        (i) => `• ${i.title}${i.meta ? ` (${i.meta})` : ""}\n  ${i.detail}`
      ),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="sheet rounded-xl overflow-hidden">
      <div className="border-b border-[var(--border-hairline)] bg-[var(--bg-inset)] px-5 py-3">
        <h3 className="text-xs font-semibold text-[var(--text-primary)]">
          What you can do next
        </h3>
      </div>

      <div className="divide-y divide-[var(--border-hairline)]">
        {actions.map((action) => {
          const isRunning = runningActionId === action.id;
          return (
            <button
              key={action.id}
              type="button"
              disabled={runningActionId !== null}
              onClick={() => onRunAction(action)}
              className="btn-press w-full flex items-center justify-between gap-4 px-5 py-3.5 text-left hover:bg-[var(--bg-subtle)] transition-colors disabled:opacity-60"
            >
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  {action.title}
                </div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {action.description}
                </div>
              </div>
              {isRunning ? (
                <Loader2
                  className="h-4 w-4 animate-spin text-[var(--text-secondary)] shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <ArrowRight
                  className="h-4 w-4 text-[var(--text-muted)] shrink-0"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {activeActionOutput && (
        <div className="border-t border-[var(--border-hairline)] bg-[var(--bg-inset)] p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {activeActionOutput.title}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {activeActionOutput.summary}
              </p>
            </div>
            <button
              type="button"
              onClick={copyOutput}
              className="btn-press inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] shrink-0"
            >
              {copied ? (
                <Check className="h-3 w-3 text-[var(--status-success)]" aria-hidden="true" />
              ) : (
                <Copy className="h-3 w-3" aria-hidden="true" />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div className="divide-y divide-[var(--border-hairline)] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
            {activeActionOutput.items.map((item, idx) => (
              <div key={idx} className="p-3.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">{item.title}</span>
                  {item.meta && (
                    <span className="rounded bg-[var(--bg-subtle)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
                      {item.meta}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[var(--text-secondary)] leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
