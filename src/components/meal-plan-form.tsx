
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, AlertTriangle,ThumbsDown } from "lucide-react";
import { useState, useEffect } from "react";

// Schema for react-hook-form, only for fields directly managed by it
const formSchema = z.object({
  diabeticResearchSummary: z.string().min(20, { message: "Veuillez fournir un résumé de recherche pertinent." }),
  // availableFoods will be constructed from the interactive list, so we make it optional here
  // or keep it and set its value manually before AI call if needed by Zod pre-validation.
  // For simplicity, we'll construct it directly for the AI call and not include it in Zod schema for now.
});

type MealPlanFormProps = {
  onMealPlanGenerated: (mealPlan: GenerateMealPlanOutput) => void;
};

const defaultResearchSummary = "Concentrez-vous sur les grains entiers, les protéines maigres, les graisses saines et beaucoup de légumes non amylacés. Contrôlez l'apport en glucides à chaque repas et collation. Privilégiez les aliments à faible indice glycémique. Assurez un apport suffisant en fibres. Le contrôle des portions est essentiel. Des horaires de repas réguliers aident à gérer la glycémie.";

interface FoodItem {
  id: string;
  name: string;
  ig: string;
  isDisliked: boolean;
  isAllergenic: boolean;
}

interface FoodCategory {
  categoryName: string;
  items: FoodItem[];
}

const initialFoodCategories: FoodCategory[] = [
  {
    categoryName: "Fruits",
    items: [
      { id: "fruit1", name: "Avocat", ig: "(IG: <15)", isDisliked: false, isAllergenic: false },
      { id: "fruit2", name: "Fraises", ig: "(IG: ~40)", isDisliked: false, isAllergenic: false },
      { id: "fruit3", name: "Pomme", ig: "(IG: ~38)", isDisliked: false, isAllergenic: false },
      { id: "fruit4", name: "Orange", ig: "(IG: ~43)", isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Légumes",
    items: [
      { id: "veg1", name: "Brocoli", ig: "(IG: <15)", isDisliked: false, isAllergenic: false },
      { id: "veg2", name: "Carotte (crue)", ig: "(IG: ~16)", isDisliked: false, isAllergenic: false },
      { id: "veg3", name: "Courgette", ig: "(IG: <15)", isDisliked: false, isAllergenic: false },
      { id: "veg4", name: "Épinards", ig: "(IG: <15)", isDisliked: false, isAllergenic: false },
      { id: "veg5", name: "Patates douces (cuites)", ig: "(IG: ~50)", isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Fruits à coque et Graines",
    items: [
      { id: "nut1", name: "Amandes", ig: "(IG: 0)", isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Céréales, Grains et Féculents",
    items: [
      { id: "grain1", name: "Avoine (flocons)", ig: "(IG: ~55)", isDisliked: false, isAllergenic: false },
      { id: "grain2", name: "Pain de blé entier (100%)", ig: "(IG: ~51)", isDisliked: false, isAllergenic: false },
      { id: "grain3", name: "Quinoa (cuit)", ig: "(IG: ~53)", isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Légumineuses",
    items: [
      { id: "legume1", name: "Lentilles (vertes/brunes, cuites)", ig: "(IG: ~30)", isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Viandes, Poissons et Œufs",
    items: [
      { id: "meat1", name: "Œufs", ig: "(IG: 0)", isDisliked: false, isAllergenic: false },
      { id: "meat2", name: "Poitrine de poulet", ig: "(IG: 0)", isDisliked: false, isAllergenic: false },
      { id: "meat3", name: "Saumon", ig: "(IG: 0)", isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Produits Laitiers et Alternatives",
    items: [
      { id: "dairy1", name: "Yaourt grec (nature, sans sucre)", ig: "(IG: ~15)", isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Matières Grasses",
    items: [
      { id: "fat1", name: "Huile d'olive", ig: "(IG: 0)", isDisliked: false, isAllergenic: false },
    ],
  },
].map(category => ({
  ...category,
  items: category.items.sort((a, b) => a.name.localeCompare(b.name))
}));


export function MealPlanForm({ onMealPlanGenerated }: MealPlanFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>(initialFoodCategories);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      diabeticResearchSummary: defaultResearchSummary,
    },
  });

  const handleFoodPreferenceChange = (categoryId: string, itemId: string, type: "isDisliked" | "isAllergenic", checked: boolean) => {
    setFoodCategories(prevCategories =>
      prevCategories.map(category =>
        category.categoryName === categoryId
          ? {
              ...category,
              items: category.items.map(item =>
                item.id === itemId ? { ...item, [type]: checked } : item
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
        const foodEntry = `${item.name} ${item.ig}`;
        if (item.isDisliked || item.isAllergenic) {
          foodsToAvoidList.push(foodEntry + (item.isDisliked && item.isAllergenic ? " (non aimé et allergène)" : item.isDisliked ? " (non aimé)" : " (allergène)"));
        } else {
          likedFoodsList.push(foodEntry);
        }
      });
    });

    if (likedFoodsList.length === 0) {
      toast({
        title: "Aucun aliment sélectionné",
        description: "Veuillez sélectionner au moins un aliment que vous aimez et auquel vous n'êtes pas allergique.",
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
                Cochez les cases correspondantes pour les aliments que vous n'aimez pas ou auxquels vous êtes allergique.
                Seuls les aliments non cochés ici seront considérés comme disponibles.
              </p>
              <div className="space-y-3 max-h-[400px] overflow-y-auto p-1 rounded-md border">
                {foodCategories.map(category => (
                  <div key={category.categoryName} className="p-2 rounded-md bg-card/50">
                    <h4 className="font-semibold mb-2 text-md text-primary">{category.categoryName}</h4>
                    <ul className="space-y-2 pl-2">
                      {category.items.map(item => (
                        <li key={item.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-2 py-1 border-b border-border/50 last:border-b-0">
                          <span className="text-sm">{item.name} <span className="text-xs text-muted-foreground">{item.ig}</span></span>
                          <div className="flex items-center space-x-1 justify-self-end">
                            <Checkbox
                              id={`${item.id}-disliked`}
                              checked={item.isDisliked}
                              onCheckedChange={(checked) => handleFoodPreferenceChange(category.categoryName, item.id, "isDisliked", !!checked)}
                              aria-label={`Marquer ${item.name} comme non aimé`}
                            />
                            <Label htmlFor={`${item.id}-disliked`} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer" title="Je n'aime pas">
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </Label>
                          </div>
                           <div className="flex items-center space-x-1 justify-self-end">
                            <Checkbox
                              id={`${item.id}-allergenic`}
                              checked={item.isAllergenic}
                              onCheckedChange={(checked) => handleFoodPreferenceChange(category.categoryName, item.id, "isAllergenic", !!checked)}
                              aria-label={`Marquer ${item.name} comme allergène`}
                            />
                            <Label htmlFor={`${item.id}-allergenic`} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer" title="Allergie/Intolérance">
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </Label>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
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
