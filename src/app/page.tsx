
"use client";

import { useState, useEffect } from "react";
import type { GenerateMealPlanOutput } from "@/ai/flows/generate-meal-plan";
import type { StoredMealPlan } from "@/lib/types";
import { AppHeader } from "@/components/app-header";
import { MealPlanForm } from "@/components/meal-plan-form";
import { MealPlanDisplay } from "@/components/meal-plan-display";
import { SavedMealPlans } from "@/components/saved-meal-plans";
import { SavePlanDialog } from "@/components/save-plan-dialog";
import useLocalStorage from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Define initialSavedPlansValue outside the component to ensure a stable reference.
const initialSavedPlansValue: StoredMealPlan[] = [];

export default function HomePage() {
  const [currentMealPlan, setCurrentMealPlan] = useState<GenerateMealPlanOutput | null>(null);
  const [currentMealPlanId, setCurrentMealPlanId] = useState<string | null>(null);
  const [currentMealPlanName, setCurrentMealPlanName] = useState<string>("");
  
  const [savedPlansFromStorage, setSavedPlansInStorage] = useLocalStorage<StoredMealPlan[]>(
    "diabeatz-meal-plans", 
    initialSavedPlansValue
  );
  const { toast } = useToast();

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);


  const handleMealPlanGenerated = (mealPlan: GenerateMealPlanOutput) => {
    setCurrentMealPlan(mealPlan);
    setCurrentMealPlanId(null); // It's a new, unsaved plan
    setCurrentMealPlanName(""); // Clear name for new plan
    setAiError(null);
  };

  const handleOpenSaveDialog = () => {
    if (!currentMealPlan) {
      toast({
        title: "Aucun Plan à Sauvegarder",
        description: "Veuillez d'abord générer un plan repas.",
        variant: "destructive",
      });
      return;
    }
    setIsSaveDialogOpen(true);
  };

  const handleSavePlan = (name: string) => {
    if (!currentMealPlan) return;

    const existingPlanIndex = currentMealPlanId ? savedPlansFromStorage.findIndex(p => p.id === currentMealPlanId) : -1;
    
    let planToSave: StoredMealPlan;

    if (existingPlanIndex !== -1) { // Updating existing plan
      planToSave = {
        ...savedPlansFromStorage[existingPlanIndex],
        ...currentMealPlan, // Update with potentially new meal details
        name, // Update name
        createdAt: new Date().toISOString(), // Update timestamp
      };
      const updatedPlans = [...savedPlansFromStorage];
      updatedPlans[existingPlanIndex] = planToSave;
      setSavedPlansInStorage(updatedPlans);
      toast({ title: "Plan Mis à Jour!", description: `Le plan repas "${name}" a été mis à jour.` });
    } else { // Saving new plan
      const newId = crypto.randomUUID();
      planToSave = {
        id: newId,
        name,
        ...currentMealPlan,
        createdAt: new Date().toISOString(),
      };
      setSavedPlansInStorage([...savedPlansFromStorage, planToSave].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setCurrentMealPlanId(newId);
      toast({ title: "Plan Sauvegardé!", description: `Le plan repas "${name}" a été sauvegardé.` });
    }
    setCurrentMealPlanName(name);
    setIsSaveDialogOpen(false);
  };

  const handleLoadPlan = (planId: string) => {
    const planToLoad = savedPlansFromStorage.find(p => p.id === planId);
    if (planToLoad) {
      const { id, name, createdAt, ...mealData } = planToLoad;
      setCurrentMealPlan(mealData);
      setCurrentMealPlanId(id);
      setCurrentMealPlanName(name);
      toast({ title: "Plan Chargé", description: `Le plan repas "${name}" est affiché.` });
    }
  };

  const handleDeletePlan = (planId: string) => {
    setSavedPlansInStorage(savedPlansFromStorage.filter(p => p.id !== planId));
    if (currentMealPlanId === planId) {
      setCurrentMealPlan(null);
      setCurrentMealPlanId(null);
      setCurrentMealPlanName("");
    }
    toast({ title: "Plan Supprimé", description: "Le plan repas a été supprimé.", variant: "destructive" });
  };
  
  // Sort plans by date initially
  useEffect(() => {
    // Ensure prevPlans is an array before attempting to sort
    setSavedPlansInStorage(prevPlans => 
      Array.isArray(prevPlans) 
        ? [...prevPlans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) 
        : initialSavedPlansValue
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Determine which plans to display to avoid hydration mismatch
  const displayableSavedPlans = hasMounted ? savedPlansFromStorage : initialSavedPlansValue;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <MealPlanForm onMealPlanGenerated={handleMealPlanGenerated} />
            <SavedMealPlans
              savedPlans={displayableSavedPlans}
              onLoadPlan={handleLoadPlan}
              onDeletePlan={handleDeletePlan}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            {aiError && (
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Erreur de Génération AI</AlertTitle>
                <AlertDescription>{aiError}</AlertDescription>
              </Alert>
            )}
            <MealPlanDisplay
              mealPlan={currentMealPlan}
              mealPlanName={currentMealPlanName}
              onSavePlan={handleOpenSaveDialog}
            />
          </div>
        </div>
      </main>
      <SavePlanDialog
        isOpen={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSavePlan}
        initialName={currentMealPlanName || (currentMealPlan ? `Mon Plan ${new Date().toLocaleDateString('fr-FR')}`: "")}
      />
       <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} DiabEatz. Tous droits réservés.
      </footer>
    </div>
  );
}

