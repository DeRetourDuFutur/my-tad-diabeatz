
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
  FormDescription as FormDescriptionComponent,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, AlertTriangle, ThumbsDown, Star, CalendarDays, Save, Upload, ListFilter, PlusCircle, BookOpenText, BarChart2, Apple, Carrot, Nut, Wheat, Bean, Beef, Milk, Shell as OilIcon, Blend } from "lucide-react";
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
  DialogDescription as DialogDescriptionComponentUI,
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
import { format, addDays, differenceInDays, isValid, parseISO, isBefore, isEqual, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import type { FormSettings } from "@/lib/types";
import { Alert, AlertTitle, AlertDescription as AlertDescriptionShadcn } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


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
  let currentSectionTitle: React.ReactNode = null;
  let inList = false;

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <div key={`section-list-${elements.length}`} className="mb-3">
          {currentSectionTitle && <div className="mb-1">{currentSectionTitle}</div>}
          <ul className="list-disc pl-5 space-y-0.5">
            {currentListItems.map((item, idx) => (
              <li key={`li-${elements.length}-${idx}`} className="text-sm">{item}</li>
            ))}
          </ul>
        </div>
      );
      currentListItems = [];
      currentSectionTitle = null;
      inList = false;
    } else if (currentSectionTitle) {
        elements.push(<div key={`title-only-${elements.length}`} className="mb-1">{currentSectionTitle}</div>);
        currentSectionTitle = null;
    }
  };

  lines.forEach((line, index) => {
    const titleMatch = line.match(/^\*\*(.*?)\*\*/);
    const listItemMatch = line.match(/^- (.*)/);

    if (titleMatch) {
      flushList();
      let titleContent = titleMatch[1];
      let titleClasses = "font-semibold text-foreground";
      if (titleContent.includes("(en gras et bleu)")) {
        titleClasses = "font-semibold text-primary";
        titleContent = titleContent.replace("(en gras et bleu)", "").trim();
      } else if (titleContent.includes("(en gras et rouge)")) {
        titleClasses = "font-semibold text-destructive";
        titleContent = titleContent.replace("(en gras et rouge)", "").trim();
      } else if (titleContent.includes("(en gras)")) {
         titleContent = titleContent.replace("(en gras)", "").trim();
      }
      currentSectionTitle = <p className={titleClasses}>{titleContent}</p>;
    } else if (listItemMatch) {
      if (!inList && currentSectionTitle) {
        inList = true;
      } else if (!inList) {
        flushList();
        inList = true;
      }
      currentListItems.push(listItemMatch[1]);
    } else if (line.trim() !== "") { 
      flushList(); 
      elements.push(<p key={`p-${index}`} className="mb-1 text-sm">{line}</p>);
    }
  });

  flushList(); 

  return <div className="prose prose-sm dark:prose-invert max-w-none">{elements}</div>;
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


