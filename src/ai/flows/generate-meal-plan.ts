
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
      "Une liste d'aliments préférés et disponibles que l'utilisateur peut manger. Chaque aliment peut être sur une nouvelle ligne ou les aliments peuvent être séparés par des virgules. Les aliments marqués avec '(favori)' à la fin de leur nom sont particulièrement appréciés et devraient être inclus plus fréquemment si possible."
    ),
  foodsToAvoid: z
    .string()
    .optional()
    .describe(
      "Une liste d'aliments à éviter ABSOLUMENT car l'utilisateur ne les aime pas ou y est allergique/intolérant. Chaque aliment sur une nouvelle ligne."
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
  preparationTime: z.string().describe("Le temps de préparation estimé pour le plat/repas (par exemple, 'Environ 20 minutes')."),
  ingredients: z.string().describe("La liste des ingrédients nécessaires pour la recette. Chaque ingrédient doit être sur une nouvelle ligne, précédé d'un tiret (par exemple, '- 100g de poulet\\n- 1/2 oignon')."),
  recipe: z.string().describe("La recette détaillée, avec chaque étape numérotée et sur une nouvelle ligne (par exemple, '1. Couper les légumes.\\n2. Cuire le poulet...')."),
  tips: z.string().optional().describe("Conseils, astuces ou notes supplémentaires concernant ce plat/repas. Ce champ est optionnel.")
});

const GenerateMealPlanOutputSchema = z.object({
  breakfast: MealItemSchema.describe('Détails structurés pour le petit-déjeuner.'),
  morningSnack: MealItemSchema.describe('Détails structurés pour la collation du matin.'),
  lunch: MealItemSchema.describe('Détails structurés pour le déjeuner.'),
  afternoonSnack: MealItemSchema.describe('Détails structurés pour la collation de l\'après-midi.'),
  dinner: MealItemSchema.describe('Détails structurés pour le dîner.'),
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

  En fonction des aliments disponibles (ceux que l'utilisateur aime et peut manger) et des recherches récentes sur le diabète, créez un plan de repas quotidien EN FRANÇAIS.
  Le plan de repas doit inclure pour chaque section (petit-déjeuner, collation du matin, déjeuner, collation de l'après-midi, dîner) les éléments suivants, structurés en JSON :
  1.  Un "title" (titre) clair et concis pour le plat ou le repas.
  2.  Un "preparationTime" (temps de préparation) estimé (par exemple, "Environ 30 minutes").
  3.  Une liste d'"ingredients" (ingrédients) nécessaires. Chaque ingrédient doit être sur une nouvelle ligne, idéalement précédé d'un tiret et d'un espace (ex: "- 100g de saumon\\n- 1 courgette").
  4.  Une "recipe" (recette) détaillée. CHAQUE étape doit être NUMÉROTÉE et commencer sur une NOUVELLE LIGNE (ex: "1. Lavez les légumes.\\n2. Faites cuire le poisson à la vapeur...").
  5.  Des "tips" (conseils) pertinents et utiles, ou des astuces pour ce repas. Ce champ "tips" est optionnel; s'il n'y a pas de conseil spécifique, vous pouvez omettre ce champ ou le laisser vide.

  Aliments Disponibles (ceux à utiliser) :
  {{{availableFoods}}}
  Important: Les aliments suivis de la mention "(favori)" sont particulièrement appréciés par l'utilisateur. Essayez de les intégrer plus souvent dans le plan repas, tout en assurant la variété et l'équilibre nutritionnel.

  {{#if foodsToAvoid}}
  Aliments à ÉVITER ABSOLUMENT (ne pas utiliser dans le plan, car non aimés ou allergènes) :
  {{{foodsToAvoid}}}
  Il est IMPÉRATIF de ne PAS inclure ces aliments dans le plan repas.
  {{/if}}

  Résumé de la Recherche sur le Diabète : {{{diabeticResearchSummary}}}

  Assurez-vous que chaque repas et collation soit approprié pour un diabétique de type 2, en tenant compte de facteurs tels que la teneur en glucides, l'indice glycémique et la taille des portions.
  Toutes les descriptions, titres, recettes et conseils doivent être rédigés EN FRANÇAIS.

  Le format de sortie DOIT être un objet JSON valide respectant le schéma fourni. Pour chaque clé de repas (breakfast, morningSnack, lunch, afternoonSnack, dinner), la valeur doit être un objet contenant les clés "title", "preparationTime", "ingredients", "recipe", et optionnellement "tips".
  Exemple pour un repas:
  "breakfast": {
    "title": "Exemple de Titre de Petit Déjeuner",
    "preparationTime": "Environ 10 minutes",
    "ingredients": "- 1 tranche de pain complet\\n- 1/2 avocat mûr\\n- 1 c.à.c de graines de chia\\n- Une pincée de sel et de poivre",
    "recipe": "1. Griller la tranche de pain complet jusqu'à ce qu'elle soit dorée.\\n2. Pendant ce temps, écraser l'avocat à la fourchette dans un petit bol. Assaisonner avec le sel et le poivre.\\n3. Étaler l'avocat écrasé sur le pain grillé.\\n4. Saupoudrer de graines de chia.",
    "tips": "Pour plus de protéines, ajoutez un œuf poché sur le dessus. Vous pouvez aussi ajouter quelques gouttes de jus de citron à l'avocat pour éviter qu'il ne noircisse."
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
