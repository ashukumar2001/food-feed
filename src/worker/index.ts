import { trpcServer } from "@hono/trpc-server";
import { logger } from "hono/logger"
import { Hono } from "hono";
import { createContext } from "./trpc";
import { appRouter } from "./routes";
import { auth } from "./lib/auth";
const app = new Hono<{ Bindings: Env }>();
app.use("*", logger());
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.get("/api/health", (c) => c.json({ status: true }, 200))

app.use("/trpc/*", async (c, next) =>
    trpcServer({
        router: appRouter,
        createContext: () => createContext(c),
    })(c, next)
);

export default app;
