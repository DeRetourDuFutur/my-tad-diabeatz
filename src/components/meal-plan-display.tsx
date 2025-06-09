
"use client";

import { useEffect, type ReactNode, useRef, useState } from "react";
import type { GenerateMealPlanOutput, DailyMealPlan, MealComponent, Breakfast, LunchDinner } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Save, Utensils, Lightbulb, Clock, ClipboardList, GlassWater, Soup, Beef, Apple, Grape, Cookie, NotebookPen, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const renderMealCourse = (mealCourse: MealComponent | undefined, courseTitle: string) => {
  if (!mealCourse || !mealCourse.title) return null;
  return <MealComponentCard component={mealCourse} typeTitle={courseTitle} />;
};

type MealDefinition = {
  key: string;
  label: string;
  icon: React.ElementType;
  content: ReactNode | null;
  isAvailable: boolean;
};


export function MealPlanDisplay({ mealPlan, mealPlanName, onSavePlan }: MealPlanDisplayProps) {
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const handleScroll = () => {
    if (tabsListRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth -1); // -1 for precision
    }
  };

  useEffect(() => {
    const currentTabsList = tabsListRef.current;
    if (currentTabsList) {
      handleScroll(); // Initial check
      currentTabsList.addEventListener("scroll", handleScroll);
      // Check again after a short delay to ensure layout is stable
      const timer = setTimeout(handleScroll, 100);
      return () => {
        currentTabsList.removeEventListener("scroll", handleScroll);
        clearTimeout(timer);
      };
    }
  }, [mealPlan]); // Re-check when mealPlan changes as it affects tabs

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsListRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      tabsListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const styleId = "tabs-grid-style";
    if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .grid-cols-minmax-100px-auto {
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        }
        .grid-cols-minmax-meal-tabs {
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!mealPlan || !mealPlan.days || mealPlan.days.length === 0) {
    return (
      <Card className="shadow-lg card-glow-effect card-variant">
        <Accordion
          type="single"
          collapsible
          defaultValue="meal-display-placeholder-item"
        >
          <AccordionItem
            value="meal-display-placeholder-item"
            className="border-b-0"
          >
            <AccordionTrigger className="w-full text-left p-0 hover:no-underline">
              <CardHeader className="flex flex-row items-center justify-between w-full p-4">
                <div className="flex items-center gap-2">
                  <NotebookPen className="h-5 w-5 text-secondary-foreground" />
                  <CardTitle className="text-lg font-semibold">
                    Votre Plan Repas Généré
                  </CardTitle>
                </div>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent className="pt-0">
              <CardContent className="flex flex-col items-center justify-center p-8 min-h-[200px] text-center">
                <ChefHat className="h-16 w-16 text-primary/50 mb-4" />
                <CardDescription>
                  Générez un plan via le formulaire pour l'afficher ici.
                </CardDescription>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-1 flex items-center">
              <NotebookPen className="mr-3 h-7 w-7 text-primary" />
              {mealPlanName ? `Plan: ${mealPlanName}` : `Plan Repas (${mealPlan.days.length} jour${mealPlan.days.length > 1 ? 's' : ''})`}
            </CardTitle>
            <CardDescription>Consultez votre plan repas personnalisé. Naviguez par jour, puis par type de repas.</CardDescription>
          </div>
          <Button onClick={onSavePlan} size="sm" variant="outline" className="button-neon-glow">
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={mealPlan.days[0]?.dayIdentifier || "day-0"} className="w-full">
          <div className="relative flex items-center mb-4">
            {showLeftArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 z-10 bg-background/50 hover:bg-background/80 text-white rounded-full h-8 w-8 p-0 mr-1"
                onClick={() => scrollTabs('left')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div ref={tabsListRef} className="overflow-x-auto whitespace-nowrap p-1 rounded-md shadow-[0_0_15px_rgba(0,255,255,0.5)] border border-cyan-300/50 no-scrollbar mx-10 flex-grow">
              <TabsList className="inline-flex items-center justify-start space-x-1 h-auto">
                {mealPlan.days.map((day, index) => (
                  <TabsTrigger key={day.dayIdentifier || `day-${index}`} value={day.dayIdentifier || `day-${index}`} className="flex-shrink-0 min-w-[100px] data-[state=active]:shadow-md">
                    {day.dayIdentifier || `Jour ${index + 1}`}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {showRightArrow && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 z-10 bg-background/50 hover:bg-background/80 text-white rounded-full h-8 w-8 p-0 ml-1"
                onClick={() => scrollTabs('right')}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
          {/* La ScrollArea est modifiée ici pour que son contenu détermine sa hauteur */}
          <ScrollArea className="h-auto pr-3 -mr-3">
            {mealPlan.days.map((day, dayIndex) => {
              const mealDefinitions: MealDefinition[] = [
                {
                  key: "breakfast",
                  label: "Petit-déjeuner",
                  icon: Utensils,
                  isAvailable: !!(day.breakfast && day.breakfast.mainItem && day.breakfast.mainItem.title),
                  content: day.breakfast && day.breakfast.mainItem && day.breakfast.mainItem.title && (
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
                  )
                },
                {
                  key: "morningSnack",
                  label: "Collation (matin)",
                  icon: Cookie,
                  isAvailable: !!(day.morningSnack && day.morningSnack.title),
                  content: day.morningSnack && day.morningSnack.title && (
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
                  )
                },
                {
                  key: "lunch",
                  label: "Déjeuner",
                  icon: Utensils,
                   isAvailable: !!(day.lunch && day.lunch.mainCourse && day.lunch.mainCourse.title),
                  content: day.lunch && day.lunch.mainCourse && day.lunch.mainCourse.title && (
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
                  )
                },
                {
                  key: "afternoonSnack",
                  label: "Collation (a-m)",
                  icon: Cookie,
                  isAvailable: !!(day.afternoonSnack && day.afternoonSnack.title),
                  content: day.afternoonSnack && day.afternoonSnack.title && (
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
                  )
                },
                {
                  key: "dinner",
                  label: "Dîner",
                  icon: Utensils,
                  isAvailable: !!(day.dinner && day.dinner.mainCourse && day.dinner.mainCourse.title),
                  content: day.dinner && day.dinner.mainCourse && day.dinner.mainCourse.title && (
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
                  )
                }
              ];

              const availableMealsForDay = mealDefinitions.filter(meal => meal.isAvailable);
              const defaultMealTab = availableMealsForDay.length > 0 ? availableMealsForDay[0].key : "";

              return (
                <TabsContent key={day.dayIdentifier || `day-content-${dayIndex}`} value={day.dayIdentifier || `day-${dayIndex}`} className="mt-0">
                  {availableMealsForDay.length > 0 ? (
                    <Tabs defaultValue={defaultMealTab} className="w-full pt-2">
                      <TabsList className="grid w-full grid-cols-minmax-meal-tabs gap-1 mb-4 h-auto flex-wrap justify-start">
                        {availableMealsForDay.map(mealDef => (
                          <TabsTrigger key={mealDef.key} value={mealDef.key}  className="flex-1 min-w-[120px] data-[state=active]:shadow-md">
                            <mealDef.icon className="mr-2 h-4 w-4" />
                            {mealDef.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {availableMealsForDay.map(mealDef => (
                        <TabsContent key={mealDef.key} value={mealDef.key} className="mt-2">
                          {mealDef.content}
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <ChefHat className="mx-auto h-12 w-12 mb-2"/>
                      Aucun repas défini pour cette journée.
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </ScrollArea>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-4 border-t">
        <p>Ce plan repas est généré par IA et doit être examiné par un professionnel de santé ou un diététicien.</p>
      </CardFooter>
    </Card>
  );
}

