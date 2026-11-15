"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, X } from "lucide-react";
import { AIProvider } from "@/types/analysis";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  provider: AIProvider;
  apiKey: string;
  onSave: (provider: AIProvider, apiKey: string) => void;
}

export function SettingsModal({
  open,
  onClose,
  provider,
  apiKey,
  onSave,
}: SettingsModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(
    provider === "demo" ? "gemini" : provider
  );
  const [keyInput, setKeyInput] = useState(apiKey);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
    >
      <div className="sheet w-full max-w-md rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-primary)]">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="settings-modal-title"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                API Settings
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Connected to server Gemini Flash by default
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="btn-press rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <span className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Model provider
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(["gemini", "openai"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedProvider(p)}
                  className={`btn-press rounded-lg border px-3 py-2 text-left text-xs ${
                    selectedProvider === p
                      ? "border-[var(--text-primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold"
                      : "border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <div>{p === "gemini" ? "Google Gemini" : "OpenAI"}</div>
                  <div className="text-[11px] font-normal text-[var(--text-muted)] mt-0.5">
                    {p === "gemini" ? "Gemini Flash (Vision)" : "gpt-4o-mini (Vision)"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="custom-api-key-input"
              className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
            >
              Custom API key <span className="text-[var(--text-muted)]">(optional)</span>
            </label>
            <input
              id="custom-api-key-input"
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Leave blank to use server key"
              autoComplete="off"
              className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setKeyInput("");
              onSave("gemini", "");
              onClose();
            }}
            className="btn-press rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
          >
            Reset to default
          </button>
          <button
            type="button"
            onClick={() => {
              const trimmed = keyInput.trim();
              onSave(selectedProvider, trimmed);
              onClose();
            }}
            className="btn-press inline-flex items-center gap-1.5 rounded-lg bg-[var(--action-bg)] px-4 py-2 text-xs font-medium text-[var(--action-fg)]"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
