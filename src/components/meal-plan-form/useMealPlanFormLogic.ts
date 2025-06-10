// useMealPlanFormLogic.ts
import { GenerateMealPlanInput, GenerateMealPlanOutput, generateMealPlan } from '@/ai/flows/generate-meal-plan'; // Added import
import { differenceInDays, isBefore } from 'date-fns'; // Added import
  import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore'; // Added collection, getDocs, deleteDoc
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { FormSettings, FoodCategory, Medication, SavedFormSettings, FormSettingsHistory } from '@/lib/types'; // Added Medication, SavedFormSettings, FormSettingsHistory
import { initialFoodCategories as baseInitialFoodCategories } from '@/lib/food-data';
import { addDays, startOfDay, parseISO, isValid, formatISO } from 'date-fns'; // Added formatISO
import type { NewFoodData } from './types';

export const initialNewFoodData: NewFoodData = {
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

const formSchema = z.object({
  planName: z.string().optional(),
  diabeticResearchSummary: z.string().min(20, { message: "Veuillez fournir un résumé de recherche pertinent." }),
});

export const defaultResearchSummary = `**Principes Généraux (en gras et bleu)**
- **Gestion Combinée :** Une alimentation équilibrée est cruciale pour gérer à la fois la glycémie (diabète) et le taux de cholestérol. 
- **Variété et Fraîcheur :** Privilégiez des aliments frais, peu transformés, et variez les sources de nutriments. 
- **Limitation :** Réduisez les produits ultra-transformés, les sucres ajoutés, les plats industriels et l'excès de sel. 

**Choix des Aliments (en gras et bleu)**
- **Légumes Abondants :** Consommez au moins 3-5 portions de légumes par jour (verts à feuilles, crucifères, colorés). Remplissez la moitié de l'assiette de légumes. 
- **Céréales Complètes et Légumineuses :** Remplacez les céréales raffinées par des complètes (pain complet, riz brun, quinoa). Intégrez des légumineuses (lentilles, pois chiches) plusieurs fois par semaine. 
- **Protéines Maigres :** Optez pour volaille sans peau, poissons (surtout gras comme saumon, sardine, maquereau riches en oméga-3), œufs. Limitez la viande rouge. 
- **Bonnes Graisses :** Privilégiez les graisses insaturées : huiles végétales (olive, colza), avocats, noix, graines.  Limitez les graisses saturées (viandes grasses, beurre, produits laitiers entiers). 
- **Fibres Essentielles :** Augmentez l'apport en fibres (fruits, légumes, céréales complètes, légumineuses). Les fibres aident à contrôler la glycémie et à réduire le cholestérol. 

**Gestion des Repas (en gras et bleu)**
- **Contrôle des Glucides :** Répartissez les glucides régulièrement. Privilégiez les aliments à IG bas ou moyen. 
- **Portions et Satiété :** Maîtrisez les portions, écoutez vos signaux de faim et de satiété. 
- **Repas Réguliers :** Prenez 3 repas principaux à horaires réguliers. Collations nutritives si besoin. 

**Autres Recommandations (en gras et bleu)**
- **Hydratation :** Buvez suffisamment d'eau. 
- **Alcool avec Modération :** Limitez l'alcool et tenez compte de ses effets. 
- **Activité Physique :** Une activité physique régulière est complémentaire à une bonne alimentation. 

**Privilégiez la variété et la fraîcheur (en gras et bleu)**
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

**N'hésitez pas à consulter un(e) diététicien(ne) pour un accompagnement personnalisé (en gras et rouge)**`;

export interface UseMealPlanFormLogicProps {
  userId: string;
  defaultResearchSummary: string;
  onMealPlanGenerated: (result: GenerateMealPlanOutput, planName?: string) => void;
  onGenerationError: (error: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  medications: Medication[]; // Added medications prop
}

export const useMealPlanFormLogic = ({ userId, defaultResearchSummary, onMealPlanGenerated, onGenerationError, setIsLoading, medications }: UseMealPlanFormLogicProps) => {
  const [formSettingsHistory, setFormSettingsHistory] = useState<FormSettingsHistory>([]);
  const [selectedConfigurationId, setSelectedConfigurationId] = useState<string | null>(null);
  const [displayDurationFromDates, setDisplayDurationFromDates] = useState<string>("1 jour");
  const [displayEndDateFromDuration, setDisplayEndDateFromDuration] = useState<Date | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planName: "",
      diabeticResearchSummary: defaultResearchSummary,
    },
  });

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState<"dates" | "duration">("dates");
  const [startDate, setStartDate] = useState<Date | undefined>(startOfDay(addDays(new Date(), 1)));
  const [endDate, setEndDate] = useState<Date | undefined>(startOfDay(addDays(new Date(), 1)));
  const [durationInDays, setDurationInDays] = useState<string>("1");
  const [durationModeStartDate, setDurationModeStartDate] = useState<Date | undefined>(startOfDay(addDays(new Date(), 1)));
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>(baseInitialFoodCategories.map(cat => ({...cat, items: [...cat.items].sort((a,b) => a.name.localeCompare(b.name))})).sort((a,b) => a.categoryName.localeCompare(b.categoryName)));

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLoadSettingsAndPreferences = useCallback(async () => {
    console.log(`handleLoadSettingsAndPreferences called. userId: ${userId}, isClient: ${isClient}`);
    if (!userId || !isClient) {
      console.log("handleLoadSettingsAndPreferences: Aborting, userId or isClient is not set.");
      return;
    }
    setIsDataLoading(true);
    try {
      console.log(`Attempting to load settings for userId: ${userId}`);
      const settingsDocRef = doc(db, 'users', userId, 'formSettings', 'default');
      const settingsDocSnap = await getDoc(settingsDocRef);

      if (settingsDocSnap.exists()) {
        const loadedSettings = settingsDocSnap.data() as FormSettings;
        console.log("Settings loaded from Firebase:", loadedSettings);
        
        const shouldUseStoredSummary = loadedSettings.diabeticResearchSummary && 
                                     loadedSettings.diabeticResearchSummary !== defaultResearchSummary;
        
        form.reset({
          planName: loadedSettings.planName || "",
          diabeticResearchSummary: shouldUseStoredSummary ? loadedSettings.diabeticResearchSummary : defaultResearchSummary,
        });

        if (!loadedSettings.diabeticResearchSummary || loadedSettings.diabeticResearchSummary !== defaultResearchSummary) {
          console.log("Attempting to update defaultResearchSummary in Firestore as it's missing or different.");
          try {
            await setDoc(settingsDocRef, { diabeticResearchSummary: defaultResearchSummary }, { merge: true });
            console.log("Successfully updated defaultResearchSummary in Firestore.");
            toast({ title: "Conseils diététiques mis à jour", description: "Les derniers conseils ont été sauvegardés." });
          } catch (error) {
            console.error("Error updating defaultResearchSummary in Firestore:", error);
            toast({ variant: "destructive", title: "Erreur Firestore", description: "Impossible de mettre à jour les conseils diététiques dans la base de données." });
          }
        }
        setSelectionMode(loadedSettings.selectionMode || 'dates');
        const tomorrow = startOfDay(addDays(new Date(), 1));
        setStartDate(typeof loadedSettings.startDate === 'string' && isValid(parseISO(loadedSettings.startDate)) ? startOfDay(parseISO(loadedSettings.startDate)) : tomorrow);
        setEndDate(typeof loadedSettings.endDate === 'string' && isValid(parseISO(loadedSettings.endDate)) ? startOfDay(parseISO(loadedSettings.endDate)) : tomorrow);
        setDurationInDays(loadedSettings.durationInDays || "1");
        setDurationModeStartDate(typeof loadedSettings.durationModeStartDate === 'string' && isValid(parseISO(loadedSettings.durationModeStartDate)) ? startOfDay(parseISO(loadedSettings.durationModeStartDate)) : tomorrow);
      } else {
        console.log("No existing settings found in Firestore. Initializing with defaults.");
        const tomorrow = startOfDay(addDays(new Date(), 1));
        setStartDate(tomorrow); setEndDate(tomorrow); setDurationModeStartDate(tomorrow);
        setDurationInDays("1"); setSelectionMode('dates');
        form.reset({ planName: "", diabeticResearchSummary: defaultResearchSummary });
        
        console.log("Attempting to save initial defaultResearchSummary to Firestore.");
        try {
          await setDoc(settingsDocRef, { diabeticResearchSummary: defaultResearchSummary }, { merge: true });
          console.log("Successfully saved initial defaultResearchSummary to Firestore.");
          toast({ title: "Conseils diététiques sauvegardés", description: "Les conseils par défaut ont été sauvegardés pour la première fois." });
        } catch (error) {
          console.error("Error saving initial defaultResearchSummary to Firestore:", error);
          toast({ variant: "destructive", title: "Erreur Firestore", description: "Impossible de sauvegarder les conseils diététiques initiaux." });
        }
      }

      const foodPrefsDocRef = doc(db, 'users', userId, 'foodPreferences', 'default');
      const foodPrefsDocSnap = await getDoc(foodPrefsDocRef);
      let currentFoodCategories: FoodCategory[];
      if (foodPrefsDocSnap.exists()) {
        const storedFoodPrefs = foodPrefsDocSnap.data().categories as FoodCategory[];
        currentFoodCategories = baseInitialFoodCategories.map(initialCat => {
          const storedCat = storedFoodPrefs.find(sc => sc.categoryName === initialCat.categoryName);
          if (storedCat) {
            const mergedItems = initialCat.items.map(initItem => {
              const storedItem = storedCat.items.find(si => si.id === initItem.id || si.name === initItem.name);
              return { ...initItem, ...(storedItem || {}) };
            });
            storedCat.items.forEach(sfi => {
                if (!mergedItems.some(mi => mi.id === sfi.id || mi.name === sfi.name)) {
                    mergedItems.push(sfi);
                }
            });
            return { ...initialCat, ...storedCat, items: mergedItems.sort((a, b) => a.name.localeCompare(b.name)) };
          }
          return initialCat;
        });
        baseInitialFoodCategories.forEach(initialCat => {
            if(!currentFoodCategories.some(hc => hc.categoryName === initialCat.categoryName)){
                currentFoodCategories.push(initialCat);
            }
        });
      } else {
        currentFoodCategories = baseInitialFoodCategories.map(cat => ({...cat, items: [...cat.items].sort((a,b) => a.name.localeCompare(b.name))}));
      }
      setFoodCategories(currentFoodCategories.sort((a,b) => a.categoryName.localeCompare(b.categoryName)));

    } catch (error) {
      console.error("Error loading user settings and preferences:", error);
      toast({ variant: "destructive", title: "Erreur de chargement", description: "Impossible de charger les paramètres et préférences utilisateur." });
      // Fallback to defaults in case of error
      const tomorrow = startOfDay(addDays(new Date(), 1));
      setStartDate(tomorrow); setEndDate(tomorrow); setDurationModeStartDate(tomorrow);
      setDurationInDays("1"); setSelectionMode('dates');
      form.reset({ planName: "", diabeticResearchSummary: defaultResearchSummary });
      setFoodCategories(baseInitialFoodCategories.map(cat => ({...cat, items: [...cat.items].sort((a,b) => a.name.localeCompare(b.name))})).sort((a,b) => a.categoryName.localeCompare(b.categoryName)));
    } finally {
      console.log("handleLoadSettingsAndPreferences: Setting isDataLoading to false.");
      setIsDataLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, userId, form.reset, toast, defaultResearchSummary]);

  const loadFormSettingsHistory = useCallback(async () => {
    if (!userId || !isClient) return;
    try {
      const historyCollectionRef = collection(db, 'users', userId, 'formSettingsHistory');
      const historySnapshot = await getDocs(historyCollectionRef);
      const loadedHistory = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedFormSettings));
      setFormSettingsHistory(loadedHistory.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt.toDate();
          const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt.toDate();
          return dateB.getTime() - dateA.getTime();
        }
        return 0;
      }));
    } catch (error) {
      console.error("Error loading form settings history from Firebase:", error);
      toast({ title: "Erreur de chargement", description: "Impossible de charger l'historique des configurations.", variant: "destructive" });
    }
  }, [userId, isClient, toast]);

  useEffect(() => {
    if (isClient && userId) {
      loadFormSettingsHistory();
    }
  }, [isClient, userId, loadFormSettingsHistory]);


  const handleSaveConfiguration = async (name: string) => {
    if (!userId || !name.trim()) return;
    setIsDataLoading(true);
    try {
      const currentSettings: FormSettings = {
        planName: form.getValues("planName"),
        diabeticResearchSummary: form.getValues("diabeticResearchSummary"),
        selectionMode,
        startDate: startDate ? formatISO(startDate) : undefined,
        endDate: endDate ? formatISO(endDate) : undefined,
        durationInDays,
        durationModeStartDate: durationModeStartDate ? formatISO(durationModeStartDate) : undefined,
      };
      const newConfigDocRef = doc(collection(db, 'users', userId, 'formSettingsHistory'));
      const newConfig: SavedFormSettings = {
        ...currentSettings,
        id: newConfigDocRef.id,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };
      await setDoc(newConfigDocRef, newConfig);
      setFormSettingsHistory(prev => [newConfig, ...prev].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt.toDate();
          const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt.toDate();
          return dateB.getTime() - dateA.getTime();
        }
        return 0;
      }));
      toast({ title: "Configuration sauvegardée", description: `La configuration "${name.trim()}" a été sauvegardée.` });
      // Optionally, save food preferences with the configuration
      // const foodPrefsDocRef = doc(db, 'users', userId, 'foodPreferences', newConfigDocRef.id);
      // await setDoc(foodPrefsDocRef, { categories: foodCategories });

      // Save as default if it's the first one or explicitly chosen
      const defaultSettingsDocRef = doc(db, 'users', userId, 'formSettings', 'default');
      await setDoc(defaultSettingsDocRef, currentSettings);

    } catch (error) {
      console.error("Error saving configuration to Firebase:", error);
      toast({ title: "Erreur de sauvegarde", description: "Impossible de sauvegarder la configuration.", variant: "destructive" });
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleLoadConfiguration = async (configId: string) => {
    if (!userId) return;
    const configToLoad = formSettingsHistory.find(c => c.id === configId);
    if (!configToLoad) {
      toast({ title: "Erreur", description: "Configuration non trouvée.", variant: "destructive" });
      return;
    }
    setIsDataLoading(true);
    try {
      form.reset({
        planName: configToLoad.planName || "",
        diabeticResearchSummary: configToLoad.diabeticResearchSummary || defaultResearchSummary,
      });
      setSelectionMode(configToLoad.selectionMode || 'dates');
      const tomorrow = startOfDay(addDays(new Date(), 1));
      setStartDate(typeof configToLoad.startDate === 'string' && isValid(parseISO(configToLoad.startDate)) ? startOfDay(parseISO(configToLoad.startDate)) : tomorrow);
      setEndDate(typeof configToLoad.endDate === 'string' && isValid(parseISO(configToLoad.endDate)) ? startOfDay(parseISO(configToLoad.endDate)) : tomorrow);
      setDurationInDays(configToLoad.durationInDays || "1");
      setDurationModeStartDate(typeof configToLoad.durationModeStartDate === 'string' && isValid(parseISO(configToLoad.durationModeStartDate)) ? startOfDay(parseISO(configToLoad.durationModeStartDate)) : tomorrow);
      setSelectedConfigurationId(configId);
      toast({ title: "Configuration chargée", description: `La configuration "${configToLoad.name}" a été chargée.` });

      // Optionally, load associated food preferences if they were saved separately
      // const foodPrefsDocRef = doc(db, 'users', userId, 'foodPreferences', configId);
      // const foodPrefsDocSnap = await getDoc(foodPrefsDocRef);
      // if (foodPrefsDocSnap.exists()) {
      //   setFoodCategories(foodPrefsDocSnap.data().categories as FoodCategory[]);
      // } else {
         // If no specific prefs for this config, load default or base
      //    const defaultFoodPrefsDocRef = doc(db, 'users', userId, 'foodPreferences', 'default');
      //    const defaultFoodPrefsSnap = await getDoc(defaultFoodPrefsDocRef);
      //    if (defaultFoodPrefsSnap.exists()) {
      //       setFoodCategories(defaultFoodPrefsSnap.data().categories as FoodCategory[]);
      //    } else {
      //       setFoodCategories(baseInitialFoodCategories.map(cat => ({...cat, items: [...cat.items].sort((a,b) => a.name.localeCompare(b.name))})).sort((a,b) => a.categoryName.localeCompare(b.categoryName)));
      //    }
      // }

    } catch (error) {
      console.error("Error loading configuration details:", error);
      toast({ title: "Erreur de chargement", description: "Impossible de charger les détails de la configuration.", variant: "destructive" });
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleDeleteConfiguration = async (configId: string) => {
    if (!userId) return;
    const configToDelete = formSettingsHistory.find(c => c.id === configId);
    if (!configToDelete) return;

    setIsDataLoading(true);
    try {
      const configDocRef = doc(db, 'users', userId, 'formSettingsHistory', configId);
      await deleteDoc(configDocRef);
      // Optionally, delete associated food preferences
      // const foodPrefsDocRef = doc(db, 'users', userId, 'foodPreferences', configId);
      // await deleteDoc(foodPrefsDocRef);

      setFormSettingsHistory(prev => prev.filter(c => c.id !== configId));
      if (selectedConfigurationId === configId) {
        setSelectedConfigurationId(null); // Deselect if the loaded one is deleted
        // Optionally, load default settings or clear form
        handleLoadSettingsAndPreferences(); 
      }
      toast({ title: "Configuration supprimée", description: `La configuration "${configToDelete.name}" a été supprimée.` });
    } catch (error) {
      console.error("Error deleting configuration from Firebase:", error);
      toast({ title: "Erreur de suppression", description: "Impossible de supprimer la configuration.", variant: "destructive" });
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && userId) {
      handleLoadSettingsAndPreferences();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, userId, handleLoadSettingsAndPreferences]);

  // Autres logiques et fonctions de rappel à déplacer ici...

  // Effect for "Par Dates" mode: calculate displayDurationFromDates
  useEffect(() => {
    if (isClient && !isDataLoading && selectionMode === 'dates') {
      if (startDate && endDate && isValid(startDate) && isValid(endDate) && !isBefore(startOfDay(endDate), startOfDay(startDate))) {
        const diff = differenceInDays(startOfDay(endDate), startOfDay(startDate)) + 1;
        setDisplayDurationFromDates(`${diff} jour${diff > 1 ? 's' : ''}`);
      } else {
        setDisplayDurationFromDates("Durée invalide");
      }
    }
  }, [startDate, endDate, selectionMode, isClient, isDataLoading]);

  // Effect for "Par Durée" mode: calculate displayEndDateFromDuration
  useEffect(() => {
    if (isClient && !isDataLoading && selectionMode === 'duration') {
      if (durationModeStartDate && isValid(durationModeStartDate)) {
        const numDays = parseInt(durationInDays, 10);
        if (!isNaN(numDays) && numDays >= 1 && numDays <= 365) {
          const newEndDate = addDays(startOfDay(durationModeStartDate), numDays - 1);
          setDisplayEndDateFromDuration(newEndDate);
        } else {
          setDisplayEndDateFromDuration(undefined);
        }
      } else {
         setDisplayEndDateFromDuration(undefined);
      }
    }
  }, [durationInDays, durationModeStartDate, selectionMode, isClient, isDataLoading]);

  const handleDurationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     if (value === "" || /^\d{1,3}$/.test(value)) { 
      const num = parseInt(value,10);
      if (value === "" || (num >= 0 && num <= 365) ) { 
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
  // Le useEffect qui appelle handleLoadSettingsAndPreferences est également dans le hook.

  const handleFoodPreferenceChange = async (categoryId: string, itemId: string, type: "isFavorite" | "isDisliked" | "isAllergenic", checked: boolean) => {
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
    if (userId) {
      try {
        const foodPrefsDocRef = doc(db, 'users', userId, 'foodPreferences', 'default');
        await setDoc(foodPrefsDocRef, { categories: updatedCategories }, { merge: true });
        // console.log("Food preferences saved to Firebase for user:", userId);
      } catch (error) {
        console.error("Error saving food preferences to Firebase:", error);
        toast({
          title: "Erreur de sauvegarde des préférences",
          description: "Impossible d'enregistrer les préférences alimentaires sur Firebase.",
          variant: "destructive",
        });
      }
    } else if (typeof window !== "undefined") {
        localStorage.setItem("diabeatz-food-preferences", JSON.stringify(updatedCategories)); // Fallback
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
      // toast({
      //   title: "Plan Alimentaire Généré!",
      //   description: "Votre nouveau plan alimentaire est prêt.",
      // });
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


  return {
    formSettingsHistory,
    selectedConfigurationId,
    handleSaveConfiguration,
    handleLoadConfiguration,
    handleDeleteConfiguration,
    setSelectedConfigurationId,
    form,
    toast,
    isClient,
    isDataLoading, setIsDataLoading,
    selectionMode, setSelectionMode,
    startDate, setStartDate,
    endDate, setEndDate,
    durationInDays, setDurationInDays,
    durationModeStartDate, setDurationModeStartDate,
    foodCategories, setFoodCategories,
    handleLoadSettingsAndPreferences,
    displayDurationFromDates,
    displayEndDateFromDuration,
    handleDurationInputChange,
    handleDurationInputBlur,
    handleFoodPreferenceChange, // Added export
    onSubmit // Added export
  };
};