
"use client";

import { useState, useEffect } from "react";
import type { GenerateMealPlanOutput, StoredMealPlan, Medication } from "@/lib/types";
import { AppHeader } from "@/components/app-header";
import { MealPlanForm } from "@/components/meal-plan-form";
import { MealPlanDisplay } from "@/components/meal-plan-display";
import { SavedMealPlans } from "@/components/saved-meal-plans";
import { MedicationManagementCard } from "@/components/MedicationManagementCard";
import { AddEditMedicationDialog } from "@/components/AddEditMedicationDialog";
import { SavePlanDialog } from "@/components/save-plan-dialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2, ArrowUpCircle } from "lucide-react";

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, setDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import useLocalStorage from "@/hooks/use-local-storage";

const initialSavedPlans: StoredMealPlan[] = [];
const initialMedications: Medication[] = [];

export default function HomePage() {
  const [currentMealPlan, setCurrentMealPlan] = useState<GenerateMealPlanOutput | null>(null);
  const [currentMealPlanId, setCurrentMealPlanId] = useState<string | null>(null);
  const [currentMealPlanName, setCurrentMealPlanName] = useState<string>("");

  const [savedPlans, setSavedPlans] = useState<StoredMealPlan[]>(initialSavedPlans);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const { toast } = useToast();

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [isAddEditMedicationDialogOpen, setIsAddEditMedicationDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    fetchSavedPlans();
    fetchMedications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScrollTopButton && window.pageYOffset > 400) {
        setShowScrollTopButton(true);
      } else if (showScrollTopButton && window.pageYOffset <= 400) {
        setShowScrollTopButton(false);
      }
    };
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, [showScrollTopButton]);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchMedications = async () => {
    try {
      const medicationsCollectionRef = collection(db, "medications");
      const q = query(medicationsCollectionRef, orderBy("name"));
      const querySnapshot = await getDocs(q);
      const meds: Medication[] = [];
      querySnapshot.forEach((doc) => {
        meds.push({ id: doc.id, ...doc.data() } as Medication);
      });
      setMedications(meds);
    } catch (error) {
      console.error("Error fetching medications:", error);
      toast({ 
        title: "Erreur de chargement", 
        description: "Impossible de charger les médicaments.", 
        variant: "destructive" 
      });
    }
  };

  const fetchSavedPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const plansCollectionRef = collection(db, "mealPlans");
      const q = query(plansCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const plans: StoredMealPlan[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        let createdAt = data.createdAt;
        if (typeof createdAt === 'string') {
          createdAt = Timestamp.fromDate(new Date(createdAt));
        } else if (!(createdAt instanceof Timestamp) && createdAt && typeof createdAt.seconds === 'number' && typeof createdAt.nanoseconds === 'number') {
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
    toast({ title: "Plan Généré!", description: "Votre nouveau plan alimentaire est prêt." });
  };

  const handleGenerationError = (errorMsg: string) => {
    setAiError(errorMsg);
    setCurrentMealPlan(null);
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
    setIsLoadingPlans(true);

    const planDataToSave = {
      ...currentMealPlan,
      name,
      createdAt: currentMealPlanId ? savedPlans.find(p=>p.id === currentMealPlanId)?.createdAt || Timestamp.now() : Timestamp.now(),
    };

    try {
      if (currentMealPlanId) {
        const planDocRef = doc(db, "mealPlans", currentMealPlanId);
        const existingPlan = savedPlans.find(p => p.id === currentMealPlanId);
        const updatedPlanData = { ...planDataToSave, createdAt: existingPlan?.createdAt || Timestamp.now() };
        await setDoc(planDocRef, updatedPlanData);
        toast({ title: "Plan Mis à Jour!", description: `Le plan repas "${name}" a été mis à jour.` });
      } else {
        const plansCollectionRef = collection(db, "mealPlans");
        const docRef = await addDoc(plansCollectionRef, planDataToSave);
        setCurrentMealPlanId(docRef.id);
        toast({ title: "Plan Sauvegardé!", description: `Le plan repas "${name}" a été sauvegardé.` });
      }
      setCurrentMealPlanName(name);
      await fetchSavedPlans();
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
      setAiError(null);
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
      await fetchSavedPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({ title: "Erreur de Suppression", description: "Impossible de supprimer le plan repas.", variant: "destructive" });
    }
    setIsLoadingPlans(false);
  };

  const displayableSavedPlans = hasMounted ? savedPlans : [];

  const handleOpenAddMedicationDialog = () => {
    setEditingMedication(null);
    setIsAddEditMedicationDialogOpen(true);
  };

 const handleSaveMedication = async (medicationData: Omit<Medication, 'id'> | Medication) => {
    try {
      const medicationsCollectionRef = collection(db, "medications");
      
      if ('id' in medicationData && medicationData.id) {
        // Mise à jour d'un médicament existant
        const medicationDocRef = doc(db, "medications", medicationData.id);
        await setDoc(medicationDocRef, medicationData);
        toast({ 
          title: "Médicament Modifié!", 
          description: `${medicationData.name} a été mis à jour.` 
        });
      } else {
        // Ajout d'un nouveau médicament
        const newMedicationData = {
          ...medicationData,
          color: medicationData.color || "#cccccc",
          form: medicationData.form || 'other',
          createdAt: Timestamp.now()
        };
        await addDoc(medicationsCollectionRef, newMedicationData);
        toast({ 
          title: "Médicament Ajouté!", 
          description: `${medicationData.name} a été ajouté à votre liste.` 
        });
      }
      
      // Rafraîchir la liste des médicaments
      await fetchMedications();
    } catch (error) {
      console.error("Error saving medication:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de sauvegarder le médicament.", 
        variant: "destructive" 
      });
    }
    
    setIsAddEditMedicationDialogOpen(false);
    setEditingMedication(null);
  };

  const handleEditMedicationItem = (medication: Medication) => {
    setEditingMedication(medication);
    setIsAddEditMedicationDialogOpen(true);
  };

  const handleDeleteMedicationItem = async (medicationId: string) => {
    try {
      const medicationDocRef = doc(db, "medications", medicationId);
      await deleteDoc(medicationDocRef);
      toast({ 
        title: "Médicament Supprimé", 
        description: "Le médicament a été supprimé avec succès.",
        variant: "destructive" 
      });
      // Rafraîchir la liste des médicaments
      await fetchMedications();
    } catch (error) {
      console.error("Error deleting medication:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de supprimer le médicament.", 
        variant: "destructive" 
      });
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-center text-primary">Diabeatz Meal Planner</h1>

        {aiError && (
          <Alert variant="destructive" className="my-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Erreur de Génération IA</AlertTitle>
            <AlertDescription>{aiError}</AlertDescription>
          </Alert>
        )}

        <MealPlanForm 
          onMealPlanGenerated={handleMealPlanGenerated} 
          onGenerationError={handleGenerationError} 
          medications={medications} 
        />

        {currentMealPlan && (
          <MealPlanDisplay 
            mealPlan={currentMealPlan} 
            onSavePlan={handleOpenSaveDialog} 
            mealPlanName={currentMealPlanName} // Changed from planName to mealPlanName
          />
        )}

        <SavedMealPlans
          savedPlans={displayableSavedPlans} // Changed from plans to savedPlans
          onLoadPlan={handleLoadPlan}
          onDeletePlan={handleDeletePlan}
          isLoading={isLoadingPlans}
        />

        <MedicationManagementCard 
          medications={medications}
          onAddMedication={handleOpenAddMedicationDialog}
          onEditMedication={handleEditMedicationItem}
          onDeleteMedication={handleDeleteMedicationItem}
        />

      {showScrollTopButton && (
        <button 
          onClick={scrollTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-opacity duration-300 opacity-100 hover:opacity-80"
          aria-label="Retour en haut"
        >
          <ArrowUpCircle className="h-6 w-6" />
        </button>
      )}
      </main>
      <SavePlanDialog
        isOpen={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSavePlan} // Ensure this matches the prop name in SavePlanDialog
        currentPlanName={currentMealPlanName} // Pass currentMealPlanName
      />
      <AddEditMedicationDialog 
        isOpen={isAddEditMedicationDialogOpen} 
        onOpenChange={setIsAddEditMedicationDialogOpen}
        onSave={handleSaveMedication}
        medicationToEdit={editingMedication}
      />
    </div>
  );
}
