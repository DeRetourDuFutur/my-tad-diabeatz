
import type { FoodCategory } from '@/lib/food-data';
import type { Timestamp } from 'firebase/firestore';

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
  id: string; // Document ID from Firestore
  name: string;
  createdAt: Timestamp | string; // Firestore Timestamp or ISO string for new plans
}

export interface FormSettings {
  planName?: string;
  diabeticResearchSummary: string;
  // foodPreferences are now stored in Firestore directly
  selectionMode?: 'dates' | 'duration';
  startDate?: string; // ISO string for localStorage (for "Par Dates" mode)
  endDate?: string; // ISO string for localStorage (for "Par Dates" mode)
  durationInDays?: string; // For "Par Durée" mode
  durationModeStartDate?: string; // ISO string for localStorage (start date for "Par Durée" mode)
}
