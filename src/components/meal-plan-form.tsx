
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
  FormDescription as FormDescriptionComponentUI,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, AlertTriangle, ThumbsDown, Star, CalendarDays, Save, Upload, ListFilter, PlusCircle, BookOpenText, BarChart2, Apple, Carrot, Nut, Wheat, Bean, Beef, Milk, CookingPot as OilIcon, Blend, Utensils } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FoodCategory, FoodItem, FormSettings, Medication } from "@/lib/types";
import { initialFoodCategories as baseInitialFoodCategories } from "@/lib/food-data";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription as DialogDescriptionComponent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { format, addDays, differenceInDays, isValid, parseISO, isBefore, isEqual, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Alert, AlertTitle, AlertDescription as AlertDescriptionShadcn } from "@/components/ui/alert";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const formSchema = z.object({
  planName: z.string().optional(),
  diabeticResearchSummary: z.string().min(20, { message: "Veuillez fournir un résumé de recherche pertinent." }),
});





import RichTextDisplay from './meal-plan-form/RichTextDisplay';

import type { MealPlanFormProps, EditableNutritionalInfo, NewFoodData } from './meal-plan-form/types';
import { initialNewFoodData } from './meal-plan-form/useMealPlanFormLogic';

const categoryIcons: Record<string, React.ElementType> = {
  "Fruits": Apple,
  "Légumes": Carrot,
  "Fruits à coque et Graines": Nut,
  "Céréales, Grains et Féculents": Wheat,
  "Légumineuses": Bean,
  "Viandes, Volailles, Poissons et Œufs": Beef,
  "Produits Laitiers et Alternatives Végétales": Milk,
  "Matières Grasses (avec modération)": OilIcon,
  "Assaisonnements et Autres": Blend,
};


import { useMealPlanFormLogic, defaultResearchSummary } from './meal-plan-form/useMealPlanFormLogic';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Added for Firestore saving

