import { type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react"
import { ArrowRight, Clock3, Tag } from "lucide-react"

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}



interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode
  className?: string
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string
  className?: string
  background: ReactNode
  Icon: ElementType
  durationBadge?: string
  priceBadge?: string
  description: string
  href: string
  cta: string
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 [&>*]:!col-auto [&>*]:!row-auto [&>*]:!col-span-1 [&>*]:!row-span-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const ctaClass =
  "pointer-events-auto inline-flex items-center text-sm font-semibold text-[var(--text-primary)] underline underline-offset-4 transition-colors hover:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]"

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  durationBadge,
  priceBadge,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex min-h-[27rem] flex-col justify-between overflow-hidden rounded-xl",
      "bg-[var(--surface-3)] shadow-[var(--shadow-md)]",
      "dark:bg-[var(--surface-3)] transform-gpu border border-[var(--border-strong)]",
      className
    )}
    {...props}
  >
    <div className="relative flex h-48 items-start justify-center overflow-hidden px-4 pt-4">
      <div className="h-full w-full max-w-[17rem] overflow-hidden rounded-3xl [&>img]:h-full [&>img]:w-full [&>img]:max-w-none [&>img]:rounded-none [&>img]:object-cover [&>img]:object-top [&>img]:transform-gpu [&>img]:transition-transform [&>img]:duration-300 [&>img]:ease-out group-hover:[&>img]:scale-[1.05] [&>div]:h-full [&>div]:w-full [&>div]:max-w-none [&>div]:rounded-none">
        {background}
      </div>

      {(durationBadge || priceBadge) ? (
        <div className="absolute left-6 top-6 flex flex-wrap gap-2">
          {durationBadge ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--glass-border)] bg-[var(--surface-glass)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-primary)] backdrop-blur-md">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {durationBadge}
            </span>
          ) : null}

          {priceBadge ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--glass-border)] bg-[var(--surface-3)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-primary)] backdrop-blur-md dark:bg-[var(--surface-1)]">
              <Tag className="h-3.5 w-3.5" aria-hidden="true" />
              {priceBadge}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>

    <div className="relative flex flex-1 flex-col justify-end p-4 transition-colors duration-300 group-hover:bg-[var(--surface-glass)] dark:group-hover:bg-[var(--surface-glass)]">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-[var(--surface-glass)] dark:bg-[var(--surface-glass)] z-0"
        )}
      />

      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 transition-all duration-300 lg:group-hover:-translate-y-10">
        <Icon className="h-12 w-12 origin-left transform-gpu text-[var(--text-secondary)] transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">
          {name}
        </h3>
        <p className="max-w-lg text-[var(--text-secondary)]">{description}</p>
      </div>

      <div
        className={cn(
          "pointer-events-none z-10 flex w-full translate-y-0 transform-gpu flex-row items-center transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:hidden mt-4"
        )}
      >
        <a href={href} className={ctaClass}>
          {cta}
          <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
        </a>
      </div>

      <div
        className={cn(
          "pointer-events-none z-10 absolute bottom-0 left-0 hidden w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
        )}
      >
        <a href={href} className={ctaClass}>
          {cta}
          <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
        </a>
      </div>
    </div>
  </div>
)

export { BentoCard, BentoGrid }
