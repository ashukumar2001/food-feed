import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { auth } from "../lib/auth";
import { analyzeFoodMacros } from "../lib/ai-analyzer";
import { DateTime } from "luxon";

// Input validation schema for analyzing food description
const analyzeInputSchema = z.object({
    name: z.string().min(4, "Name is required"),
    description: z.string().min(1, "Description is required")
});

// Input validation schema for creating a new food log
const createFoodLogSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    calories: z.number().min(0, "Calories must be a positive number"),
    protein: z.number().min(0, "Protein must be a positive number").default(0),
    carbs: z.number().min(0, "Carbs must be a positive number").default(0),
    fat: z.number().min(0, "Fat must be a positive number").default(0),
    timestamp: z.string().optional() // Optional ISO timestamp string
});

// Input validation schema for updating a food log
const updateFoodLogSchema = z.object({
    id: z.string().uuid(),
    calories: z.number().min(0, "Calories must be a positive number"),
    protein: z.number().min(0, "Protein must be a positive number").default(0),
    carbs: z.number().min(0, "Carbs must be a positive number").default(0),
    fat: z.number().min(0, "Fat must be a positive number").default(0),
    timestamp: z.string().optional() // Optional ISO timestamp string
});

// Define FoodLog type
export type FoodLog = {
    id: string;
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    timestamp: string; // ISO string
    userId: string;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
};

