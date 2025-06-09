// types.ts
// types.ts
// Définitions de types et interfaces partagées pour le formulaire de plan de repas

import type { FoodItem, Medication } from "@/lib/types";

export type MealPlanFormProps = {
  onMealPlanGenerated: (mealPlan: any, planName?: string) => void; // TODO: Remplacer any par GenerateMealPlanOutput
  onGenerationError: (error: string) => void;
  medications: Medication[]; // Added medications prop
};

export type EditableNutritionalInfo = Omit<FoodItem, 'id' | 'name' | 'ig' | 'isFavorite' | 'isDisliked' | 'isAllergenic'>;

export type NewFoodData = Omit<FoodItem, 'id' | 'isFavorite' | 'isDisliked' | 'isAllergenic'> & { categoryName: string };

// Il serait peut-être préférable de déplacer initialNewFoodData vers useMealPlanFormLogic.ts
// export const initialNewFoodData: NewFoodData = {
//   name: "",
//   categoryName: "",
//   ig: "",
//   calories: "",
//   carbs: "",
//   protein: "",
//   fat: "",
//   sugars: "",
//   fiber: "",
//   sodium: "",
//   notes: "",
// };