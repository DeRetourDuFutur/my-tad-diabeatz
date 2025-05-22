
"use client";

import type { GenerateMealPlanInput, GenerateMealPlanOutput } from "@/ai/flows/generate-meal-plan";
import { generateMealPlan } from "@/ai/flows/generate-meal-plan";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, AlertTriangle, ThumbsDown, Star, CalendarDays, Save, Upload } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useLocalStorage from "@/hooks/use-local-storage";
import type { FoodCategory, FoodItem } from "@/lib/food-data"; 
import { initialFoodCategories } from "@/lib/food-data"; 
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, addDays, differenceInDays, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { FormSettings } from "@/lib/types";


const formSchema = z.object({
  planName: z.string().optional(),
  diabeticResearchSummary: z.string().min(20, { message: "Veuillez fournir un résumé de recherche pertinent." }),
});

type MealPlanFormProps = {
  onMealPlanGenerated: (mealPlan: GenerateMealPlanOutput, planName?: string) => void;
};

const defaultResearchSummary = `- Concentrez-vous sur les grains entiers, les protéines maigres, les graisses saines et beaucoup de légumes non amylacés.
- Contrôlez l'apport en glucides à chaque repas et collation.
- Privilégiez les aliments à faible indice glycémique.
- Assurez un apport suffisant en fibres.
- Le contrôle des portions est essentiel.
- Des horaires de repas réguliers aident à gérer la glycémie.`;

