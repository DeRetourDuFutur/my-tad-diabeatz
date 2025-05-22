
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

type SavedMealPlansProps = {
  savedPlans: StoredMealPlan[];
  onLoadPlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
};

export function SavedMealPlans({ savedPlans, onLoadPlan, onDeletePlan }: SavedMealPlansProps) {
  return (
    <Card className="shadow-lg">
      <Accordion type="single" collapsible> {/* Removed defaultValue="saved-plans-item" */}
        <AccordionItem value="saved-plans-item" className="border-b-0">
          <AccordionTrigger className="w-full text-left p-0 hover:no-underline">
            <CardHeader className="flex flex-row items-center justify-between w-full p-4">
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-secondary-foreground" />
                <CardTitle className="text-lg font-semibold">Plans sauvegardés</CardTitle>
              </div>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent className="pt-0">
            <CardContent>
              <CardDescription className="mb-4">Chargez ou supprimez vos plans repas précédemment sauvegardés.</CardDescription>
              <ScrollArea className="h-[250px] pr-3">
                {savedPlans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                    <Inbox className="h-12 w-12 mb-3" />
                    <p className="font-medium">Aucun plan sauvegardé</p>
                    <p className="text-sm">Vos plans repas sauvegardés apparaîtront ici.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {savedPlans.map((plan, index) => (
                      <li key={plan.id}>
                        <div className="flex items-center justify-between p-3 bg-background rounded-md border hover:shadow-md transition-shadow">
                          <div>
                            <p className="font-semibold text-sm">{plan.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Créé le: {format(new Date(plan.createdAt), "PPPp", { locale: fr })}
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
                        {index < savedPlans.length - 1 && <Separator className="my-2" />}
                      </li>
                    ))}
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
