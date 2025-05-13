import { AppNavbar } from "@/components/app-navbar";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { User } from "better-auth";

export const Route = createFileRoute("/_protected")({
  component: RouteComponent,
  beforeLoad: async (): Promise<{ user: User }> => {
    const { data } = await authClient.getSession();
    if (!data?.user) {
      throw redirect({ to: "/" });
    }
    return { user: data.user };
  },
});

function RouteComponent() {
  return (
    <div className="h-full w-full relative">
      <AppNavbar />
      <Outlet />
    </div>
  );
}