export function MealPlanForm({ onMealPlanGenerated }: MealPlanFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [foodCategoriesFromStorage, setFoodCategoriesInStorage] = useLocalStorage<FoodCategory[]>(
    "diabeatz-food-preferences",
    initialFoodCategories
  );

  const [processedFoodCategories, setProcessedFoodCategories] = useState<FoodCategory[]>(initialFoodCategories);

  const [startDate, setStartDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 1)); 
  const [durationInDays, setDurationInDays] = useState<string>("1");


  const [savedFormSettings, setSavedFormSettings] = useLocalStorage<FormSettings | null>("diabeatz-form-settings", null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    const hydratedCategories = foodCategoriesFromStorage.map(storedCategory => {
      const initialCategoryDefinition = initialFoodCategories.find(
        initCat => initCat.categoryName === storedCategory.categoryName
      );
      const initialItems = initialCategoryDefinition ? initialCategoryDefinition.items : [];
      
      return {
        ...(initialCategoryDefinition || {}), 
        ...storedCategory, 
        categoryName: storedCategory.categoryName, 
        items: initialItems.map(initialItem => { 
          const storedItem = storedCategory.items.find(si => si.id === initialItem.id);
          return {
            ...initialItem, 
            ...(storedItem || {}), 
            calories: storedItem?.calories ?? initialItem.calories,
            carbs: storedItem?.carbs ?? initialItem.carbs,
            protein: storedItem?.protein ?? initialItem.protein,
            fat: storedItem?.fat ?? initialItem.fat,
            sugars: storedItem?.sugars ?? initialItem.sugars,
            fiber: storedItem?.fiber ?? initialItem.fiber,
            sodium: storedItem?.sodium ?? initialItem.sodium,
            notes: storedItem?.notes ?? initialItem.notes,
          };
        }),
      };
    });
    setProcessedFoodCategories(hydratedCategories);
  }, [foodCategoriesFromStorage]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planName: "",
      diabeticResearchSummary: defaultResearchSummary,
    },
  });

  // Update durationInDays when startDate or endDate changes from pickers
  useEffect(() => {
    if (startDate && endDate && isValid(startDate) && isValid(endDate) && endDate >= startDate) {
      const diff = differenceInDays(endDate, startDate) + 1;
      if (durationInDays !== diff.toString()) {
        setDurationInDays(diff.toString());
      }
    }
  }, [startDate, endDate]); // Corrected: Removed durationInDays from dependencies

  // Update endDate when durationInDays (from input) or startDate changes
  useEffect(() => {
    const numDays = parseInt(durationInDays, 10);
    if (startDate && isValid(startDate)) {
      if (!isNaN(numDays) && numDays >= 1 && numDays <= 365) {
        const newEndDate = addDays(startDate, numDays - 1);
        if (!endDate || !isValid(endDate) || newEndDate.getTime() !== endDate.getTime()) {
          setEndDate(newEndDate);
        }
      }
    }
  }, [durationInDays, startDate]); // Corrected: Removed endDate from dependencies


  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) { 
      const numValue = parseInt(value, 10);
      if (value === "" || (numValue >= 1 && numValue <= 365) ) {
         setDurationInDays(value);
      } else if (numValue > 365) {
         setDurationInDays("365");
      } else { 
         setDurationInDays(value);
      }
    }
  };
  
  const handleDurationBlur = () => {
    const numDays = parseInt(durationInDays, 10);
    if (isNaN(numDays) || numDays <= 0) {
      setDurationInDays("1"); 
    } else if (numDays > 365) {
      setDurationInDays("365"); 
    } else {
      setDurationInDays(numDays.toString()); 
    }
  };


  const handleFoodPreferenceChange = (categoryId: string, itemId: string, type: "isFavorite" | "isDisliked" | "isAllergenic", checked: boolean) => {
    setFoodCategoriesInStorage(prevCategories =>
      prevCategories.map(category =>
        category.categoryName === categoryId
          ? {
              ...category,
              items: category.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      [type]: checked,
                      ...(type === "isFavorite" && checked && { isDisliked: false, isAllergenic: false }),
                      ...(type === "isDisliked" && checked && { isFavorite: false }), 
                      ...(type === "isAllergenic" && checked && { isFavorite: false }), 
                    }
                  : item
              ),
            }
          : category
      )
    );
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate) || endDate < startDate) {
      toast({
        title: "Dates invalides",
        description: "Veuillez sélectionner une date de début et une date de fin valide, où la date de fin est après ou égale à la date de début.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const likedFoodsList: string[] = [];
    const foodsToAvoidList: string[] = [];

    processedFoodCategories.forEach(category => {
      category.items.forEach(item => {
        let foodEntry = `${item.name} ${item.ig}`;
        if (item.isDisliked || item.isAllergenic) {
          foodsToAvoidList.push(
            foodEntry +
            (item.isDisliked && item.isAllergenic ? " (non aimé et allergène)" : item.isDisliked ? " (non aimé)" : " (allergène)")
          );
        } else {
          if (item.isFavorite) {
            foodEntry += " (favori)";
          }
          likedFoodsList.push(foodEntry);
        }
      });
    });

    if (likedFoodsList.length === 0) {
      toast({
        title: "Aucun aliment sélectionné",
        description: "Veuillez sélectionner au moins un aliment que vous aimez et auquel vous n'êtes pas allergique/que vous n'aimez pas.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    const availableFoodsForAI = likedFoodsList.join("\n");
    const foodsToAvoidForAI = foodsToAvoidList.join("\n");

    const actualDurationInDays = differenceInDays(endDate, startDate) + 1;
    const planDurationForAI = `${actualDurationInDays} jour${actualDurationInDays > 1 ? 's' : ''}`;


    try {
      const mealPlanInput: GenerateMealPlanInput = {
        planName: values.planName,
        availableFoods: availableFoodsForAI,
        foodsToAvoid: foodsToAvoidForAI.length > 0 ? foodsToAvoidForAI : undefined,
        diabeticResearchSummary: values.diabeticResearchSummary,
        planDuration: planDurationForAI, 
      };
      const result = await generateMealPlan(mealPlanInput);
      onMealPlanGenerated(result, values.planName);
      toast({
        title: "Plan Repas Généré!",
        description: "Votre nouveau plan repas est prêt.",
      });
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast({
        title: "Erreur de Génération",
        description: "Impossible de générer le plan repas. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const renderNutritionalInfo = (item: FoodItem) => {
    const infos = [
      item.calories,
      item.carbs && `Glucides: ${item.carbs}`,
      item.sugars && `dont Sucres: ${item.sugars}`,
      item.protein && `Protéines: ${item.protein}`,
      item.fat && `Lipides: ${item.fat}`,
      item.fiber && `Fibres: ${item.fiber}`,
      item.sodium && `Sel/Sodium: ${item.sodium}`,
    ].filter(Boolean); 

    if (infos.length === 0 && !item.notes) return null;

    return (
      <div className="mt-1 pl-2 text-xs text-muted-foreground space-y-0.5">
        {infos.map((info, index) => <div key={index}>{info}</div>)}
        {item.notes && <div className="italic">{item.notes}</div>}
      </div>
    );
  };

  const handleSaveSettings = () => {
    const currentFormValues = form.getValues();
    const settingsToSave: FormSettings = {
      planName: currentFormValues.planName,
      diabeticResearchSummary: currentFormValues.diabeticResearchSummary,
      foodPreferences: foodCategoriesFromStorage, 
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined, 
    };
    setSavedFormSettings(settingsToSave);
    toast({
      title: "Paramètres sauvegardés!",
      description: "Votre configuration de formulaire a été enregistrée.",
    });
  };

  const handleLoadSettings = () => {
    if (savedFormSettings) {
      form.reset({
        planName: savedFormSettings.planName || "",
        diabeticResearchSummary: savedFormSettings.diabeticResearchSummary,
      });
      setFoodCategoriesInStorage(savedFormSettings.foodPreferences); 
      
      const loadedStartDate = savedFormSettings.startDate ? parseISO(savedFormSettings.startDate) : addDays(new Date(), 1);
      const loadedEndDate = savedFormSettings.endDate ? parseISO(savedFormSettings.endDate) : addDays(loadedStartDate, 0);

      if (isValid(loadedStartDate)) {
        setStartDate(loadedStartDate);
      } else {
        setStartDate(addDays(new Date(), 1)); 
      }
      
      if (isValid(loadedEndDate) && loadedEndDate >= loadedStartDate) {
        setEndDate(loadedEndDate);
      } else if (isValid(loadedStartDate)) {
        setEndDate(addDays(loadedStartDate, 0)); 
      } else {
        setEndDate(addDays(new Date(), 1)); 
      }
      toast({
        title: "Paramètres chargés!",
        description: "Votre configuration de formulaire a été restaurée.",
      });
    } else {
      toast({
        title: "Aucun paramètre trouvé",
        description: "Aucun paramètre de formulaire n'a été trouvé pour le chargement.",
        variant: "destructive",
      });
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Wand2 className="h-6 w-6 text-primary" />
          Configuration des plans de repas
        </CardTitle>
        <CardDescription>
         Personnalisez vos préférences et générez un plan de repas adapté sur une période de votre choix.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="planName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du plan (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mon plan semaine prochaine" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Calendrier du plan</FormLabel>
              <div className="flex flex-col md:flex-row gap-4 md:gap-3 items-end">
                <div className="flex-grow flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="flex-1 min-w-[140px] sm:min-w-[170px]">
                    <Label htmlFor="start-date-picker-trigger" className="text-sm font-medium mb-1 block">Date de début</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="start-date-picker-trigger"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal h-10",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {startDate && isValid(startDate) ? format(startDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            if (date) {
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                if (date < today) {
                                  setStartDate(addDays(new Date(),1)); 
                                } else {
                                  setStartDate(date);
                                }
                                if (endDate && date > endDate) setEndDate(date); 
                            }
                          }}
                          disabled={(date) => {
                              const minSelectableDate = new Date();
                              minSelectableDate.setDate(minSelectableDate.getDate()); 
                              minSelectableDate.setHours(0,0,0,0);
                              return date < minSelectableDate;
                            } 
                          } 
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1 min-w-[140px] sm:min-w-[170px]">
                    <Label htmlFor="end-date-picker-trigger" className="text-sm font-medium mb-1 block">Date de fin</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="end-date-picker-trigger"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal h-10",
                            !endDate && "text-muted-foreground"
                          )}
                          disabled={!startDate || !isValid(startDate)} 
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {endDate && isValid(endDate) ? format(endDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => {
                            const minDate = startDate && isValid(startDate) ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate()));
                            minDate.setHours(0,0,0,0);
                            return date < minDate;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="w-full md:w-auto flex-shrink-0">
                  <Label htmlFor="duration-input" className="text-sm font-medium mb-1 block">Durée en jours</Label>
                  <Input
                      id="duration-input"
                      type="text" 
                      value={durationInDays}
                      onChange={handleDurationChange}
                      onBlur={handleDurationBlur}
                      className="h-10 text-center w-full md:w-24 bg-secondary" 
                      placeholder="Jours"
                  />
                </div>
              </div>
              <FormDescription>
                Choisissez la date de début et de fin du plan ou indiquez le nombre de jours souhaité.
              </FormDescription>
            </FormItem>


            <div className="space-y-4">
              <Label className="text-lg font-semibold">Préférences alimentaires</Label>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                Cochez vos aliments favoris, à éviter ou allergènes.
                Les aliments favoris seront privilégiés pour vos plans de repas.
              </p>
              <div className="max-h-[400px] overflow-y-auto p-1 rounded-md border">
                <Accordion type="multiple" className="w-full">
                  {processedFoodCategories.map(category => (
                    <AccordionItem value={category.categoryName} key={category.categoryName} className="border-b-0 last:border-b-0">
                      <AccordionTrigger className="py-3 px-2 text-md font-semibold text-primary hover:no-underline hover:bg-muted/50 rounded-md">
                        {category.categoryName}
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-2 px-2">
                        <ul className="space-y-2 pl-2">
                          {category.items.map(item => (
                            <li key={item.id} className="py-1.5 border-b border-border/50 last:border-b-0">
                              <div className="grid grid-cols-[1fr_auto_auto_auto] items-start gap-x-2">
                                <div>
                                  <span className="text-sm">{item.name} <span className="text-xs text-muted-foreground">{item.ig}</span></span>
                                  {renderNutritionalInfo(item)}
                                </div>
                                 <div className="flex items-center space-x-1 justify-self-end">
                                  <Checkbox
                                    id={`${item.id}-favorite`}
                                    checked={item.isFavorite}
                                    onCheckedChange={(checked) => handleFoodPreferenceChange(category.categoryName, item.id, "isFavorite", !!checked)}
                                    aria-label={`Marquer ${item.name} comme favori`}
                                    disabled={item.isDisliked || item.isAllergenic}
                                  />
                                  <Label htmlFor={`${item.id}-favorite`} className={`text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer ${ (item.isDisliked || item.isAllergenic) ? 'opacity-50 cursor-not-allowed' : ''}`} title="Favori">
                                    <Star className="h-3.5 w-3.5" />
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-1 justify-self-end">
                                  <Checkbox
                                    id={`${item.id}-disliked`}
                                    checked={item.isDisliked}
                                    onCheckedChange={(checked) => handleFoodPreferenceChange(category.categoryName, item.id, "isDisliked", !!checked)}
                                    aria-label={`Marquer ${item.name} comme non aimé`}
                                    disabled={item.isFavorite}
                                  />
                                  <Label htmlFor={`${item.id}-disliked`} className={`text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer ${item.isFavorite ? 'opacity-50 cursor-not-allowed' : ''}`} title="Je n'aime pas">
                                    <ThumbsDown className="h-3.5 w-3.5" />
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-1 justify-self-end">
                                  <Checkbox
                                    id={`${item.id}-allergenic`}
                                    checked={item.isAllergenic}
                                    onCheckedChange={(checked) => handleFoodPreferenceChange(category.categoryName, item.id, "isAllergenic", !!checked)}
                                    aria-label={`Marquer ${item.name} comme allergène`}
                                    disabled={item.isFavorite}
                                  />
                                  <Label htmlFor={`${item.id}-allergenic`} className={`text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer ${item.isFavorite ? 'opacity-50 cursor-not-allowed' : ''}`} title="Allergie/Intolérance">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                  </Label>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            <FormField
              control={form.control}
              name="diabeticResearchSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conseils à propos du régime Diabétique Type 2</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Focus sur les aliments à faible IG, contrôle des portions..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ce résumé aide l'IA à adapter le plan à vos besoins et aux dernières recommandations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Générer le Plan Repas
                </>
              )}
            </Button>

            <div className="flex gap-2 mt-4">
              <Button type="button" variant="outline" onClick={handleSaveSettings} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder les paramètres
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleLoadSettings} 
                className="flex-1" 
                disabled={!isClient || (!savedFormSettings && typeof window !== 'undefined' && !window.localStorage.getItem("diabeatz-form-settings"))}
              >
                <Upload className="mr-2 h-4 w-4" />
                Charger les paramètres
              </Button>
            </div>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
    

    

    


