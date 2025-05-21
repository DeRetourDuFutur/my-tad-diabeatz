
"use client";

import type { GenerateMealPlanInput, GenerateMealPlanOutput } from "@/ai/flows/generate-meal-plan";
import { generateMealPlan } from "@/ai/flows/generate-meal-plan";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription, // Added FormDescription here
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, AlertTriangle, ThumbsDown, Star } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import useLocalStorage from "@/hooks/use-local-storage";
import type { FoodCategory, FoodItem } from "@/lib/food-data"; // Import types
import { initialFoodCategories } from "@/lib/food-data"; // Import initial data


// Schema for react-hook-form, only for fields directly managed by it
const formSchema = z.object({
  diabeticResearchSummary: z.string().min(20, { message: "Veuillez fournir un résumé de recherche pertinent." }),
});

type MealPlanFormProps = {
  onMealPlanGenerated: (mealPlan: GenerateMealPlanOutput) => void;
};

const defaultResearchSummary = "Concentrez-vous sur les grains entiers, les protéines maigres, les graisses saines et beaucoup de légumes non amylacés. Contrôlez l'apport en glucides à chaque repas et collation. Privilégiez les aliments à faible indice glycémique. Assurez un apport suffisant en fibres. Le contrôle des portions est essentiel. Des horaires de repas réguliers aident à gérer la glycémie.";

export function MealPlanForm({ onMealPlanGenerated }: MealPlanFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  // Use useLocalStorage to persist foodCategories state
  const [foodCategories, setFoodCategories] = useLocalStorage<FoodCategory[]>(
    "diabeatz-food-preferences",
    initialFoodCategories
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      diabeticResearchSummary: defaultResearchSummary,
    },
  });

  const handleFoodPreferenceChange = (categoryId: string, itemId: string, type: "isFavorite" | "isDisliked" | "isAllergenic", checked: boolean) => {
    setFoodCategories(prevCategories =>
      prevCategories.map(category =>
        category.categoryName === categoryId
          ? {
              ...category,
              items: category.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      [type]: checked,
                      // Ensure logic for exclusive choices
                      ...(type === "isFavorite" && checked && { isDisliked: false, isAllergenic: false }),
                      ...(type === "isDisliked" && checked && { isFavorite: false }),
                      ...(type === "isAllergenic" && checked && { isFavorite: false }),
                    }
                  : item
              ),
            }
          : category
      )
    );
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const likedFoodsList: string[] = [];
    const foodsToAvoidList: string[] = [];

    foodCategories.forEach(category => {
      category.items.forEach(item => {
        let foodEntry = `${item.name} ${item.ig}`;
        if (item.isDisliked || item.isAllergenic) {
          foodsToAvoidList.push(
            foodEntry +
            (item.isDisliked && item.isAllergenic ? " (non aimé et allergène)" : item.isDisliked ? " (non aimé)" : " (allergène)")
          );
        } else {
          if (item.isFavorite) {
            foodEntry += " (favori)";
          }
          likedFoodsList.push(foodEntry);
        }
      });
    });

    if (likedFoodsList.length === 0) {
      toast({
        title: "Aucun aliment sélectionné",
        description: "Veuillez sélectionner au moins un aliment que vous aimez et auquel vous n'êtes pas allergique/que vous n'aimez pas.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const availableFoodsForAI = likedFoodsList.join("\n");
    const foodsToAvoidForAI = foodsToAvoidList.join("\n");

    try {
      const mealPlanInput: GenerateMealPlanInput = {
        availableFoods: availableFoodsForAI,
        foodsToAvoid: foodsToAvoidForAI.length > 0 ? foodsToAvoidForAI : undefined,
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
      // Resetting foodCategories to initial might be too aggressive.
      // Consider just showing an error or allowing retry.
      // setFoodCategories(initialFoodCategories);
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
          Personnalisez votre liste d'aliments et fournissez un résumé des recherches pour générer un plan repas quotidien.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Vos Préférences Alimentaires</Label>
              <p className="text-sm text-muted-foreground">
                Cochez les cases pour marquer les aliments comme favoris, non aimés ou allergènes.
                Seuls les aliments non marqués comme "non aimé" ou "allergène" seront considérés. Les favoris seront privilégiés.
              </p>
              <div className="max-h-[400px] overflow-y-auto p-1 rounded-md border">
                <Accordion type="multiple" className="w-full">
                  {foodCategories.map(category => (
                    <AccordionItem value={category.categoryName} key={category.categoryName} className="border-b-0 last:border-b-0">
                      <AccordionTrigger className="py-3 px-2 text-md font-semibold text-primary hover:no-underline hover:bg-muted/50 rounded-md">
                        {category.categoryName}
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-2 px-2">
                        <ul className="space-y-2 pl-2">
                          {category.items.map(item => (
                            <li key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 py-1.5 border-b border-border/50 last:border-b-0">
                              <span className="text-sm">{item.name} <span className="text-xs text-muted-foreground">{item.ig}</span></span>

                              <div className="flex items-center space-x-1 justify-self-end">
                                <Checkbox
                                  id={`${item.id}-favorite`}
                                  checked={item.isFavorite}
                                  onCheckedChange={(checked) => handleFoodPreferenceChange(category.categoryName, item.id, "isFavorite", !!checked)}
                                  aria-label={`Marquer ${item.name} comme favori`}
                                  disabled={item.isDisliked || item.isAllergenic}
                                />
                                <Label htmlFor={`${item.id}-favorite`} className={`text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer ${ (item.isDisliked || item.isAllergenic) ? 'opacity-50 cursor-not-allowed' : ''}`} title="Favori">
                                  <Star className="h-3.5 w-3.5" />
                                </Label>
                              </div>

                              <div className="flex items-center space-x-1 justify-self-end">
                                <Checkbox
                                  id={`${item.id}-disliked`}
                                  checked={item.isDisliked}
                                  onCheckedChange={(checked) => handleFoodPreferenceChange(category.categoryName, item.id, "isDisliked", !!checked)}
                                  aria-label={`Marquer ${item.name} comme non aimé`}
                                  disabled={item.isFavorite}
                                />
                                <Label htmlFor={`${item.id}-disliked`} className={`text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer ${item.isFavorite ? 'opacity-50 cursor-not-allowed' : ''}`} title="Je n'aime pas">
                                  <ThumbsDown className="h-3.5 w-3.5" />
                                </Label>
                              </div>
                              <div className="flex items-center space-x-1 justify-self-end">
                                <Checkbox
                                  id={`${item.id}-allergenic`}
                                  checked={item.isAllergenic}
                                  onCheckedChange={(checked) => handleFoodPreferenceChange(category.categoryName, item.id, "isAllergenic", !!checked)}
                                  aria-label={`Marquer ${item.name} comme allergène`}
                                  disabled={item.isFavorite}
                                />
                                <Label htmlFor={`${item.id}-allergenic`} className={`text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer ${item.isFavorite ? 'opacity-50 cursor-not-allowed' : ''}`} title="Allergie/Intolérance">
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                </Label>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

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
                    Ce résumé aide l'IA à adapter le plan à vos besoins et aux dernières recommandations.
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
