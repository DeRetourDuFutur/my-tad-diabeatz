
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

const MealItemSchema = z.object({
  title: z.string().describe("Le nom ou le titre du plat/repas."),
  recipe: z.string().describe("La recette détaillée pour la préparation du plat/repas."),
  tips: z.string().optional().describe("Conseils, astuces ou notes supplémentaires concernant ce plat/repas. Ce champ est optionnel.")
});

const GenerateMealPlanOutputSchema = z.object({
  breakfast: MealItemSchema.describe('Détails structurés pour le petit-déjeuner, incluant titre, recette et conseils.'),
  morningSnack: MealItemSchema.describe('Détails structurés pour la collation du matin, incluant titre, recette et conseils.'),
  lunch: MealItemSchema.describe('Détails structurés pour le déjeuner, incluant titre, recette et conseils.'),
  afternoonSnack: MealItemSchema.describe('Détails structurés pour la collation de l\'après-midi, incluant titre, recette et conseils.'),
  dinner: MealItemSchema.describe('Détails structurés pour le dîner, incluant titre, recette et conseils.'),
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
  Le plan de repas doit inclure pour chaque section (petit-déjeuner, collation du matin, déjeuner, collation de l'après-midi, dîner) les éléments suivants, structurés en JSON :
  1.  Un "title" (titre) clair et concis pour le plat ou le repas.
  2.  Une "recipe" (recette) détaillée, étape par étape, pour la préparation.
  3.  Des "tips" (conseils) pertinents et utiles, ou des astuces pour ce repas. Ce champ "tips" est optionnel; s'il n'y a pas de conseil spécifique, vous pouvez omettre ce champ ou le laisser vide.

  Aliments Disponibles : {{{availableFoods}}}
  Résumé de la Recherche sur le Diabète : {{{diabeticResearchSummary}}}

  Assurez-vous que chaque repas et collation soit approprié pour un diabétique de type 2, en tenant compte de facteurs tels que la teneur en glucides, l'indice glycémique et la taille des portions.
  Toutes les descriptions, titres, recettes et conseils doivent être rédigés EN FRANÇAIS.

  Le format de sortie DOIT être un objet JSON valide respectant le schéma fourni. Pour chaque clé de repas (breakfast, morningSnack, lunch, afternoonSnack, dinner), la valeur doit être un objet contenant les clés "title", "recipe", et optionnellement "tips".
  Exemple pour un repas:
  "breakfast": {
    "title": "Exemple de Titre de Petit Déjeuner",
    "recipe": "1. Griller une tranche de pain complet. 2. Tartiner avec de l'avocat écrasé. 3. Saupoudrer de graines de chia.",
    "tips": "Pour plus de protéines, ajoutez un œuf poché."
  }
  `,
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

