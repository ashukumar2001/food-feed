import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

import fs from "node:fs";
import path from "node:path";
dotenv.config({ path: process.env.CLOUDFLARE_ENV === "production" ? ".dev.vars.production" : ".dev.vars.dev" });
const getLocalD1 = () => {
    try {
        const basePath = path.resolve('.wrangler');
        const dbFile = fs
            .readdirSync(basePath, { recursive: true, encoding: 'utf-8' })
            .filter(v => v.endsWith(".sqlite"))
            .map(v => {
                const filePath = path.join(basePath, v);
                return ({
                    path: filePath,
                    mtime: fs.statSync(filePath).mtime.getTime(),
                })
            }).sort((a, b) => b.mtime - a.mtime)

        return dbFile[0]?.path;
    } catch (err) {
        console.error(`Error finding latest sqlite file: ${err}`);
        return undefined;
    }
}
const getDbConfiguration = () => {
    const useLocalDb = process.env.CLOUDFLARE_ENV === "dev" && process.env.USE_DB_TYPE === "local";
    if (useLocalDb) {
        return {
            dbCredentials: {
                url: getLocalD1(),
            }
        }
    }

    return {
        driver: 'd1-http',
        dbCredentials: {
            accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
            databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
            token: process.env.CLOUDFLARE_D1_TOKEN!
        }
    }
};

const dbCredentials = getDbConfiguration();
export default {
    out: "./src/worker/drizzle",
    schema: "./src/worker/db/schema.ts",
    dialect: "sqlite",
    ...dbCredentials
} satisfies Config;
