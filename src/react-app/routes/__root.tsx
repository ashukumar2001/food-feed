import { ThemeProvider } from "@/components/theme-provider";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="foodfeed-ui-theme">
      <main className="min-h-dvh">
        <Outlet />
      </main>
    </ThemeProvider>
  );
}