export function MealPlanForm({ onMealPlanGenerated: onMealPlanGeneratedProp, onGenerationError: onGenerationErrorProp }: MealPlanFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  // const { toast } = useToast(); // Sera géré par le hook
  
  // const [isClient, setIsClient] = useState(false); // Géré par le hook
  // const [isDataLoading, setIsDataLoading] = useState(true); // Géré par le hook

  // const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]); // Géré par le hook
  
  // const [selectionMode, setSelectionMode] = useState<'dates' | 'duration'>('dates'); // Géré par le hook
  // const [startDate, setStartDate] = useState<Date | undefined>(undefined); // Géré par le hook
  // const [endDate, setEndDate] = useState<Date | undefined>(undefined); // Géré par le hook
  // const [durationInDays, setDurationInDays] = useState<string>("1");  // Géré par le hook
  // const [durationModeStartDate, setDurationModeStartDate] = useState<Date | undefined>(undefined); // Géré par le hook
  

  
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [isDurationModeStartDatePickerOpen, setIsDurationModeStartDatePickerOpen] = useState(false);

  const [isEditTipsDialogOpen, setIsEditTipsDialogOpen] = useState(false);
  const [editingTips, setEditingTips] = useState<string>("");

  const [isNutritionalInfoDialogOpen, setIsNutritionalInfoDialogOpen] = useState(false);
  const [selectedFoodItemForNutritionalInfo, setSelectedFoodItemForNutritionalInfo] = useState<FoodItem | null>(null);
  const [selectedFoodCategoryName, setSelectedFoodCategoryName] = useState<string | null>(null);
  const [editableNutritionalInfo, setEditableNutritionalInfo] = useState<EditableNutritionalInfo>({});

  const [isAddFoodDialogOpen, setIsAddFoodDialogOpen] = useState(false);
  const [newFoodData, setNewFoodData] = useState<NewFoodData>(initialNewFoodData);
  const [addFoodFormError, setAddFoodFormError] = useState<string | null>(null);

  // TODO: Implement proper user authentication and get userId
  const userId = 'testUser'; // Replace with actual user ID from auth system

  const handleGenerationError = (error: string) => {
    if (onGenerationErrorProp) {
      onGenerationErrorProp(error);
    }
  };

  const handleMealPlanGenerated = async (result: GenerateMealPlanOutput, planName?: string) => {
    if (onMealPlanGeneratedProp) {
      onMealPlanGeneratedProp(result, planName);
    }

    if (userId) {
      try {
        const mealPlansCollectionRef = collection(db, 'users', userId, 'mealPlans');
        await addDoc(mealPlansCollectionRef, {
          ...result,
          planName: planName || `Plan du ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
          createdAt: serverTimestamp(),
          // generationParams: { // Optional: Store generation parameters for history/re-generation
          //   selectionMode,
          //   startDate: startDate ? startDate.toISOString() : null,
          //   endDate: endDate ? endDate.toISOString() : null,
          //   durationInDays,
          //   durationModeStartDate: durationModeStartDate ? durationModeStartDate.toISOString() : null,
          //   diabeticResearchSummary: form.getValues("diabeticResearchSummary"),
          //   // foodCategories, // Consider if this is too much data or if a summary is better
          // }
        });
        toast({
          title: "Plan sauvegardé !",
          description: "Votre nouveau plan alimentaire a été sauvegardé dans votre historique.",
        });
      } catch (error) {
        console.error("Error saving meal plan to Firestore:", error);
        toast({
          title: "Erreur de sauvegarde Firestore",
          description: "Impossible de sauvegarder le plan alimentaire.",
          variant: "destructive",
        });
      }
    }
  };

  const {
    form,
    toast,
    isClient,
    isDataLoading,
    foodCategories, setFoodCategories, 
    selectionMode, setSelectionMode,
    startDate, setStartDate,
    endDate, setEndDate,
    durationInDays, setDurationInDays,
    durationModeStartDate, setDurationModeStartDate,
    handleLoadSettingsAndPreferences,
    displayDurationFromDates, // Ajouté depuis le hook
    displayEndDateFromDuration, // Ajouté depuis le hook
    handleDurationInputChange, // Ajouté depuis le hook
    handleDurationInputBlur, // Ajouté depuis le hook
    handleFoodPreferenceChange, // Ajouté depuis le hook
    onSubmit // Ajouté depuis le hook
  } = useMealPlanFormLogic({
    userId,
    defaultResearchSummary,
    onMealPlanGenerated: handleMealPlanGenerated, // Renamed to avoid conflict and clarify internal handling
    onGenerationError: handleGenerationError, // Renamed for clarity
    setIsLoading,
  });

  // useEffect(() => { // Géré par le hook
  //   setIsClient(true);
  // }, []);

  useEffect(() => {
    if (!isClient || isDataLoading) return;

    let finalStartDate: Date | undefined = undefined;
    let finalEndDate: Date | undefined = undefined;
    let days = 0;

    if (selectionMode === 'dates') {
      if (startDate && endDate && isValid(startDate) && isValid(endDate) && !isBefore(startOfDay(endDate), startOfDay(startDate))) {
        finalStartDate = startOfDay(startDate);
        finalEndDate = startOfDay(endDate);
        days = differenceInDays(finalEndDate, finalStartDate) + 1;
      }
    } else { // selectionMode === 'duration'
      if (durationModeStartDate && isValid(durationModeStartDate) && durationInDays) {
        const numDays = parseInt(durationInDays, 10);
        if (numDays > 0) {
          finalStartDate = startOfDay(durationModeStartDate);
          finalEndDate = addDays(finalStartDate, numDays - 1);
          days = numDays;
        }
      }
    }

    if (finalStartDate && finalEndDate && days > 0) {
      const formattedStartDate = format(finalStartDate, "dd/MM", { locale: fr });
      const formattedEndDate = format(finalEndDate, "dd/MM", { locale: fr });
      form.setValue("planName", `Plan Alimentaire | ${formattedStartDate} - ${formattedEndDate} (${days} Jour${days > 1 ? 's' : ''})`);
    } else if (days > 0 && selectionMode === 'duration') { // Case for duration mode if dates are not fully set but duration is valid
        form.setValue("planName", `Plan Alimentaire Pour ${days} Jour${days > 1 ? 's' : ''}`);
    } else {
      // Fallback if dates are not valid or not set for 'dates' mode, or duration is invalid for 'duration' mode
      // Check if there's an existing planName from loaded settings, otherwise set a very basic default or leave empty
      const currentPlanName = form.getValues("planName");
      if (!currentPlanName) { // Only set if truly empty, to not override loaded user input
        form.setValue("planName", "Plan Alimentaire"); 
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, isDataLoading, selectionMode, startDate, endDate, durationInDays, durationModeStartDate, form.setValue]);

    // La logique de handleLoadSettingsAndPreferences et le useEffect associé sont maintenant dans useMealPlanFormLogic.
  // Le useEffect qui appelle handleLoadSettingsAndPreferences est également dans le hook.


  // Les useEffect pour displayDurationFromDates et displayEndDateFromDuration sont maintenant dans useMealPlanFormLogic.
  // Les fonctions handleDurationInputChange et handleDurationInputBlur sont maintenant dans useMealPlanFormLogic.
  // Les fonctions handleFoodPreferenceChange et onSubmit sont maintenant dans useMealPlanFormLogic.

  const handleOpenEditTipsDialog = () => {
    setEditingTips(form.getValues('diabeticResearchSummary'));
    setIsEditTipsDialogOpen(true);
  };

  const handleOpenNutritionalInfoDialog = (item: FoodItem, categoryName: string) => {
    setSelectedFoodItemForNutritionalInfo(item);
    setSelectedFoodCategoryName(categoryName);
    setEditableNutritionalInfo({
        calories: item.calories || "",
        carbs: item.carbs || "",
        protein: item.protein || "",
        fat: item.fat || "",
        sugars: item.sugars || "",
        fiber: item.fiber || "",
        sodium: item.sodium || "",
        notes: item.notes || "",
    });
    setIsNutritionalInfoDialogOpen(true);
  };

  const handleNutritionalInfoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableNutritionalInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveNutritionalInfo = async () => {
    if (!selectedFoodItemForNutritionalInfo || !selectedFoodCategoryName) return;

    const updatedCategories = foodCategories.map(category =>
        category.categoryName === selectedFoodCategoryName ?
        {
            ...category,
            items: category.items.map(item =>
                item.id === selectedFoodItemForNutritionalInfo.id
                    ? {
                        ...item,
                        ...editableNutritionalInfo,
                      }
                    : item
            ),
        } : category
    );
    setFoodCategories(updatedCategories);
    if (userId) {
      try {
        const foodPrefsDocRef = doc(db, 'users', userId, 'foodPreferences', 'default');
        await setDoc(foodPrefsDocRef, { categories: updatedCategories }, { merge: true });
        // console.log("Food preferences (add new) saved to Firebase for user:", userId);
      } catch (error) {
        console.error("Error saving food preferences (add new) to Firebase:", error);
        toast({
          title: "Erreur de sauvegarde des préférences",
          description: "Impossible d'enregistrer les préférences alimentaires sur Firebase.",
          variant: "destructive",
        });
      }
    } else if (typeof window !== "undefined") {
        localStorage.setItem("diabeatz-food-preferences", JSON.stringify(updatedCategories)); // Fallback
    }
    setIsNutritionalInfoDialogOpen(false);
    toast({ title: "Informations nutritionnelles mises à jour!", description: `Pour ${selectedFoodItemForNutritionalInfo.name}.` });
  };

  const handleSaveSettings = useCallback(async () => {
    if (!userId) {
      toast({ title: "Utilisateur non identifié", description: "Veuillez vous connecter pour sauvegarder.", variant: "destructive" });
      return;
    }
    const currentFormValues = form.getValues();
    const settingsToSave: FormSettings = {
      planName: currentFormValues.planName,
      diabeticResearchSummary: currentFormValues.diabeticResearchSummary,
      selectionMode: selectionMode,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
      durationInDays: durationInDays,
      durationModeStartDate: durationModeStartDate ? durationModeStartDate.toISOString() : undefined,
    };
    console.log("Valeurs du formulaire à sauvegarder:", currentFormValues);
    console.log("Settings à sauvegarder sur Firebase:", settingsToSave);
    console.log("UserID utilisé pour la sauvegarde:", userId);
    try {
      const settingsDocRef = doc(db, 'users', userId, 'formSettings', 'default');
      await setDoc(settingsDocRef, settingsToSave, { merge: true });
      toast({
        title: "Paramètres sauvegardés!",
        description: "Votre configuration de formulaire a été enregistrée sur Firebase.",
      });
    } catch (error) {
      console.error("Error saving form settings to Firebase:", error);
      toast({
        title: "Erreur de sauvegarde Firebase",
        description: "Impossible d'enregistrer les paramètres du formulaire.",
        variant: "destructive",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, selectionMode, startDate, endDate, durationInDays, durationModeStartDate, toast, userId]);
  

  const handleAddNewFoodChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFoodData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewFoodCategoryChange = (value: string) => {
    setNewFoodData(prev => ({ ...prev, categoryName: value }));
  };

  const handleAddNewFood = async () => {
    setAddFoodFormError(null);
    if (!newFoodData.name.trim() || !newFoodData.categoryName) {
      setAddFoodFormError("Le nom de l'aliment et la catégorie sont requis.");
      return;
    }

    let foodAlreadyExists = false;
    foodCategories.forEach(category => {
      if (category.categoryName === newFoodData.categoryName) {
        if (category.items.some(item => item.name.toLowerCase() === newFoodData.name.trim().toLowerCase())) {
          setAddFoodFormError(`L'aliment "${newFoodData.name.trim()}" existe déjà dans la catégorie "${newFoodData.categoryName}".`);
          foodAlreadyExists = true;
        }
      }
    });

    if(foodAlreadyExists) return;

    const newFoodItem: FoodItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2,9)}`, 
      name: newFoodData.name.trim(),
      ig: newFoodData.ig || "(IG: N/A)",
      calories: newFoodData.calories || "",
      carbs: newFoodData.carbs || "",
      protein: newFoodData.protein || "",
      fat: newFoodData.fat || "",
      sugars: newFoodData.sugars || "",
      fiber: newFoodData.fiber || "",
      sodium: newFoodData.sodium || "",
      notes: newFoodData.notes || "",
      isFavorite: false,
      isDisliked: false,
      isAllergenic: false,
    };

    const updatedCategories = foodCategories.map(cat => {
      if (cat.categoryName === newFoodData.categoryName) {
        return {
          ...cat,
          items: [...cat.items, newFoodItem].sort((a,b) => a.name.localeCompare(b.name)),
        };
      }
      return cat;
    });
    setFoodCategories(updatedCategories);
    if (userId) {
      try {
        const foodPrefsDocRef = doc(db, 'users', userId, 'foodPreferences', 'default');
        await setDoc(foodPrefsDocRef, { categories: updatedCategories }, { merge: true });
        // console.log("Food preferences (add new) saved to Firebase for user:", userId);
      } catch (error) {
        console.error("Error saving food preferences (add new) to Firebase:", error);
        toast({
          title: "Erreur de sauvegarde des préférences",
          description: "Impossible d'enregistrer les préférences alimentaires sur Firebase.",
          variant: "destructive",
        });
      }
    } else if (typeof window !== "undefined") {
        localStorage.setItem("diabeatz-food-preferences", JSON.stringify(updatedCategories)); // Fallback
    }

    toast({
      title: "Aliment ajouté!",
      description: `${newFoodItem.name} a été ajouté à la catégorie ${newFoodData.categoryName}.`,
    });
    setIsAddFoodDialogOpen(false);
    setNewFoodData(initialNewFoodData);
  };

  if (isDataLoading && isClient) { 
    return (
      <div className="space-y-6">
        <Card className="shadow-lg"><CardHeader><CardTitle className="text-lg font-semibold">Chargement de la configuration...</CardTitle></CardHeader><CardContent className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>
      </div>
    );
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion
          type="multiple"
          defaultValue={["config-base-item", "prefs-aliments-item"]}
          className="w-full space-y-6"
        >
          <AccordionItem value="config-base-item" className="border-b-0">
            <Card className="shadow-lg card-glow-effect card-variant">
              <AccordionTrigger className="w-full text-left p-0 hover:no-underline group">
                <CardHeader className="flex flex-row items-center justify-between w-full p-4">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-secondary-foreground" />
                    <CardTitle className="text-lg font-semibold">
                      Planification
                    </CardTitle>
                  </div>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="pt-0">
                <CardContent>
                  <FormField
                    control={form.control}
                    name="planName"
                    render={({ field }) => (
                      <FormItem className="mb-6">
                        <FormLabel>Nom du plan (optionnel)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex. : Plan alimentaire personnalisé"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel className="text-base font-medium mb-2 block">
                      Calendrier / Durée
                    </FormLabel>
                    <FormDescriptionComponentUI className="mb-3 text-xs">
                      Choisissez la date de début et de fin du plan ou indiquez
                      le nombre de jour(s) souhaité(s).
                    </FormDescriptionComponentUI>
                    <RadioGroup
                      value={selectionMode}
                      onValueChange={(value: "dates" | "duration") =>
                        setSelectionMode(value)
                      }
                      className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 my-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dates" id="mode-dates" />
                        <Label htmlFor="mode-dates">Par Dates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="duration" id="mode-duration" />
                        <Label htmlFor="mode-duration">Par Durée</Label>
                      </div>
                    </RadioGroup>

                    {selectionMode === "dates" && (
                      <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor="start-date-picker"
                            className="text-sm font-medium mb-1 block"
                          >
                            Date de début
                          </Label>
                          <Popover
                            open={isStartDatePickerOpen}
                            onOpenChange={setIsStartDatePickerOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                id="start-date-picker"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal h-10",
                                  !startDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {startDate && isValid(startDate) ? (
                                  format(startDate, "PPP", { locale: fr })
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 datepicker-popover"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => {
                                  if (date) {
                                    const newStartDate = startOfDay(date);
                                    setStartDate(newStartDate);
                                    if (
                                      endDate &&
                                      isBefore(
                                        startOfDay(endDate),
                                        newStartDate
                                      )
                                    ) {
                                      setEndDate(new Date(newStartDate));
                                    }
                                  }
                                  setIsStartDatePickerOpen(false);
                                }}
                                disabled={(date) =>
                                  isBefore(
                                    startOfDay(date),
                                    startOfDay(new Date())
                                  )
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor="end-date-picker"
                            className="text-sm font-medium mb-1 block"
                          >
                            Date de fin
                          </Label>
                          <Popover
                            open={isEndDatePickerOpen}
                            onOpenChange={setIsEndDatePickerOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                id="end-date-picker"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal h-10",
                                  !endDate && "text-muted-foreground"
                                )}
                                disabled={!startDate || !isValid(startDate)}
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {endDate && isValid(endDate) ? (
                                  format(endDate, "PPP", { locale: fr })
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 datepicker-popover"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => {
                                  if (date && startDate && isValid(startDate)) {
                                    const newEndDate = startOfDay(date);
                                    if (
                                      !isBefore(
                                        newEndDate,
                                        startOfDay(startDate)
                                      )
                                    ) {
                                      setEndDate(newEndDate);
                                    }
                                  }
                                  setIsEndDatePickerOpen(false);
                                }}
                                disabled={(date) => {
                                  const minDate =
                                    startDate && isValid(startDate)
                                      ? startOfDay(startDate)
                                      : startOfDay(new Date());
                                  return isBefore(startOfDay(date), minDate);
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="sm:w-auto sm:min-w-[80px] text-center sm:text-left h-10 flex items-center justify-center sm:justify-start text-sm text-primary pt-1 sm:pt-0">
                          {displayDurationFromDates}
                        </div>
                      </div>
                    )}

                    {selectionMode === "duration" && (
                      <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor="duration-mode-start-date-picker"
                            className="text-sm font-medium mb-1 block"
                          >
                            Date de début
                          </Label>
                          <Popover
                            open={isDurationModeStartDatePickerOpen}
                            onOpenChange={setIsDurationModeStartDatePickerOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                id="duration-mode-start-date-picker"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal h-10",
                                  !durationModeStartDate &&
                                    "text-muted-foreground"
                                )}
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {durationModeStartDate &&
                                isValid(durationModeStartDate) ? (
                                  format(durationModeStartDate, "PPP", {
                                    locale: fr,
                                  })
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 datepicker-popover"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={durationModeStartDate}
                                onSelect={(date) => {
                                  if (date) {
                                    const newDurationStartDate =
                                      startOfDay(date);
                                    setDurationModeStartDate(
                                      newDurationStartDate
                                    );
                                  }
                                  setIsDurationModeStartDatePickerOpen(false);
                                }}
                                disabled={(date) =>
                                  isBefore(
                                    startOfDay(date),
                                    startOfDay(new Date())
                                  )
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="sm:w-24">
                          <Label
                            htmlFor="duration-input-field"
                            className="text-sm font-medium mb-1 block"
                          >
                            Jour(s)
                          </Label>
                          <Input
                            id="duration-input-field"
                            type="text"
                            value={durationInDays}
                            onChange={handleDurationInputChange}
                            onBlur={handleDurationInputBlur}
                            className="h-10 text-center bg-secondary w-full md:w-24"
                            placeholder="Jours"
                          />
                        </div>
                        <div className="flex-1 min-w-0 h-10 flex items-center justify-start text-sm pt-1 sm:pt-0">
                          {displayEndDateFromDuration &&
                            isValid(displayEndDateFromDuration) && (
                              <div className="text-primary">
                                <span className="font-medium text-muted-foreground">
                                  Fin du plan :{" "}
                                </span>
                                {format(displayEndDateFromDuration, "PPP", {
                                  locale: fr,
                                })}
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </FormItem>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="prefs-aliments-item" className="border-b-0">
            <Card className="shadow-lg card-glow-effect card-variant">
              <div className="flex flex-row items-center justify-between w-full p-4">
                <AccordionTrigger className="flex flex-1 items-center gap-2 p-0 hover:no-underline group">
                  <div className="flex items-center gap-2">
                    <ListFilter className="h-5 w-5 text-secondary-foreground" />
                    <CardTitle className="text-lg font-semibold">
                      Préférences alimentaires
                    </CardTitle>
                  </div>
                </AccordionTrigger>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-4 shrink-0"
                  onClick={() => {
                    setNewFoodData(initialNewFoodData);
                    setAddFoodFormError(null);
                    setIsAddFoodDialogOpen(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Ajouter un aliment</span>
                  <span className="sm:hidden">Ajouter</span>
                </Button>
              </div>
              <AccordionContent className="pt-0">
                <CardContent>
                  <FormDescriptionComponentUI className="mb-2 text-xs">
                    Cochez vos aliments favoris, à éviter ou allergènes.
                    <br />
                    Les aliments favoris seront privilégiés pour vos plans de
                    repas.
                  </FormDescriptionComponentUI>
                  <div className="max-h-[400px] overflow-y-auto p-1 rounded-md border mt-2">
                    <Accordion type="multiple" className="w-full">
                      {foodCategories.map((category) => {
                        const CategoryIcon =
                          categoryIcons[category.categoryName] || ListFilter;
                        return (
                          <AccordionItem
                            value={category.categoryName}
                            key={category.categoryName}
                            className="border-b-0 last:border-b-0"
                          >
                            <AccordionTrigger className="py-3 px-2 hover:no-underline hover:bg-muted/50 rounded-md">
                              <div className="flex flex-1 items-center gap-2">
                                <CategoryIcon className="h-4 w-4 text-secondary-foreground" />
                                <span className="text-md font-semibold text-primary">
                                  {category.categoryName}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-1 pb-2 px-2">
                              <ul className="space-y-1 pl-2">
                                {category.items.map((item) => (
                                  <li
                                    key={item.id}
                                    className="py-1 border-b border-border/50 last:border-b-0"
                                  >
                                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto] sm:items-center gap-x-1 sm:gap-x-2">
                                      <div className="mb-1 sm:mb-0">
                                        <span
                                          className={cn(
                                            "text-sm font-medium",
                                            item.isDisliked && "line-through",
                                            item.isAllergenic &&
                                              "text-destructive"
                                          )}
                                        >
                                          {item.name}
                                        </span>
                                        <span
                                          className={cn(
                                            "text-xs text-muted-foreground ml-1",
                                            item.isDisliked && "line-through",
                                            item.isAllergenic &&
                                              "text-destructive"
                                          )}
                                        >
                                          {item.ig}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-start sm:justify-self-end gap-x-2 sm:gap-x-1 mt-1 sm:mt-0">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="p-1 h-7 w-7"
                                          onClick={() =>
                                            handleOpenNutritionalInfoDialog(
                                              item,
                                              category.categoryName
                                            )
                                          }
                                          title="Valeurs nutritionnelles"
                                        >
                                          <BarChart2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <div className="flex items-center space-x-1">
                                          <Checkbox
                                            id={`${item.id}-favorite`}
                                            checked={item.isFavorite}
                                            onCheckedChange={(checked) =>
                                              handleFoodPreferenceChange(
                                                category.categoryName,
                                                item.id,
                                                "isFavorite",
                                                !!checked
                                              )
                                            }
                                            aria-label={`Marquer ${item.name} comme favori`}
                                            disabled={
                                              item.isDisliked ||
                                              item.isAllergenic
                                            }
                                          />
                                          <Label
                                            htmlFor={`${item.id}-favorite`}
                                            className={`text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer ${
                                              item.isDisliked ||
                                              item.isAllergenic
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                            title="Favori"
                                          >
                                            <Star className="h-3.5 w-3.5" />
                                          </Label>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Checkbox
                                            id={`${item.id}-disliked`}
                                            checked={item.isDisliked}
                                            onCheckedChange={(checked) =>
                                              handleFoodPreferenceChange(
                                                category.categoryName,
                                                item.id,
                                                "isDisliked",
                                                !!checked
                                              )
                                            }
                                            aria-label={`Marquer ${item.name} comme non aimé`}
                                            disabled={item.isFavorite}
                                          />
                                          <Label
                                            htmlFor={`${item.id}-disliked`}
                                            className={`text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer ${
                                              item.isFavorite
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                            title="Je n'aime pas"
                                          >
                                            <ThumbsDown className="h-3.5 w-3.5" />
                                          </Label>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Checkbox
                                            id={`${item.id}-allergenic`}
                                            checked={item.isAllergenic}
                                            onCheckedChange={(checked) =>
                                              handleFoodPreferenceChange(
                                                category.categoryName,
                                                item.id,
                                                "isAllergenic",
                                                !!checked
                                              )
                                            }
                                            aria-label={`Marquer ${item.name} comme allergène`}
                                            disabled={item.isFavorite}
                                          />
                                          <Label
                                            htmlFor={`${item.id}-allergenic`}
                                            className={`text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer ${
                                              item.isFavorite
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                            title="Allergie/Intolérance"
                                          >
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                          </Label>
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveSettings}
            className="w-full sm:flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder les paramètres
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleLoadSettingsAndPreferences} // Corrected function call
            className="w-full sm:flex-1"
            disabled={ // Updated disabled logic for Firebase
              !isClient || !userId || isDataLoading
            }
          >
            <Upload className="mr-2 h-4 w-4" />
            Charger les paramètres
          </Button>
        </div>

        <Button
          type="submit"
          disabled={isLoading || (isDataLoading && isClient)}
          className="w-full"
        >
          {isLoading || (isDataLoading && isClient) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isLoading ? "Génération en cours..." : "Chargement..."}
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Générer le plan alimentaire
            </>
          )}
        </Button>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="conseils-aliments-item" className="border-b-0">
            <Card className="shadow-lg card-glow-effect card-variant">
              <AccordionTrigger className="w-full text-left p-0 hover:no-underline group">
                <CardHeader className="flex flex-row items-center justify-between w-full p-4">
                  <div className="flex items-center gap-2">
                    <BookOpenText className="h-5 w-5 text-secondary-foreground" />
                    <CardTitle className="text-lg font-semibold text-foreground">
                      Conseils alimentaires optimisés pour Diabète de Type 2
                    </CardTitle>
                  </div>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent className="pt-0">
                <CardContent>
                  <RichTextDisplay
                    text={form.watch("diabeticResearchSummary")}
                  />
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleOpenEditTipsDialog}
                    className="text-sm p-0 h-auto mt-2"
                  >
                    Modifier les conseils
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </form>
      <Dialog
        open={isEditTipsDialogOpen}
        onOpenChange={setIsEditTipsDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier les Conseils Alimentaires</DialogTitle>
            <DialogDescriptionComponent>
              Modifiez le texte des conseils ci-dessous. Utilisez `**texte**`
              pour le gras. Les annotations comme (en gras et bleu) seront
              interprétées pour le style.
            </DialogDescriptionComponent>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editingTips}
              onChange={(e) => setEditingTips(e.target.value)}
              className="min-h-[250px] text-sm"
              rows={15}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditTipsDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                form.setValue("diabeticResearchSummary", editingTips, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                setIsEditTipsDialogOpen(false);
              }}
            >
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isNutritionalInfoDialogOpen}
        onOpenChange={setIsNutritionalInfoDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Valeurs nutritionnelles pour{" "}
              {selectedFoodItemForNutritionalInfo?.name}
            </DialogTitle>
            <DialogDescriptionComponent>
              Modifiez les informations nutritionnelles ci-dessous. Ces valeurs
              sont indicatives.
            </DialogDescriptionComponent>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {(
              Object.keys(editableNutritionalInfo) as Array<
                keyof EditableNutritionalInfo
              >
            ).map((key) => {
              const labelMap: Record<keyof EditableNutritionalInfo, string> = {
                calories: "Calories (kcal/portion ou 100g)",
                carbs: "Glucides (g)",
                protein: "Protéines (g)",
                fat: "Lipides (g)",
                sugars: "dont Sucres (g)",
                fiber: "Fibres (g)",
                sodium: "Sel/Sodium (mg ou g)",
                notes: "Notes / Portion de référence",
              };
              const currentLabel =
                labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);

              return (
                <div
                  key={key}
                  className="grid grid-cols-[1fr_2fr] items-center gap-x-2"
                >
                  <Label
                    htmlFor={`nutritional-${key}`}
                    className="text-right text-xs whitespace-nowrap"
                  >
                    {currentLabel} :
                  </Label>
                  {key === "notes" ? (
                    <Textarea
                      id={`nutritional-${key}`}
                      name={key}
                      value={editableNutritionalInfo[key] || ""}
                      onChange={handleNutritionalInfoInputChange}
                      className="col-span-1 text-sm"
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={`nutritional-${key}`}
                      name={key}
                      value={editableNutritionalInfo[key] || ""}
                      onChange={handleNutritionalInfoInputChange}
                      className="col-span-1 text-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNutritionalInfoDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveNutritionalInfo}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddFoodDialogOpen} onOpenChange={setIsAddFoodDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel aliment</DialogTitle>
            <DialogDescriptionComponent>
              Remplissez les informations ci-dessous pour ajouter un aliment à
              vos préférences.
            </DialogDescriptionComponent>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-3">
            {addFoodFormError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescriptionShadcn>
                  {addFoodFormError}
                </AlertDescriptionShadcn>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-food-name" className="text-right col-span-1">
                Nom*
              </Label>
              <Input
                id="new-food-name"
                name="name"
                value={newFoodData.name}
                onChange={handleAddNewFoodChange}
                className="col-span-3"
                placeholder="Ex: Tomate cerise"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="new-food-category"
                className="text-right col-span-1"
              >
                Catégorie*
              </Label>
              <Select
                value={newFoodData.categoryName}
                onValueChange={handleAddNewFoodCategoryChange}
              >
                <SelectTrigger id="new-food-category" className="col-span-3">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {baseInitialFoodCategories.map((cat) => (
                    <SelectItem key={cat.categoryName} value={cat.categoryName}>
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-food-ig" className="text-right col-span-1">
                IG
              </Label>
              <Input
                id="new-food-ig"
                name="ig"
                value={newFoodData.ig}
                onChange={handleAddNewFoodChange}
                className="col-span-3"
                placeholder="Ex: (IG: ~15)"
              />
            </div>
            {(Object.keys(initialNewFoodData) as Array<keyof NewFoodData>)
              .filter((key) => !["name", "categoryName", "ig"].includes(key))
              .map((key) => {
                const labelMap: Record<string, string> = {
                  calories: "Calories (kcal)",
                  carbs: "Glucides (g)",
                  protein: "Protéines (g)",
                  fat: "Lipides (g)",
                  sugars: "dont Sucres (g)",
                  fiber: "Fibres (g)",
                  sodium: "Sel/Sodium (mg ou g)",
                  notes: "Notes / Portion",
                };
                const currentLabel =
                  labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
                return (
                  <div
                    key={key}
                    className="grid grid-cols-4 items-center gap-4"
                  >
                    <Label
                      htmlFor={`new-food-${key}`}
                      className="text-right col-span-1 text-sm"
                    >
                      {currentLabel}
                    </Label>
                    {key === "notes" ? (
                      <Textarea
                        id={`new-food-${key}`}
                        name={key}
                        value={newFoodData[key as keyof NewFoodData] || ""}
                        onChange={handleAddNewFoodChange}
                        className="col-span-3"
                        rows={2}
                      />
                    ) : (
                      <Input
                        id={`new-food-${key}`}
                        name={key}
                        value={newFoodData[key as keyof NewFoodData] || ""}
                        onChange={handleAddNewFoodChange}
                        className="col-span-3"
                      />
                    )}
                  </div>
                );
              })}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleAddNewFood}>
              Ajouter l'aliment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}

