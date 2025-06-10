
import type { FoodCategory, FoodItem } from '@/lib/food-data';
export type { FoodCategory, FoodItem };
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
  selectionMode?: 'dates' | 'duration';
  startDate?: string; // ISO string for localStorage (for "Par Dates" mode)
  endDate?: string; // ISO string for localStorage (for "Par Dates" mode)
  durationInDays?: string; // For "Par Durée" mode
  durationModeStartDate?: string; // ISO string for localStorage (start date for "Par Durée" mode)
}

export interface SavedFormSettings extends FormSettings {
  id: string; // Unique ID for the saved settings (e.g., Firestore document ID or timestamp-based)
  name: string; // User-defined name for this settings configuration (e.g., "Régime Strict", "Weekend Léger")
  createdAt?: Timestamp | string; // Optional: Timestamp of when the settings were saved
}

export type FormSettingsHistory = SavedFormSettings[];

export type ReminderFrequency = 'daily' | 'everyXdays' | 'specificDays' | 'asNeeded';

export interface MedicationReminder {
  frequency: ReminderFrequency;
  intervalDays?: number; // For 'everyXdays'
  specificDays?: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[]; // For 'specificDays'
  times: string[]; // Array of times, e.g., ["08:00", "20:00"]
}

export interface Medication {
  id: string;
  name: string;
  description: string; // Rôle du médicament
  strength?: string; // ex: "500mg", "10mg/ml"
  form?: 'comprimé' | 'gélule'; // Format du médicament
  shape?: 'rond' | 'ovale' | 'rectangle' | 'losange' | 'carré' | 'triangle' | 'pentagone' | 'hexagone' | 'octogone' | 'sécable' | 'standard' | 'longue' | 'molle' | 'deux pièces' | 'oblongue'; // Aspect du médicament
  color?: string; // Couleur indicative du médicament (ex: "blue", "#FF5733")
  stock: number; // Quantité restante
  lowStockThreshold?: number; // Seuil pour alerte de stock bas
  instructions: string; // Posologie et instructions de prise
  reminder?: MedicationReminder;
  // lastTaken?: string; // ISO string - pour une future fonctionnalité de suivi
  // nextDueDate?: string; // ISO string - pour une future fonctionnalité de rappel
}

export type UserRole = 'Admin' | 'Utilisateur';

export interface UserProfile {
  uid: string;
  email: string | null;
  firstName?: string;
  lastName?: string;
  displayName?: string; // Fallback if firstName or lastName is not set
  photoURL?: string | null;
  age?: number;
  height?: number; // in cm
  weight?: number; // in kg
  bmi?: number; // Calculated
  bio?: string;
  phoneNumber?: string;
  role: UserRole;
  allergies?: string;
  pathologies?: string;
  // Firebase user properties that we might want to sync or use
  emailVerified: boolean;
  isAnonymous: boolean;
  providerData: any[]; // from firebase.User.providerData
  createdAt?: string; // from firebase.User.metadata.creationTime
  lastLoginAt?: string; // from firebase.User.metadata.lastSignInTime
}

