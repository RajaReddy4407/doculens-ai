"use client";

import { useState } from "react";
import { FileText, RotateCcw, Upload, ZoomIn, ZoomOut } from "lucide-react";
import { UploadedFilePayload } from "@/types/analysis";

interface DocumentViewerProps {
  file: UploadedFilePayload;
  onReset: () => void;
}

export function DocumentViewer({ file, onReset }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const isImage = file.mimeType.startsWith("image/");
  const isPdf = file.mimeType === "application/pdf";

  return (
    <div className="sheet flex flex-col rounded-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border-hairline)] px-3.5 py-2.5 bg-[var(--bg-inset)]">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
          <span className="truncate text-xs font-medium text-[var(--text-primary)]">
            {file.name}
          </span>
          <span className="tabular-nums shrink-0 text-[11px] text-[var(--text-muted)]">
            {(file.size / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isImage && (
            <>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="btn-press rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="btn-press tabular-nums rounded-md px-1.5 py-1 text-[11px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                aria-label="Reset zoom to 100%"
                title="Reset zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                className="btn-press rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                aria-label="Zoom in"
                title="Zoom in"
              >
                <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onReset}
            className="btn-press ml-1 inline-flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          >
            <Upload className="h-3 w-3" aria-hidden="true" />
            Replace
          </button>
        </div>
      </div>

      <div className="relative max-h-[440px] overflow-auto overscroll-contain bg-[var(--bg-subtle)]/50 p-3 flex items-center justify-center">
        {isImage && file.dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- client-side data: URL preview
          <img
            src={file.dataUrl}
            alt={file.name}
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
            className="max-w-full rounded-md transition-transform duration-150"
          />
        ) : isPdf && file.dataUrl ? (
          <iframe
            src={file.dataUrl}
            title={file.name}
            className="h-[380px] w-full rounded-md border border-[var(--border-hairline)] bg-white"
          />
        ) : file.textContent ? (
          <pre className="w-full whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--text-primary)] p-2">
            {file.textContent}
          </pre>
        ) : (
          <div className="py-12 text-center text-xs text-[var(--text-muted)]">
            <RotateCcw className="mx-auto mb-2 h-5 w-5" aria-hidden="true" />
            Preview unavailable for this file type.
          </div>
        )}
      </div>
    </div>
  );
}
