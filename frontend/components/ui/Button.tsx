"use client";

import { ButtonHTMLAttributes, useState, useEffect, CSSProperties } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "interactive";
  isLoading?: boolean;
}

export default function Button({
  variant = "primary",
  isLoading,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2 font-semibold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
  const variants = {
    primary:
      "bg-[linear-gradient(90deg,var(--app-primary),var(--app-primary-strong))] text-[var(--surface-3)] shadow-[var(--shadow-md)] hover:brightness-110 border border-[var(--border-soft)]",
    secondary:
      "border border-[var(--border-strong)] bg-[var(--surface-3)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] backdrop-blur-sm hover:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] dark:hover:bg-[var(--surface-2)]",
    danger:
      "bg-[var(--color-error)] text-[var(--surface-3)] shadow-[var(--shadow-md)] hover:brightness-110 border border-[var(--border-soft)]",
    interactive: "",
  };

  /* ── Interactive variant: fully managed in React ── */
  if (variant === "interactive") {
    return (
      <InteractiveButton
        className={className}
        disabled={disabled}
        isLoading={isLoading}
        {...props}
      >
        {children}
      </InteractiveButton>
    );
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   InteractiveButton — mix-blend-mode: difference hover
   Faithful port of the reference CSS, zero external styles.
   ───────────────────────────────────────────────────────── */

const BTN_W = 150;
const BTN_H = 46;

interface InteractiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

function InteractiveButton({
  children,
  className = "",
  disabled,
  isLoading,
  ...props
}: InteractiveButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const check = () => setIsDark(root.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const btnStyle: CSSProperties = {
    width: BTN_W,
    height: BTN_H,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDark ? "white" : "rgb(15, 15, 15)",
    border: "none",
    borderRadius: 0,
    color: isDark ? "rgb(15, 15, 15)" : "white",
    fontWeight: 700,
    fontSize: 15,
    gap: 8,
    cursor: disabled ? "default" : "pointer",
    boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.103)",
    position: "relative",
    overflow: "hidden",
    transitionDuration: "0.3s",
    padding: "0 16px",
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? "none" : "auto",
    isolation: "isolate",
    transform: pressed ? "translate(5px, 5px) translateZ(0)" : "translateZ(0)",
  };

  const overlayStyle: CSSProperties = {
    width: BTN_W,
    height: BTN_W,
    position: "absolute",
    zIndex: 2,
    backgroundColor: "white",
    borderRadius: hovered ? 0 : "50%",
    left: "-100%",
    top: 0,
    transitionDuration: "0.3s",
    mixBlendMode: "difference",
    pointerEvents: "none",
    transform: hovered ? "translate(100%, -50%) scale(1.05)" : "translate3d(0, 0, 0)",
  };

  return (
    <button
      className={className}
      style={btnStyle}
      disabled={disabled || isLoading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <span style={overlayStyle} aria-hidden />
    </button>
  );
}

