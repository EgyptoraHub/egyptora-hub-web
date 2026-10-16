import { createFileRoute, redirect } from "@tanstack/react-router";

// Old URL kept alive as a permanent redirect (no page of its own).
export const Route = createFileRoute("/about")({
  beforeLoad: () => {
    throw redirect({ to: "/legal", statusCode: 301 });
  },
});
