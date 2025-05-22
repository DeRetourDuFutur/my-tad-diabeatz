
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
  planName: z.string().optional().describe("Le nom optionnel donné au plan repas par l'utilisateur avant la génération."),
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
  planDuration: z.string().describe("La durée pour laquelle générer le plan de repas (par exemple, '1 jour', '3 jours', '1 semaine').")
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

// This schema represents a single dish/component of a meal
const MealComponentSchema = z.object({
  title: z.string().describe("Le nom ou le titre du plat/composant (ex: 'Salade de concombres', 'Saumon grillé aux herbes', 'Compote de pommes sans sucre ajouté')."),
  preparationTime: z.string().describe("Le temps de préparation estimé pour ce plat/composant (par exemple, 'Environ 15 minutes')."),
  ingredients: z.string().describe("La liste des ingrédients nécessaires pour ce plat/composant. Chaque ingrédient doit être sur une nouvelle ligne, précédé d'un tiret."),
  recipe: z.string().describe("La recette détaillée pour ce plat/composant, avec chaque étape numérotée et sur une nouvelle ligne."),
  tips: z.string().optional().describe("Conseils, astuces ou notes supplémentaires concernant ce plat/composant. Ce champ est optionnel.")
});

const BreakfastSchema = z.object({
  mainItem: MealComponentSchema.describe("Détails structurés pour l'élément principal du petit-déjeuner."),
  waterToDrink: z.string().describe("Quantité d'eau recommandée à boire avec le petit-déjeuner (ex: '1 grand verre d'eau (250ml)')."),
});

const LunchDinnerSchema = z.object({
  starter: MealComponentSchema.optional().describe("Détails structurés pour l'entrée (optionnel)."),
  mainCourse: MealComponentSchema.describe("Détails structurés pour le plat principal, incluant son accompagnement."),
  cheese: MealComponentSchema.optional().describe("Détails structurés pour le fromage (optionnel)."),
  dessert: MealComponentSchema.optional().describe("Détails structurés pour le dessert (optionnel)."),
  waterToDrink: z.string().describe("Quantité d'eau recommandée à boire avec le repas (ex: '2 verres d'eau (500ml)').")
});

const DailyMealPlanSchema = z.object({
  dayIdentifier: z.string().describe("Identifiant du jour (par exemple, 'Jour 1', 'Lundi')."),
  breakfast: BreakfastSchema.describe('Détails structurés pour le petit-déjeuner.'),
  morningSnack: MealComponentSchema.optional().describe('Détails structurés pour la collation du matin (optionnel, suivant MealComponentSchema).'),
  lunch: LunchDinnerSchema.describe('Détails structurés pour le déjeuner.'),
  afternoonSnack: MealComponentSchema.optional().describe('Détails structurés pour la collation de l\'après-midi (optionnel, suivant MealComponentSchema).'),
  dinner: LunchDinnerSchema.describe('Détails structurés pour le dîner.'),
});

