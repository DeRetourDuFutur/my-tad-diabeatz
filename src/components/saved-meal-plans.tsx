
"use client";

import type { StoredMealPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ListChecks, Trash2, Eye, Inbox } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

type SavedMealPlansProps = {
  savedPlans: StoredMealPlan[];
  onLoadPlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
  isLoading: boolean; // Added isLoading prop
};

export function SavedMealPlans({ savedPlans, onLoadPlan, onDeletePlan, isLoading }: SavedMealPlansProps) { // Added isLoading to destructuring
  return (
    <Card className="shadow-lg card-glow-effect card-variant">
      <Accordion type="single" collapsible>
        <AccordionItem value="saved-plans-item" className="border-b-0">
          <AccordionTrigger className="w-full text-left p-0 hover:no-underline">
            <CardHeader className="flex flex-row items-center justify-between w-full p-4">
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-secondary-foreground" />
                <CardTitle className="text-lg font-semibold">
                  Plans sauvegardés
                </CardTitle>
              </div>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <CardContent>
              <CardDescription className="mb-4">
                Chargez ou supprimez vos plans repas précédemment sauvegardés.
              </CardDescription>
              <ScrollArea className="h-[250px] pr-3">
                {isLoading && savedPlans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                    <ListChecks className="h-12 w-12 mb-3 animate-pulse" />
                    <p className="font-medium">Chargement des plans...</p>
                  </div>
                ) : savedPlans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                    <Inbox className="h-12 w-12 mb-3" />
                    <p className="font-medium">Aucun plan sauvegardé</p>
                    <p className="text-sm">
                      Vos plans repas sauvegardés apparaîtront ici.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {savedPlans.map((plan, index) => {
                      let dateToFormat: Date;
                      if (plan.createdAt instanceof Timestamp) {
                        dateToFormat = plan.createdAt.toDate();
                      } else if (typeof plan.createdAt === "string") {
                        dateToFormat = new Date(plan.createdAt);
                      } else {
                        // Fallback or error handling if createdAt is an unexpected type
                        // For now, let's try to create a date, which might result in "Invalid Date"
                        // but it's better than crashing.
                        // @ts-ignore
                        dateToFormat = new Date(plan.createdAt);
                      }

                      return (
                        <li key={plan.id}>
                          <div className="flex items-center justify-between p-3 bg-background rounded-md border hover:shadow-md transition-shadow">
                            <div>
                              <p className="font-semibold text-sm">
                                {plan.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Créé le:{" "}
                                {isValidDate(dateToFormat)
                                  ? format(dateToFormat, "PPPp", { locale: fr })
                                  : "Date invalide"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onLoadPlan(plan.id)}
                                aria-label={`Charger le plan ${plan.name}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDeletePlan(plan.id)}
                                aria-label={`Supprimer le plan ${plan.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {index < savedPlans.length - 1 && (
                            <Separator className="my-2" />
                          )}
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

// Helper function to check if a date is valid
function isValidDate(d: any) {
  return d instanceof Date && !isNaN(d.getTime());
}
