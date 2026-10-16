import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/** Sign in / Create account controls — collapses to a dashboard link once signed in. */
export function AuthButtons({
  className,
  variant = "default",
}: {
  className?: string;
  /** "nav": single gold rounded-rectangle Login button (shared top navigation). */
  variant?: "default" | "nav";
}) {
  const { t } = useI18n();
  const { user, loading } = useAuth();

  if (loading) return <div className={cn("h-10 w-24", className)} />;

  if (user) {
    const items = [
      { to: "/account", label: "Account" },
      { to: "/my-trips", label: "My trips" },
      { to: "/my-trips/new", label: "Plan your trip" },
      { to: "/saved", label: "Saved" },
      { to: "/account/bookings", label: "Bookings" },
    ] as const;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex items-center gap-2 rounded-full border border-gold-line bg-gold-soft px-3.5 py-2 text-xs font-semibold text-gold transition-colors hover:bg-gold hover:text-primary-foreground",
            className,
          )}
        >
          <LayoutDashboard className="size-4" />
          <span className="hidden sm:inline">{t("My dashboard")}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {items.map((i) => (
            <DropdownMenuItem key={i.to} asChild>
              <Link to={i.to}>{t(i.label)}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "nav") {
    return (
      <Link
        to="/auth"
        className={cn(
          "flex items-center gap-2 rounded-lg bg-gold-cta px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90",
          className,
        )}
      >
        <LogIn className="size-4" />
        {t("Login")}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Link
        to="/auth"
        className="flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-gold-line hover:text-gold"
      >
        <LogIn className="size-4" />
        <span className="hidden sm:inline">{t("Sign in")}</span>
      </Link>
      <Link
        to="/auth"
        className="flex items-center gap-2 rounded-full bg-gold px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <UserPlus className="size-4" />
        <span className="hidden sm:inline">{t("Create account")}</span>
      </Link>
    </div>
  );
}
