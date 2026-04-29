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
          className={`w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all focus:border-[var(--app-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--app-primary-soft)] dark:border-zinc-800/80 dark:bg-zinc-950/50 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-[var(--app-primary-strong)] dark:focus:bg-zinc-900 dark:focus:ring-[rgba(37,99,235,0.15)] ${
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
