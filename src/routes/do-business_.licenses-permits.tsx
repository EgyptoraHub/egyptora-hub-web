import { createFileRoute, redirect } from "@tanstack/react-router";

// Old URL kept alive as a permanent redirect (no page of its own).
export const Route = createFileRoute("/do-business_/licenses-permits")({
  beforeLoad: () => {
    throw redirect({ to: "/do-business", statusCode: 301 });
  },
});