export function MealPlanForm({ onMealPlanGenerated }: MealPlanFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [foodCategoriesFromStorage, setFoodCategoriesInStorage] = useLocalStorage<FoodCategory[]>(
    "diabeatz-food-preferences",
    initialFoodCategories
  );
  const [processedFoodCategories, setProcessedFoodCategories] = useState<FoodCategory[]>(initialFoodCategories);
  
  const [selectionMode, setSelectionMode] = useState<'dates' | 'duration'>('dates');
  
  // States for "Par Dates" mode
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [displayDurationFromDates, setDisplayDurationFromDates] = useState<string>("1 jour");
  
  // States for "Par Durée" mode
  const [durationInDays, setDurationInDays] = useState<string>("1"); 
  const [durationModeStartDate, setDurationModeStartDate] = useState<Date | undefined>(undefined);
  const [displayEndDateFromDuration, setDisplayEndDateFromDuration] = useState<Date | undefined>(undefined);
  
  const [savedFormSettings, setSavedFormSettings] = useLocalStorage<FormSettings | null>("diabeatz-form-settings", null);
  const [isClient, setIsClient] = useState(false);
  
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [isDurationModeStartDatePickerOpen, setIsDurationModeStartDatePickerOpen] = useState(false);

  const [isEditTipsDialogOpen, setIsEditTipsDialogOpen] = useState(false);
  const [editingTips, setEditingTips] = useState<string>("");

  const [isNutritionalInfoDialogOpen, setIsNutritionalInfoDialogOpen] = useState(false);
  const [selectedFoodItemForNutritionalInfo, setSelectedFoodItemForNutritionalInfo] = useState<FoodItem | null>(null);
  const [editableNutritionalInfo, setEditableNutritionalInfo] = useState<EditableNutritionalInfo>({});

  const [isAddFoodDialogOpen, setIsAddFoodDialogOpen] = useState(false);
  const [newFoodData, setNewFoodData] = useState<NewFoodData>(initialNewFoodData);
  const [addFoodFormError, setAddFoodFormError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planName: "",
      diabeticResearchSummary: defaultResearchSummary,
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const tomorrow = startOfDay(addDays(new Date(), 1));
      if (savedFormSettings) {
        // handleLoadSettings will be called which sets dates
      } else {
        // Initialize dates for "Par Dates" mode
        setStartDate(tomorrow);
        setEndDate(new Date(tomorrow)); // for 1 day duration initially
        // Initialize date and duration for "Par Durée" mode
        setDurationModeStartDate(tomorrow);
        setDurationInDays("1");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // Effect to handle loading settings once they are available from localStorage
  useEffect(() => {
    if (isClient && savedFormSettings) {
        handleLoadSettings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, savedFormSettings]); // Trigger when savedFormSettings is hydrated

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


  // Update display duration when in "Par Dates" mode and dates change
  useEffect(() => {
    if (selectionMode === 'dates' && startDate && endDate && isValid(startDate) && isValid(endDate) && !isBefore(endDate, startDate)) {
      const diff = differenceInDays(endDate, startDate) + 1;
      setDisplayDurationFromDates(`${diff} jour${diff > 1 ? 's' : ''}`);
    } else if (selectionMode === 'dates') {
      setDisplayDurationFromDates("Durée invalide");
    }
  }, [startDate, endDate, selectionMode]);


  // Update display end date when in "Par Durée" mode and duration or start date changes
  useEffect(() => {
    if (selectionMode === 'duration' && durationModeStartDate && isValid(durationModeStartDate)) {
      const numDays = parseInt(durationInDays, 10);
      if (!isNaN(numDays) && numDays >= 1 && numDays <= 365) {
         const newEndDate = addDays(durationModeStartDate, numDays - 1);
         if (!isEqual(newEndDate, displayEndDateFromDuration || new Date(0))) { 
            setDisplayEndDateFromDuration(newEndDate);
         }
      } else {
        if (displayEndDateFromDuration !== undefined) { 
            setDisplayEndDateFromDuration(undefined); 
        }
      }
    }
  }, [durationInDays, durationModeStartDate, selectionMode, displayEndDateFromDuration]);


  const handleDurationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     if (value === "" || (/^\d{1,3}$/.test(value) && parseInt(value,10) >= 0 && parseInt(value, 10) <= 365 )) {
      setDurationInDays(value);
    } else if (/^\d+$/.test(value) && parseInt(value, 10) > 365) {
      setDurationInDays("365");
    }
  };

  const handleDurationInputBlur = () => {
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
                      ...((type === "isDisliked" || type === "isAllergenic") && checked && { isFavorite: false }),
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
    let planDurationForAI = "";
    let finalStartDateForAI: Date | undefined; // This will be used to ensure plan starts from a sensible date

    if (selectionMode === 'dates') {
      if (startDate && endDate && isValid(startDate) && isValid(endDate) && !isBefore(endDate, startDate)) {
        const diff = differenceInDays(endDate, startDate) + 1;
        planDurationForAI = `${diff} jour${diff > 1 ? 's' : ''}`;
        finalStartDateForAI = startDate;
      } else {
        toast({ title: "Dates invalides", description: "Veuillez sélectionner une date de début et de fin valides.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    } else { // selectionMode === 'duration'
      const numDays = parseInt(durationInDays, 10);
      if (durationModeStartDate && isValid(durationModeStartDate) && !isNaN(numDays) && numDays >= 1 && numDays <= 365) {
        planDurationForAI = `${numDays} jour${numDays > 1 ? 's' : ''}`;
        finalStartDateForAI = durationModeStartDate; 
      } else {
        toast({ title: "Configuration de durée invalide", description: "Veuillez entrer une durée valide (1-365 jours) et une date de début.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }

    if (!planDurationForAI || !finalStartDateForAI) {
      toast({ title: "Configuration de période invalide", description: "Veuillez configurer la période du plan.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    // Further check: Ensure the finalStartDateForAI is not in the past
    const today = startOfDay(new Date());
    if (isBefore(finalStartDateForAI, today)) {
        toast({ title: "Date de début passée", description: "La date de début du plan ne peut pas être dans le passé.", variant: "destructive"});
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

  const handleOpenEditTipsDialog = () => {
    setEditingTips(form.getValues('diabeticResearchSummary'));
    setIsEditTipsDialogOpen(true);
  };

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
      selectionMode: selectionMode,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
      durationInDays: durationInDays,
      durationModeStartDate: durationModeStartDate ? durationModeStartDate.toISOString() : undefined,
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
        diabeticResearchSummary: savedFormSettings.diabeticResearchSummary || defaultResearchSummary,
      });

      const hydratedFoodPrefs = initialFoodCategories.map(initialCat => {
        const storedCat = savedFormSettings.foodPreferences.find(sc => sc.categoryName === initialCat.categoryName);
        if (storedCat) {
            const mergedItems = initialCat.items.map(initItem => {
                const storedItem = storedCat.items.find(si => si.id === initItem.id);
                return {
                    ...initItem,
                    ...(storedItem || {}), 
                    calories: storedItem?.calories ?? initItem.calories,
                    carbs: storedItem?.carbs ?? initItem.carbs,
                    protein: storedItem?.protein ?? initItem.protein,
                    fat: storedItem?.fat ?? initItem.fat,
                    sugars: storedItem?.sugars ?? initItem.sugars,
                    fiber: storedItem?.fiber ?? initItem.fiber,
                    sodium: storedItem?.sodium ?? initItem.sodium,
                    notes: storedItem?.notes ?? initItem.notes,
                };
            });
            storedCat.items.forEach(storedItem => {
                if (!mergedItems.some(mi => mi.id === storedItem.id)) {
                    mergedItems.push(storedItem);
                }
            });
            return { ...initialCat, ...storedCat, items: mergedItems.sort((a,b) => a.name.localeCompare(b.name)) };
        }
        return initialCat; 
      });
      savedFormSettings.foodPreferences.forEach(storedCat => {
        if(!hydratedFoodPrefs.some(hp => hp.categoryName === storedCat.categoryName)) {
            hydratedFoodPrefs.push(storedCat); 
        }
      });
      setFoodCategoriesInStorage(hydratedFoodPrefs);


      setSelectionMode(savedFormSettings.selectionMode || 'dates');
      const tomorrow = startOfDay(addDays(new Date(), 1));

      let newStartDate = tomorrow;
      if (savedFormSettings.startDate) {
        const parsed = parseISO(savedFormSettings.startDate);
        if (isValid(parsed)) {
          newStartDate = startOfDay(parsed);
        }
      }
      setStartDate(newStartDate);

      let newEndDate = new Date(newStartDate); 
      if (savedFormSettings.endDate) {
        const parsedEnd = parseISO(savedFormSettings.endDate);
        if (isValid(parsedEnd)) {
            const startOfDayEnd = startOfDay(parsedEnd);
            if (!isBefore(startOfDayEnd, newStartDate)) {
                 newEndDate = startOfDayEnd;
            }
        }
      }
      setEndDate(newEndDate);
      
      setDurationInDays(savedFormSettings.durationInDays || "1");
      let newDurationModeStartDate = tomorrow; 
      if (savedFormSettings.durationModeStartDate) {
        const parsedDurationStart = parseISO(savedFormSettings.durationModeStartDate);
        if (isValid(parsedDurationStart)) {
          newDurationModeStartDate = startOfDay(parsedDurationStart);
        }
      }
      setDurationModeStartDate(newDurationModeStartDate);

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
  }, [savedFormSettings, form, setFoodCategoriesInStorage]); 


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
    foodCategoriesFromStorage.forEach(category => {
      if (category.categoryName === newFoodData.categoryName) {
        if (category.items.some(item => item.name.toLowerCase() === newFoodData.name.trim().toLowerCase())) {
          setAddFoodFormError(`L'aliment "${newFoodData.name.trim()}" existe déjà dans la catégorie "${newFoodData.categoryName}".`);
          foodAlreadyExists = true;
        }
      }
    });

    if(foodAlreadyExists) {
      return;
    }

    const newFoodItem: FoodItem = {
      id: `custom-${Date.now()}`,
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
      // If category doesn't exist, create it (though this case might not happen if select is populated from existing categories)
      return [...prevCategories, { categoryName: newFoodData.categoryName, items: [newFoodItem] }];
    });

    toast({
      title: "Aliment ajouté!",
      description: `${newFoodItem.name} a été ajouté à la catégorie ${newFoodData.categoryName}.`,
    });
    setIsAddFoodDialogOpen(false);
    setNewFoodData(initialNewFoodData);
  };


  if (!isClient) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg"><CardHeader><CardTitle className="text-lg font-semibold">Chargement...</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>
        <Card className="shadow-lg"><CardHeader><CardTitle className="text-lg font-semibold">Chargement...</CardTitle></CardHeader><CardContent><Loader2 className="animate-spin" /></CardContent></Card>
      </div>
    );
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="multiple" defaultValue={["config-base-item", "prefs-aliments-item"]} className="w-full space-y-6">
         
          <AccordionItem value="config-base-item" className="border-b-0">
             <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between w-full p-4">
                    <AccordionTrigger className="w-full text-left p-0 hover:no-underline group">
                        <div className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-secondary-foreground" />
                            <CardTitle className="text-lg font-semibold">Planification</CardTitle>
                        </div>
                    </AccordionTrigger>
                </CardHeader>
                <AccordionContent className="pt-0">
                  <CardContent>
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="planName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du plan (optionnel)</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex. : Plan alimentaire personnalisé" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormItem>
                        <FormLabel className="text-base font-medium mb-2 block">Calendrier / Durée</FormLabel>
                         <FormDescriptionComponent className="mb-3">
                           Choisissez la date de début et de fin du plan ou indiquez le nombre de jours souhaité.
                        </FormDescriptionComponent>
                        <RadioGroup
                          value={selectionMode}
                          onValueChange={(value: 'dates' | 'duration') => setSelectionMode(value)}
                          className="flex space-x-4 my-2"
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

                        {selectionMode === 'dates' && (
                          <div className="flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex-1 min-w-[150px] sm:min-w-[180px]">
                              <Label htmlFor="start-date-picker" className="text-sm font-medium mb-1 block">Date de début</Label>
                              <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="start-date-picker"
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal h-10", !startDate && "text-muted-foreground")}
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
                                        const newStartDate = startOfDay(date);
                                        const today = startOfDay(new Date());
                                        if (isBefore(newStartDate, today)) { 
                                          setStartDate(today);
                                          if (endDate && isBefore(endDate, today)) setEndDate(new Date(today));
                                        } else {
                                          setStartDate(newStartDate);
                                          if (endDate && isBefore(endDate, newStartDate)) {
                                            setEndDate(new Date(newStartDate));
                                          }
                                        }
                                      }
                                      setIsStartDatePickerOpen(false);
                                    }}
                                    disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="flex-1 min-w-[150px] sm:min-w-[180px]">
                              <Label htmlFor="end-date-picker" className="text-sm font-medium mb-1 block">Date de fin</Label>
                              <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="end-date-picker"
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal h-10", !endDate && "text-muted-foreground")}
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
                                        const newEndDate = startOfDay(date);
                                        if (!isBefore(newEndDate, startDate)) {
                                            setEndDate(newEndDate);
                                        }
                                      }
                                      setIsEndDatePickerOpen(false);
                                    }}
                                    disabled={(date) => {
                                      const minDate = startDate && isValid(startDate) ? new Date(startDate) : startOfDay(addDays(new Date(),-1)); 
                                      return isBefore(startOfDay(date), minDate);
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="h-10 flex items-center text-sm text-primary min-w-[80px] text-right sm:text-left sm:justify-start">
                              {displayDurationFromDates !== "Durée invalide" && displayDurationFromDates}
                            </div>
                          </div>
                        )}

                        {selectionMode === 'duration' && (
                           <div className="flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex-1 min-w-[150px] sm:min-w-[180px]">
                               <Label htmlFor="duration-mode-start-date-picker" className="text-sm font-medium mb-1 block">Date de début</Label>
                               <Popover open={isDurationModeStartDatePickerOpen} onOpenChange={setIsDurationModeStartDatePickerOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="duration-mode-start-date-picker"
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal h-10", !durationModeStartDate && "text-muted-foreground")}
                                  >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {durationModeStartDate && isValid(durationModeStartDate) ? format(durationModeStartDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={durationModeStartDate}
                                    onSelect={(date) => {
                                      if (date) {
                                        const newDurationStartDate = startOfDay(date);
                                        const today = startOfDay(new Date());
                                        if (isBefore(newDurationStartDate, today)) {
                                          setDurationModeStartDate(today);
                                        } else {
                                          setDurationModeStartDate(newDurationStartDate);
                                        }
                                      }
                                      setIsDurationModeStartDatePickerOpen(false);
                                    }}
                                     disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="w-full sm:w-auto md:w-24">
                              <Label htmlFor="duration-input-field" className="text-sm font-medium mb-1 block">Durée en jours</Label>
                              <Input
                                id="duration-input-field"
                                type="text" 
                                value={durationInDays}
                                onChange={handleDurationInputChange}
                                onBlur={handleDurationInputBlur}
                                className="h-10 text-center bg-secondary"
                                placeholder="Jours"
                              />
                            </div>
                            <div className="h-10 flex items-center flex-1 text-sm text-primary min-w-[150px] sm:min-w-[180px]">
                                {displayEndDateFromDuration && isValid(displayEndDateFromDuration) && (
                                    <div>
                                        <span className="font-medium text-muted-foreground">Fin du plan : </span>
                                        {format(displayEndDateFromDuration, "PPP", { locale: fr })}
                                    </div>
                                )}
                            </div>
                          </div>
                        )}
                      </FormItem>
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
          </AccordionItem>

          <AccordionItem value="prefs-aliments-item" className="border-b-0">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between w-full p-4">
                  <AccordionTrigger className="w-full text-left p-0 hover:no-underline group flex-1">
                    <div className="flex items-center gap-2">
                      <ListFilter className="h-5 w-5 text-secondary-foreground" />
                      <CardTitle className="text-lg font-semibold">Préférences alimentaires</CardTitle>
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
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un aliment
                  </Button>
              </CardHeader>
              <AccordionContent className="pt-0">
                  <CardContent>
                      <FormDescriptionComponent className="mb-2">
                        Cochez vos aliments favoris, à éviter ou allergènes.<br/>
                        Les aliments favoris seront privilégiés pour vos plans de repas.
                      </FormDescriptionComponent>
                      <div className="max-h-[400px] overflow-y-auto p-1 rounded-md border mt-2">
                      <Accordion type="multiple" className="w-full">
                          {processedFoodCategories.map(category => {
                          const CategoryIcon = categoryIcons[category.categoryName] || ListFilter;
                          return (
                              <AccordionItem value={category.categoryName} key={category.categoryName} className="border-b-0 last:border-b-0">
                              <AccordionTrigger className="py-3 px-2 hover:no-underline hover:bg-muted/50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <CategoryIcon className="h-4 w-4 text-secondary-foreground" />
                                  <span className="text-md font-semibold text-primary">{category.categoryName}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-1 pb-2 px-2">
                                  <ul className="space-y-1 pl-2">
                                  {category.items.map(item => (
                                      <li key={item.id} className="py-1 border-b border-border/50 last:border-b-0">
                                      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-2">
                                          <div>
                                            <span className={cn(
                                                "text-sm font-medium",
                                                item.isDisliked && "line-through",
                                                item.isAllergenic && "text-destructive"
                                            )}>{item.name}</span>
                                            <span className={cn(
                                                "text-xs text-muted-foreground ml-1",
                                                item.isDisliked && "line-through",
                                                item.isAllergenic && "text-destructive"
                                            )}>{item.ig}</span>
                                          </div>
                                          <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="p-1 h-auto justify-self-end"
                                          onClick={() => handleOpenNutritionalInfoDialog(item)}
                                          title="Valeurs nutritionnelles"
                                          >
                                          <BarChart2 className="h-3.5 w-3.5" />
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
                          );
                          })}
                      </Accordion>
                      </div>
                  </CardContent>
                </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

        <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleSaveSettings} className="w-full sm:flex-1">
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder les paramètres
            </Button>
            <Button
                type="button"
                variant="outline"
                onClick={handleLoadSettings}
                className="w-full sm:flex-1"
                disabled={!isClient || (!savedFormSettings && (typeof window !== 'undefined' && !localStorage.getItem("diabeatz-form-settings")))}
            >
                <Upload className="mr-2 h-4 w-4" />
                Charger les paramètres
            </Button>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
            <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Génération en cours...
            </>
        ) : (
            <>
            <Wand2 className="mr-2 h-4 w-4" />
            Générer le plan alimentaire
            </>
        )}
        </Button>
        
        <Accordion type="single" collapsible className="w-full space-y-6">
            <AccordionItem value="conseils-aliments-item" className="border-b-0">
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between w-full p-4">
                        <AccordionTrigger className="w-full text-left p-0 hover:no-underline group">
                            <div className="flex items-center gap-2">
                                <BookOpenText className="h-5 w-5 text-secondary-foreground" />
                                <CardTitle className="text-lg font-semibold text-foreground">
                                    Conseils alimentaires optimisés pour Diabète de Type 2
                                </CardTitle>
                            </div>
                        </AccordionTrigger>
                    </CardHeader>
                    <AccordionContent className="pt-0">
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="diabeticResearchSummary"
                                render={({ field }) => (
                                    <FormItem>
                                        <RichTextDisplay text={field.value} />
                                        <Button
                                            type="button"
                                            variant="link"
                                            onClick={handleOpenEditTipsDialog}
                                            className="text-sm p-0 h-auto mt-2"
                                        >
                                            Modifier les conseils
                                        </Button>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </AccordionContent>
                </Card>
            </AccordionItem>
        </Accordion>

      </form>
        <Dialog open={isEditTipsDialogOpen} onOpenChange={setIsEditTipsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier les Conseils Alimentaires</DialogTitle>
              <DialogDescriptionComponentUI>
                Modifiez le texte des conseils ci-dessous. Utilisez `**texte**` pour le gras.
                Les annotations comme (en gras et bleu) seront interprétées pour le style.
              </DialogDescriptionComponentUI>
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
              <DialogDescriptionComponentUI>
                Modifiez les informations nutritionnelles ci-dessous. Ces valeurs sont indicatives.
              </DialogDescriptionComponentUI>
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
              <DialogDescriptionComponentUI>
                Remplissez les informations ci-dessous pour ajouter un aliment à vos préférences.
              </DialogDescriptionComponentUI>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-3">
              {addFoodFormError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescriptionShadcn>{addFoodFormError}</AlertDescriptionShadcn>
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

