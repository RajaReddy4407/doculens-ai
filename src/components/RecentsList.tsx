"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, Loader2, X } from "lucide-react";
import { formatRelativeTime, RecentSummary } from "@/lib/recents";

interface RecentsListProps {
  items: RecentSummary[];
  openingId: string | null;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const COLLAPSED_COUNT = 5;

export function RecentsList({ items, openingId, onOpen, onDelete, onClearAll }: RecentsListProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, COLLAPSED_COUNT);
  const hiddenCount = items.length - visible.length;

  return (
    <section aria-labelledby="recents-heading" className="mt-8">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h2 id="recents-heading" className="text-xs font-medium text-[var(--text-secondary)]">
          Recent
        </h2>
        {confirmClear ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)]">Clear all recents?</span>
            <button
              type="button"
              onClick={() => {
                onClearAll();
                setConfirmClear(false);
              }}
              className="font-medium text-[var(--status-danger)] hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="text-[var(--text-secondary)] hover:underline"
            >
              Keep
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Clear all
          </button>
        )}
      </div>

      <ul className="sheet rounded-xl divide-y divide-[var(--border-hairline)] overflow-hidden">
        {visible.map((item) => {
          const isImage = item.mimeType.startsWith("image/");
          const isOpening = openingId === item.id;
          return (
            <li key={item.id} className="group relative flex items-center">
              <button
                type="button"
                onClick={() => onOpen(item.id)}
                disabled={Boolean(openingId)}
                className="btn-press flex flex-1 min-w-0 items-center gap-3 px-4 py-2.5 pr-12 text-left hover:bg-[var(--bg-subtle)] transition-colors disabled:opacity-60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--border-hairline)] bg-[var(--bg-inset)]">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                  ) : isImage ? (
                    <ImageIcon className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                  ) : (
                    <FileText className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                    {item.name}
                  </span>
                  <span className="block truncate text-xs text-[var(--text-muted)]">
                    {item.category} · <span className="tabular-nums">{formatRelativeTime(item.updatedAt)}</span>
                  </span>
                </span>
                {isOpening && (
                  <Loader2
                    className="h-4 w-4 shrink-0 animate-spin text-[var(--text-muted)]"
                    aria-label="Opening"
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                aria-label={`Remove ${item.name} from recents`}
                title="Remove"
                className="absolute right-2.5 rounded-md p-1.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] [@media(hover:none)]:opacity-100"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>

      {(hiddenCount > 0 || expanded) && items.length > COLLAPSED_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 px-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          {expanded ? "Show less" : `Show ${hiddenCount} more`}
        </button>
      )}

      <p className="mt-2 px-1 text-[11px] text-[var(--text-muted)]">
        Saved only in this browser. The last 15 files are kept.
      </p>
    </section>
  );
}
