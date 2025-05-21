"use client";

import type { GenerateMealPlanOutput } from "@/ai/flows/generate-meal-plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Save, Utensils } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type MealPlanDisplayProps = {
  mealPlan: GenerateMealPlanOutput | null;
  mealPlanName?: string;
  onSavePlan: () => void; // Callback to initiate saving process (e.g., open dialog for name)
};

const mealTypes = [
  { key: "breakfast", title: "Petit-déjeuner" },
  { key: "morningSnack", title: "Collation du Matin" },
  { key: "lunch", title: "Déjeuner" },
  { key: "afternoonSnack", title: "Collation de l'Après-midi" },
  { key: "dinner", title: "Dîner" },
] as const;


export function MealPlanDisplay({ mealPlan, mealPlanName, onSavePlan }: MealPlanDisplayProps) {
  if (!mealPlan) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center shadow-lg">
        <ChefHat className="h-16 w-16 text-muted-foreground mb-4" />
        <CardTitle className="text-xl mb-2">Votre Plan Repas Apparaîtra Ici</CardTitle>
        <CardDescription>
          Utilisez le formulaire pour générer un nouveau plan repas personnalisé.
        </CardDescription>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-1">
              {mealPlanName ? `Plan Repas: ${mealPlanName}` : "Nouveau Plan Repas"}
            </CardTitle>
            <CardDescription>Voici votre plan repas quotidien personnalisé pour diabétiques de type 2.</CardDescription>
          </div>
          <Button onClick={onSavePlan} size="sm" variant="outline">
            <Save className="mr-2 h-4 w-4" />
            {mealPlanName ? "Mettre à jour" : "Sauvegarder"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-280px)] lg:h-auto lg:max-h-[calc(100vh-220px)] pr-4">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {mealTypes.map((mealType) => (
              <Card key={mealType.key} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Utensils className="mr-2 h-5 w-5 text-primary" />
                    {mealType.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm whitespace-pre-wrap">
                    {mealPlan[mealType.key] || "Aucune recette fournie."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>Ce plan repas est généré par IA et doit être examiné par un professionnel de santé ou un diététicien.</p>
      </CardFooter>
    </Card>
  );
}
