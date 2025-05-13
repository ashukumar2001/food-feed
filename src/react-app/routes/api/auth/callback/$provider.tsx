import { LoadingDots } from "@/components/ui/loading-dots";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/callback/$provider")({
  component: RouteComponent,
  beforeLoad: async (ctx) => {
    const response = await fetch(ctx.location.href);
    if (response.ok) {
      window.location.href = "/";
    }
  },
  onCatch() {
    window.location.href = "/";
  },
  pendingComponent: () => (
    <div className="w-screen h-dvh grid place-items-center">
      <LoadingDots />
    </div>
  ),
  pendingMs: 50,
});

function RouteComponent() {
  return null;
}
