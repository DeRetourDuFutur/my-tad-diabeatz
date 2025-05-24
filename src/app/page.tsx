
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
import { Terminal, Loader2 } from "lucide-react";

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

  const [medications, setMedications] = useLocalStorage<Medication[]>('diabeatz-medications', initialMedications);
  const [isAddEditMedicationDialogOpen, setIsAddEditMedicationDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  useEffect(() => {
    setHasMounted(true);
    fetchSavedPlans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

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

 const handleSaveMedication = (medicationData: Omit<Medication, 'id'> | Medication) => {
    if ('id' in medicationData && medicationData.id) { 
      setMedications(prevMeds => 
        prevMeds.map(med => med.id === medicationData.id ? { ...med, ...medicationData } : med)
        .sort((a, b) => a.name.localeCompare(b.name))
      );
      toast({ title: "Médicament Modifié!", description: `${medicationData.name} a été mis à jour.` });
    } else { 
      const newMedication: Medication = {
        id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        ...medicationData,
        color: medicationData.color || "#cccccc", 
        form: medicationData.form || 'other',
      };
      setMedications(prevMeds => [...prevMeds, newMedication].sort((a, b) => a.name.localeCompare(b.name)));
      toast({ title: "Médicament Ajouté!", description: `${newMedication.name} a été ajouté à votre liste.` });
    }
    setIsAddEditMedicationDialogOpen(false);
    setEditingMedication(null);
  };

  const handleEditMedicationItem = (medication: Medication) => {
    setEditingMedication(medication);
    setIsAddEditMedicationDialogOpen(true);
  };

  const handleDeleteMedicationItem = (medicationId: string) => {
    setMedications(prevMeds => prevMeds.filter(med => med.id !== medicationId));
    toast({ title: "Médicament Supprimé", variant: "destructive" });
  };


  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            <MealPlanForm 
              onMealPlanGenerated={handleMealPlanGenerated} 
              onGenerationError={handleGenerationError} 
            />
            {isLoadingPlans && !hasMounted ? (
              <div className="flex justify-center items-center h-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <SavedMealPlans
                savedPlans={displayableSavedPlans}
                onLoadPlan={handleLoadPlan}
                onDeletePlan={handleDeletePlan}
              />
            )}
            <MedicationManagementCard 
              medications={medications}
              onAddMedication={handleOpenAddMedicationDialog}
              onEditMedication={handleEditMedicationItem}
              onDeleteMedication={handleDeleteMedicationItem}
            />
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
      <AddEditMedicationDialog
        isOpen={isAddEditMedicationDialogOpen}
        onOpenChange={setIsAddEditMedicationDialogOpen}
        onSave={handleSaveMedication}
        medicationToEdit={editingMedication}
      />
       <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} DiabEatz. Tous droits réservés.
      </footer>
    </div>
  );
}

