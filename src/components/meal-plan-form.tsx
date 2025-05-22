
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, AlertTriangle, ThumbsDown, Star, CalendarDays, Save, Upload, Info, ListFilter, PlusCircle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const defaultResearchSummary = `**Privilégiez la variété et la fraîcheur (en gras et bleu)**
- Cuisinez autant que possible à partir d’aliments frais et peu transformés, en variant les sources de nutriments sur la semaine.
- Aucun aliment n’est strictement interdit, mais il est préférable de limiter les produits ultra-transformés, les sucres ajoutés et les plats industriels.

**Faites la part belle aux légumes non amylacés (en gras et bleu)**
- Consommez au moins 3 portions de légumes par jour, en privilégiant les légumes verts à feuilles, les crucifères, les légumes colorés et les courges.
- Remplissez la moitié de votre assiette de légumes à chaque repas pour augmenter l’apport en fibres et limiter l’absorption des glucides.

**Choisissez des céréales complètes et des légumineuses (en gras et bleu)**
- Remplacez les céréales raffinées (pain blanc, riz blanc) par des céréales complètes (pain complet, riz brun, quinoa, avoine).
- Intégrez des légumineuses (lentilles, pois chiches, haricots) au moins deux fois par semaine pour leur richesse en fibres et protéines végétales.

**Privilégiez les protéines maigres et les bonnes graisses (en gras et bleu)**
- Optez pour des sources de protéines maigres : volaille sans peau, poissons gras (saumon, sardine, maquereau) riches en oméga-3, œufs.
- Consommez des huiles végétales (olive, colza, tournesol), des avocats, des noix et des graines en quantité modérée pour favoriser les acides gras insaturés.

**Contrôlez la qualité et la quantité des glucides (en gras et bleu)**
- Répartissez les glucides de façon régulière à chaque repas et collation, en visant 45 à 75 g de glucides par repas, et 15 à 30 g par collation si nécessaire.
- Privilégiez les aliments à faible ou moyen indice glycémique (IG) : légumes, fruits à coque, légumineuses, céréales complètes.
- Limitez les aliments à IG élevé (pain blanc, pommes de terre, sodas, pâtisseries).

**Assurez un apport suffisant en fibres (en gras et bleu)**
- Consommez au moins 5 portions de fruits et légumes par jour, dont 2 à 3 fruits (entiers, non en jus).
- Les fibres ralentissent l’absorption des sucres et facilitent le contrôle de la glycémie.

**Maîtrisez les portions et respectez votre satiété (en gras et bleu)**
- Utilisez des assiettes plus petites, remplissez la moitié de légumes, et limitez la portion de féculents à la taille de votre poing.
- Écoutez vos signaux de faim et de satiété, prenez le temps de savourer vos repas.

**Structurez vos repas et collations (en gras et bleu)**
- Prenez 3 repas principaux par jour à horaires réguliers, sans sauter de repas.
- Si besoin, ajoutez 1 à 2 collations nutritives pour prévenir les hypoglycémies ou combler la faim, en privilégiant des aliments riches en fibres et protéines.

**Limitez le sel, l’alcool et les graisses saturées (en gras et bleu)**
- Réduisez la consommation de sel pour prévenir l’hypertension.
- Limitez l’alcool à un verre par jour pour les femmes, deux pour les hommes, en tenant compte de ses effets sur la glycémie.
- Privilégiez la volaille et limitez les viandes rouges et charcuteries à 500g par semaine maximum.

**Adaptez votre alimentation à votre mode de vie (en gras et bleu)**
- Tenez compte de vos horaires, préférences alimentaires et activité physique pour construire des repas adaptés et durables.

**N’hésitez pas à consulter un(e) diététicien(ne) pour un accompagnement personnalisé (en gras et rouge)**`;

