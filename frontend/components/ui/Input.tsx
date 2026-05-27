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
          <label htmlFor={id} className="ml-1 text-[13px] font-semibold text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-[var(--shadow-sm)] backdrop-blur-sm transition-all focus:border-[var(--text-secondary)] focus:bg-[var(--surface-3)] focus:outline-none dark:border-[var(--border-strong)] dark:bg-[var(--surface-0)]/50 dark:placeholder:text-[var(--text-secondary)] dark:focus:border-[var(--text-secondary)] dark:focus:bg-[var(--surface-1)] ${
            error ? "border-[var(--color-error)] focus:border-[var(--color-error)]" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="ml-1 text-[12px] font-medium text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
