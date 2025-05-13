import { router } from "../trpc";
import { foodRouter } from "./food";

export const appRouter = router({
  food: foodRouter
});

export type AppRouter = typeof appRouter;