const RichTextDisplay: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const elements: JSX.Element[] = [];
  let currentListItems: string[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc pl-5 mb-2 space-y-0.5">
          {currentListItems.map((item, idx) => (
            <li key={`li-${elements.length}-${idx}`}>{item}</li>
          ))}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, index) => {
    const titleMatch = line.match(/^\*\*(.*?)\*\*/);
    const listItemMatch = line.match(/^- (.*)/);

    if (titleMatch) {
      flushList();
      let titleContent = titleMatch[1];
      let titleClasses = "font-semibold my-3 text-foreground"; 
      if (titleContent.includes("(en gras et bleu)")) {
        titleClasses = "font-semibold my-3 text-primary";
        titleContent = titleContent.replace("(en gras et bleu)", "").trim();
      } else if (titleContent.includes("(en gras et rouge)")) {
        titleClasses = "font-semibold my-3 text-destructive";
        titleContent = titleContent.replace("(en gras et rouge)", "").trim();
      } else if (titleContent.includes("(en gras)")) {
         titleContent = titleContent.replace("(en gras)", "").trim();
      }
      elements.push(<p key={`title-${index}`} className={titleClasses}>{titleContent}</p>);
    } else if (listItemMatch) {
      currentListItems.push(listItemMatch[1]);
    } else if (line.trim() !== "") { 
      flushList();
      elements.push(<p key={`p-${index}`} className="mb-1">{line}</p>);
    }
  });

  flushList(); 

  return <div className="text-sm prose prose-sm dark:prose-invert max-w-none">{elements}</div>;
};

type EditableNutritionalInfo = {
  calories?: string;
  carbs?: string;
  protein?: string;
  fat?: string;
  sugars?: string;
  fiber?: string;
  sodium?: string;
  notes?: string;
};

type NewFoodData = {
  name: string;
  categoryName: string;
  ig: string;
  calories?: string;
  carbs?: string;
  protein?: string;
  fat?: string;
  sugars?: string;
  fiber?: string;
  sodium?: string;
  notes?: string;
};

const initialNewFoodData: NewFoodData = {
  name: "",
  categoryName: "",
  ig: "",
  calories: "",
  carbs: "",
  protein: "",
  fat: "",
  sugars: "",
  fiber: "",
  sodium: "",
  notes: "",
};


