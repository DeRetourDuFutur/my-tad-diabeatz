
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Medication, MedicationReminder, ReminderFrequency } from "@/lib/types";
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
  FormDescription as FormDescriptionUI,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CirclePicker, CompactPicker } from 'react-color'; // Using react-color for a simple color picker
import { cn } from "@/lib/utils";

// Placeholder for MedicationFormEnum - User should replace with actual definition
const MedicationFormEnum = {
  TABLET: 'tablet',
  CAPSULE: 'capsule',
  LIQUID: 'liquid',
  INJECTION: 'injection',
  INHALER: 'inhaler',
  DROPS: 'drops',
  CREAM: 'cream',
  OTHER: 'other',
} as const;

const medicationFormSchema = z.object({
  name: z.string().min(1, { message: "Le nom est requis." }),
  description: z.string().min(1, { message: "La description/rôle est requise." }),
  strength: z.string().optional(),
  form: z.enum(['tablet', 'capsule', 'liquid', 'injection', 'inhaler', 'drops', 'cream', 'other']).optional(),
  color: z.string().optional(),
  stock: z.coerce.number().min(0, { message: "Le stock ne peut pas être négatif." }).default(0),
  lowStockThreshold: z.coerce.number().min(0, { message: "Le seuil ne peut être négatif." }).optional().or(z.literal('')),
  instructions: z.string().min(1, { message: "Les instructions de prise sont requises." }),
  reminderFrequency: z.enum(['daily', 'everyXdays', 'specificDays', 'asNeeded']).optional(),
  reminderIntervalDays: z.coerce.number().min(1).optional().or(z.literal('')), // Ensure this can be undefined or a number
  reminderSpecificDays: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).optional(),
  reminderTimes: z.string().optional(), // Comma-separated times e.g., "08:00,20:00"
});

type MedicationFormData = z.infer<typeof medicationFormSchema>;

const defaultReminderValues = {
  reminderFrequency: undefined,
  reminderIntervalDays: undefined,
  reminderSpecificDays: [],
  reminderTimes: "",
};

type AddEditMedicationDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Medication, 'id'> | Medication) => void;
  medicationToEdit?: Medication | null;
};

const daysOfWeekOptions: { id: NonNullable<MedicationReminder['specificDays']>[number]; label: string }[] = [
    { id: 'Mon', label: 'Lun' },
    { id: 'Tue', label: 'Mar' },
    { id: 'Wed', label: 'Mer' },
    { id: 'Thu', label: 'Jeu' },
    { id: 'Fri', label: 'Ven' },
    { id: 'Sat', label: 'Sam' },
    { id: 'Sun', label: 'Dim' },
];

