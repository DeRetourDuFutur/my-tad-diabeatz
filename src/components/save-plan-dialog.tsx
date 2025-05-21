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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialName ? "Mettre à jour le nom du plan" : "Sauvegarder le Plan Repas"}</DialogTitle>
          <DialogDescription>
            {initialName ? "Modifiez le nom de votre plan repas." : "Donnez un nom à votre nouveau plan repas pour le retrouver facilement."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan-name" className="text-right">
              Nom
            </Label>
            <Input
              id="plan-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Ex: Plan Semaine 1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {initialName ? "Mettre à jour" : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
