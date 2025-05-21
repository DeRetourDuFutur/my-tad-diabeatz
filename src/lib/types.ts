import type { GenerateMealPlanOutput } from '@/ai/flows/generate-meal-plan';

export interface StoredMealPlan extends GenerateMealPlanOutput {
  id: string;
  name: string;
  createdAt: string; // ISO date string
}
