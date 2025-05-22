
"use client";

import { useEffect } from "react";
import type { GenerateMealPlanOutput, DailyMealPlan, MealComponent, Breakfast, LunchDinner } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Save, Utensils, Lightbulb, Clock, ClipboardList, GlassWater, Soup, Beef, Apple, Grape, Cookie } from "lucide-react"; // Changed CheeseIcon to Grape, Added Cookie for snacks
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MealPlanDisplayProps = {
  mealPlan: GenerateMealPlanOutput | null;
  mealPlanName?: string;
  onSavePlan: () => void;
};

// Helper function to render a single meal component (dish)
const MealComponentCard: React.FC<{ component: MealComponent; typeTitle?: string; isSnack?: boolean }> = ({ component, typeTitle, isSnack }) => {
  if (!component || !component.title) return null;

  let hasPreviousContent = false;
  
  let IconForType = Utensils;
  if (isSnack) IconForType = Cookie;
  else if (typeTitle === "Entrée") IconForType = Soup;
  else if (typeTitle === "Plat Principal") IconForType = Beef;
  else if (typeTitle === "Fromage") IconForType = Grape; 
  else if (typeTitle === "Dessert") IconForType = Apple;


  return (
    <Card className="flex flex-col bg-card/60 dark:bg-card/80 shadow-md mt-4 first:mt-0 rounded-lg border-border/50">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="flex items-center text-md font-semibold">
          <IconForType className="mr-2.5 h-5 w-5 text-primary" />
          {component.title}
        </CardTitle>
        {typeTitle && !isSnack && <CardDescription className="text-xs text-muted-foreground pt-0.5 pl-1">{typeTitle}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow space-y-2.5 text-sm px-4 pb-4">
        {component.preparationTime && (
          <div>
            <h4 className="font-medium mb-0.5 text-xs text-foreground/90 flex items-center">
              <Clock className="mr-1.5 h-3.5 w-3.5 text-primary/80" />
              Temps de préparation :
            </h4>
            <p className="text-xs whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {component.preparationTime}
            </p>
            { (hasPreviousContent = true) }
          </div>
        )}

        {component.ingredients && (
            <div className={`${hasPreviousContent ? 'pt-2 border-t border-border/50' : ''}`}>
            <h4 className="font-medium mb-0.5 text-xs text-foreground/90 flex items-center">
              <ClipboardList className="mr-1.5 h-3.5 w-3.5 text-primary/80" />
              Ingrédients :
            </h4>
            <p className="text-xs whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {component.ingredients}
            </p>
            { (hasPreviousContent = true) }
          </div>
        )}
        
        {component.recipe && (
          <div className={`${hasPreviousContent ? 'pt-2 border-t border-border/50' : ''}`}>
            <h4 className="font-medium mb-0.5 text-xs text-foreground/90">Recette :</h4>
            <p className="text-xs whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {component.recipe}
            </p>
            { (hasPreviousContent = true) }
          </div>
        )}

        {component.tips && component.tips.trim() !== "" && (
          <div className={`${hasPreviousContent ? 'pt-2 border-t border-border/50' : ''}`}>
            <h4 className="font-medium mb-0.5 text-xs text-foreground/90 flex items-center">
              <Lightbulb className="mr-1.5 h-3.5 w-3.5 text-accent" />
              Conseils :
            </h4>
            <p className="text-xs whitespace-pre-wrap text-muted-foreground/80 leading-relaxed">
              {component.tips}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


export function MealPlanDisplay({ mealPlan, mealPlanName, onSavePlan }: MealPlanDisplayProps) {
  useEffect(() => {
    const styleId = "tabs-grid-style";
    if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .grid-cols-minmax-100px-auto {
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!mealPlan || !mealPlan.days || mealPlan.days.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center shadow-lg">
        <ChefHat className="h-16 w-16 text-muted-foreground mb-4" />
        <CardTitle className="text-lg font-semibold mb-2">Vos plans repas</CardTitle>
        <CardDescription>
          Utilisez le formulaire pour générer un nouveau plan repas personnalisé.
        </CardDescription>
      </Card>
    );
  }

  const renderMealCourse = (mealCourse: MealComponent | undefined, courseTitle: string) => {
    if (!mealCourse || !mealCourse.title) return null;
    return <MealComponentCard component={mealCourse} typeTitle={courseTitle} />;
  };

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
              <TabsTrigger key={day.dayIdentifier || `day-${index}`} value={day.dayIdentifier || `day-${index}`} className="flex-1 min-w-[100px] data-[state=active]:shadow-md">
                {day.dayIdentifier || `Jour ${index + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollArea className="h-[calc(100vh-380px)] lg:h-auto lg:max-h-[calc(100vh-320px)] pr-3 -mr-3"> 
            {mealPlan.days.map((day, dayIndex) => (
              <TabsContent key={day.dayIdentifier || `day-content-${dayIndex}`} value={day.dayIdentifier || `day-${dayIndex}`}> {/* Ensure unique value here if dayIdentifier can be missing */}
                <div className="space-y-6">

                  {/* Breakfast */}
                  {day.breakfast && day.breakfast.mainItem && (
                    <Card className="bg-card shadow-md border">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg font-semibold">
                          <Utensils className="mr-2.5 h-5 w-5 text-primary" /> Petit-déjeuner
                        </CardTitle>
                        {day.breakfast.waterToDrink && (
                          <CardDescription className="text-xs text-muted-foreground pt-1 flex items-center">
                            <GlassWater className="mr-1.5 h-3.5 w-3.5 text-blue-500" /> {day.breakfast.waterToDrink}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-2 pb-4 px-4">
                        <MealComponentCard component={day.breakfast.mainItem} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Morning Snack */}
                  {day.morningSnack && day.morningSnack.title && (
                     <Card className="bg-card shadow-md border">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg font-semibold">
                          <Cookie className="mr-2.5 h-5 w-5 text-primary" /> Collation du Matin
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2 pb-4 px-4">
                        <MealComponentCard component={day.morningSnack} isSnack={true} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Lunch */}
                  {day.lunch && day.lunch.mainCourse && (
                    <Card className="bg-card shadow-md border">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg font-semibold">
                          <Utensils className="mr-2.5 h-5 w-5 text-primary" /> Déjeuner
                        </CardTitle>
                         {day.lunch.waterToDrink && (
                          <CardDescription className="text-xs text-muted-foreground pt-1 flex items-center">
                            <GlassWater className="mr-1.5 h-3.5 w-3.5 text-blue-500" /> {day.lunch.waterToDrink}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-0 pt-2 pb-4 px-4">
                        {renderMealCourse(day.lunch.starter, "Entrée")}
                        {renderMealCourse(day.lunch.mainCourse, "Plat Principal")}
                        {renderMealCourse(day.lunch.cheese, "Fromage")}
                        {renderMealCourse(day.lunch.dessert, "Dessert")}
                      </CardContent>
                    </Card>
                  )}

                  {/* Afternoon Snack */}
                  {day.afternoonSnack && day.afternoonSnack.title && (
                    <Card className="bg-card shadow-md border">
                     <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg font-semibold">
                          <Cookie className="mr-2.5 h-5 w-5 text-primary" /> Collation de l'Après-midi
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2 pb-4 px-4">
                        <MealComponentCard component={day.afternoonSnack} isSnack={true} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Dinner */}
                  {day.dinner && day.dinner.mainCourse && (
                     <Card className="bg-card shadow-md border">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg font-semibold">
                          <Utensils className="mr-2.5 h-5 w-5 text-primary" /> Dîner
                        </CardTitle>
                         {day.dinner.waterToDrink && (
                          <CardDescription className="text-xs text-muted-foreground pt-1 flex items-center">
                            <GlassWater className="mr-1.5 h-3.5 w-3.5 text-blue-500" /> {day.dinner.waterToDrink}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-0 pt-2 pb-4 px-4">
                        {renderMealCourse(day.dinner.starter, "Entrée")}
                        {renderMealCourse(day.dinner.mainCourse, "Plat Principal")}
                        {renderMealCourse(day.dinner.cheese, "Fromage")}
                        {renderMealCourse(day.dinner.dessert, "Dessert")}
                      </CardContent>
                    </Card>
                  )}
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

    
