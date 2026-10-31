/**
 * Maintenance Mode.
 *
 * The real switch now lives in the database and is controlled from the
 * owner panel at /admin/maintenance — no code change or redeploy needed.
 *
 * MAINTENANCE_MODE below is only a hard override: true = force the site
 * closed regardless of the panel. Leave it false for normal operation.
 *
 * Preview host classification affects presentation, never admin authorization.
 */
export const MAINTENANCE_MODE = false;

export const PUBLIC_MAINTENANCE_HOSTS = ["egyptora-hub.com", "www.egyptora-hub.com"];
export const STATIC_PREVIEW_SUFFIXES = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"];
export const LIVE_PREVIEW_SUFFIXES = [".lovableproject.com", ".lovableproject-dev.com"];
export const LOCAL_PREVIEW_HOSTS = ["localhost", "127.0.0.1", "[::1]"];
export const DELEGATED_PREVIEW_HOSTS: readonly string[] = [];
const STATIC_PREVIEW_LABEL = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;
const DEV_PREVIEW_LABEL = /^project--.+-dev$/;

export function isMaintenancePreviewHost(host: string): boolean {
  const hostname = host.toLowerCase();
  if (PUBLIC_MAINTENANCE_HOSTS.includes(hostname)) return false;
  if (LOCAL_PREVIEW_HOSTS.includes(hostname) || DELEGATED_PREVIEW_HOSTS.includes(hostname)) return true;
  if (LIVE_PREVIEW_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) return true;
  return STATIC_PREVIEW_SUFFIXES.some((suffix) => hostname.endsWith(suffix)) &&
    (STATIC_PREVIEW_LABEL.test(hostname.split(".")[0] ?? "") || DEV_PREVIEW_LABEL.test(hostname.split(".")[0] ?? ""));
}

export function maintenanceVisibility(enabled: boolean, preview: boolean, admin: boolean) {
  return { closed: enabled && !preview && !admin, badge: enabled && (preview || admin) };
}

export function requireMaintenanceAdmin(signedIn: boolean, admin: boolean) {
  if (!signedIn || !admin) throw new Error("Forbidden");
}
