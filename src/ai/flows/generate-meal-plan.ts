// This file is machine-generated - do not edit!

'use server';

/**
 * @fileOverview Generates a personalized daily meal plan for Type 2 Diabetes.
 *
 * - generateMealPlan - A function that generates the meal plan.
 * - GenerateMealPlanInput - The input type for the generateMealPlan function.
 * - GenerateMealPlanOutput - The return type for the generateMealPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMealPlanInputSchema = z.object({
  availableFoods: z
    .string()
    .describe(
      'A comma-separated list of foods available for use in the meal plan.'
    ),
  diabeticResearchSummary: z
    .string()
    .describe(
      'A summary of recent diabetic research and best practices for meal planning.'
    ),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

const GenerateMealPlanOutputSchema = z.object({
  breakfast: z.string().describe('Recipe for breakfast.'),
  morningSnack: z.string().describe('Recipe for morning snack.'),
  lunch: z.string().describe('Recipe for lunch.'),
  afternoonSnack: z.string().describe('Recipe for afternoon snack.'),
  dinner: z.string().describe('Recipe for dinner.'),
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;

export async function generateMealPlan(
  input: GenerateMealPlanInput
): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: {schema: GenerateMealPlanInputSchema},
  output: {schema: GenerateMealPlanOutputSchema},
  prompt: `You are a registered dietician specializing in meal plans for Type 2 Diabetes.

  Based on the available foods and recent diabetic research, create a daily meal plan.
  The meal plan should include recipes for breakfast, morning snack, lunch, afternoon snack, and dinner.

  Available Foods: {{{availableFoods}}}
  Diabetic Research Summary: {{{diabeticResearchSummary}}}

  Ensure that each meal and snack is appropriate for a Type 2 Diabetic, considering factors like carbohydrate content, glycemic index, and portion size.

  Breakfast:
  Morning Snack:
  Lunch:
  Afternoon Snack:
  Dinner:`,
});

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
