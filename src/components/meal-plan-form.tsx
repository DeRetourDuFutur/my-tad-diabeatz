
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
import { Loader2, Wand2, AlertTriangle, ThumbsDown, Star, CalendarDays, Save, Upload, ListFilter, PlusCircle, BookOpenText, BarChart2, Apple, Carrot, Nut, Wheat, Bean, Beef, Milk, CookingPot as OilIcon, Blend } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FoodCategory, FoodItem, FormSettings, EditableNutritionalInfo, NewFoodData } from "@/lib/types";
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

const formSchema = z.object({
  planName: z.string().optional(),
  diabeticResearchSummary: z.string().min(20, { message: "Veuillez fournir un résumé de recherche pertinent." }),
});

type MealPlanFormProps = {
  onMealPlanGenerated: (mealPlan: GenerateMealPlanOutput, planName?: string) => void;
  onGenerationError: (error: string) => void;
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


export function MealPlanForm({ onMealPlanGenerated, onGenerationError }: MealPlanFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [isClient, setIsClient] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // States for form inputs - to be managed directly
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>(baseInitialFoodCategories);
  const [selectionMode, setSelectionMode] = useState<'dates' | 'duration'>('dates');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [durationInDays, setDurationInDays] = useState<string>("1"); 
  const [durationModeStartDate, setDurationModeStartDate] = useState<Date | undefined>(undefined);
  
  // States for displaying calculated values
  const [displayDurationFromDates, setDisplayDurationFromDates] = useState<string>("1 jour");
  const [displayEndDateFromDuration, setDisplayEndDateFromDuration] = useState<Date | undefined>(undefined);
  
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
    if (!isClient) return;

    setIsDataLoading(true);

    // Load Food Preferences
    try {
      const storedFoodPrefsString = localStorage.getItem("diabeatz-food-preferences");
      if (storedFoodPrefsString) {
        const storedFoodPrefs = JSON.parse(storedFoodPrefsString) as FoodCategory[];
        // Hydrate stored preferences with baseInitialFoodCategories to ensure all fields are present
        const hydratedCategories = baseInitialFoodCategories.map(initialCat => {
          const storedCat = storedFoodPrefs.find(sc => sc.categoryName === initialCat.categoryName);
          if (storedCat) {
            const mergedItems = initialCat.items.map(initItem => {
              const storedItem = storedCat.items.find(si => si.id === initItem.id || si.name === initItem.name);
              return { ...initItem, ...(storedItem || {}) };
            });
            // Add any custom items from storage not in initialCat
            storedCat.items.forEach(sfi => {
                if (!mergedItems.some(mi => mi.id === sfi.id || mi.name === sfi.name)) {
                    mergedItems.push(sfi);
                }
            });
            return { ...initialCat, ...storedCat, items: mergedItems.sort((a, b) => a.name.localeCompare(b.name)) };
          }
          return initialCat;
        });
         // Add any new categories from baseInitialFoodCategories not in storage
        baseInitialFoodCategories.forEach(initialCat => {
            if(!hydratedCategories.some(hc => hc.categoryName === initialCat.categoryName)){
                hydratedCategories.push(initialCat);
            }
        });
        setFoodCategories(hydratedCategories.sort((a,b) => a.categoryName.localeCompare(b.name)));
      } else {
        setFoodCategories(baseInitialFoodCategories); // Use base if nothing in localStorage
      }
    } catch (error) {
      console.error("Error loading food preferences from localStorage:", error);
      setFoodCategories(baseInitialFoodCategories); // Fallback to base
    }

    // Load Form Settings
    let loadedSettings: FormSettings | null = null;
    try {
      const storedSettingsString = localStorage.getItem("diabeatz-form-settings");
      if (storedSettingsString) {
        loadedSettings = JSON.parse(storedSettingsString) as FormSettings;
      }
    } catch (error) {
      console.error("Error loading form settings from localStorage:", error);
    }
    
    if (loadedSettings) {
      form.reset({
        planName: loadedSettings.planName || "",
        diabeticResearchSummary: loadedSettings.diabeticResearchSummary || defaultResearchSummary,
      });
      setSelectionMode(loadedSettings.selectionMode || 'dates');
      
      if (loadedSettings.startDate) {
        const parsedStart = parseISO(loadedSettings.startDate);
        if (isValid(parsedStart)) setStartDate(startOfDay(parsedStart));
        else setStartDate(startOfDay(addDays(new Date(),1)));
      } else {
        setStartDate(startOfDay(addDays(new Date(),1)));
      }

      if (loadedSettings.endDate) {
        const parsedEnd = parseISO(loadedSettings.endDate);
        if (isValid(parsedEnd)) setEndDate(startOfDay(parsedEnd));
        else setEndDate(startOfDay(addDays(new Date(),1)));
      } else {
         setEndDate(startOfDay(addDays(new Date(),1)));
      }
      
      setDurationInDays(loadedSettings.durationInDays || "1");

      if (loadedSettings.durationModeStartDate) {
        const parsedDurationStart = parseISO(loadedSettings.durationModeStartDate);
        if (isValid(parsedDurationStart)) setDurationModeStartDate(startOfDay(parsedDurationStart));
        else setDurationModeStartDate(startOfDay(addDays(new Date(),1)));
      } else {
         setDurationModeStartDate(startOfDay(addDays(new Date(),1)));
      }
      toast({ title: "Paramètres chargés!", description: "Votre configuration a été restaurée." });
    } else {
        // Set initial default values if no settings are loaded
        const tomorrow = startOfDay(addDays(new Date(), 1));
        setStartDate(tomorrow);
        setEndDate(tomorrow);
        setDurationInDays("1");
        setDurationModeStartDate(tomorrow);
        setSelectionMode('dates');
    }

    setIsDataLoading(false);
  }, [isClient, form, toast]);


  // Effect for "Par Dates" mode: calculate displayDurationFromDates
  useEffect(() => {
    if (isClient && selectionMode === 'dates' && startDate && endDate && isValid(startDate) && isValid(endDate) && !isBefore(startOfDay(endDate), startOfDay(startDate))) {
      const diff = differenceInDays(startOfDay(endDate), startOfDay(startDate)) + 1;
      setDisplayDurationFromDates(`${diff} jour${diff > 1 ? 's' : ''}`);
    } else if (isClient && selectionMode === 'dates') {
      setDisplayDurationFromDates("Durée invalide");
    }
  }, [startDate, endDate, selectionMode, isClient]);

  // Effect for "Par Durée" mode: calculate displayEndDateFromDuration
  useEffect(() => {
    if (isClient && selectionMode === 'duration' && durationModeStartDate && isValid(durationModeStartDate)) {
      const numDays = parseInt(durationInDays, 10);
      if (!isNaN(numDays) && numDays >= 1 && numDays <= 365) {
        const newEndDate = addDays(startOfDay(durationModeStartDate), numDays - 1);
        setDisplayEndDateFromDuration(newEndDate);
      } else {
        setDisplayEndDateFromDuration(undefined);
      }
    } else if (isClient && selectionMode === 'duration') {
       setDisplayEndDateFromDuration(undefined);
    }
  }, [durationInDays, durationModeStartDate, selectionMode, isClient]);


  const handleDurationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     if (value === "" || /^\d{1,3}$/.test(value)) { // Allow empty string for intermediate input
      const num = parseInt(value,10);
      if (value === "" || (num >= 0 && num <= 365) ) { // Allow 0 temporarily
         setDurationInDays(value);
      } else if (num > 365) {
        setDurationInDays("365");
      }
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
    const updatedCategories = foodCategories.map(category =>
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
    );
    setFoodCategories(updatedCategories);
    if (typeof window !== "undefined") {
        localStorage.setItem("diabeatz-food-preferences", JSON.stringify(updatedCategories));
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    onGenerationError(""); 
    
    let planDurationForAI = "";
    let finalStartDateForAI: Date | undefined;

    if (selectionMode === 'dates') {
      if (startDate && endDate && isValid(startDate) && isValid(endDate) && !isBefore(startOfDay(endDate), startOfDay(startDate))) {
        const diff = differenceInDays(startOfDay(endDate), startOfDay(startDate)) + 1;
        planDurationForAI = `${diff} jour${diff > 1 ? 's' : ''}`;
        finalStartDateForAI = startDate;
      } else {
        toast({ title: "Dates invalides", description: "Veuillez sélectionner une date de début et de fin valides pour le mode 'Par Dates'.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    } else { // selectionMode === 'duration'
      const numDays = parseInt(durationInDays, 10);
      if (durationModeStartDate && isValid(durationModeStartDate) && !isNaN(numDays) && numDays >= 1 && numDays <= 365) {
        planDurationForAI = `${numDays} jour${numDays > 1 ? 's' : ''}`;
        finalStartDateForAI = durationModeStartDate; 
      } else {
        toast({ title: "Configuration de durée invalide", description: "Veuillez entrer une durée valide (1-365 jours) et une date de début pour le mode 'Par Durée'.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }

    if (!planDurationForAI || !finalStartDateForAI) {
      toast({ title: "Configuration de période invalide", description: "Veuillez configurer la période du plan.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    const today = startOfDay(new Date());
    if (isBefore(startOfDay(finalStartDateForAI), today)) {
        toast({ title: "Date de début passée", description: "La date de début du plan ne peut pas être dans le passé.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    const likedFoodsList: string[] = [];
    const foodsToAvoidList: string[] = [];

    foodCategories.forEach(category => {
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
        description: "Veuillez sélectionner au moins un aliment que vous aimez.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const availableFoodsForAI = likedFoodsList.join("\n");
    const foodsToAvoidForAI = foodsToAvoidList.length > 0 ? foodsToAvoidList.join("\n") : undefined;

    try {
      const mealPlanInput: GenerateMealPlanInput = {
        planName: values.planName,
        availableFoods: availableFoodsForAI,
        foodsToAvoid: foodsToAvoidForAI,
        diabeticResearchSummary: values.diabeticResearchSummary,
        planDuration: planDurationForAI,
      };
      const result = await generateMealPlan(mealPlanInput);
      onMealPlanGenerated(result, values.planName);
      toast({
        title: "Plan Alimentaire Généré!",
        description: "Votre nouveau plan alimentaire est prêt.",
      });
    } catch (error: any) {
      console.error("Error generating meal plan:", error);
      let errorMessage = "Impossible de générer le plan repas. Veuillez réessayer.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast({
        title: "Erreur de Génération",
        description: errorMessage,
        variant: "destructive",
      });
      onGenerationError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

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

  const handleSaveNutritionalInfo = () => {
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
     if (typeof window !== "undefined") {
        localStorage.setItem("diabeatz-food-preferences", JSON.stringify(updatedCategories));
    }
    setIsNutritionalInfoDialogOpen(false);
    toast({ title: "Informations nutritionnelles mises à jour!", description: `Pour ${selectedFoodItemForNutritionalInfo.name}.` });
  };

  const handleSaveSettings = () => {
    if (typeof window !== "undefined") {
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
        localStorage.setItem("diabeatz-form-settings", JSON.stringify(settingsToSave));
        toast({
        title: "Paramètres sauvegardés!",
        description: "Votre configuration de formulaire a été enregistrée localement.",
        });
    }
  };

  const handleLoadSettings = useCallback(() => {
    if (typeof window !== "undefined") {
        const storedSettingsString = localStorage.getItem("diabeatz-form-settings");
        if (storedSettingsString) {
            const loadedSettings = JSON.parse(storedSettingsString) as FormSettings;
            form.reset({
                planName: loadedSettings.planName || "",
                diabeticResearchSummary: loadedSettings.diabeticResearchSummary || defaultResearchSummary,
            });
            setSelectionMode(loadedSettings.selectionMode || 'dates');
            if (loadedSettings.startDate) {
                const parsedStart = parseISO(loadedSettings.startDate);
                if (isValid(parsedStart)) setStartDate(startOfDay(parsedStart));
            }
            if (loadedSettings.endDate) {
                const parsedEnd = parseISO(loadedSettings.endDate);
                if (isValid(parsedEnd)) setEndDate(startOfDay(parsedEnd));
            }
            setDurationInDays(loadedSettings.durationInDays || "1");
            if (loadedSettings.durationModeStartDate) {
                const parsedDurationStart = parseISO(loadedSettings.durationModeStartDate);
                if (isValid(parsedDurationStart)) setDurationModeStartDate(startOfDay(parsedDurationStart));
            }
             toast({
                title: "Paramètres chargés!",
                description: "Votre configuration de formulaire locale a été restaurée.",
            });
        } else {
            // toast({ title: "Aucun paramètre sauvegardé", description: "Utilisation des valeurs par défaut.", variant: "default"});
        }
    }
  }, [form, toast]);
  

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
     if (typeof window !== "undefined") {
        localStorage.setItem("diabeatz-food-preferences", JSON.stringify(updatedCategories));
    }

    toast({
      title: "Aliment ajouté!",
      description: `${newFoodItem.name} a été ajouté à la catégorie ${newFoodData.categoryName}.`,
    });
    setIsAddFoodDialogOpen(false);
    setNewFoodData(initialNewFoodData);
  };

  if (!isClient || isDataLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg"><CardHeader><CardTitle className="text-lg font-semibold">Chargement de la configuration...</CardTitle></CardHeader><CardContent className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="multiple" defaultValue={["config-base-item", "prefs-aliments-item"]} className="w-full space-y-6">
          
          <AccordionItem value="config-base-item" className="border-b-0">
            <Card className="shadow-lg">
                <AccordionTrigger className="w-full text-left p-0 hover:no-underline group">
                    <CardHeader className="flex flex-row items-center justify-between w-full p-4">
                        <div className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-secondary-foreground" />
                            <CardTitle className="text-lg font-semibold">Planification</CardTitle>
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
                          <Input placeholder="Ex. : Plan alimentaire personnalisé" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormItem>
                    <FormLabel className="text-base font-medium mb-2 block">Calendrier / Durée</FormLabel>
                     <FormDescriptionComponentUI className="mb-3 text-xs">
                       Choisissez la date de début et de fin du plan ou indiquez le nombre de jour(s) souhaité(s).
                    </FormDescriptionComponentUI>
                    <RadioGroup
                        value={selectionMode}
                        onValueChange={(value: 'dates' | 'duration') => setSelectionMode(value)}
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

                    {selectionMode === 'dates' && startDate && endDate && (
                      <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="start-date-picker" className="text-sm font-medium mb-1 block">Date de début</Label>
                          <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                id="start-date-picker"
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal h-10", !startDate && "text-muted-foreground")}
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {isValid(startDate) ? format(startDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => {
                                  if (date) {
                                    const newStartDate = startOfDay(date);
                                    setStartDate(newStartDate);
                                    if (endDate && isBefore(startOfDay(endDate), newStartDate)) {
                                      setEndDate(new Date(newStartDate)); 
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
                        <div className="flex-1 min-w-0">
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
                                {isValid(endDate) ? format(endDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => {
                                  if (date && startDate && isValid(startDate)) {
                                    const newEndDate = startOfDay(date);
                                    if (!isBefore(newEndDate, startOfDay(startDate))) { 
                                        setEndDate(newEndDate);
                                    }
                                  }
                                  setIsEndDatePickerOpen(false);
                                }}
                                disabled={(date) => {
                                  const minDate = startDate && isValid(startDate) ? startOfDay(startDate) : startOfDay(new Date()); 
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

                    {selectionMode === 'duration' && durationModeStartDate && (
                       <div className="flex flex-col sm:flex-row gap-3 items-end">
                         <div className="flex-1 min-w-0">
                           <Label htmlFor="duration-mode-start-date-picker" className="text-sm font-medium mb-1 block">Date de début</Label>
                           <Popover open={isDurationModeStartDatePickerOpen} onOpenChange={setIsDurationModeStartDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                id="duration-mode-start-date-picker"
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal h-10", !durationModeStartDate && "text-muted-foreground")}
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {isValid(durationModeStartDate) ? format(durationModeStartDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={durationModeStartDate}
                                onSelect={(date) => {
                                  if (date) {
                                    const newDurationStartDate = startOfDay(date);
                                    setDurationModeStartDate(newDurationStartDate);
                                  }
                                  setIsDurationModeStartDatePickerOpen(false);
                                }}
                                 disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))} 
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="sm:w-24">
                          <Label htmlFor="duration-input-field" className="text-sm font-medium mb-1 block">Jour(s)</Label>
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
                        <div className="flex-1 min-w-0 h-10 flex items-center justify-start text-sm pt-1">
                            {displayEndDateFromDuration && isValid(displayEndDateFromDuration) && (
                                <div>
                                    <span className="font-medium text-muted-foreground">Fin du plan : </span>
                                    <span className="text-primary">{format(displayEndDateFromDuration, "PPP", { locale: fr })}</span>
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
            <Card className="shadow-lg">
                <div className="flex flex-row items-center justify-between w-full p-4">
                    <AccordionTrigger className="flex flex-1 items-center gap-2 p-0 hover:no-underline group">
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
                        Les aliments favoris seront privilégiés pour vos plans de repas.
                      </FormDescriptionComponentUI>
                      <div className="max-h-[400px] overflow-y-auto p-1 rounded-md border mt-2">
                      <Accordion type="multiple" className="w-full">
                          {foodCategories.map(category => {
                          const CategoryIcon = categoryIcons[category.categoryName] || ListFilter;
                          return (
                              <AccordionItem value={category.categoryName} key={category.categoryName} className="border-b-0 last:border-b-0">
                                <AccordionTrigger className="py-3 px-2 hover:no-underline hover:bg-muted/50 rounded-md">
                                    <div className="flex flex-1 items-center gap-2"> 
                                    <CategoryIcon className="h-4 w-4 text-secondary-foreground" />
                                    <span className="text-md font-semibold text-primary">{category.categoryName}</span>
                                    </div>
                                </AccordionTrigger>
                              <AccordionContent className="pt-1 pb-2 px-2">
                                  <ul className="space-y-1 pl-2">
                                  {category.items.map(item => (
                                      <li key={item.id} className="py-1 border-b border-border/50 last:border-b-0">
                                      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-1 sm:gap-x-2"> 
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
                                            size="icon" 
                                            className="p-1 h-7 w-7 justify-self-end"
                                            onClick={() => handleOpenNutritionalInfoDialog(item, category.categoryName)}
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
        
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleSaveSettings} className="w-full sm:flex-1">
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder les paramètres
            </Button>
            <Button
                type="button"
                variant="outline"
                onClick={handleLoadSettings}
                className="w-full sm:flex-1"
                disabled={!isClient || (typeof window !== 'undefined' && !localStorage.getItem("diabeatz-form-settings"))}
            >
                <Upload className="mr-2 h-4 w-4" />
                Charger les paramètres
            </Button>
        </div>

        <Button type="submit" disabled={isLoading || isDataLoading} className="w-full">
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
        
         <Accordion type="single" collapsible className="w-full">
             <AccordionItem value="conseils-aliments-item" className="border-b-0">
                <Card className="shadow-lg">
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
                           <RichTextDisplay text={form.watch('diabeticResearchSummary')} />
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
        <Dialog open={isEditTipsDialogOpen} onOpenChange={setIsEditTipsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier les Conseils Alimentaires</DialogTitle>
              <DialogDescriptionComponent>
                Modifiez le texte des conseils ci-dessous. Utilisez `**texte**` pour le gras.
                Les annotations comme (en gras et bleu) seront interprétées pour le style.
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
              <DialogDescriptionComponent>
                Modifiez les informations nutritionnelles ci-dessous. Ces valeurs sont indicatives.
              </DialogDescriptionComponent>
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
              <DialogDescriptionComponent>
                Remplissez les informations ci-dessous pour ajouter un aliment à vos préférences.
              </DialogDescriptionComponent>
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
                    {baseInitialFoodCategories.map(cat => (
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


    