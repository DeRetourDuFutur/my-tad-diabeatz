
import type { GenerateMealPlanOutput as GenkitMealPlanOutput } from '@/ai/flows/generate-meal-plan';

// We redefine or infer types here for use in UI components to decouple them slightly from the direct Genkit output type if needed,
// or to extend them. For now, StoredMealPlan will be very close to GenkitMealPlanOutput.

export type MealItem = {
  title: string;
  preparationTime: string;
  ingredients: string;
  recipe: string;
  tips?: string;
};

export type DailyMealPlan = {
  dayIdentifier: string;
  breakfast: MealItem;
  morningSnack?: MealItem;
  lunch: MealItem;
  afternoonSnack?: MealItem;
  dinner: MealItem;
};

export interface GenerateMealPlanOutput {
  days: DailyMealPlan[];
}

export interface StoredMealPlan extends GenerateMealPlanOutput {
  id: string;
  name: string;
  createdAt: string; // ISO date string
}

