
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
import { Tablet, Container as LiquidIcon, Syringe, SprayCan } from 'lucide-react';


type MedicationManagementCardProps = {
  medications: Medication[];
  onAddMedication: () => void;
  onEditMedication: (medication: Medication) => void;
  onDeleteMedication: (medicationId: string) => void;
};

const FormIcon: React.FC<{ form?: Medication['form'] }> = ({ form }) => {
  switch (form) {
    case 'tablet':
      return <Tablet className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    case 'capsule':
      return <Pill className="h-4 w-4 mr-1.5 text-muted-foreground" />; // Pas d'icône capsule, Pill est le plus proche
    case 'liquid':
      return <LiquidIcon className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    case 'injection':
      return <Syringe className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    case 'inhaler':
      return <SprayCan className="h-4 w-4 mr-1.5 text-muted-foreground" />;
    case 'drops': // Pas d'icône spécifique pour gouttes, on peut utiliser une icône générique ou Pill
      return <Pill className="h-4 w-4 mr-1.5 text-muted-foreground" />; // Placeholder
    case 'cream': // Pas d'icône spécifique pour crème
       return <Pill className="h-4 w-4 mr-1.5 text-muted-foreground" />; // Placeholder
    default:
      return <HelpCircle className="h-4 w-4 mr-1.5 text-muted-foreground" />;
  }
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
    <Card className="shadow-lg">
      <Accordion type="single" collapsible>
        <AccordionItem value="medication-management-item" className="border-b-0">
          <AccordionTrigger className="w-full text-left p-0 hover:no-underline">
            <CardHeader className="flex flex-row items-center justify-between w-full p-4">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-secondary-foreground" />
                <CardTitle className="text-lg font-semibold">Gestion des Médicaments</CardTitle>
              </div>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <CardContent>
              <CardDescription className="mb-4">
                Suivez et gérez vos médicaments, leurs stocks et rappels de prise.
              </CardDescription>
              <Button onClick={onAddMedication} className="w-full mb-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un médicament
              </Button>
              <ScrollArea className="h-[300px] pr-3">
                {medications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                    <Inbox className="h-12 w-12 mb-3" />
                    <p className="font-medium">Aucun médicament</p>
                    <p className="text-sm">Vos médicaments apparaîtront ici.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {medications.map((med) => {
                      const isLowStock = med.lowStockThreshold !== undefined && med.stock <= med.lowStockThreshold;
                      return (
                        <li key={med.id} className={cn("p-3 bg-card/80 dark:bg-card/90 rounded-lg border hover:shadow-md transition-shadow", isLowStock && "border-destructive/50 ring-1 ring-destructive/30")}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-0.5">
                                {med.color && <div className="w-3 h-3 rounded-full mr-2 flex-shrink-0 border" style={{ backgroundColor: med.color }} title={`Couleur: ${med.color}`} />}
                                <FormIcon form={med.form} />
                                <h4 className="font-semibold text-sm truncate" title={med.name}>{med.name}</h4>
                              </div>
                              {med.strength && <p className="text-xs text-muted-foreground ml-6">Dosage: {med.strength}</p>}
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
                          
                          <div className="space-y-1 text-xs">
                            <div className="flex items-start">
                                <Tag className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0"/> 
                                <div><strong>Rôle:</strong> {med.description}</div>
                            </div>
                            <div className="flex items-start">
                                <HelpCircle className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0"/>
                                <div><strong>Instructions:</strong> {med.instructions}</div>
                            </div>
                            {med.reminder && med.reminder.frequency !== 'asNeeded' && (
                                <>
                                    <div className="flex items-start">
                                        <Repeat className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0"/>
                                        <div><strong>Fréquence:</strong> {formatFrequency(med.reminder)}</div>
                                    </div>
                                    {med.reminder.times.length > 0 && (
                                        <div className="flex items-start">
                                            <Clock className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0"/>
                                            <div><strong>Heures:</strong> {med.reminder.times.join(', ')}</div>
                                        </div>
                                    )}
                                </>
                            )}
                             {med.reminder && med.reminder.frequency === 'asNeeded' && (
                                <div className="flex items-start">
                                    <Repeat className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0"/>
                                    <div><strong>Fréquence:</strong> Si besoin (pas de rappel programmé)</div>
                                </div>
                             )}
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                            <p className={cn("text-xs font-medium", isLowStock ? "text-destructive animate-pulse" : "text-muted-foreground")}>
                              Stock: {med.stock} unité(s)
                              {isLowStock && <AlertTriangle className="inline-block h-3.5 w-3.5 ml-1 mb-0.5" />}
                            </p>
                            {med.lowStockThreshold !== undefined && (
                               <Badge variant={isLowStock ? "destructive" : "secondary"} className="text-xs">
                                Seuil: {med.lowStockThreshold}
                               </Badge>
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

