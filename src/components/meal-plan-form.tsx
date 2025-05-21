
"use client";

import type { GenerateMealPlanInput, GenerateMealPlanOutput } from "@/ai/flows/generate-meal-plan";
import { generateMealPlan } from "@/ai/flows/generate-meal-plan";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  availableFoods: z.string().min(10, { message: "Veuillez lister au moins quelques aliments disponibles." }),
  diabeticResearchSummary: z.string().min(20, { message: "Veuillez fournir un résumé de recherche pertinent." }),
});

type MealPlanFormProps = {
  onMealPlanGenerated: (mealPlan: GenerateMealPlanOutput) => void;
};

const defaultResearchSummary = "Concentrez-vous sur les grains entiers, les protéines maigres, les graisses saines et beaucoup de légumes non amylacés. Contrôlez l'apport en glucides à chaque repas et collation. Privilégiez les aliments à faible indice glycémique. Assurez un apport suffisant en fibres. Le contrôle des portions est essentiel. Des horaires de repas réguliers aident à gérer la glycémie.";

const defaultAvailableFoods = `**Fruits**
Avocat (IG: <15)
Fraises (IG: ~40)

**Légumes**
Brocoli (IG: <15)
Épinards (IG: <15)
Patates douces (cuites) (IG: ~50)

**Fruits à coque et Graines**
Amandes (IG: 0)

**Céréales, Grains et Féculents**
Avoine (flocons) (IG: ~55)
Pain de blé entier (100%) (IG: ~51)
Quinoa (cuit) (IG: ~53)

**Légumineuses**
Lentilles (vertes/brunes, cuites) (IG: ~30)

**Viandes, Poissons et Œufs**
Œufs (IG: 0)
Poitrine de poulet (IG: 0)
Saumon (IG: 0)

**Produits Laitiers et Alternatives**
Yaourt grec (nature, sans sucre) (IG: ~15)

**Matières Grasses**
Huile d'olive (IG: 0)`;

export function MealPlanForm({ onMealPlanGenerated }: MealPlanFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      availableFoods: defaultAvailableFoods,
      diabeticResearchSummary: defaultResearchSummary,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const mealPlanInput: GenerateMealPlanInput = {
        availableFoods: values.availableFoods,
        diabeticResearchSummary: values.diabeticResearchSummary,
      };
      const result = await generateMealPlan(mealPlanInput);
      onMealPlanGenerated(result);
      toast({
        title: "Plan Repas Généré!",
        description: "Votre nouveau plan repas est prêt.",
      });
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast({
        title: "Erreur de Génération",
        description: "Impossible de générer le plan repas. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Wand2 className="h-6 w-6 text-primary" />
          Créateur de Plan Repas AI
        </CardTitle>
        <CardDescription>
          Entrez vos aliments disponibles et un résumé des recherches pour générer un plan repas quotidien.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="availableFoods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aliments Disponibles</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex:
**Fruits**
Pomme (IG: ~38)
Orange (IG: ~43)

**Légumes**
Carotte (crue) (IG: ~16)
Courgette (IG: <15)

(un aliment par ligne, avec son IG si connu, groupé par catégorie)"
                      className="min-h-[200px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Liste des aliments que vous aimez.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="diabeticResearchSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Résumé de Recherche sur le Diabète</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Focus sur les aliments à faible IG, contrôle des portions..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Fournissez un bref résumé des meilleures pratiques ou des recherches récentes sur l'alimentation pour diabétiques de type 2.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Générer le Plan Repas
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
