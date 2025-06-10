
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
import { SketchPicker } from 'react-color'; // Using react-color for a more comprehensive color picker
import { cn } from "@/lib/utils";

// Enum pour les formats de médicament
const MedicationFormEnum = {
  TABLET: 'comprimé',
  CAPSULE: 'gélule',
} as const;

// Enum pour les aspects visuels des médicaments
const MedicationShapeEnum = {
  // Formes de comprimés
  ROUND: 'rond',
  OVAL: 'ovale',
  RECTANGLE: 'rectangle',
  DIAMOND: 'losange',
  SQUARE: 'carré',
  TRIANGLE: 'triangle',
  PENTAGON: 'pentagone',
  HEXAGON: 'hexagone',
  OCTAGON: 'octogone',
  SCREDABLE: 'sécable',
  // Formes de gélules
  CAPSULE_STANDARD: 'standard',
  CAPSULE_LONG: 'longue',
  CAPSULE_SOFTGEL: 'molle',
  CAPSULE_TWO_PIECE: 'deux pièces',
  CAPSULE_OBLONG: 'oblongue',
} as const;

const medicationFormSchema = z.object({
  name: z.string().min(1, { message: "Le nom est requis." }),
  description: z.string().min(1, { message: "La description/rôle est requise." }),
  strength: z.string().optional(),
  form: z.enum(['comprimé', 'gélule']).optional(),
  shape: z.enum(['rond', 'ovale', 'rectangle', 'losange', 'carré', 'triangle', 'pentagone', 'hexagone', 'octogone', 'sécable', 'standard', 'longue', 'molle', 'deux pièces', 'oblongue']).optional(),
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
  shape: undefined,
      color: "#cccccc", // Default color
      stock: 0,
      lowStockThreshold: undefined,
      instructions: "",
      ...defaultReminderValues,
    },
  });

  const watchedFrequency = form.watch("reminderFrequency");
  const watchedForm = form.watch("form");

  useEffect(() => {
    if (isOpen) {
      if (medicationToEdit) {
        form.reset({
          name: medicationToEdit.name,
          description: medicationToEdit.description,
          strength: medicationToEdit.strength || "",
          form: medicationToEdit.form ? (MedicationFormEnum[medicationToEdit.form.toUpperCase() as keyof typeof MedicationFormEnum] || medicationToEdit.form) : undefined,
          shape: medicationToEdit.shape || undefined,
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
          shape: undefined,
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
    // Construct reminder object carefully to avoid undefined fields
    let constructedReminder: MedicationReminder | undefined = undefined;
    if (data.reminderFrequency) {
      const reminderBase: any = { // Using 'any' for intermediate construction ease, ensure MedicationReminder type is matched
        frequency: data.reminderFrequency,
        times: data.reminderTimes?.split(',').map(t => t.trim()).filter(t => t) || [],
      };

      if (data.reminderFrequency === 'everyXdays' && data.reminderIntervalDays && String(data.reminderIntervalDays).trim() !== '') {
        const interval = Number(data.reminderIntervalDays);
        if (!isNaN(interval)) { // Add intervalDays only if it's a valid number
          reminderBase.intervalDays = interval;
        }
      }

      if (data.reminderFrequency === 'specificDays' && data.reminderSpecificDays && data.reminderSpecificDays.length > 0) {
        reminderBase.specificDays = data.reminderSpecificDays;
      }
      constructedReminder = reminderBase as MedicationReminder;
    }

    // Construct medicationData ensuring no undefined fields are explicitly set
    const medicationData: { [key: string]: any } = { // Use a general type for construction, ensure it matches onSave prop type
      name: data.name,
      description: data.description,
      strength: data.strength,
      form: data.form,
      shape: data.shape,
      color: data.color,
      // Ensure stock is a number, defaulting to 0 if empty/undefined/null or invalid string
      stock: (data.stock !== undefined && data.stock !== null && String(data.stock).trim() !== '' && !isNaN(Number(data.stock))) ? Number(data.stock) : 0,
      instructions: data.instructions,
    };

    if (data.lowStockThreshold && String(data.lowStockThreshold).trim() !== '') {
      const threshold = Number(data.lowStockThreshold);
      if (!isNaN(threshold)) { // Add lowStockThreshold only if it's a valid number
        medicationData.lowStockThreshold = threshold;
      }
    }

    if (constructedReminder) {
      medicationData.reminder = constructedReminder;
    }
    // Fields not set (e.g. lowStockThreshold if invalid, reminder if not applicable) will be omitted from medicationData by Firestore if not present

    if (medicationToEdit && medicationToEdit.id) {
      // Ensure all required fields for Medication are present, even if spreading medicationData
      const finalMedicationData: Medication = {
        id: medicationToEdit.id, // id is always present for editing
        name: medicationData.name, // name is required
        description: medicationData.description, // description is required
        strength: medicationData.strength, // strength is required
        form: medicationData.form, // form is required
        shape: medicationData.shape, // shape is optional but include if present
        color: medicationData.color, // color is required
        stock: medicationData.stock, // stock is required
        instructions: medicationData.instructions, // instructions is required
        // Optional fields, only add if they exist in medicationData
        ...(medicationData.lowStockThreshold !== undefined && { lowStockThreshold: medicationData.lowStockThreshold }),
        ...(medicationData.reminder && { reminder: medicationData.reminder })
       };
      onSave(finalMedicationData);
    } else {
      // For new medications, ensure all required fields for Omit<Medication, "id"> are present
      const finalNewMedicationData: Omit<Medication, "id"> = {
        name: medicationData.name, // name is required
        description: medicationData.description, // description is required
        strength: medicationData.strength, // strength is required
        form: medicationData.form, // form is required
        shape: medicationData.shape, // shape is optional but include if present
        color: medicationData.color, // color is required
        stock: medicationData.stock, // stock is required
        instructions: medicationData.instructions, // instructions is required
        // Optional fields, only add if they exist in medicationData
        ...(medicationData.lowStockThreshold !== undefined && { lowStockThreshold: medicationData.lowStockThreshold }),
        ...(medicationData.reminder && { reminder: medicationData.reminder }),
        // createdAt will be set by the onSave function in page.tsx
      };
      onSave(finalNewMedicationData);
    }
  };

  const handleCloseDialog = () => {
    form.reset({
        name: "", description: "", strength: "", form: undefined, shape: undefined, color: "#cccccc",
        stock: 0, lowStockThreshold: '', instructions: "", ...defaultReminderValues
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[#0f1729] border-[#1e293b] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {medicationToEdit ? "Modifier le médicament" : "Ajouter un médicament"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {medicationToEdit
              ? "Modifiez les détails de votre médicament."
              : "Renseignez les informations de votre nouveau médicament."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-2 max-h-[70vh] overflow-y-auto pr-3">
            <div className="grid grid-cols-10 gap-4">
              <div className="col-span-7">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du médicament</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Metformine" {...field} className="bg-[#1e293b] border-[#2e3b52] text-white placeholder:text-gray-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-3">
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
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Rôle</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Antidiabétique oral" {...field} rows={1} className="min-h-[32px] py-1 bg-[#1e293b] border-[#2e3b52] text-white placeholder:text-gray-400"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-10 gap-4">
            <div className="col-span-3">
            <FormField
              control={form.control}
              name="form"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <Select onValueChange={(value) => { field.onChange(value); form.setValue('shape', undefined); }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#1e293b] border-[#2e3b52] text-white placeholder:text-gray-400 focus:ring-ring focus:ring-offset-background focus:ring-offset-2 focus:ring-2">
                        <SelectValue placeholder="Sélectionner le format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1e293b] border-[#2e3b52] text-white">
                      {Object.values(MedicationFormEnum).map((formValue) => (
                        <SelectItem key={formValue} value={formValue} className="hover:bg-[#2e3b52] focus:bg-[#2e3b52]">
                          {formValue.charAt(0).toUpperCase() + formValue.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
            {watchedForm ? (
              <div className="col-span-7 grid grid-cols-10 gap-4 items-end">
                <div className="col-span-5">
                  <FormField
                    control={form.control}
                    name="shape"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aspect</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal bg-[#1e293b] border-[#2e3b52] text-white hover:bg-[#2e3b52] hover:text-white"
                              >
                                {field.value ? (
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden mr-2">
                                      {/* Updated SVG Icons */}
                                      {field.value === 'rond' && <svg viewBox='0 0 32 32' className='w-5 h-5' style={{ fill: form.getValues('color') || '#cccccc' }}><circle cx='16' cy='16' r='14'/></svg>}
                                      {field.value === 'ovale' && <svg viewBox='0 0 40 24' className='w-6 h-4' style={{ fill: form.getValues('color') || '#cccccc' }}><ellipse cx='20' cy='12' rx='18' ry='10'/></svg>}
                                      {field.value === 'rectangle' && <svg viewBox='0 0 40 24' className='w-7 h-5' style={{ fill: form.getValues('color') || '#cccccc' }}><rect x='2' y='2' width='36' height='20' rx='3' ry='3'/></svg>}
                                      {field.value === 'losange' && <svg viewBox='0 0 32 32' className='w-5 h-5' style={{ fill: form.getValues('color') || '#cccccc' }}><polygon points='16,2 30,16 16,30 2,16'/></svg>}
                                      {field.value === 'carré' && <svg viewBox='0 0 32 32' className='w-5 h-5' style={{ fill: form.getValues('color') || '#cccccc' }}><rect x='4' y='4' width='24' height='24' rx='3' ry='3'/></svg>}
                                      {field.value === 'triangle' && <svg viewBox='0 0 32 32' className='w-5 h-5' style={{ fill: form.getValues('color') || '#cccccc' }}><polygon points='16,4 28,28 4,28'/></svg>}
                                      {field.value === 'pentagone' && <svg viewBox='0 0 32 32' className='w-5 h-5' style={{ fill: form.getValues('color') || '#cccccc' }}><polygon points='16,2 30,12 24,30 8,30 2,12'/></svg>}
                                      {field.value === 'hexagone' && <svg viewBox='0 0 32 32' className='w-5 h-5' style={{ fill: form.getValues('color') || '#cccccc' }}><polygon points='8,4 24,4 30,16 24,28 8,28 2,16'/></svg>}
                                      {field.value === 'octogone' && <svg viewBox='0 0 32 32' className='w-5 h-5' style={{ fill: form.getValues('color') || '#cccccc' }}><polygon points='10,2 22,2 30,10 30,22 22,30 10,30 2,22 2,10'/></svg>}
                                      {field.value === 'sécable' && <svg viewBox='0 0 32 32' className='w-5 h-5' style={{ fill: form.getValues('color') || '#cccccc' }}><circle cx='16' cy='16' r='14'/><line x1='4' y1='16' x2='28' y2='16' stroke={form.getValues('color') === '#ffffff' || form.getValues('color') === '#fff' ? '#888888' : 'white'} strokeWidth='2.5'/></svg>}
                                      {field.value === 'standard' && <svg viewBox='0 0 40 20' className='w-7 h-5' style={{ fill: form.getValues('color') || '#cccccc' }}><rect x='2' y='2' width='36' height='16' rx='8' ry='8'/></svg>}
                                      {field.value === 'longue' && <svg viewBox='0 0 48 20' className='w-8 h-5' style={{ fill: form.getValues('color') || '#cccccc' }}><rect x='2' y='2' width='44' height='16' rx='8' ry='8'/></svg>}
                                      {field.value === 'molle' && <svg viewBox='0 0 32 32' className='w-6 h-6' style={{ fill: form.getValues('color') || '#cccccc' }}><ellipse cx='16' cy='16' rx='14' ry='10' transform='rotate(30 16 16)'/></svg>}
                                      {field.value === 'deux pièces' && 
                                        <svg viewBox='0 0 40 20' className='w-7 h-5'>
                                          <defs>
                                            <linearGradient id="gradCapsule" x1="0%" y1="0%" x2="100%" y2="0%">
                                              <stop offset="49%" style={{stopColor: form.getValues('color') || '#cccccc', stopOpacity:1}} />
                                              <stop offset="51%" style={{stopColor: form.getValues('color') || '#cccccc', stopOpacity:1}} />
                                            </linearGradient>
                                          </defs>
                                          <rect x='2' y='2' width='17' height='16' rx='8' ry='8' style={{fill: form.getValues('color') || '#cccccc'}}/>
                                          <rect x='21' y='2' width='17' height='16' rx='8' ry='8' style={{fill: form.getValues('color') || '#cccccc'}}/>
                                          <line x1='19.5' y1='1.5' x2='19.5' y2='18.5' stroke={form.getValues('color') === '#ffffff' || form.getValues('color') === '#fff' ? '#888888' : 'white'} strokeWidth='1.5'/>
                                        </svg>
                                      }
                                      {field.value === 'oblongue' && <svg viewBox='0 0 48 24' className='w-8 h-5' style={{ fill: form.getValues('color') || '#cccccc' }}><rect x='2' y='2' width='44' height='20' rx='10' ry='10'/></svg>}
                                    </div>
                                    {field.value.charAt(0).toUpperCase() + field.value.slice(1)}
                                  </div>
                                ) : "Choisir un aspect"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-1 bg-[#1e293b] border-[#2e3b52]">
                            <div className={`grid gap-1 ${watchedForm === MedicationFormEnum.TABLET ? 'grid-cols-3' : 'grid-cols-3'}`}>
                              {Object.values(MedicationShapeEnum)
                                .filter(shapeValue =>
                                  (watchedForm === MedicationFormEnum.TABLET && ['rond', 'ovale', 'rectangle', 'losange', 'carré', 'triangle', 'pentagone', 'hexagone', 'octogone', 'sécable'].includes(shapeValue)) ||
                                  (watchedForm === MedicationFormEnum.CAPSULE && ['standard', 'longue', 'molle', 'deux pièces', 'oblongue'].includes(shapeValue))
                                )
                                .map((shapeValue) => (
                                  <Button
                                    key={shapeValue}
                                    type="button"
                                    variant={field.value === shapeValue ? "default" : "outline"}
                                    onClick={() => { field.onChange(shapeValue); form.trigger('color'); }}
                                    className={cn(
                                      "h-10 w-10 p-1.5 flex items-center justify-center text-center aspect-square rounded-md",
                                      field.value === shapeValue ? "bg-blue-600 hover:bg-blue-700 border-blue-600" : "bg-transparent hover:bg-[#283347] border-transparent text-white"
                                    )}
                                    title={shapeValue.charAt(0).toUpperCase() + shapeValue.slice(1)}
                                  >
                                    <div className="w-7 h-7 flex items-center justify-center overflow-hidden">
                                      {/* Modern SVG Icons with enhanced design */}
                                      {shapeValue === 'rond' && <svg viewBox='0 0 32 32' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><circle cx='16' cy='16' r='15' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/></svg>}
                                      {shapeValue === 'ovale' && <svg viewBox='0 0 40 24' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><ellipse cx='20' cy='12' rx='19' ry='11' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/></svg>}
                                      {shapeValue === 'rectangle' && <svg viewBox='0 0 40 24' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><rect x='1' y='1' width='38' height='22' rx='4' ry='4' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/></svg>}
                                      {shapeValue === 'losange' && <svg viewBox='0 0 32 32' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><path d='M16,1 L31,16 L16,31 L1,16 Z' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/></svg>}
                                      {shapeValue === 'carré' && <svg viewBox='0 0 32 32' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><rect x='1' y='1' width='30' height='30' rx='4' ry='4' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/></svg>}
                                      {shapeValue === 'triangle' && <svg viewBox='0 0 32 32' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><path d='M16,2 L30,28 H2 Z' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/></svg>}
                                      {shapeValue === 'pentagone' && <svg viewBox='0 0 32 32' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><path d='M16,1 L31,12 L25,31 H7 L1,12 Z' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/></svg>}
                                      {shapeValue === 'hexagone' && <svg viewBox='0 0 32 32' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><path d='M8,2 L24,2 L31,16 L24,30 L8,30 L1,16 Z' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/></svg>}
                                      {shapeValue === 'octogone' && <svg viewBox='0 0 32 32' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><path d='M11,1 L21,1 L31,11 L31,21 L21,31 L11,31 L1,21 L1,11 Z' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/></svg>}
                                      {shapeValue === 'sécable' && <svg viewBox='0 0 32 32' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><circle cx='16' cy='16' r='15' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/><line x1='3' y1='16' x2='29' y2='16' stroke={form.getValues('color') === '#ffffff' || form.getValues('color') === '#fff' ? '#888888' : 'white'} strokeWidth='2' strokeLinecap='round'/></svg>}
                                      {shapeValue === 'standard' && <svg viewBox='0 0 40 20' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><rect x='1' y='1' width='38' height='18' rx='9' ry='9' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/></svg>}
                                      {shapeValue === 'longue' && <svg viewBox='0 0 48 20' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><rect x='1' y='1' width='46' height='18' rx='9' ry='9' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/></svg>}
                                      {shapeValue === 'molle' && <svg viewBox='0 0 32 32' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><ellipse cx='16' cy='16' rx='15' ry='11' transform='rotate(30 16 16)' strokeWidth='1.5' stroke='rgba(255,255,255,0.1)'/></svg>}
                                      {shapeValue === 'deux pièces' && 
                                        <svg viewBox='0 0 40 20' className='w-full h-full'>
                                          <defs>
                                            <linearGradient id="gradCapsulePopover" x1="0%" y1="0%" x2="100%" y2="0%">
                                              <stop offset="49%" style={{stopColor: form.getValues('color') || '#cccccc', stopOpacity:1}} />
                                              <stop offset="51%" style={{stopColor: form.getValues('color') || '#cccccc', stopOpacity:1}} />
                                            </linearGradient>
                                          </defs>
                                          <rect x='2' y='2' width='17' height='16' rx='8' ry='8' style={{fill: form.getValues('color') || '#cccccc'}}/>
                                          <rect x='21' y='2' width='17' height='16' rx='8' ry='8' style={{fill: form.getValues('color') || '#cccccc'}}/>
                                          <line x1='19.5' y1='1.5' x2='19.5' y2='18.5' stroke={form.getValues('color') === '#ffffff' || form.getValues('color') === '#fff' ? '#888888' : 'white'} strokeWidth='1.5'/>
                                        </svg>
                                      }
                                      {shapeValue === 'oblongue' && <svg viewBox='0 0 48 24' className='w-full h-full' style={{ fill: form.getValues('color') || '#cccccc' }}><rect x='2' y='2' width='44' height='20' rx='10' ry='10'/></svg>}
                                    </div>
                                    {/* Removed shape name text below icon */}
                                  </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-5">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem className="flex flex-col h-full justify-between">
                        <FormLabel>Couleur</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal bg-[#1e293b] border-[#2e3b52] text-white hover:bg-[#2e3b52] hover:text-white mt-auto"
                              >
                                <div className="w-4 h-4 rounded-full mr-2 border" style={{ backgroundColor: field.value || '#cccccc' }} />
                                {field.value ? field.value : "Choisir une couleur"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 border-0 bg-transparent">
                            <SketchPicker 
                              color={field.value || '#ffffff'} 
                              onChangeComplete={(color) => {
                                field.onChange(color.hex);
                                // Trigger shape update to re-render SVG with new color
                                if (form.getValues('shape')) {
                                  form.trigger('shape'); 
                                }
                              }} 
                              presetColors={['#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', '#4A90E2', '#50E3C2', '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF', '#c0c0c0', '#808080', '#ff0000', '#800000', '#ffff00', '#808000', '#00ff00', '#008000', '#00ffff', '#008080', '#0000ff', '#000080', '#ff00ff', '#800080']}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ) : null}
            </div>
            {/* Le FormField pour la couleur qui était ici a été supprimé car il était en double et causait des erreurs. 
               La logique de couleur est maintenant gérée dans le bloc conditionnel ci-dessus lorsque `watchedForm` est vrai. 
            */}
            
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions de prise</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: 1 comprimé matin et soir au milieu du repas" {...field} rows={1} className="min-h-[32px] py-1 bg-[#1e293b] border-[#2e3b52] text-white placeholder:text-gray-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock (unités)</FormLabel>
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
                    <FormLabel>Seuil renouvellement</FormLabel>
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
            </div>

            <div className="space-y-3 border rounded-md">
                                <div className="grid grid-cols-10 gap-2">
                  <div className="col-span-6"> {/* Adjusted from col-span-7 to col-span-6 */}
                    <FormField
                        control={form.control}
                        name="reminderFrequency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fréquence des rappels</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-[#1e293b] border-[#2e3b52] text-white placeholder:text-gray-400 focus:ring-ring focus:ring-offset-background focus:ring-offset-2 focus:ring-2">
                                            <SelectValue placeholder="Choisir une fréquence" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-[#1e293b] border-[#2e3b52] text-white">
                                        <SelectItem value="daily" className="hover:bg-[#2e3b52] focus:bg-[#2e3b52]">Quotidien</SelectItem>
                                        <SelectItem value="everyXdays" className="hover:bg-[#2e3b52] focus:bg-[#2e3b52]">Tous les X jours</SelectItem>
                                        <SelectItem value="specificDays" className="hover:bg-[#2e3b52] focus:bg-[#2e3b52]">Jours spécifiques de la semaine</SelectItem>
                                        {/* Removed: <SelectItem value="asNeeded" className="hover:bg-[#2e3b52] focus:bg-[#2e3b52]">Si besoin (pas de rappel programmé)</SelectItem> */}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                  </div>
                  <div className="col-span-4"> {/* Adjusted from col-span-3 to col-span-4 */}
                    {watchedFrequency && watchedFrequency !== 'asNeeded' && (
                        <FormField
                            control={form.control}
                            name="reminderTimes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Heures de prise</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 08:00, 12:00, 20:00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                  </div>
                </div>

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

                {/* Reminder times is now part of the grid layout above, this block can be removed or adjusted if further description is needed elsewhere */}
                {watchedFrequency && watchedFrequency !== 'asNeeded' && (
                     <FormField
                        control={form.control}
                        name="reminderTimes"
                        render={({ field }) => (
                            <FormItem className="col-span-10">
                                {/* <FormLabel>Heures de prise</FormLabel> */} {/* Label is now in the grid cell */} 
                                {/* <FormControl>
                                    <Input placeholder="Ex: 08:00, 12:30, 20:00" {...field} />
                                </FormControl> */} {/* Input is now in the grid cell */} 
                                <FormDescriptionUI className="pt-2">
                                    Séparez plusieurs heures par une virgule si besoin.
                                </FormDescriptionUI>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

            </div>


            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="bg-transparent border-gray-500 text-gray-300 hover:bg-gray-700 hover:text-white">
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