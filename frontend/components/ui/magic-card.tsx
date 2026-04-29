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
  "pointer-events-auto inline-flex items-center text-sm font-semibold text-zinc-900 underline underline-offset-4 transition-colors hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-200"

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
      "bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      "dark:bg-background transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)]",
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
            <span className="inline-flex items-center gap-1 rounded-full border border-white/45 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {durationBadge}
            </span>
          ) : null}

          {priceBadge ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/45 bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-zinc-900 backdrop-blur-md dark:bg-zinc-900/80 dark:text-zinc-100">
              <Tag className="h-3.5 w-3.5" aria-hidden="true" />
              {priceBadge}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>

    <div className="p-4">
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 transition-all duration-300 lg:group-hover:-translate-y-10">
        <Icon className="h-12 w-12 origin-left transform-gpu text-zinc-700 transition-all duration-300 ease-in-out group-hover:scale-75 dark:text-zinc-200" />
        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-50">
          {name}
        </h3>
        <p className="max-w-lg text-zinc-600 dark:text-zinc-300">{description}</p>
      </div>

      <div
        className={cn(
          "pointer-events-none flex w-full translate-y-0 transform-gpu flex-row items-center transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:hidden"
        )}
      >
        <a href={href} className={ctaClass}>
          {cta}
          <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
        </a>
      </div>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute bottom-0 hidden w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
      )}
    >
      <a href={href} className={ctaClass}>
        {cta}
        <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
      </a>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 top-48 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(244,244,245,0.55)_100%)] dark:bg-[linear-gradient(180deg,rgba(9,9,11,0)_0%,rgba(9,9,11,0.34)_100%)]"
      )}
    />

    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 top-48 transform-gpu transition-all duration-300 group-hover:bg-black/3 group-hover:dark:bg-neutral-800/10"
      )}
    />
  </div>
)

export { BentoCard, BentoGrid }