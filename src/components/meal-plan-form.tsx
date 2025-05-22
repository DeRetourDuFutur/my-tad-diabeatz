
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

  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 0)); 
  const [durationInDays, setDurationInDays] = useState<string>("1");


  const [savedFormSettings, setSavedFormSettings] = useLocalStorage<FormSettings | null>("diabeatz-form-settings", null);


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

  // Update durationInDays when startDate or endDate changes
  useEffect(() => {
    if (startDate && endDate && isValid(startDate) && isValid(endDate) && endDate >= startDate) {
      const diff = differenceInDays(endDate, startDate) + 1;
      setDurationInDays(diff.toString());
    } else if (startDate && endDate && isValid(startDate) && isValid(endDate) && endDate < startDate) {
      setDurationInDays("0"); // Or some indicator of invalid range
    }
  }, [startDate, endDate]);

  // Update endDate when durationInDays or startDate changes
  useEffect(() => {
    const numDays = parseInt(durationInDays, 10);
    if (!isNaN(numDays) && numDays > 0 && startDate && isValid(startDate)) {
      const newEndDate = addDays(startDate, numDays - 1);
      // Only update if newEndDate is different to avoid infinite loops
      if (!endDate || !isValid(endDate) || newEndDate.getTime() !== endDate.getTime()) {
         // Check if newEndDate is not before startDate to prevent invalid range from duration input
        if (newEndDate >= startDate) {
            setEndDate(newEndDate);
        } else {
            // If duration makes endDate before startDate, reset duration to 1 or based on current valid endDate
            if (endDate && endDate >= startDate) {
                 const diff = differenceInDays(endDate, startDate) + 1;
                 setDurationInDays(diff.toString());
            } else {
                 setDurationInDays("1");
                 setEndDate(addDays(startDate, 0));
            }
        }
      }
    } else if (!isNaN(numDays) && numDays <= 0 && startDate && isValid(startDate)) {
        // Handle cases where user enters 0 or negative, reset to 1 day
        setDurationInDays("1");
        if(!endDate || !isValid(endDate) || addDays(startDate,0).getTime() !== endDate.getTime()){
             setEndDate(addDays(startDate, 0));
        }
    }
  }, [durationInDays, startDate]);


  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input temporarily, or positive numbers
    if (value === "" || (parseInt(value, 10) > 0 && /^\d*$/.test(value))) {
      setDurationInDays(value);
    } else if (parseInt(value, 10) <= 0 && value !== "") {
      setDurationInDays("1"); // Reset to 1 if 0 or negative
    }
  };
  
  const handleDurationBlur = () => {
    if (durationInDays === "" || parseInt(durationInDays, 10) <= 0) {
      setDurationInDays("1"); // Default to 1 if empty or invalid on blur
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
      
      const loadedStartDate = savedFormSettings.startDate ? parseISO(savedFormSettings.startDate) : new Date();
      const loadedEndDate = savedFormSettings.endDate ? parseISO(savedFormSettings.endDate) : addDays(loadedStartDate, 0);

      if (isValid(loadedStartDate)) {
        setStartDate(loadedStartDate);
      } else {
        setStartDate(new Date()); // Fallback
      }
      
      if (isValid(loadedEndDate) && loadedEndDate >= loadedStartDate) {
        setEndDate(loadedEndDate);
      } else if (isValid(loadedStartDate)) {
        setEndDate(addDays(loadedStartDate, 0)); // Fallback based on valid start date
      } else {
        setEndDate(addDays(new Date(),0)); // Fallback
      }
      
      // This will trigger the useEffect to set durationInDays based on loaded dates
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
                  <FormDescription>
                    Donnez un nom à votre plan pour le retrouver facilement.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Calendrier du plan</FormLabel>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Left Column: Date Pickers (60%) */}
                <div className="w-full sm:w-3/5 space-y-3">
                  <div>
                    <Label htmlFor="start-date-picker-trigger" className="text-sm font-medium">Date de début</Label>
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
                                setStartDate(date);
                                if (endDate && date > endDate) setEndDate(date); // Ensure end date is not before start
                            }
                          }}
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } 
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="end-date-picker-trigger" className="text-sm font-medium">Date de fin</Label>
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
                          disabled={(date) => startDate && isValid(startDate) ? date < startDate : date < new Date(new Date().setDate(new Date().getDate() -1)) } 
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {/* Right Column: Duration Input (40%) */}
                <div className="w-full sm:w-2/5 space-y-3 sm:pt-0 pt-2"> {/* Adjusted padding top for small screens */}
                   <div>
                    <Label htmlFor="duration-input" className="text-sm font-medium">Durée choisie (jours)</Label>
                    <Input
                        id="duration-input"
                        type="number"
                        min="1"
                        value={durationInDays}
                        onChange={handleDurationChange}
                        onBlur={handleDurationBlur}
                        className="h-10 text-center"
                        placeholder="Jours"
                    />
                   </div>
                </div>
              </div>
              <FormDescription>
                Choisissez la date de début et de fin du plan. Cela vous indiquera la durée du plan en jours.
              </FormDescription>
            </FormItem>


            <div className="space-y-4">
              <Label className="text-lg font-semibold">Préférences alimentaires</Label>
              <p className="text-sm text-muted-foreground">
                Cochez vos aliments favoris, à éviter ou allergènes.
                <br />
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
              <Button type="button" variant="outline" onClick={handleLoadSettings} className="flex-1" disabled={!savedFormSettings && (typeof window !== 'undefined' && !localStorage.getItem("diabeatz-form-settings"))}>
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
    
