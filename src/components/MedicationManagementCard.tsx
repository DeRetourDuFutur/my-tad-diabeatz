
"use client";

import type { Medication } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pill, PlusCircle, Edit3, Trash2, Inbox, AlertTriangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MedicationManagementCardProps = {
  medications: Medication[];
  onAddMedication: () => void;
  onEditMedication: (medication: Medication) => void;
  onDeleteMedication: (medicationId: string) => void;
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
                Suivez et gérez vos médicaments et leurs stocks.
              </CardDescription>
              <Button onClick={onAddMedication} className="w-full mb-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un médicament
              </Button>
              <ScrollArea className="h-[250px] pr-3">
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
                        <li key={med.id} className={cn("p-3 bg-background rounded-md border hover:shadow-md transition-shadow", isLowStock && "border-destructive/50")}>
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h4 className="font-semibold text-sm">{med.name}</h4>
                              {med.strength && <p className="text-xs text-muted-foreground">Force: {med.strength}</p>}
                              {med.form && <p className="text-xs text-muted-foreground">Forme: {med.form}</p>}
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditMedication(med)}
                                aria-label={`Modifier ${med.name}`}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDeleteMedication(med.id)}
                                aria-label={`Supprimer ${med.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-0.5"><strong>Rôle:</strong> {med.description}</p>
                          <p className="text-xs text-muted-foreground mb-1"><strong>Instructions:</strong> {med.instructions}</p>
                          <div className="flex items-center justify-between">
                            <p className={cn("text-xs font-medium", isLowStock ? "text-destructive" : "text-muted-foreground")}>
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
