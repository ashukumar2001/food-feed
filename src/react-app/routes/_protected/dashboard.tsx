import { CalorieTracker } from "@/components/food-log";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/dashboard")({
  component: CalorieTracker,
});
