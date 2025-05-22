
import type { FoodCategory } from '@/lib/food-data';

// This represents a single dish or component of a meal
export type MealComponent = {
  title: string;
  preparationTime: string;
  ingredients: string;
  recipe: string;
  tips?: string;
};

export type Breakfast = {
  mainItem: MealComponent;
  waterToDrink: string;
};

export type LunchDinner = {
  starter?: MealComponent;
  mainCourse: MealComponent;
  cheese?: MealComponent;
  dessert?: MealComponent;
  waterToDrink: string;
};

export type DailyMealPlan = {
  dayIdentifier: string;
  breakfast: Breakfast;
  morningSnack?: MealComponent; // Snacks are single components
  lunch: LunchDinner;
  afternoonSnack?: MealComponent; // Snacks are single components
  dinner: LunchDinner;
};

export interface GenerateMealPlanOutput {
  days: DailyMealPlan[];
}

export interface StoredMealPlan extends GenerateMealPlanOutput {
  id: string;
  name: string;
  createdAt: string; // ISO date string
}

export interface FormSettings {
  planName?: string;
  // planDuration: string; // Removed as per user request
  diabeticResearchSummary: string;
  foodPreferences: FoodCategory[];
  startDate?: string; // ISO string for localStorage
  endDate?: string; // ISO string for localStorage
}

