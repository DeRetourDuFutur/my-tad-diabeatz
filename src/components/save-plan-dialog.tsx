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
  onSave: (name: string) => void;
  initialName?: string;
};

export function SavePlanDialog({ isOpen, onOpenChange, onSave, initialName = "" }: SavePlanDialogProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (isOpen) {
      setName(initialName || `Mon Plan Repas ${new Date().toLocaleDateString('fr-FR')}`);
    }
  }, [isOpen, initialName]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-blue-900 via-black to-black border border-cyan-400 shadow-[0_0_15px_5px_rgba(0,255,255,0.5)] rounded-lg">
        <DialogHeader>
<DialogTitle className="mb-2">{initialName ? "Sauvegarder la plan dans votre historique" : "Sauvegarder le Plan Repas"}</DialogTitle>
             <DialogDescription>
               {initialName ? "Vous pouvez renommer votre plan avant de l'enregistrer" : "Donnez un nom à votre nouveau plan repas pour le retrouver facilement."}
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
