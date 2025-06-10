
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
import ProtectedRoute from '@/components/auth/ProtectedRoute'; // Ajout de l'importation
// import { OptimizedTips } from '@/components/optimized-tips'; // Ajout de l'importation - Commenté car le composant n'existe pas

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, setDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import useLocalStorage from "@/hooks/use-local-storage";
import { useAuth } from '@/contexts/AuthContext'; // Correction du chemin d'importation

const initialSavedPlans: StoredMealPlan[] = [];
const initialMedications: Medication[] = [];

export default function HomePage() {
  const { currentUser } = useAuth(); // Récupérer l'utilisateur actuel
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
    if (!currentUser) return;
    try {
      const medicationsCollectionRef = collection(db, "users", currentUser.uid, "medications");
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
    if (!currentUser) return;
    setIsLoadingPlans(true);
    try {
      const plansCollectionRef = collection(db, "users", currentUser.uid, "mealPlans");
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
    if (!currentMealPlan || !currentUser) return;
    setIsLoadingPlans(true);

    const planDataToSave = {
      ...currentMealPlan,
      name,
      // Conserver le createdAt original lors de la mise à jour, sinon en créer un nouveau
      createdAt: currentMealPlanId 
        ? savedPlans.find(p => p.id === currentMealPlanId)?.createdAt || Timestamp.now() 
        : Timestamp.now(),
    };

    try {
      if (currentMealPlanId) {
        const planDocRef = doc(db, "users", currentUser.uid, "mealPlans", currentMealPlanId);
        // const existingPlan = savedPlans.find(p => p.id === currentMealPlanId); // Déjà utilisé pour createdAt
        // const updatedPlanData = { ...planDataToSave, createdAt: existingPlan?.createdAt || Timestamp.now() };
        await setDoc(planDocRef, planDataToSave); // planDataToSave contient déjà le bon createdAt
        
        // Mettre à jour l'état local
        setSavedPlans(prevPlans => 
          prevPlans.map(p => p.id === currentMealPlanId ? { ...planDataToSave, id: currentMealPlanId } as StoredMealPlan : p)
        );
        toast({ title: "Plan Mis à Jour!", description: `Le plan repas "${name}" a été mis à jour.` });
      } else {
        const plansCollectionRef = collection(db, "users", currentUser.uid, "mealPlans");
        const docRef = await addDoc(plansCollectionRef, planDataToSave);
        setCurrentMealPlanId(docRef.id);
        
        // Mettre à jour l'état local
        const newPlan = { ...planDataToSave, id: docRef.id } as StoredMealPlan;
        setSavedPlans(prevPlans =>
          [newPlan, ...prevPlans].sort((a, b) => {
            const getMillisSafe = (dateVal: string | Timestamp | null | undefined): number => {
              if (dateVal instanceof Timestamp) {
                return dateVal.toMillis();
              }
              if (typeof dateVal === 'string') {
                const d = new Date(dateVal);
                return !isNaN(d.getTime()) ? d.getTime() : 0; // Handle invalid date strings
              }
              return 0; // Fallback for null, undefined, or other unexpected types
            };
            return getMillisSafe(b.createdAt) - getMillisSafe(a.createdAt);
          })
        );

        toast({ title: "Plan Sauvegardé!", description: `Le plan repas "${name}" a été sauvegardé.` });
      }
      setCurrentMealPlanName(name);
      // Optionnel: appeler fetchSavedPlans pour resynchroniser, mais l'UI devrait être à jour
      // await fetchSavedPlans(); 
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({ title: "Erreur de Sauvegarde", description: "Impossible de sauvegarder le plan repas.", variant: "destructive" });
    } finally {
        setIsSaveDialogOpen(false);
        setIsLoadingPlans(false);
    }
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
    if (!currentUser) return;
    setIsLoadingPlans(true);
    try {
      const planDocRef = doc(db, "users", currentUser.uid, "mealPlans", planId);
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
    if (!currentUser) return;
    try {
      const medicationsCollectionRef = collection(db, "users", currentUser.uid, "medications");
      
      if ('id' in medicationData && medicationData.id) {
        // Mise à jour d'un médicament existant
        const medicationDocRef = doc(db, "users", currentUser.uid, "medications", medicationData.id);
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
    if (!currentUser) return;
    try {
      const medicationDocRef = doc(db, "users", currentUser.uid, "medications", medicationId);
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
    <ProtectedRoute>
      <main className="min-h-screen bg-background pt-24 container mx-auto px-6">
        <AppHeader />
        {aiError && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{aiError}</AlertDescription>
          </Alert>
        )}
        <div className="w-full mb-8">
          <MealPlanForm
            onMealPlanGenerated={handleMealPlanGenerated}
            onGenerationError={handleGenerationError}
            medications={medications}
          />
        </div>
        <div className="w-full mb-8">
          <SavedMealPlans
            savedPlans={displayableSavedPlans}
            isLoading={isLoadingPlans}
            onLoadPlan={handleLoadPlan}
            onDeletePlan={handleDeletePlan}
          />
        </div>
        <div className="w-full mb-8">
          <MedicationManagementCard
            medications={medications}
            onAddMedication={() => {
              setEditingMedication(null);
              setIsAddEditMedicationDialogOpen(true);
            }}
            onEditMedication={handleEditMedicationItem}
            onDeleteMedication={handleDeleteMedicationItem}
          />
        </div>
        <div className="w-full mb-8">
          <MealPlanDisplay
            mealPlan={currentMealPlan}
            mealPlanName={currentMealPlanName}
            onSavePlan={handleOpenSaveDialog}
          />
        </div>
        {showScrollTopButton && (
          <button
            onClick={scrollTop}
            className="fixed bottom-8 right-8 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Retour en haut"
          >
            <ArrowUpCircle className="h-6 w-6" />
          </button>
        )}
        <SavePlanDialog
          isOpen={isSaveDialogOpen}
          onOpenChange={setIsSaveDialogOpen}
          onSave={handleSavePlan}
          currentPlanName={currentMealPlanName}
        />
        <AddEditMedicationDialog
          isOpen={isAddEditMedicationDialogOpen}
          onOpenChange={(isOpen) => {
            setIsAddEditMedicationDialogOpen(isOpen);
            if (!isOpen) setEditingMedication(null);
          }}
          onSave={handleSaveMedication}
          medicationToEdit={editingMedication}
        />
        <div className="w-full mt-8">
          { /* <OptimizedTips /> */ }
        </div>
      </main>
    </ProtectedRoute>
  );
}
