import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
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
      "bg-[var(--app-primary-gradient)] text-dark shadow-[0_4px_14px_-6px_rgba(37,99,235,0.4),inset_0_1px_rgba(255,255,255,0.25)] hover:brightness-110 border border-t-[rgba(255,255,255,0.1)] border-b-[rgba(0,0,0,0.1)] border-x-transparent",
    secondary:
      "border border-zinc-200 bg-[var(--surface-3)]/ text-zinc-900 shadow-[var(--shadow-sm)] backdrop-blur-sm hover:bg-[var(--surface-2)]/80 dark:border-zinc-800 dark:bg-[var(--surface-1)]/70  dark:hover:bg-[var(--surface-2)]",
    danger:
      "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_4px_14px_-6px_rgba(220,38,38,0.4),inset_0_1px_rgba(255,255,255,0.2)] hover:brightness-110 border border-t-[rgba(255,255,255,0.1)] border-b-[rgba(0,0,0,0.1)] border-x-transparent",
  };
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
