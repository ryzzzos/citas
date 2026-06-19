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
      "bg-[linear-gradient(90deg,var(--app-primary),var(--app-primary-strong))] text-[var(--surface-3)] shadow-[var(--shadow-md)] hover:brightness-110 border border-[var(--border-soft)]",
    secondary:
      "border border-[var(--border-strong)] bg-[var(--surface-3)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] backdrop-blur-sm hover:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] dark:hover:bg-[var(--surface-2)]",
    danger:
      "bg-[var(--color-error)] text-[var(--surface-3)] shadow-[var(--shadow-md)] hover:brightness-110 border border-[var(--border-soft)]",
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
