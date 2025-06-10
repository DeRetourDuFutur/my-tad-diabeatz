
"use client";

import type { Medication } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pill, PlusCircle, Edit3, Trash2, Inbox, AlertTriangle, Clock, HelpCircle, Palette, CalendarDays, Repeat, Tag } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Icônes pour les formes de médicaments
import { Tablet, Container as LiquidIcon, Syringe, SprayCan, Circle, Square, Triangle, PillIcon, Minus } from 'lucide-react';


type MedicationManagementCardProps = {
  medications: Medication[];
  onAddMedication: () => void;
  onEditMedication: (medication: Medication) => void;
  onDeleteMedication: (medicationId: string) => void;
};

const FormIcon: React.FC<{ form?: Medication['form'], shape?: Medication['shape'], color?: Medication['color'] }> = ({ form, shape, color }) => {
  const iconProps = { className: "h-5 w-5 mr-1.5", style: { color: color || 'currentColor' } }; // Reduced icon size to h-5 w-5

  if (form === 'comprimé') {
    switch (shape) {
      case 'rond': return <Circle {...iconProps} fill={color || 'currentColor'} />;
      case 'ovale': return <svg viewBox='0 0 100 60' className={iconProps.className} style={iconProps.style} fill={color || 'currentColor'}><ellipse cx='50' cy='30' rx='48' ry='28'/></svg>;
      case 'rectangle': return <Square {...iconProps} fill={color || 'currentColor'} />;
      case 'losange': return <svg viewBox='0 0 100 100' className={iconProps.className} style={iconProps.style} fill={color || 'currentColor'}><polygon points='50,5 95,50 50,95 5,50'/></svg>;
      case 'carré': return <Square {...iconProps} fill={color || 'currentColor'} />;
      case 'triangle': return <Triangle {...iconProps} fill={color || 'currentColor'} />;
      case 'pentagone': return <svg viewBox='0 0 100 100' className={iconProps.className} style={iconProps.style} fill={color || 'currentColor'}><polygon points='50,5 95,35 80,95 20,95 5,35'/></svg>;
      case 'hexagone': return <svg viewBox='0 0 100 100' className={iconProps.className} style={iconProps.style} fill={color || 'currentColor'}><polygon points='30,5 70,5 95,50 70,95 30,95 5,50'/></svg>;
      case 'octogone': return <svg viewBox='0 0 100 100' className={iconProps.className} style={iconProps.style} fill={color || 'currentColor'}><polygon points='35,5 65,5 90,30 90,70 65,95 35,95 10,70 10,30'/></svg>;
      case 'sécable': return <div className="relative"><Circle {...iconProps} fill={color || 'currentColor'} /><Minus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3" style={{ color: color === '#ffffff' || color === '#fff' ? '#555555': 'white' }} /></div>;
      default: return <Tablet {...iconProps} />;
    }
  } else if (form === 'gélule') {
     // Pour les gélules, on peut utiliser PillIcon ou des SVG custom si besoin de plus de variations
    return <PillIcon {...iconProps} fill={color || 'currentColor'} />;
  }

  // Si la forme n'est ni comprimé ni gélule, ou si elle n'est pas définie, afficher une icône par défaut.
  return <HelpCircle {...iconProps} />;
};

const formatFrequency = (reminder?: Medication['reminder']): string => {
    if (!reminder) return "Non défini";
    switch (reminder.frequency) {
        case 'daily': return "Quotidien";
        case 'everyXdays': return `Tous les ${reminder.intervalDays} jours`;
        case 'specificDays': return `Jours spécifiques: ${reminder.specificDays?.join(', ') || 'N/A'}`;
        case 'asNeeded': return "Si besoin";
        default: return "Non défini";
    }
};


export function MedicationManagementCard({
  medications,
  onAddMedication,
  onEditMedication,
  onDeleteMedication,
}: MedicationManagementCardProps) {
  return (
    <Card className="shadow-lg card-glow-effect card-variant">
      <Accordion type="single" collapsible>
        <AccordionItem
          value="medication-management-item"
          className="border-b-0"
        >
          <AccordionTrigger className="w-full text-left p-0 hover:no-underline">
            <CardHeader className="flex flex-row items-center justify-between w-full p-4">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-secondary-foreground" />
                <CardTitle className="text-lg font-semibold">
                  Gestion des Médicaments
                </CardTitle>
              </div>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <CardContent>
              <CardDescription className="mb-4">
                Suivez et gérez vos médicaments, leurs stocks et rappels de
                prise.
              </CardDescription>
              <Button onClick={onAddMedication} className="w-full mb-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un médicament
              </Button>
              <ScrollArea className="h-auto pr-3"> {/* Removed max-height to allow full list display */} 
                {medications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                    <Inbox className="h-12 w-12 mb-3" />
                    <div className="font-medium">Aucun médicament</div>
                    <p className="text-sm">Vos médicaments apparaîtront ici.</p>
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medications.map((med) => {
                      const isLowStock =
                        med.lowStockThreshold !== undefined &&
                        med.stock <= med.lowStockThreshold;
                      return (
                        <li
                          key={med.id}
                          className={cn(
                            "p-3 bg-card/80 dark:bg-card/90 rounded-lg border hover:shadow-md transition-shadow",
                            isLowStock &&
                              "border-destructive/50 ring-1 ring-destructive/30"
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                {/* Removed the color dot: med.color && ( ... ) */}
                                <FormIcon form={med.form} shape={med.shape} color={med.color} />
                                <h4
                                  className="font-semibold text-sm truncate mr-2"
                                  title={med.name}
                                >
                                  {med.name}
                                </h4>
                                {med.strength && (
                                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                                    ({med.strength})
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 ml-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onEditMedication(med)}
                                aria-label={`Modifier ${med.name}`}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onDeleteMedication(med.id)}
                                aria-label={`Supprimer ${med.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 mb-2 ml-6">
                            Stock: {med.stock} unité(s)
                            {med.lowStockThreshold !== undefined && (
                              <span className={isLowStock ? "text-destructive font-semibold" : ""}> / Seuil: {med.lowStockThreshold}</span>
                            )}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-start">
                              <Tag className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <div>
                                <strong>Rôle:</strong> {med.description}
                              </div>
                            </div>
                            <div className="flex items-start">
                              <HelpCircle className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <div>
                                <strong>Instructions:</strong>{" "}
                                {med.instructions}
                              </div>
                            </div>
                            {med.reminder &&
                              med.reminder.frequency !== "asNeeded" && (
                                <>
                                  <div className="flex items-start">
                                    <Repeat className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                                    <div>
                                      <strong>Fréquence:</strong>{" "}
                                      {formatFrequency(med.reminder)}
                                    </div>
                                  </div>
                                  {med.reminder.times.length > 0 && (
                                    <div className="flex items-start">
                                      <Clock className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                                      <div>
                                        <strong>Heures:</strong>{" "}
                                        {med.reminder.times.join(", ")}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            {med.reminder &&
                              med.reminder.frequency === "asNeeded" && (
                                <div className="flex items-start">
                                  <Repeat className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                                  <div>
                                    <strong>Fréquence:</strong> Si besoin (pas
                                    de rappel programmé)
                                  </div>
                                </div>
                              )}
                          </div>

                        </li>
                      );
                    })}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

