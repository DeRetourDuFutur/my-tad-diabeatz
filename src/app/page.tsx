
"use client";

import { useState, useEffect } from "react";
import type { GenerateMealPlanOutput, StoredMealPlan } from "@/lib/types";
import { AppHeader } from "@/components/app-header";
import { MealPlanForm } from "@/components/meal-plan-form";
import { MealPlanDisplay } from "@/components/meal-plan-display";
import { SavedMealPlans } from "@/components/saved-meal-plans";
import { SavePlanDialog } from "@/components/save-plan-dialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, setDoc, query, orderBy, Timestamp } from 'firebase/firestore';

export default function HomePage() {
  const [currentMealPlan, setCurrentMealPlan] = useState<GenerateMealPlanOutput | null>(null);
  const [currentMealPlanId, setCurrentMealPlanId] = useState<string | null>(null);
  const [currentMealPlanName, setCurrentMealPlanName] = useState<string>("");
  
  const [savedPlans, setSavedPlans] = useState<StoredMealPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const { toast } = useToast();

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    fetchSavedPlans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // toast should be stable

  const fetchSavedPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const plansCollectionRef = collection(db, "mealPlans");
      const q = query(plansCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const plans: StoredMealPlan[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Ensure createdAt is correctly handled (it might be a string from GenerateMealPlanOutput if not yet saved)
        let createdAt = data.createdAt;
        if (typeof createdAt === 'string') {
          createdAt = Timestamp.fromDate(new Date(createdAt));
        } else if (!(createdAt instanceof Timestamp) && createdAt.seconds) { // Handle Firestore Timestamp-like objects
          createdAt = new Timestamp(createdAt.seconds, createdAt.nanoseconds);
        }

        plans.push({ id: doc.id, ...data, createdAt } as StoredMealPlan);
      });
      setSavedPlans(plans);
    } catch (error) {
      console.error("Error fetching saved plans:", error);
      toast({ title: "Erreur de chargement", description: "Impossible de charger les plans sauvegardés.", variant: "destructive" });
    }
    setIsLoadingPlans(false);
  };

  const handleMealPlanGenerated = (mealPlan: GenerateMealPlanOutput, planName?: string) => {
    setCurrentMealPlan(mealPlan);
    setCurrentMealPlanId(null); 
    setCurrentMealPlanName(planName || ""); 
    setAiError(null);
  };

  const handleOpenSaveDialog = () => {
    if (!currentMealPlan || !currentMealPlan.days || currentMealPlan.days.length === 0) {
      toast({
        title: "Aucun Plan à Sauvegarder",
        description: "Veuillez d'abord générer un plan repas.",
        variant: "destructive",
      });
      return;
    }
    setIsSaveDialogOpen(true);
  };

  const handleSavePlan = async (name: string) => {
    if (!currentMealPlan) return;
    setIsLoadingPlans(true); // Indicate loading while saving

    const planDataToSave = {
      ...currentMealPlan,
      name,
      createdAt: currentMealPlanId ? savedPlans.find(p=>p.id === currentMealPlanId)?.createdAt || Timestamp.now() : Timestamp.now(),
    };

    try {
      if (currentMealPlanId) { 
        const planDocRef = doc(db, "mealPlans", currentMealPlanId);
        // Ensure we update createdAt only if it's a new save or explicitly changing it
        // For updates, we might want to keep original createdAt or add an updatedAt field
        const updatedPlanData = { ...planDataToSave, createdAt: savedPlans.find(p=>p.id === currentMealPlanId)?.createdAt || Timestamp.now() };
        await setDoc(planDocRef, updatedPlanData);
        toast({ title: "Plan Mis à Jour!", description: `Le plan repas "${name}" a été mis à jour.` });
      } else { 
        const plansCollectionRef = collection(db, "mealPlans");
        const docRef = await addDoc(plansCollectionRef, planDataToSave);
        setCurrentMealPlanId(docRef.id);
        toast({ title: "Plan Sauvegardé!", description: `Le plan repas "${name}" a été sauvegardé.` });
      }
      setCurrentMealPlanName(name);
      await fetchSavedPlans(); // Refresh the list
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({ title: "Erreur de Sauvegarde", description: "Impossible de sauvegarder le plan repas.", variant: "destructive" });
    }
    setIsSaveDialogOpen(false);
    setIsLoadingPlans(false);
  };

  const handleLoadPlan = (planId: string) => {
    const planToLoad = savedPlans.find(p => p.id === planId);
    if (planToLoad) {
      const { id, name, createdAt, ...mealData } = planToLoad; 
      setCurrentMealPlan(mealData as GenerateMealPlanOutput); 
      setCurrentMealPlanId(id);
      setCurrentMealPlanName(name);
      toast({ title: "Plan Chargé", description: `Le plan repas "${name}" est affiché.` });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    setIsLoadingPlans(true);
    try {
      const planDocRef = doc(db, "mealPlans", planId);
      await deleteDoc(planDocRef);
      toast({ title: "Plan Supprimé", description: "Le plan repas a été supprimé.", variant: "destructive" });
      if (currentMealPlanId === planId) {
        setCurrentMealPlan(null);
        setCurrentMealPlanId(null);
        setCurrentMealPlanName("");
      }
      await fetchSavedPlans(); // Refresh the list
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({ title: "Erreur de Suppression", description: "Impossible de supprimer le plan repas.", variant: "destructive" });
    }
    setIsLoadingPlans(false);
  };
  
  const displayableSavedPlans = hasMounted ? savedPlans : [];

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <MealPlanForm onMealPlanGenerated={handleMealPlanGenerated} />
            {isLoadingPlans && !hasMounted ? (
              <div className="flex justify-center items-center h-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <SavedMealPlans
                savedPlans={displayableSavedPlans}
                onLoadPlan={handleLoadPlan}
                onDeletePlan={handleDeletePlan}
              />
            )}
          </div>

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
        initialName={currentMealPlanName || (currentMealPlan?.days?.length ? `Mon Plan ${new Date().toLocaleDateString('fr-FR')}`: "")}
      />
       <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} DiabEatz. Tous droits réservés.
      </footer>
    </div>
  );
}
