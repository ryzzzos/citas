"use client";

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  type ChangeEvent,
} from "react";
import { ZoomIn, ZoomOut, RotateCcw, Move, ImagePlus } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Public Types
   ───────────────────────────────────────────────────────────── */

export type FrameShape = "circle" | "square" | "landscape" | "portrait" | "custom";

export interface ImageFramingFieldRef {
  /** Returns a cropped JPEG File matching the current framing. */
  getCroppedFile: () => Promise<File | null>;
  /** Clears everything: image, zoom, pan. */
  reset: () => void;
  /** Whether an image is currently loaded. */
  hasImage: () => boolean;
}

export interface ImageFramingFieldProps {
  /* ── Frame ──────────────────────────────────────────────── */
  /** Shape of the crop frame. */
  frameShape: FrameShape;
  /** Custom aspect ratio when frameShape="custom" (e.g. "4:3"). */
  customRatio?: string;

  /* ── Output ─────────────────────────────────────────────── */
  /** Export resolution in pixels. Defaults to sensible values per shape. */
  outputSize?: { width: number; height: number };
  /** JPEG quality 0–1.  Default 0.92 */
  outputQuality?: number;

  /* ── File constraints ───────────────────────────────────── */
  /** MIME types the file picker accepts.  Default: jpeg, png, webp */
  acceptedFormats?: string[];
  /** Max file size in bytes.  Default: 2 MB */
  maxFileSize?: number;

  /* ── Initial state (edit mode) ──────────────────────────── */
  /** Pre-existing image URL shown before the user picks a file. */
  initialImageUrl?: string | null;

  /* ── Labels (i18n-ready) ────────────────────────────────── */
  /** Heading above the field. */
  label?: string;
  /** Button text when no image is loaded. */
  selectLabel?: string;
  /** Button text when an image is already loaded. */
  changeLabel?: string;
  /** Placeholder line 1 (no image). */
  emptyText?: string;
  /** Placeholder line 2 (no image). */
  emptySubtext?: string;
  /** Drag hint inside the viewport. */
  dragHint?: string;

  /* ── Feature flags ──────────────────────────────────────── */
  /** Show rule-of-thirds grid over the viewport.  Default true */
  showGrid?: boolean;
  /** Show zoom slider + reset.  Default true */
  showZoomControls?: boolean;

  /* ── State ──────────────────────────────────────────────── */
  disabled?: boolean;
  className?: string;
}

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */

/** Parse a ratio string like "16:10" → numeric value. */
function parseRatio(ratio: string): number {
  const [w, h] = ratio.split(":").map(Number);
  if (!w || !h || h === 0) return 1;
  return w / h;
}

/** Derive the CSS aspect-ratio value from frame shape + custom ratio. */
function getAspectCss(shape: FrameShape, customRatio?: string): string {
  switch (shape) {
    case "circle":
    case "square":
      return "1 / 1";
    case "landscape":
      return "16 / 10";
    case "portrait":
      return "3 / 4";
    case "custom":
      return customRatio ? customRatio.replace(":", " / ") : "1 / 1";
  }
}

/** Numeric aspect ratio for a given shape. */
function getNumericRatio(shape: FrameShape, customRatio?: string): number {
  switch (shape) {
    case "circle":
    case "square":
      return 1;
    case "landscape":
      return 16 / 10;
    case "portrait":
      return 3 / 4;
    case "custom":
      return customRatio ? parseRatio(customRatio) : 1;
  }
}

/** Default output size per shape. */
function defaultOutputSize(shape: FrameShape, customRatio?: string): { width: number; height: number } {
  const ratio = getNumericRatio(shape, customRatio);
  if (ratio >= 1) {
    return { width: 960, height: Math.round(960 / ratio) };
  }
  return { width: Math.round(960 * ratio), height: 960 };
}

/** Extra CSS class for the frame container border-radius. */
function frameRadiusClass(shape: FrameShape): string {
  return shape === "circle" ? "rounded-full" : "rounded-[var(--radius-lg)]";
}

/** Compute explicit cover-fit dimensions for the image inside the frame. */
function coverDimensions(
  imgW: number,
  imgH: number,
  frameW: number,
  frameH: number
): { renderW: number; renderH: number } {
  const imgAspect = imgW / imgH;
  const frameAspect = frameW / frameH;

  if (imgAspect > frameAspect) {
    // Image wider → match height, width overflows
    return { renderW: frameH * imgAspect, renderH: frameH };
  }
  // Image taller → match width, height overflows
  return { renderW: frameW, renderH: frameW / imgAspect };
}

/** Clamp pan so the image always covers 100 % of the frame. */
function clampPan(
  pan: { x: number; y: number },
  zoom: number,
  renderW: number,
  renderH: number,
  frameW: number,
  frameH: number
): { x: number; y: number } {
  const scaledW = renderW * zoom;
  const scaledH = renderH * zoom;
  const maxX = Math.max(0, (scaledW - frameW) / 2);
  const maxY = Math.max(0, (scaledH - frameH) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, pan.x)),
    y: Math.min(maxY, Math.max(-maxY, pan.y)),
  };
}

