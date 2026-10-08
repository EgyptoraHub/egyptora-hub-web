import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/i18n";

/** "Report an issue" for a traveller story — insert-only for visitors. */
const reportSchema = z.object({ message: z.string().trim().min(5).max(500) });

export function StoryReportButton({ storyId, label }: { storyId: string; label: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (website) return setOpen(false);
    const parsed = reportSchema.safeParse({ message });
    if (!parsed.success) return void toast.error(t("Please write 5–500 characters."));
    setBusy(true);
    const { error } = await supabase.from("traveller_story_reports").insert({ story_id: storyId, message: parsed.data.message });
    setBusy(false);
    if (error) return void toast.error(t("Could not send your report. Please try again later."));
    toast.success(t("Thank you — your report was sent."));
    setMessage("");
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 rounded-full border border-navy px-4 text-sm font-semibold text-navy hover:bg-navy hover:text-primary-foreground"
      >
        {t("Report an issue")}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Report an issue")}</DialogTitle>
            <DialogDescription dir="auto">{label}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void submit(e)} className="grid gap-3">
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
              dir="auto"
              placeholder={t("What is wrong or missing here?")}
              className="rounded-xl border border-border bg-background p-3 text-sm"
            />
            <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" name="website" />
            <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-navy px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {busy ? t("Sending…") : t("Send report")}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

