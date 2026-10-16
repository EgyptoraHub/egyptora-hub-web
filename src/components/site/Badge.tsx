import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The one site badge: a dark-navy pill. */
export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-pill)] bg-navy px-2.5 py-0.5 text-2xs font-semibold text-primary-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
