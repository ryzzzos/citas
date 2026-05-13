import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="ml-1 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-[var(--shadow-[var(--shadow-sm)])] backdrop-blur-sm transition-all focus:border-[var(--app-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--app-primary-soft)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-0)]/50  dark:placeholder:text-[var(--text-secondary)] dark:focus:border-[var(--app-primary)] dark:focus:bg-zinc-900 dark:focus:ring-[rgba(37,99,235,0.15)] ${
            error ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="ml-1 text-[12px] font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
