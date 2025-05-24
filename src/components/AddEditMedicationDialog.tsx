
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Medication } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const medicationSchema = z.object({
  name: z.string().min(1, { message: "Le nom est requis." }),
  description: z.string().min(1, { message: "La description/rôle est requise." }),
  stock: z.coerce.number().min(0, { message: "Le stock ne peut pas être négatif." }),
  dosage: z.string().min(1, { message: "La posologie est requise." }),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

type AddEditMedicationDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Medication, 'id'>) => void;
  medicationToEdit?: Medication | null;
};

export function AddEditMedicationDialog({
  isOpen,
  onOpenChange,
  onSave,
  medicationToEdit,
}: AddEditMedicationDialogProps) {
  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      description: "",
      stock: 0,
      dosage: "",
    },
  });

  useEffect(() => {
    if (medicationToEdit) {
      form.reset(medicationToEdit);
    } else {
      form.reset({
        name: "",
        description: "",
        stock: 0,
        dosage: "",
      });
    }
  }, [medicationToEdit, form, isOpen]); // Re-run when isOpen changes to reset form on new "add"

  const handleSubmit = (data: MedicationFormData) => {
    onSave(data);
    onOpenChange(false); // Close dialog on save
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {medicationToEdit ? "Modifier le médicament" : "Ajouter un médicament"}
          </DialogTitle>
          <DialogDescription>
            {medicationToEdit
              ? "Modifiez les détails de votre médicament."
              : "Renseignez les informations de votre nouveau médicament."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du médicament</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Metformine 500mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Rôle</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Antidiabétique oral" {...field} rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock actuel (unités)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posologie</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 1 comprimé matin et soir" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit">
                {medicationToEdit ? "Sauvegarder" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
