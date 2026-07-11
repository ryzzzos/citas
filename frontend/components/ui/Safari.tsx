import type { HTMLAttributes } from "react";
import { Lock } from "lucide-react";

export interface SafariProps extends HTMLAttributes<HTMLDivElement> {
  url?: string;
  imageSrc?: string;
  imageSrcDark?: string;
  videoSrc?: string;
  videoSrcDark?: string;
}

export default function Safari({
  imageSrc,
  imageSrcDark,
  videoSrc,
  videoSrcDark,
  url = "agendaweb.com",
  className,
  style,
  ...props
}: SafariProps) {
  const hasVideo = !!videoSrc;

  return (
    <div
      className={`w-full bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] overflow-hidden flex flex-col ${className ?? ""}`}
      style={style}
      {...props}
    >
      {/* Browser Bar */}
      <div className="h-11 bg-[var(--surface-2)]/90 backdrop-blur-md border-b border-[var(--border-strong)]/45 flex items-center px-4 justify-between select-none">
        {/* macOS Dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] opacity-90" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-90" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] opacity-90" />
        </div>

        {/* URL Bar */}
        <div className="flex-1 max-w-xs sm:max-w-md mx-auto">
          <div className="h-7 rounded-full bg-[var(--surface-3)] border border-[var(--border-strong)]/60 text-[0.72rem] text-[var(--text-muted)] flex items-center justify-center gap-1.5 px-3 truncate">
            <Lock className="h-3 w-3 text-[var(--color-success)] shrink-0" />
            <span className="truncate tracking-wide">{url}</span>
          </div>
        </div>

        {/* Spacer for alignment balance */}
        <div className="w-[52px] shrink-0 hidden sm:block" />
      </div>

      {/* Screen Area */}
      <div className="relative w-full h-auto bg-[var(--surface-1)]">
        {hasVideo ? (
          <>
            <video
              className={`block w-full h-auto object-contain ${videoSrcDark ? "dark:hidden" : ""}`}
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
            {videoSrcDark && (
              <video
                className="hidden w-full h-auto object-contain dark:block"
                src={videoSrcDark}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            )}
          </>
        ) : (
          imageSrc && (
            <>
              <img
                src={imageSrc}
                alt="Dashboard Preview"
                className={`block w-full h-auto object-contain object-top ${imageSrcDark ? "dark:hidden" : ""}`}
              />
              {imageSrcDark && (
                <img
                  src={imageSrcDark}
                  alt="Dashboard Preview Dark"
                  className="hidden w-full h-auto object-contain object-top dark:block"
                />
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
