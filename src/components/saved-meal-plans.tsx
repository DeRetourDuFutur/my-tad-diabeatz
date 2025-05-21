"use client";

import type { StoredMealPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ListChecks, Trash2, Eye, Inbox } from "lucide-react";

type SavedMealPlansProps = {
  savedPlans: StoredMealPlan[];
  onLoadPlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
};

export function SavedMealPlans({ savedPlans, onLoadPlan, onDeletePlan }: SavedMealPlansProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ListChecks className="h-6 w-6 text-primary" />
          Plans Repas Sauvegardés
        </CardTitle>
        <CardDescription>Chargez ou supprimez vos plans repas précédemment sauvegardés.</CardDescription>
      </CardHeader>
      <CardContent>
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
    </Card>
  );
}