export const foodRouter = router({
    // Analyze food description using AI to estimate calories
    analyze: publicProcedure
        .input(analyzeInputSchema)
        .query(async ({ input, ctx }) => {
            try {
                // Add retry logic for AI analysis
                let attempts = 0;
                const maxAttempts = 3;
                let lastError = null;

                while (attempts < maxAttempts) {
                    try {
                        const macros = await analyzeFoodMacros(ctx.workerContext.env, input.name, input.description);
                        return macros;
                    } catch (error) {
                        lastError = error;
                        attempts++;
                        // Wait before retrying (exponential backoff)
                        if (attempts < maxAttempts) {
                            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempts)));
                        }
                    }
                }

                console.error("Error estimating calories after retries:", lastError);

                // Return fallback values if all attempts fail
                return {
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0
                };
            } catch (error) {
                console.error("Error estimating calories:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to estimate calories"
                });
            }
        }),

    // Create a new food log
    createFoodLog: publicProcedure
        .input(createFoodLogSchema)
        .mutation(async ({ input, ctx }) => {
            const session = await auth.api.getSession(ctx.workerContext.req.raw);

            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must be logged in to create a food log"
                });
            }

            try {
                const newId = crypto.randomUUID();
                const now = new Date();

                // If timestamp is provided, use it
                const timestamp = input.timestamp ? new Date(input.timestamp) : now;

                const newFoodLog = {
                    id: newId,
                    name: input.name,
                    description: input.description,
                    calories: input.calories,
                    protein: input.protein,
                    carbs: input.carbs,
                    fat: input.fat,
                    timestamp: timestamp,
                    userId: session.user.id,
                    createdAt: now,
                    updatedAt: now
                };

                await ctx.workerContext.env.DB.prepare(`
                    INSERT INTO food_logs (id, name, description, calories, protein, carbs, fat, timestamp, user_id, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    newId,
                    input.name,
                    input.description,
                    input.calories,
                    input.protein,
                    input.carbs,
                    input.fat,
                    timestamp.getTime(),
                    session.user.id,
                    now.getTime(),
                    now.getTime()
                ).run();

                return newFoodLog;
            } catch (error) {
                console.error("Error creating food log:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create food log"
                });
            }
        }),

    // Get all food logs for the current user
    getFoodLogs: publicProcedure
        .query(async ({ ctx }) => {
            const session = await auth.api.getSession(ctx.workerContext.req.raw);

            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must be logged in to view food logs"
                });
            }

            try {
                const { results } = await ctx.workerContext.env.DB.prepare(`
                    SELECT * FROM food_logs 
                    WHERE user_id = ? 
                    ORDER BY timestamp DESC
                `).bind(session.user.id).all();

                // Convert timestamp to Date objects
                const logs: FoodLog[] = results.map((log) => ({
                    id: String(log.id),
                    name: String(log.name),
                    description: String(log.description),
                    calories: Number(log.calories),
                    protein: Number(log.protein),
                    carbs: Number(log.carbs),
                    fat: Number(log.fat),
                    timestamp: new Date(Number(log.timestamp)).toISOString(),
                    userId: String(log.user_id),
                    createdAt: new Date(Number(log.created_at)).toISOString(),
                    updatedAt: new Date(Number(log.updated_at)).toISOString(),
                }));

                return logs;
            } catch (error) {
                console.error("Error fetching food logs:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to fetch food logs"
                });
            }
        }),

    // Update a food log (all macros)
    updateFoodLog: publicProcedure
        .input(updateFoodLogSchema)
        .mutation(async ({ input, ctx }) => {
            const session = await auth.api.getSession(ctx.workerContext.req.raw);

            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must be logged in to update a food log"
                });
            }

            try {
                const now = new Date();

                // First check if the food log exists and belongs to the user
                const { results } = await ctx.workerContext.env.DB.prepare(`
                    SELECT * FROM food_logs
                    WHERE id = ? AND user_id = ?
                `).bind(input.id, session.user.id).all();

                if (!results.length) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Food log not found or does not belong to you"
                    });
                }

                // Update query and params depending on whether timestamp is provided
                let updateQuery = `
                    UPDATE food_logs
                    SET calories = ?, protein = ?, carbs = ?, fat = ?, updated_at = ?
                `;
                let params = [
                    input.calories,
                    input.protein,
                    input.carbs,
                    input.fat,
                    now.getTime()
                ];

                // If timestamp is provided, include it in the update
                if (input.timestamp) {
                    const timestamp = new Date(input.timestamp);
                    updateQuery = `
                        UPDATE food_logs
                        SET calories = ?, protein = ?, carbs = ?, fat = ?, timestamp = ?, updated_at = ?
                    `;
                    params = [
                        input.calories,
                        input.protein,
                        input.carbs,
                        input.fat,
                        timestamp.getTime(),
                        now.getTime()
                    ];
                }

                // Complete the query with the WHERE clause
                updateQuery += ` WHERE id = ?`;
                // TypeScript thinks params is readonly after spread
                const finalParams = [...params, input.id];

                // Execute the update
                await ctx.workerContext.env.DB.prepare(updateQuery).bind(...finalParams).run();

                return { success: true };
            } catch (error) {
                console.error("Error updating food log:", error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to update food log"
                });
            }
        }),

    // Delete a food log
    deleteFoodLog: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const session = await auth.api.getSession(ctx.workerContext.req.raw);

            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must be logged in to delete a food log"
                });
            }

            try {
                // First check if the food log exists and belongs to the user
                const { results } = await ctx.workerContext.env.DB.prepare(`
                    SELECT * FROM food_logs
                    WHERE id = ? AND user_id = ?
                `).bind(input.id, session.user.id).all();

                if (!results.length) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Food log not found or does not belong to you"
                    });
                }

                // Delete the food log
                await ctx.workerContext.env.DB.prepare(`
                    DELETE FROM food_logs
                    WHERE id = ?
                `).bind(input.id).run();

                return { success: true };
            } catch (error) {
                console.error("Error deleting food log:", error);
                if (error instanceof TRPCError) {
                    throw error;
                }
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to delete food log"
                });
            }
        }),

    // Get daily calorie summary
    getDailySummary: publicProcedure
        .input(z.object({ timezone: z.string().default('Asia/Calcutta') }))
        .query(async ({ ctx, input: { timezone } }) => {
            const session = await auth.api.getSession(ctx.workerContext.req.raw);

            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must be logged in to view daily summary"
                });
            }
            try {
                // Calculate start and end of today in user's timezone
                const now = DateTime.now().setZone(timezone);
                const startOfDay = now.startOf('day');
                const endOfDay = startOfDay.plus({ days: 1 });
                // Get all food logs for today
                const { results } = await ctx.workerContext.env.DB.prepare(`
                    SELECT * FROM food_logs
                    WHERE user_id = ? 
                    AND timestamp >= ? 
                    AND timestamp < ?
                `).bind(
                    session.user.id,
                    startOfDay.toMillis(),
                    endOfDay.toMillis()
                ).all();

                // Calculate total macros
                const totalCalories = results.reduce((sum, log) => sum + Number(log.calories || 0), 0);
                const totalProtein = results.reduce((sum, log) => sum + Number(log.protein || 0), 0);
                const totalCarbs = results.reduce((sum, log) => sum + Number(log.carbs || 0), 0);
                const totalFat = results.reduce((sum, log) => sum + Number(log.fat || 0), 0);

                return {
                    date: startOfDay.toISO(),
                    totalCalories,
                    totalProtein,
                    totalCarbs,
                    totalFat,
                    logCount: results.length
                };
            } catch (error) {
                console.error("Error calculating daily summary:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to calculate daily summary"
                });
            }
        })
}); 