const GenerateMealPlanOutputSchema = z.object({
  days: z.array(DailyMealPlanSchema).describe("Liste des plans journaliers pour la durée spécifiée.")
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;

export async function generateMealPlan(
  input: GenerateMealPlanInput
): Promise<GenerateMealPlanOutput> {
  try {
    const result = await generateMealPlanFlow(input);
    if (!result) {
      // This case should ideally be handled by generateMealPlanFlow throwing an error
      throw new Error("L'IA n'a pas réussi à générer un plan (pas de résultat).");
    }
    return result;
  } catch (error: any) {
    console.error("[generateMealPlan Flow Error]", error);
    // Re-throw a more user-friendly or generic error if needed,
    // or let the original error propagate if it's informative enough.
    // For Vercel, the original error might be more useful in logs.
    throw new Error(error.message || "Une erreur est survenue lors de la communication avec le service d'IA.");
  }
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: {schema: GenerateMealPlanInputSchema},
  output: {schema: GenerateMealPlanOutputSchema},
  prompt: `Vous êtes un diététicien agréé spécialisé dans les plans de repas pour le diabète de type 2.

  Générez un plan repas EN FRANÇAIS pour la durée spécifiée : {{{planDuration}}}.
  Pour CHAQUE JOUR de cette durée, créez un plan quotidien.
  Chaque plan quotidien ("DailyMealPlanSchema") doit avoir un "dayIdentifier" (par exemple, "Jour 1", "Lundi").

  Pour le PETIT-DÉJEUNER ("BreakfastSchema") de chaque jour :
  - Fournissez un "mainItem" (élément principal) détaillé selon "MealComponentSchema".
  - Spécifiez "waterToDrink" (quantité d'eau à boire, ex: "1 grand verre d'eau (250ml)").

  Pour le DÉJEUNER et le DÎNER ("LunchDinnerSchema") de chaque jour :
  - Fournissez "starter" (entrée, optionnelle) selon "MealComponentSchema".
  - Fournissez "mainCourse" (plat principal AVEC son accompagnement clairement inclus dans sa description/recette) selon "MealComponentSchema".
  - Fournissez "cheese" (fromage, optionnel) selon "MealComponentSchema".
  - Fournissez "dessert" (dessert, optionnel) selon "MealComponentSchema".
  - Spécifiez "waterToDrink" (quantité d'eau à boire pour le repas, ex: "2 verres d'eau (500ml)").

  Pour les COLLATIONS (morningSnack, afternoonSnack), si présentes :
  - Elles sont optionnelles et doivent suivre "MealComponentSchema" (pas de sous-plats comme entrée/plat/dessert). Il n'est pas nécessaire de spécifier "waterToDrink" pour les collations.

  Chaque "MealComponentSchema" (utilisé pour chaque plat/composant/collation) doit contenir :
  1.  Un "title" (titre) clair et concis.
  2.  Un "preparationTime" (temps de préparation) estimé (par exemple, "Environ 20 minutes").
  3.  Une liste d'"ingredients" (ingrédients) nécessaires. Chaque ingrédient doit être sur une NOUVELLE LIGNE, idéalement précédé d'un tiret et d'un espace (ex: "- 100g de saumon\\n- 1 courgette").
  4.  Une "recipe" (recette) détaillée. CHAQUE étape doit être NUMÉROTÉE et commencer sur une NOUVELLE LIGNE (ex: "1. Lavez les légumes.\\n2. Faites cuire le poisson à la vapeur...").
  5.  Des "tips" (conseils) pertinents et utiles. Ce champ "tips" est optionnel.

  Aliments Disponibles (ceux à utiliser) :
  {{{availableFoods}}}
  Important: Les aliments suivis de la mention "(favori)" sont particulièrement appréciés par l'utilisateur. Essayez de les intégrer plus souvent dans le plan repas, tout en assurant la variété et l'équilibre nutritionnel. Variez les repas d'un jour à l'autre si la durée du plan est supérieure à 1 jour.

  {{#if foodsToAvoid}}
  Aliments à ÉVITER ABSOLUMENT (ne pas utiliser dans le plan, car non aimés ou allergènes) :
  {{{foodsToAvoid}}}
  Il est IMPÉRATIF de ne PAS inclure ces aliments dans le plan repas.
  {{/if}}

  Résumé de la Recherche sur le Diabète : {{{diabeticResearchSummary}}}

  Assurez-vous que chaque plat, composant de repas et collation soit approprié pour un diabétique de type 2, en tenant compte de facteurs tels que la teneur en glucides, l'indice glycémique et la taille des portions.
  Toutes les descriptions, titres, recettes et conseils doivent être rédigés EN FRANÇAIS.

  Le format de sortie DOIT être un objet JSON valide respectant le schéma "GenerateMealPlanOutputSchema", contenant un tableau "days". Chaque élément du tableau "days" doit respecter "DailyMealPlanSchema".
  Exemple de structure pour le déjeuner d'UN jour:
  "lunch": {
    "starter": { "title": "...", "preparationTime": "...", "ingredients": "...", "recipe": "...", "tips": "..." }, // Optionnel
    "mainCourse": { "title": "Plat Principal avec Accompagnement", "preparationTime": "...", "ingredients": "...", "recipe": "...", "tips": "..." },
    "cheese": { "title": "...", "preparationTime": "...", "ingredients": "...", "recipe": "...", "tips": "..." }, // Optionnel
    "dessert": { "title": "...", "preparationTime": "...", "ingredients": "...", "recipe": "...", "tips": "..." }, // Optionnel
    "waterToDrink": "Environ 500ml d'eau"
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
    const {output, usage} = await prompt(input); // LLM call
    if (!output) {
      console.error('AI prompt did not return an output. Usage data:', usage);
      // Consider logging more details about the input or other context if helpful
      throw new Error("L'IA n'a pas pu générer de plan. Le prompt n'a pas retourné de sortie.");
    }
    return output;
  }
);