export function MealPlanForm({ onMealPlanGenerated }: MealPlanFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [foodCategoriesFromStorage, setFoodCategoriesInStorage] = useLocalStorage<FoodCategory[]>(
    "diabeatz-food-preferences",
    initialFoodCategories
  );

  const [processedFoodCategories, setProcessedFoodCategories] = useState<FoodCategory[]>(initialFoodCategories);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined); 
  const [durationInDays, setDurationInDays] = useState<string>("1");


  const [savedFormSettings, setSavedFormSettings] = useLocalStorage<FormSettings | null>("diabeatz-form-settings", null);
  const [isClient, setIsClient] = useState(false);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [isEditTipsDialogOpen, setIsEditTipsDialogOpen] = useState(false);
  const [editingTips, setEditingTips] = useState<string>("");

  const [isNutritionalInfoDialogOpen, setIsNutritionalInfoDialogOpen] = useState(false);
  const [selectedFoodItemForNutritionalInfo, setSelectedFoodItemForNutritionalInfo] = useState<FoodItem | null>(null);
  const [editableNutritionalInfo, setEditableNutritionalInfo] = useState<EditableNutritionalInfo>({});

  const [isAddFoodDialogOpen, setIsAddFoodDialogOpen] = useState(false);
  const [newFoodData, setNewFoodData] = useState<NewFoodData>(initialNewFoodData);
  const [addFoodFormError, setAddFoodFormError] = useState<string | null>(null);


 useEffect(() => {
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    if (!startDate) {
      setStartDate(tomorrow);
    }
    if (!endDate) {
      setEndDate(new Date(tomorrow)); 
    }
    setIsClient(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    const hydratedCategories = foodCategoriesFromStorage.map(storedCategory => {
      const initialCategoryDefinition = initialFoodCategories.find(
        initCat => initCat.categoryName === storedCategory.categoryName
      );
      const initialItems = initialCategoryDefinition ? initialCategoryDefinition.items : [];
      
      const mergedItems = initialItems.map(initialItem => { 
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
      });

      // Add custom items from storage that are not in initialItems
      storedCategory.items.forEach(storedItem => {
        if (!mergedItems.some(mi => mi.id === storedItem.id)) {
          mergedItems.push(storedItem);
        }
      });

      return {
        ...(initialCategoryDefinition || {}), 
        ...storedCategory, 
        categoryName: storedCategory.categoryName, 
        items: mergedItems.sort((a, b) => a.name.localeCompare(b.name)),
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
 
  useEffect(() => {
    if (startDate && endDate && isValid(startDate) && isValid(endDate) && endDate >= startDate) {
      const diff = differenceInDays(endDate, startDate) + 1;
      if (durationInDays !== diff.toString()) {
        setDurationInDays(diff.toString());
      }
    } else if (startDate && !endDate) { 
        if (durationInDays !== "1") {
             setDurationInDays("1");
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => {
    if (!startDate || !isValid(startDate)) return;
    
    const numDays = parseInt(durationInDays, 10);
    if (!isNaN(numDays) && numDays >= 1 && numDays <= 365) { 
      const newEndDate = addDays(startDate, numDays - 1);
      if (!endDate || !isValid(endDate) || newEndDate.getTime() !== endDate.getTime()) {
        setEndDate(newEndDate);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationInDays, startDate]);


  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (/^\d{1,3}$/.test(value) && parseInt(value, 10) <= 365 && parseInt(value, 10) > 0 )) { 
      setDurationInDays(value);
    } else if (/^\d+$/.test(value) && parseInt(value, 10) > 365) {
      setDurationInDays("365"); 
    } else if (value === "0" || (value !== "" && parseInt(value,10) <=0 ) ) {
      setDurationInDays("1");
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
        // @ts-ignore
        description: error.message || "Impossible de générer le plan repas. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenNutritionalInfoDialog = (item: FoodItem) => {
    setSelectedFoodItemForNutritionalInfo(item);
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

  const handleSaveNutritionalInfo = () => {
    if (!selectedFoodItemForNutritionalInfo) return;

    setFoodCategoriesInStorage(prevCategories =>
        prevCategories.map(category => ({
            ...category,
            items: category.items.map(item =>
                item.id === selectedFoodItemForNutritionalInfo.id
                    ? {
                        ...item,
                        ...editableNutritionalInfo, 
                      }
                    : item
            ),
        }))
    );
    setIsNutritionalInfoDialogOpen(false);
    toast({ title: "Informations nutritionnelles mises à jour!", description: `Pour ${selectedFoodItemForNutritionalInfo.name}.` });
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

  const handleLoadSettings = useCallback(() => {
    if (savedFormSettings) {
      form.reset({
        planName: savedFormSettings.planName || "",
        diabeticResearchSummary: savedFormSettings.diabeticResearchSummary,
      });
      
      const hydratedFoodPrefs = savedFormSettings.foodPreferences.map(storedCat => {
        const initialCatDef = initialFoodCategories.find(ic => ic.categoryName === storedCat.categoryName);
        const initialItems = initialCatDef ? initialCatDef.items : [];
        
        const mergedItems = initialItems.map(initItem => {
            const storedItem = storedCat.items.find(si => si.id === initItem.id);
            return {
                ...initItem,
                ...(storedItem || {}),
            };
        });

        storedCat.items.forEach(storedItem => {
            if (!mergedItems.some(mi => mi.id === storedItem.id)) {
                mergedItems.push(storedItem);
            }
        });
        
        return {
          ...(initialCatDef || {}), // Ensure category-level defaults if any
          ...storedCat,
          items: mergedItems.sort((a, b) => a.name.localeCompare(b.name)),
        };
      });
      setFoodCategoriesInStorage(hydratedFoodPrefs);
      
      let newStartDate = addDays(new Date(), 1); 
      newStartDate.setHours(0,0,0,0);
      if (savedFormSettings.startDate) {
        const parsed = parseISO(savedFormSettings.startDate);
        if (isValid(parsed)) {
            parsed.setHours(0,0,0,0);
            newStartDate = parsed;
        }
      }
      setStartDate(newStartDate);

      let newEndDate = new Date(newStartDate); 
      if (savedFormSettings.endDate) {
        const parsed = parseISO(savedFormSettings.endDate);
        if (isValid(parsed)) {
            parsed.setHours(0,0,0,0);
            if (parsed >= newStartDate) { 
                 newEndDate = parsed;
            }
        }
      }
      setEndDate(newEndDate);
      
      // This will trigger the useEffect that updates durationInDays based on startDate and endDate
      const diff = differenceInDays(newEndDate, newStartDate) + 1;
      setDurationInDays(diff.toString());

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedFormSettings, form.reset, setFoodCategoriesInStorage]);

  const handleAddNewFoodChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFoodData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewFoodCategoryChange = (value: string) => {
    setNewFoodData(prev => ({ ...prev, categoryName: value }));
  };

  const handleAddNewFood = () => {
    setAddFoodFormError(null);
    if (!newFoodData.name.trim() || !newFoodData.categoryName) {
      setAddFoodFormError("Le nom de l'aliment et la catégorie sont requis.");
      return;
    }

    let foodAlreadyExists = false;
    const updatedCategories = foodCategoriesFromStorage.map(category => {
      if (category.categoryName === newFoodData.categoryName) {
        if (category.items.some(item => item.name.toLowerCase() === newFoodData.name.trim().toLowerCase())) {
          setAddFoodFormError(`L'aliment "${newFoodData.name.trim()}" existe déjà dans la catégorie "${newFoodData.categoryName}".`);
          foodAlreadyExists = true;
          return category; 
        }
      }
      return category;
    });

    if(foodAlreadyExists) {
      setFoodCategoriesInStorage(updatedCategories); // This ensures the UI doesn't "lose" the category if an error happens
      return;
    }
    
    const newFoodItem: FoodItem = {
      id: `custom-${Date.now()}`,
      ...newFoodData,
      ig: newFoodData.ig || "(IG: N/A)",
      isFavorite: false,
      isDisliked: false,
      isAllergenic: false,
    };

    setFoodCategoriesInStorage(prevCategories => {
      const targetCategoryIndex = prevCategories.findIndex(cat => cat.categoryName === newFoodData.categoryName);
      if (targetCategoryIndex !== -1) {
        const updatedCategory = {
          ...prevCategories[targetCategoryIndex],
          items: [...prevCategories[targetCategoryIndex].items, newFoodItem].sort((a,b) => a.name.localeCompare(b.name)),
        };
        const newCategories = [...prevCategories];
        newCategories[targetCategoryIndex] = updatedCategory;
        return newCategories;
      }
      // Should not happen if category selection is enforced, but as a fallback:
      return [...prevCategories, { categoryName: newFoodData.categoryName, items: [newFoodItem] }];
    });

    toast({
      title: "Aliment ajouté!",
      description: `${newFoodItem.name} a été ajouté à la catégorie ${newFoodData.categoryName}.`,
    });
    setIsAddFoodDialogOpen(false);
    setNewFoodData(initialNewFoodData); 
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wand2 className="h-6 w-6 text-primary" />
              Configuration de base
            </CardTitle>
            <CardDescription>
             Personnalisez vos préférences et générez un plan de repas adapté sur une période de votre choix.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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
                      <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
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
                                    // Silently ignore or set to today if you prefer
                                    // setStartDate(today); // Example: force today
                                  } else {
                                    date.setHours(0,0,0,0);
                                    setStartDate(date);
                                    if (endDate && date > endDate) {
                                      setEndDate(new Date(date)); 
                                    }
                                  }
                              }
                              setIsStartDatePickerOpen(false);
                            }}
                            disabled={(date) => {
                                const minSelectableDate = new Date();
                                 minSelectableDate.setDate(minSelectableDate.getDate() -1); // Allows selecting today
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
                      <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
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
                            onSelect={(date) => {
                              if (date && startDate && isValid(startDate)) {
                                  date.setHours(0,0,0,0);
                                  if (date >= startDate) { 
                                      setEndDate(date);
                                  }
                              }
                              setIsEndDatePickerOpen(false);
                            }}
                            disabled={(date) => {
                              const minDate = startDate && isValid(startDate) ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() -1));
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
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex-grow">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <ListFilter className="h-5 w-5 text-primary" />
                Préférences alimentaires
              </CardTitle>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => { 
                setNewFoodData(initialNewFoodData); 
                setAddFoodFormError(null);
                setIsAddFoodDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un aliment
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground whitespace-pre-line mb-3">
              Cochez vos aliments favoris, à éviter ou allergènes.
              <br/>
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
                            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-start gap-x-2">
                              <div>
                                <span className="text-sm font-medium">{item.name} <span className="text-xs text-muted-foreground">{item.ig}</span></span>
                                {/* Nutritional info display removed from here */}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="p-1 h-auto justify-self-end"
                                onClick={() => handleOpenNutritionalInfoDialog(item)}
                                title="Valeurs nutritionnelles"
                              >
                                <Info className="h-3.5 w-3.5" />
                              </Button>
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
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
             <CardTitle className="text-xl">Conseils alimentaires optimisés pour Diabète de Type 2</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="dietary-advice-section">
                <AccordionTrigger className="text-md font-semibold text-foreground hover:no-underline hover:bg-muted/50 rounded-md py-3 px-2">
                  Afficher/Masquer les conseils
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-2 px-2">
                  <FormField
                    control={form.control}
                    name="diabeticResearchSummary"
                    render={({ field }) => ( 
                      <FormItem className="mt-2">
                        <div className="mb-3 p-3 border rounded-md bg-background/50 max-h-60 overflow-y-auto">
                           <RichTextDisplay text={field.value} />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTips(form.getValues('diabeticResearchSummary'));
                            setIsEditTipsDialogOpen(true);
                          }}
                        >
                          Modifier les conseils
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

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
            disabled={!isClient || (!savedFormSettings && (typeof window !== 'undefined' && !localStorage.getItem("diabeatz-form-settings")))}
          >
            <Upload className="mr-2 h-4 w-4" />
            Charger les paramètres
          </Button>
        </div>
      </form>
        <Dialog open={isEditTipsDialogOpen} onOpenChange={setIsEditTipsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier les Conseils Alimentaires</DialogTitle>
              <DialogDescription>
                Modifiez le texte des conseils ci-dessous. Utilisez `**texte**` pour le gras.
                Les annotations comme (en gras et bleu) seront interprétées pour le style.
              </DialogDescription>
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
              <Button variant="outline" onClick={() => setIsEditTipsDialogOpen(false)}>Annuler</Button>
              <Button
                onClick={() => {
                  form.setValue('diabeticResearchSummary', editingTips, { shouldValidate: true, shouldDirty: true });
                  setIsEditTipsDialogOpen(false);
                }}
              >
                Enregistrer les modifications
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isNutritionalInfoDialogOpen} onOpenChange={setIsNutritionalInfoDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Valeurs nutritionnelles pour {selectedFoodItemForNutritionalInfo?.name}</DialogTitle>
              <DialogDescription>
                Modifiez les informations nutritionnelles ci-dessous. Ces valeurs sont indicatives.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              {(Object.keys(editableNutritionalInfo) as Array<keyof EditableNutritionalInfo>).map((key) => {
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
                const currentLabel = labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);

                return (
                  <div key={key} className="grid grid-cols-[1fr_2fr] items-center gap-x-2">
                    <Label htmlFor={`nutritional-${key}`} className="text-right text-xs whitespace-nowrap">
                      {currentLabel} :
                    </Label>
                    {key === 'notes' ? (
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
              <Button variant="outline" onClick={() => setIsNutritionalInfoDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSaveNutritionalInfo}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddFoodDialogOpen} onOpenChange={setIsAddFoodDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel aliment</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour ajouter un aliment à vos préférences.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-3">
              {addFoodFormError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{addFoodFormError}</AlertDescription>
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
                <Label htmlFor="new-food-category" className="text-right col-span-1">
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
                    {initialFoodCategories.map(cat => (
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
                .filter(key => !["name", "categoryName", "ig"].includes(key))
                .map(key => {
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
                  const currentLabel = labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
                  return (
                    <div key={key} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`new-food-${key}`} className="text-right col-span-1 text-sm">
                        {currentLabel}
                      </Label>
                      {key === 'notes' ? (
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
                <Button type="button" variant="outline">Annuler</Button>
              </DialogClose>
              <Button type="button" onClick={handleAddNewFood}>Ajouter l'aliment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </Form>
  );
}

    