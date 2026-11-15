"use client";

import { ChevronDown } from "lucide-react";
import { PERSONALITIES } from "@/lib/modes";
import { PersonalityMode } from "@/types/analysis";

interface ToneSelectProps {
  value: PersonalityMode;
  onChange: (value: PersonalityMode) => void;
  disabled?: boolean;
  id?: string;
  compact?: boolean;
}

/** Native select for accessibility and mobile pickers, styled with a chevron. */
export function ToneSelect({ value, onChange, disabled, id = "tone-select", compact }: ToneSelectProps) {
  const active = PERSONALITIES.find((p) => p.id === value);

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={id}
        className="text-xs font-medium text-[var(--text-muted)] whitespace-nowrap"
      >
        Level
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          title={active?.tagline}
          onChange={(e) => onChange(e.target.value as PersonalityMode)}
          className={`appearance-none cursor-pointer rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] pl-2.5 pr-7 font-medium text-[var(--text-primary)] shadow-2xs hover:bg-[var(--bg-subtle)] focus:border-[var(--accent-primary)] focus:outline-none disabled:opacity-50 ${
            compact ? "py-1 text-xs" : "py-1.5 text-xs"
          }`}
        >
          {PERSONALITIES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-secondary)]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
