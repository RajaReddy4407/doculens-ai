"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, FileText, Upload, X } from "lucide-react";
import { ANALYSIS_MODES } from "@/lib/modes";
import { DEMO_PRESETS, DemoPreset } from "@/lib/demo-presets";
import { AnalysisMode, PersonalityMode, UploadedFilePayload } from "@/types/analysis";
import { ToneSelect } from "@/components/ToneSelect";

interface UploadZoneProps {
  selectedMode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  personality: PersonalityMode;
  onPersonalityChange: (p: PersonalityMode) => void;
  onFileSelected: (file: UploadedFilePayload, modeOverride?: AnalysisMode) => void;
  isAnalyzing: boolean;
  recentsSlot?: React.ReactNode;
}

const MAX_IMAGE_DIMENSION = 1280;

export async function normalizeImageFile(file: File): Promise<{ dataUrl: string; mimeType: string }> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Could not read image."));
    reader.onerror = () => reject(new Error("Image read failed."));
    reader.readAsDataURL(file);
  });

  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return { dataUrl: rawDataUrl, mimeType: file.type };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (!w || !h || (w <= MAX_IMAGE_DIMENSION && h <= MAX_IMAGE_DIMENSION && file.size <= 450_000)) {
        resolve({ dataUrl: rawDataUrl, mimeType: file.type || "image/png" });
        return;
      }
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(w, h));
      const targetW = Math.round(w * scale);
      const targetH = Math.round(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ dataUrl: rawDataUrl, mimeType: file.type || "image/png" });
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, targetW, targetH);
      resolve({
        dataUrl: canvas.toDataURL("image/jpeg", 0.8),
        mimeType: "image/jpeg",
      });
    };
    img.onerror = () => resolve({ dataUrl: rawDataUrl, mimeType: file.type || "image/png" });
    img.src = rawDataUrl;
  });
}

export function UploadZone({
  selectedMode,
  onModeChange,
  personality,
  onPersonalityChange,
  onFileSelected,
  isAnalyzing,
  recentsSlot,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!cameraOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCamera();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cameraOpen]);

  async function processFile(file: File) {
    const isText =
      file.type.startsWith("text/") ||
      /\.(txt|md|csv|json|log|ts|tsx|js|jsx|py|html|css|xml|yaml|yml)$/i.test(file.name);

    if (isText) {
      const textContent = await file.text();
      onFileSelected({
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type || "text/plain",
        size: file.size,
        textContent,
      });
      return;
    }

    if (file.type.startsWith("image/")) {
      const normalized = await normalizeImageFile(file);
      onFileSelected({
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: normalized.mimeType,
        size: file.size,
        dataUrl: normalized.dataUrl,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onFileSelected({
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type || "application/pdf",
        size: file.size,
        dataUrl: typeof reader.result === "string" ? reader.result : undefined,
      });
    };
    reader.readAsDataURL(file);
  }

  async function openCamera() {
    setCameraError(null);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError(
        "Camera access was denied or unavailable. Choose an image from your device instead."
      );
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    closeCamera();
    onFileSelected({
      id: crypto.randomUUID(),
      name: `camera-scan-${new Date().toISOString().slice(11, 19).replace(/:/g, "-")}.jpg`,
      mimeType: "image/jpeg",
      size: Math.round((dataUrl.length * 3) / 4),
      dataUrl,
    });
  }

  function handlePresetClick(preset: DemoPreset) {
    onModeChange(preset.mode);
    onFileSelected({ ...preset.file, id: crypto.randomUUID() }, preset.mode);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      {/* Main Upload Sheet */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) processFile(dropped);
        }}
        className={`sheet rounded-2xl transition-colors duration-150 ${
          isDragging ? "border-[var(--accent-primary)] bg-[var(--accent-soft)]" : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          aria-label="Upload image, PDF, or text document"
          accept="image/*,application/pdf,.txt,.md,.csv,.json,.log,.ts,.tsx,.js,.py"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) processFile(f);
            e.target.value = "";
          }}
        />

        <div className="p-7 sm:p-10 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Read any document, note, or screenshot
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Drop an image, PDF, receipt, or handwritten page here, or press{" "}
            <kbd className="rounded bg-[var(--bg-subtle)] px-1.5 py-0.5 font-mono text-xs text-[var(--text-primary)] border border-[var(--border-hairline)]">
              Ctrl+V
            </kbd>{" "}
            to paste from your clipboard.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => inputRef.current?.click()}
              className="btn-press min-h-[42px] inline-flex items-center gap-2 rounded-lg bg-[var(--action-bg)] px-4 py-2 text-sm font-medium text-[var(--action-fg)] hover:opacity-90 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Choose file
            </button>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={openCamera}
              className="btn-press min-h-[42px] inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-50"
            >
              <Camera className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden="true" />
              Use camera
            </button>
          </div>

          <p className="mt-4 text-xs text-[var(--text-muted)]">
            PNG, JPG, WebP, PDF, TXT, Markdown, CSV, JSON
          </p>
        </div>

        {/* Quiet Integrated Mode Bar: focus + explanation level */}
        <div className="border-t border-[var(--border-hairline)] bg-[var(--bg-inset)] px-4 py-3 rounded-b-2xl flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[var(--text-muted)]">Focus</span>
            <div
              role="group"
              aria-label="Scan focus mode"
              className="flex flex-wrap items-center gap-1"
            >
              {ANALYSIS_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onModeChange(m.id)}
                  title={m.description}
                  aria-pressed={selectedMode === m.id}
                  className={`btn-press rounded-md px-2.5 py-1 text-xs font-medium ${
                    selectedMode === m.id
                      ? "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {m.shortLabel}
                </button>
              ))}
            </div>
          </div>
          <ToneSelect
            id="upload-tone-select"
            value={personality}
            onChange={onPersonalityChange}
            disabled={isAnalyzing}
          />
        </div>
      </div>

      {recentsSlot}

      {/* Clean Sample Files List */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-xs font-medium text-[var(--text-secondary)]">
            Or test with a sample document
          </h2>
          <span className="text-xs text-[var(--text-muted)]">1-click scan</span>
        </div>

        <div className="sheet rounded-xl divide-y divide-[var(--border-hairline)] overflow-hidden">
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={isAnalyzing}
              onClick={() => handlePresetClick(preset)}
              className="btn-press w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText
                  className="h-4 w-4 text-[var(--text-muted)] shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {preset.label}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] truncate">
                    {preset.description}
                  </div>
                </div>
              </div>
              <span className="shrink-0 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-hairline)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Camera Modal */}
      {cameraOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="camera-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="sheet w-full max-w-lg rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3
                id="camera-modal-title"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                Camera scanner
              </h3>
              <button
                type="button"
                onClick={closeCamera}
                aria-label="Close camera scanner"
                className="btn-press rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {cameraError ? (
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--status-danger-bg)] p-4 text-xs text-[var(--status-danger)]">
                {cameraError}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl bg-black border border-[var(--border-hairline)]">
                <video ref={videoRef} autoPlay playsInline className="w-full max-h-80 object-contain" />
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeCamera}
                className="btn-press rounded-lg px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              >
                Cancel
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="btn-press inline-flex items-center gap-1.5 rounded-lg bg-[var(--action-bg)] px-4 py-2 text-xs font-medium text-[var(--action-fg)]"
                >
                  <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                  Capture photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