/* ─────────────────────────────────────────────────────────────
   Default values
   ───────────────────────────────────────────────────────────── */

const DEFAULT_ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_MAX_SIZE = 2 * 1024 * 1024;

/* ─────────────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────────────── */

export const ImageFramingField = forwardRef<ImageFramingFieldRef, ImageFramingFieldProps>(
  function ImageFramingField(props, ref) {
    const {
      frameShape,
      customRatio,
      outputSize,
      outputQuality = 0.92,
      acceptedFormats = DEFAULT_ACCEPTED,
      maxFileSize = DEFAULT_MAX_SIZE,
      initialImageUrl = null,
      label,
      selectLabel = "Elegir archivo",
      changeLabel = "Cambiar imagen",
      emptyText = "Sin imagen seleccionada",
      emptySubtext,
      dragHint = "Arrastra para encuadrar",
      showGrid = true,
      showZoomControls = true,
      disabled = false,
      className = "",
    } = props;

    /* ── State ──────────────────────────────────────────────── */
    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });
    const [fileError, setFileError] = useState<string | null>(null);
    const [currentFileName, setCurrentFileName] = useState<string>("image.jpg");

    const frameRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── Track frame size via ResizeObserver ─────────────────── */
    useEffect(() => {
      const el = frameRef.current;
      if (!el) return;
      const ro = new ResizeObserver((entries) => {
        const e = entries[0];
        if (e) setFrameSize({ w: e.contentRect.width, h: e.contentRect.height });
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    /* ── Derived: cover dimensions ───────────────────────────── */
    const cover = imageObj && frameSize.w > 0
      ? coverDimensions(imageObj.width, imageObj.height, frameSize.w, frameSize.h)
      : null;

    /* ── Load image whenever imageSrc changes ────────────────── */
    useEffect(() => {
      if (!imageSrc) {
        setImageObj(null);
        return;
      }

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      img.onload = () => {
        setImageObj(img);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      };
      img.onerror = () => {
        setImageObj(null);
      };
    }, [imageSrc]);

    /* ── Seed with initialImageUrl on mount ──────────────────── */
    useEffect(() => {
      if (initialImageUrl && !imageSrc) {
        setImageSrc(initialImageUrl);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialImageUrl]);

    /* ── File selection handler ───────────────────────────────── */
    function onFileChange(e: ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      // reset the input so the same file can be re-selected
      e.target.value = "";

      if (!file) return;

      // Validate type
      if (!acceptedFormats.includes(file.type)) {
        setFileError("Formato no soportado. Usa JPEG, PNG o WEBP.");
        return;
      }

      // Validate size
      if (file.size > maxFileSize) {
        const mbLimit = Math.round(maxFileSize / (1024 * 1024));
        setFileError(`El archivo debe pesar ${mbLimit}MB o menos.`);
        return;
      }

      setFileError(null);
      setCurrentFileName(file.name);

      // Revoke old blob URL if any
      if (imageSrc && imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }

      const objectUrl = URL.createObjectURL(file);
      setImageSrc(objectUrl);
    }

    /* ── Cleanup blob URL on unmount ─────────────────────────── */
    useEffect(() => {
      return () => {
        if (imageSrc && imageSrc.startsWith("blob:")) {
          URL.revokeObjectURL(imageSrc);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Drag helpers ────────────────────────────────────────── */
    function startDrag(clientX: number, clientY: number) {
      if (!imageObj || disabled) return;
      setIsDragging(true);
      setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
    }

    function moveDrag(clientX: number, clientY: number) {
      if (!isDragging || !cover) return;
      const raw = { x: clientX - dragStart.x, y: clientY - dragStart.y };
      setPan(clampPan(raw, zoom, cover.renderW, cover.renderH, frameSize.w, frameSize.h));
    }

    function endDrag() {
      setIsDragging(false);
    }

    /* Mouse */
    const onMouseDown = (e: React.MouseEvent) => startDrag(e.clientX, e.clientY);
    const onMouseMove = (e: React.MouseEvent) => moveDrag(e.clientX, e.clientY);

    /* Touch */
    const onTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 1) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };

    /* ── Zoom ────────────────────────────────────────────────── */
    function handleZoom(newZoom: number) {
      setZoom(newZoom);
      if (cover) {
        setPan((prev) =>
          clampPan(prev, newZoom, cover.renderW, cover.renderH, frameSize.w, frameSize.h)
        );
      }
    }

    function resetFraming() {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }

    /* ── Export cropped file ──────────────────────────────────── */
    const exportCropped = useCallback(async (): Promise<File | null> => {
      if (!imageObj || !cover || frameSize.w === 0) return null;

      const out = outputSize ?? defaultOutputSize(frameShape, customRatio);
      const canvas = document.createElement("canvas");
      canvas.width = out.width;
      canvas.height = out.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // White fill for safety
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, out.width, out.height);

      const scale = out.width / frameSize.w;

      // Mirror the visual transform into canvas space
      ctx.translate(out.width / 2, out.height / 2);
      ctx.translate(pan.x * scale, pan.y * scale);
      ctx.scale(zoom, zoom);

      const drawW = cover.renderW * scale;
      const drawH = cover.renderH * scale;
      ctx.drawImage(imageObj, -drawW / 2, -drawH / 2, drawW, drawH);

      return new Promise<File | null>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(null);
            resolve(
              new File([blob], currentFileName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
            );
          },
          "image/jpeg",
          outputQuality
        );
      });
    }, [imageObj, cover, frameSize, pan, zoom, outputSize, outputQuality, frameShape, customRatio, currentFileName]);

    /* ── Imperative ref ──────────────────────────────────────── */
    useImperativeHandle(ref, () => ({
      getCroppedFile: exportCropped,
      reset() {
        if (imageSrc && imageSrc.startsWith("blob:")) URL.revokeObjectURL(imageSrc);
        setImageSrc(null);
        setImageObj(null);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setFileError(null);
      },
      hasImage: () => imageObj !== null,
    }));

    /* ── Derived format hint ─────────────────────────────────── */
    const defaultSubtext =
      emptySubtext ??
      `${acceptedFormats.map((f) => f.split("/")[1]?.toUpperCase()).join(", ")}. Máx ${Math.round(maxFileSize / (1024 * 1024))}MB.`;

    const hasImage = imageObj !== null && cover !== null;

    /* ── Render ──────────────────────────────────────────────── */
    return (
      <div className={`flex flex-col gap-3 select-none ${className}`}>
        {/* Header: label + file picker button */}
        {(label || true) && (
          <div className="flex items-center justify-between">
            {label && (
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">{label}</span>
            )}
            <label
              className={`inline-flex cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] ${disabled ? "pointer-events-none opacity-50" : ""}`}
            >
              <span>{hasImage ? changeLabel : selectLabel}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(",")}
                className="sr-only"
                disabled={disabled}
                onChange={onFileChange}
              />
            </label>
          </div>
        )}

        {/* Error message */}
        {fileError && (
          <p className="text-[12px] font-medium text-[var(--color-error)]">{fileError}</p>
        )}

        {/* Viewport or empty state */}
        {hasImage ? (
          <div className="flex flex-col items-center gap-3">
            {/* Frame viewport */}
            <div
              ref={frameRef}
              className={`relative w-full overflow-hidden border-2 border-[var(--app-primary)] shadow-[var(--shadow-sm)] bg-[var(--surface-1)] ${frameRadiusClass(frameShape)} ${disabled ? "pointer-events-none opacity-60" : "cursor-grab active:cursor-grabbing"}`}
              style={{ aspectRatio: getAspectCss(frameShape, customRatio) }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={endDrag}
            >
              {/* Image rendered at explicit cover-fit dimensions */}
              <img
                src={imageObj!.src}
                alt="Encuadre"
                draggable={false}
                className="absolute pointer-events-none"
                style={{
                  width: cover!.renderW,
                  height: cover!.renderH,
                  maxWidth: "none",
                  left: "50%",
                  top: "50%",
                  transformOrigin: "center center",
                  transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
                  transition: isDragging ? "none" : "transform 80ms ease-out",
                }}
              />

              {/* Rule-of-thirds grid */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-[0.12]">
                  <div className="border-r border-b border-[var(--text-primary)]" />
                  <div className="border-r border-b border-[var(--text-primary)]" />
                  <div className="border-b border-[var(--text-primary)]" />
                  <div className="border-r border-b border-[var(--text-primary)]" />
                  <div className="border-r border-b border-[var(--text-primary)]" />
                  <div className="border-b border-[var(--text-primary)]" />
                  <div className="border-r border-[var(--text-primary)]" />
                  <div className="border-r border-[var(--text-primary)]" />
                  <div />
                </div>
              )}

              {/* Drag hint badge */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] font-medium text-[var(--text-primary)] bg-[var(--surface-3)]/90 border border-[var(--border-strong)] px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none whitespace-nowrap shadow-[var(--shadow-sm)]">
                <Move className="h-3 w-3 text-[var(--app-primary)]" />
                {dragHint}
              </div>
            </div>

            {/* Zoom controls */}
            {showZoomControls && (
              <div className="flex items-center justify-between w-full max-w-xs gap-3 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-sm)]">
                <div className="flex items-center gap-2 flex-1">
                  <ZoomOut className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => handleZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[var(--surface-1)] accent-[var(--app-primary)]"
                    disabled={disabled}
                  />
                  <ZoomIn className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                </div>
                <button
                  type="button"
                  onClick={resetFraming}
                  disabled={disabled}
                  className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty placeholder */
          <div
            ref={frameRef}
            className={`flex flex-col items-center justify-center border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] text-center ${frameRadiusClass(frameShape)} ${frameShape === "circle" ? "p-6" : "p-8"}`}
            style={{ aspectRatio: getAspectCss(frameShape, customRatio) }}
          >
            <ImagePlus
              className="h-7 w-7 text-[var(--text-muted)] mb-2"
              strokeWidth={1.75}
            />
            <p className="text-xs text-[var(--text-muted)] font-medium">{emptyText}</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">{defaultSubtext}</p>
          </div>
        )}
      </div>
    );
  }
);
