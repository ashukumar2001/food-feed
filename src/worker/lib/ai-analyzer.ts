import { createWorkersAI } from 'workers-ai-provider';
import { generateObject } from 'ai';
import { z } from 'zod';

// Define the output schema for macros
export const macrosSchema = z.object({
    calories: z.number().describe('Estimated total calories'),
    protein: z.number().describe('Estimated grams of protein'),
    carbs: z.number().describe('Estimated grams of carbohydrates'),
    fat: z.number().describe('Estimated grams of fat'),
});

/**
 * Analyzes food name and description to estimate macros using Cloudflare Workers AI.
 * @param env - Cloudflare Worker environment (must include AI binding)
 * @param name - Food name
 * @param description - Food description
 * @returns Object with calories, protein, carbs, and fat
 */
export async function analyzeFoodMacros(env: Env, name: string, description: string) {
    const workersai = createWorkersAI({ binding: env.AI });
    const prompt = `Analyze the following food and estimate the macros (calories in Kcal and protein, carbs, fat are in grams). Return only numbers.\nFood name: ${name}\nDescription: ${description}`;

    const result = await generateObject({
        model: workersai("@cf/meta/llama-3.1-8b-instruct"),
        prompt,
        schema: z.object({
            calories: z.number(),
            protein: z.number(),
            carbs: z.number(),
            fat: z.number(),
        }),
    });
    return result.object;
} 