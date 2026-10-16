import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/** Shared empty list message: icon + one short translated sentence. */
export function EmptyState({ text, Icon = Inbox, className }: { text: string; Icon?: LucideIcon; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border px-6 py-10 text-center", className)}>
      <Icon className="size-7 text-muted-foreground" aria-hidden />
      <p className="max-w-sm text-sm text-muted-foreground">{t(text)}</p>
    </div>
  );
}
