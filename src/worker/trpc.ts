import { initTRPC } from "@trpc/server";
import { Context } from "hono";
export const createContext = (
    c: Context<{ Bindings: Env }, "/trpc/*", {}>
) => ({
    workerContext: c,
});
const t = initTRPC.context<ReturnType<typeof createContext>>().create();
export const router = t.router;
export const publicProcedure = t.procedure;