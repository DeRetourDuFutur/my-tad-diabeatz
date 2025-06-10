import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calcule l'Indice de Masse Corporelle (IMC) à partir de la taille en centimètres et du poids en kilogrammes.
 * @param heightCm - La taille en centimètres
 * @param weightKg - Le poids en kilogrammes
 * @returns L'IMC calculé avec deux décimales
 */
export function calculateBMI(heightCm: number, weightKg: number): number {
  // Convertir la taille en mètres
  const heightM = heightCm / 100;
  // Calculer l'IMC : poids / (taille²)
  const bmi = weightKg / (heightM * heightM);
  // Arrondir à deux décimales
  return Math.round(bmi * 100) / 100;
}
