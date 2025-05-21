
"use client";

import { useEffect } from "react"; // Importer useEffect
import type { GenerateMealPlanOutput, DailyMealPlan, MealItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Save, Utensils, Lightbulb, Clock, ClipboardList } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MealPlanDisplayProps = {
  mealPlan: GenerateMealPlanOutput | null;
  mealPlanName?: string;
  onSavePlan: () => void;
};

const mealTypes: Array<{ key: keyof Omit<DailyMealPlan, 'dayIdentifier'>; title: string }> = [
  { key: "breakfast", title: "Petit-déjeuner" },
  { key: "morningSnack", title: "Collation du Matin" },
  { key: "lunch", title: "Déjeuner" },
  { key: "afternoonSnack", title: "Collation de l'Après-midi" },
  { key: "dinner", title: "Dîner" },
] as const;


export function MealPlanDisplay({ mealPlan, mealPlanName, onSavePlan }: MealPlanDisplayProps) {
  useEffect(() => {
    // Helper style for TabsList grid - moved into useEffect
    const styleId = "tabs-grid-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .grid-cols-minmax-100px-auto {
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        }
      `;
      document.head.appendChild(style);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!mealPlan || !mealPlan.days || mealPlan.days.length === 0) {
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
              {mealPlanName ? `Plan Repas: ${mealPlanName}` : `Plan Repas (${mealPlan.days.length} jour${mealPlan.days.length > 1 ? 's' : ''})`}
            </CardTitle>
            <CardDescription>Voici votre plan repas personnalisé pour diabétiques de type 2.</CardDescription>
          </div>
          <Button onClick={onSavePlan} size="sm" variant="outline">
            <Save className="mr-2 h-4 w-4" />
            {mealPlanName ? "Mettre à jour" : "Sauvegarder"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={mealPlan.days[0]?.dayIdentifier || "day-0"} className="w-full">
          <TabsList className="grid w-full grid-cols-minmax-100px-auto gap-1 mb-4 h-auto flex-wrap justify-start">
            {mealPlan.days.map((day, index) => (
              <TabsTrigger key={day.dayIdentifier || `day-${index}`} value={day.dayIdentifier || `day-${index}-trigger`} className="flex-1 min-w-[100px] data-[state=active]:shadow-md">
                {day.dayIdentifier || `Jour ${index + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollArea className="h-[calc(100vh-380px)] lg:h-auto lg:max-h-[calc(100vh-320px)] pr-4 -mr-4">
            {mealPlan.days.map((day, dayIndex) => (
              <TabsContent key={day.dayIdentifier || `day-content-${dayIndex}`} value={day.dayIdentifier || `day-content-${dayIndex}-trigger`}>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {mealTypes.map((mealTypeInfo) => {
                    const mealDetails = day[mealTypeInfo.key] as MealItem | undefined; // Cast because snacks are optional
                    if (!mealDetails || !mealDetails.title) return null; 

                    let hasPreviousContent = false;

                    return (
                      <Card key={`${day.dayIdentifier}-${mealTypeInfo.key}`} className="flex flex-col bg-card shadow-md">
                        <CardHeader>
                          <CardTitle className="flex items-center text-xl">
                            <Utensils className="mr-3 h-6 w-6 text-primary" />
                            {mealDetails.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-muted-foreground pt-1">{mealTypeInfo.title}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                          {mealDetails.preparationTime && (
                            <div>
                              <h4 className="font-semibold mb-1.5 text-md text-foreground/90 flex items-center">
                                <Clock className="mr-2 h-5 w-5 text-primary" />
                                Temps de préparation :
                              </h4>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {mealDetails.preparationTime}
                              </p>
                              { (hasPreviousContent = true) }
                            </div>
                          )}

                          {mealDetails.ingredients && (
                             <div className={`${hasPreviousContent ? 'pt-3 border-t border-border/70' : ''}`}>
                              <h4 className="font-semibold mb-1.5 text-md text-foreground/90 flex items-center">
                                <ClipboardList className="mr-2 h-5 w-5 text-primary" />
                                Ingrédients :
                              </h4>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {mealDetails.ingredients}
                              </p>
                              { (hasPreviousContent = true) }
                            </div>
                          )}
                          
                          {mealDetails.recipe && (
                            <div className={`${hasPreviousContent ? 'pt-3 border-t border-border/70' : ''}`}>
                              <h4 className="font-semibold mb-1.5 text-md text-foreground/90">Recette :</h4>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {mealDetails.recipe}
                              </p>
                              { (hasPreviousContent = true) }
                            </div>
                          )}

                          {mealDetails.tips && mealDetails.tips.trim() !== "" && (
                            <div className={`${hasPreviousContent ? 'pt-3 border-t border-border/70' : ''}`}>
                              <h4 className="font-semibold mb-1.5 text-md text-foreground/90 flex items-center">
                                <Lightbulb className="mr-2 h-5 w-5 text-accent" />
                                Conseils :
                              </h4>
                              <p className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                {mealDetails.tips}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-4 border-t">
        <p>Ce plan repas est généré par IA et doit être examiné par un professionnel de santé ou un diététicien.</p>
      </CardFooter>
    </Card>
  );
}
