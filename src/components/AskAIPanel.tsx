"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, Send } from "lucide-react";
import { ChatMessage } from "@/types/analysis";

interface AskAIPanelProps {
  messages: ChatMessage[];
  isSending: boolean;
  onSend: (question: string) => void;
  personalityLabel: string;
}

const STARTER_QUESTIONS = [
  "Are there any mistakes or risks here?",
  "What are the most important dates or numbers?",
  "Explain this simply.",
];

export function AskAIPanel({
  messages,
  isSending,
  onSend,
  personalityLabel,
}: AskAIPanelProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, isSending]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || isSending) return;
    setInput("");
    onSend(q);
  }

  function copyMessage(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="sheet flex flex-col rounded-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border-hairline)] bg-[var(--bg-inset)] px-4 py-2.5">
        <h3 className="text-xs font-semibold text-[var(--text-primary)]">
          Ask about this document
        </h3>
        <span className="text-[11px] text-[var(--text-muted)]">{personalityLabel} tone</span>
      </div>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className="max-h-80 min-h-[140px] overflow-y-auto overscroll-contain p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="space-y-2.5">
            <p className="text-xs text-[var(--text-muted)]">Quick questions:</p>
            <div className="flex flex-wrap gap-1.5">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isSending}
                  onClick={() => onSend(q)}
                  className="btn-press rounded-md border border-[var(--border-hairline)] bg-[var(--bg-inset)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] text-left disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`group flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-[88%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[var(--action-bg)] text-[var(--action-fg)] font-medium"
                    : "border border-[var(--border-hairline)] bg-[var(--bg-inset)] text-[var(--text-primary)] pr-8"
                }`}
              >
                {m.content}
                {m.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => copyMessage(m.id, m.content)}
                    aria-label="Copy answer"
                    title="Copy answer"
                    className="absolute right-1.5 top-1.5 rounded p-1 text-[var(--text-muted)] opacity-60 hover:opacity-100 hover:bg-[var(--bg-subtle)] focus-visible:opacity-100"
                  >
                    {copiedId === m.id ? (
                      <Check className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3 w-3" aria-hidden="true" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {isSending && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            <span>Answering...</span>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-[var(--border-hairline)] p-2.5 bg-[var(--bg-inset)]"
      >
        <label htmlFor="ask-ai-input" className="sr-only">
          Ask a question about this upload
        </label>
        <input
          id="ask-ai-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          enterKeyHint="send"
          placeholder="Ask a question..."
          className="flex-1 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          aria-label="Send question"
          className="btn-press inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--action-bg)] text-[var(--action-fg)] disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
