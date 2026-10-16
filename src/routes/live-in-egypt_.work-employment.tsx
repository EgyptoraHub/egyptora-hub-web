import { createFileRoute, redirect } from "@tanstack/react-router";

// Old URL kept alive as a permanent redirect (no page of its own).
export const Route = createFileRoute("/live-in-egypt_/work-employment")({
  beforeLoad: () => {
    throw redirect({ to: "/live-in-egypt", statusCode: 301 });
  },
});
