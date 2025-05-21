
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
  prompt: `Vous êtes un diététicien agréé spécialisé dans les plans de repas pour le diabète de type 2.

  En fonction des aliments disponibles et des recherches récentes sur le diabète, créez un plan de repas quotidien EN FRANÇAIS.
  Le plan de repas doit inclure des recettes EN FRANÇAIS pour le petit-déjeuner, la collation du matin, le déjeuner, la collation de l'après-midi et le dîner.

  Aliments Disponibles : {{{availableFoods}}}
  Résumé de la Recherche sur le Diabète : {{{diabeticResearchSummary}}}

  Assurez-vous que chaque repas et collation soit approprié pour un diabétique de type 2, en tenant compte de facteurs tels que la teneur en glucides, l'indice glycémique et la taille des portions.
  Toutes les descriptions et les recettes doivent être rédigées EN FRANÇAIS.

  Petit-déjeuner:
  Collation du Matin:
  Déjeuner:
  Collation de l'Après-midi:
  Dîner:`,
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

