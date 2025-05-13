import { GetStartedButton } from "@/components/get-started-button";
import { BackgroundBeams } from "@/components/ui/background-beem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data, isPending } = authClient.useSession();

  return (
    <div className="w-full h-dvh relative flex flex-col border items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4 space-y-6 z-10 ">
        <h1 className="relative text-5xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-400 to-neutral-600 text-center font-sans font-bold">
          FoodFeed
        </h1>
        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative">
          The best way to track your food nutrients
        </p>
        <div className="flex items-center justify-center mt-6">
          {isPending ? (
            <Skeleton className="w-32 h-10 rounded-md" />
          ) : data?.user ? (
            <Button onClick={() => navigate({ to: "/dashboard" })}>
              Go to dashboard
            </Button>
          ) : (
            <GetStartedButton />
          )}
        </div>
      </div>
      <BackgroundBeams />
    </div>
  );
}
