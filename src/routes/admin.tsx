import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink } from "lucide-react";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { getMyRoles, type MyRoles } from "@/lib/roles.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

type NavLink = { to: string; label: string; exact: boolean; show: (roles: MyRoles | null) => boolean };

const ADMIN_ONLY = (roles: MyRoles | null) => roles?.admin === true;

const LINKS: NavLink[] = [
  { to: "/admin", label: "Dashboard", exact: true, show: ADMIN_ONLY },
  { to: "/admin/bookings", label: "Bookings", exact: false, show: ADMIN_ONLY },
  { to: "/admin/content", label: "Content", exact: false, show: ADMIN_ONLY },
  { to: "/admin/users", label: "Users", exact: false, show: ADMIN_ONLY },
  { to: "/admin/partners", label: "Partners", exact: false, show: ADMIN_ONLY },
  { to: "/admin/integrations", label: "Integrations", exact: false, show: ADMIN_ONLY },
  { to: "/admin/data-audit", label: "Data audit", exact: false, show: ADMIN_ONLY },
  {
    to: "/admin/crm/properties",
    label: "Properties CRM",
    exact: false,
    show: (roles) => roles?.crmProperties === true,
  },
  {
    to: "/admin/crm/investment",
    label: "Investment CRM",
    exact: false,
    show: (roles) => roles?.crmInvestment === true,
  },
];

function AdminLayout() {
  const { t } = useI18n();
  const loadRoles = useServerFn(getMyRoles);
  const [roles, setRoles] = useState<MyRoles | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;
      const result = await loadRoles({ data: {} as never });
      if (active) setRoles(result);
    })().catch(() => {
      /* nav simply stays minimal; page-level checks still apply */
    });
    return () => {
      active = false;
    };
  }, [loadRoles]);

  const visible = LINKS.filter((link) => link.show(roles));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/80">
            {SITE.name} · {t("Admin")}
          </span>
          <nav className="flex flex-wrap items-center gap-1">
            {visible.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.exact }}
                activeProps={{ className: "border-gold/60 bg-gold/10 text-gold" }}
                inactiveProps={{ className: "border-transparent text-muted-foreground hover:text-foreground" }}
                className="rounded-full border px-3.5 py-1.5 text-sm transition-colors"
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>
          <Link
            to="/"
            className="ms-auto flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-gold"
          >
            <ExternalLink className="size-3.5" />
            {t("View site")}
          </Link>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