export function AddEditMedicationDialog({
  isOpen,
  onOpenChange,
  onSave,
  medicationToEdit,
}: AddEditMedicationDialogProps) {
  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: "",
      description: "",
      strength: "",
      form: undefined,
      color: "#cccccc", // Default color
      stock: 0,
      lowStockThreshold: undefined,
      instructions: "",
      ...defaultReminderValues,
    },
  });

  const watchedFrequency = form.watch("reminderFrequency");

  useEffect(() => {
    if (isOpen) {
      if (medicationToEdit) {
        form.reset({
          name: medicationToEdit.name,
          description: medicationToEdit.description,
          strength: medicationToEdit.strength || "",
          form: medicationToEdit.form || undefined,
          color: medicationToEdit.color || "#cccccc",
          stock: medicationToEdit.stock,
          lowStockThreshold: medicationToEdit.lowStockThreshold === undefined ? '' : medicationToEdit.lowStockThreshold,
          instructions: medicationToEdit.instructions,
          reminderFrequency: medicationToEdit.reminder?.frequency || undefined,
          reminderIntervalDays: medicationToEdit.reminder?.intervalDays || undefined,
          reminderSpecificDays: medicationToEdit.reminder?.specificDays || [],
          reminderTimes: medicationToEdit.reminder?.times.join(", ") || "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
          strength: "",
          form: undefined,
          color: "#cccccc",
          stock: 0,
          lowStockThreshold: '',
          instructions: "",
          ...defaultReminderValues,
        });
      }
    }
  }, [medicationToEdit, form, isOpen]);

  const handleSubmit = (data: MedicationFormData) => {
    const reminder: MedicationReminder | undefined = data.reminderFrequency
      ? {
          frequency: data.reminderFrequency,
          intervalDays: data.reminderFrequency === 'everyXdays' && data.reminderIntervalDays ? Number(data.reminderIntervalDays) : undefined,
          specificDays: data.reminderFrequency === 'specificDays' ? data.reminderSpecificDays : undefined,
          times: data.reminderTimes?.split(',').map(t => t.trim()).filter(t => t) || [],
        }
      : undefined;

    const medicationData = {
      name: data.name,
      description: data.description,
      strength: data.strength,
      form: data.form,
      color: data.color,
      stock: Number(data.stock),
      lowStockThreshold: data.lowStockThreshold ? Number(data.lowStockThreshold) : undefined,
      instructions: data.instructions,
      reminder: reminder,
    };

    if (medicationToEdit && medicationToEdit.id) {
      onSave({ ...medicationData, id: medicationToEdit.id });
    } else {
      onSave(medicationData);
    }
  };

  const handleCloseDialog = () => {
    form.reset({
        name: "", description: "", strength: "", form: undefined, color: "#cccccc",
        stock: 0, lowStockThreshold: '', instructions: "", ...defaultReminderValues
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}> {/* Changed handleOpenChange to onOpenChange */}
      <DialogContent className="sm:max-w-lg bg-popover">
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du médicament</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Metformine" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="strength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Force / Dosage</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 500mg, 10 UI/mL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="form"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la forme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover">
                      {Object.values(MedicationFormEnum).map((formValue) => (
                        <SelectItem key={formValue} value={formValue}>
                          {formValue.charAt(0).toUpperCase() + formValue.slice(1).toLowerCase()} {/* Display formatted value */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Couleur indicative</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-[240px] justify-start text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        <div className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: field.value }} />
                                        {field.value ? field.value : "Choisir une couleur"}
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-0 shadow-none bg-transparent">
                                 <CompactPicker color={field.value} onChangeComplete={(color) => field.onChange(color.hex)} />
                            </PopoverContent>
                        </Popover>
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
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions de prise</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: 1 comprimé matin et soir au milieu du repas" {...field} rows={3} />
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
                    <Input
                      type="number"
                      placeholder="Ex: 30"
                      {...field}
                      value={field.value === undefined ? '' : field.value}
                      onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="lowStockThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seuil de stock bas (optionnel)</FormLabel>
                  <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    {...field}
                    value={field.value === undefined ? '' : String(field.value)}
                    onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                   />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 p-3 border rounded-md">
                <h4 className="text-sm font-medium text-foreground">Configuration des Rappels</h4>
                <FormField
                    control={form.control}
                    name="reminderFrequency"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Fréquence des rappels</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir une fréquence" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="daily">Quotidien</SelectItem>
                                    <SelectItem value="everyXdays">Tous les X jours</SelectItem>
                                    <SelectItem value="specificDays">Jours spécifiques de la semaine</SelectItem>
                                    <SelectItem value="asNeeded">Si besoin (pas de rappel programmé)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {watchedFrequency === 'everyXdays' && (
                    <FormField
                        control={form.control}
                        name="reminderIntervalDays"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Intervalle (jours)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Ex: 2 (pour tous les 2 jours)" {...field}
                                    value={field.value === undefined || field.value === null ? '' : String(field.value)}
                                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                                     />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {watchedFrequency === 'specificDays' && (
                     <FormField
                        control={form.control}
                        name="reminderSpecificDays"
                        render={() => (
                            <FormItem>
                                <div className="mb-2">
                                    <FormLabel className="text-base">Jours spécifiques</FormLabel>
                                    <FormDescriptionUI>
                                       Sélectionnez les jours de la semaine pour le rappel.
                                    </FormDescriptionUI>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {daysOfWeekOptions.map((day) => (
                                    <FormField
                                        key={day.id}
                                        control={form.control}
                                        name="reminderSpecificDays"
                                        render={({ field }) => {
                                        return (
                                            <FormItem
                                            key={day.id}
                                            className="flex flex-row items-center space-x-2 space-y-0 bg-muted/50 p-2 rounded-md"
                                            >
                                            <FormControl>
                                                <Checkbox
                                                checked={field.value?.includes(day.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                    ? field.onChange([...(field.value || []), day.id])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== day.id
                                                        )
                                                    )
                                                }}
                                                />
                                            </FormControl>
                                            <FormLabel className="text-sm font-normal cursor-pointer">
                                                {day.label}
                                            </FormLabel>
                                            </FormItem>
                                        )
                                        }}
                                    />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                )}

                {watchedFrequency && watchedFrequency !== 'asNeeded' && (
                     <FormField
                        control={form.control}
                        name="reminderTimes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Heures de prise</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: 08:00, 12:30, 20:00" {...field} />
                                </FormControl>
                                <FormDescriptionUI>
                                    Séparez plusieurs heures par une virgule.
                                </FormDescriptionUI>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>


            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit">
                {medicationToEdit ? "Sauvegarder les modifications" : "Ajouter le médicament"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
