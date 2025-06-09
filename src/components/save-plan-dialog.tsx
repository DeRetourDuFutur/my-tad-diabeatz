"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SavePlanDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (name: string) => void; // Changed from onSavePlan to onSave to match usage
  currentPlanName?: string; // Changed from initialName to currentPlanName
};

export function SavePlanDialog({ isOpen, onOpenChange, onSave, currentPlanName }: SavePlanDialogProps) { // Changed onSavePlan to onSave, initialName to currentPlanName
  const [name, setName] = useState(currentPlanName || "");

  useEffect(() => {
    if (isOpen) {
      setName(currentPlanName || `Mon Plan Repas ${new Date().toLocaleDateString('fr-FR')}`);
    }
  }, [isOpen, currentPlanName]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim()); // Ensure onSave is called, not onSavePlan
      // onOpenChange(false); // This is typically handled by the parent component after save completes
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-popover">
        <DialogHeader>
          <DialogTitle>Sauvegarder le plan dans votre historique</DialogTitle>
             <DialogDescription>
               {currentPlanName ? "Vous pouvez renommer votre plan avant de l'enregistrer" : "Donnez un nom à votre nouveau plan repas pour le retrouver facilement."}
             </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="mb-1">
                Nom du plan
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="border border-cyan-400/50 shadow-[0_0_5px_1px_rgba(0,255,255,0.3)] focus:border-cyan-300 focus:shadow-[0_0_8px_2px_rgba(0,255,255,0.5)] transition-all duration-300" />
            </div>
          </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
