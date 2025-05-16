import { useRouteContext } from "@tanstack/react-router";
import { UserProfileMenu } from "./user-profile-menu";

export const AppNavbar = () => {
  const routeContext = useRouteContext({ from: "/_protected" });
  return (
    <div className="border-b sticky top-0 bg-background z-10 w-full">
      <div className="container flex items-center justify-between px-4 mx-auto py-3">
        <h1 className="text-2xl bg-clip-text text-transparent bg-gradient-to-b from-primary to-neutral-400 text-center font-sans font-bold">
          FoodFeed
        </h1>
        <UserProfileMenu user={routeContext.user} />
      </div>
    </div>
  );
};
