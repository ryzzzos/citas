"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InfiniteMarqueeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  items?: React.ReactNode[];
  children?: React.ReactNode;
  title?: React.ReactNode;
  speed?: number; // duration of cycle in seconds (higher = slower)
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  fadeEdges?: boolean;
  gap?: string; // e.g. "gap-12", "gap-16"
  className?: string;
}

export function InfiniteMarquee({
  items,
  children,
  title,
  speed = 45,
  direction = "left",
  pauseOnHover = true,
  fadeEdges = true,
  gap = "gap-12 sm:gap-16",
  className,
  ...props
}: InfiniteMarqueeProps) {
  // Collect items from either `items` array or React `children`
  const itemList = items ?? (children ? React.Children.toArray(children) : []);

  if (itemList.length === 0) return null;

  // Quadruple items for seamless continuous looping
  const duplicatedItems = [...itemList, ...itemList, ...itemList, ...itemList];

  return (
    <div
      className={cn(
        "group relative w-full py-6 flex flex-col items-center justify-center overflow-hidden",
        pauseOnHover && "marquee-container",
        className
      )}
      {...props}
    >
      {title && (
        <div className="text-[0.68rem] font-bold uppercase tracking-[0.25em] text-[var(--text-muted)] opacity-80 mb-6 text-center select-none">
          {title}
        </div>
      )}

      {/* Marquee Container with edge fade masks */}
      <div
        className="relative w-full overflow-hidden flex items-center"
        style={
          fadeEdges
            ? {
                maskImage:
                  "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              }
            : undefined
        }
      >
        <div
          className={cn(
            "flex shrink-0 items-center animate-infinite-marquee",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            gap
          )}
          style={{
            animationDuration: `${speed}s`,
            animationDirection: direction === "right" ? "reverse" : "normal",
          }}
        >
          {duplicatedItems.map((item, index) => (
            <div
              key={index}
              className="shrink-0 flex items-center justify-center select-none"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InfiniteMarquee;
