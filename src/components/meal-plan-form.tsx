
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

// Schema for react-hook-form, only for fields directly managed by it
const formSchema = z.object({
  diabeticResearchSummary: z.string().min(20, { message: "Veuillez fournir un résumé de recherche pertinent." }),
});

type MealPlanFormProps = {
  onMealPlanGenerated: (mealPlan: GenerateMealPlanOutput) => void;
};

const defaultResearchSummary = "Concentrez-vous sur les grains entiers, les protéines maigres, les graisses saines et beaucoup de légumes non amylacés. Contrôlez l'apport en glucides à chaque repas et collation. Privilégiez les aliments à faible indice glycémique. Assurez un apport suffisant en fibres. Le contrôle des portions est essentiel. Des horaires de repas réguliers aident à gérer la glycémie.";

interface FoodItem {
  id: string;
  name: string;
  ig: string;
  isFavorite: boolean;
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
      { id: "fruit1", name: "Avocat", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fruit5", name: "Baies (Myrtilles, Framboises, Mûres)", ig: "(IG: ~25-40)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fruit6", name: "Cerises", ig: "(IG: ~22)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fruit7", name: "Clémentine/Mandarine", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fruit2", name: "Fraises", ig: "(IG: ~40)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fruit8", name: "Kiwi", ig: "(IG: ~50)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fruit4", name: "Orange", ig: "(IG: ~43)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fruit9", name: "Pamplemousse", ig: "(IG: ~25)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fruit10", name: "Pêche", ig: "(IG: ~42)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fruit11", name: "Poire", ig: "(IG: ~38)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fruit3", name: "Pomme", ig: "(IG: ~38)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fruit12", name: "Prune", ig: "(IG: ~40)", isFavorite: false, isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Légumes",
    items: [
      { id: "veg6", name: "Artichaut", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg7", name: "Asperge", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg8", name: "Aubergine", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg9", name: "Betterave (cuite)", ig: "(IG: ~64)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg1", name: "Brocoli", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg10", name: "Carotte (cuite)", ig: "(IG: ~39)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg2", name: "Carotte (crue)", ig: "(IG: ~16)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg11", name: "Céleri", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg12", name: "Champignons (tous types)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg13", name: "Chou (tous types: blanc, rouge, frisé, kale)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg14", name: "Chou-fleur", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg15", name: "Concombre", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg16", name: "Courge (Butternut, Spaghetti)", ig: "(IG: ~51-75)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg3", name: "Courgette", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg4", name: "Épinards", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg17", name: "Haricots verts", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg18", name: "Laitue/Salades vertes (tous types)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg19", name: "Navet", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg20", name: "Oignon", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg5", name: "Patates douces (cuites)", ig: "(IG: ~50)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg21", name: "Poireau", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg22", name: "Poivron (tous types)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg23", name: "Radis", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "veg24", name: "Tomate", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Fruits à coque et Graines",
    items: [
      { id: "nut1", name: "Amandes", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "nut2", name: "Graines de chia", ig: "(IG: ~1)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "nut3", name: "Graines de courge", ig: "(IG: ~25)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "nut4", name: "Graines de lin", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "nut5", name: "Graines de sésame", ig: "(IG: ~35)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "nut6", name: "Graines de tournesol", ig: "(IG: ~20)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "nut7", name: "Noix", ig: "(IG: ~15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "nut8", name: "Noix de cajou", ig: "(IG: ~25)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "nut9", name: "Noix de pécan", ig: "(IG: ~10)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "nut10", name: "Noix du Brésil", ig: "(IG: ~1)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "nut11", name: "Pistaches", ig: "(IG: ~15)", isFavorite: false, isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Céréales, Grains et Féculents",
    items: [
      { id: "grain1", name: "Avoine (flocons)", ig: "(IG: ~55)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "grain4", name: "Boulgour", ig: "(IG: ~48)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "grain5", name: "Orge perlé", ig: "(IG: ~25)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "grain2", name: "Pain de blé entier (100%)", ig: "(IG: ~51)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "grain6", name: "Pain au levain", ig: "(IG: ~53)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "grain7", name: "Pâtes complètes (al dente)", ig: "(IG: ~40-50)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "grain8", name: "Petit épeautre", ig: "(IG: ~40)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "grain3", name: "Quinoa (cuit)", ig: "(IG: ~53)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "grain9", name: "Riz basmati complet", ig: "(IG: ~45)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "grain10", name: "Riz sauvage", ig: "(IG: ~45)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "grain11", name: "Sarrasin (Kasha)", ig: "(IG: ~40)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "grain12", name: "Semoule de blé dur complète (couscous complet)", ig: "(IG: ~45)", isFavorite: false, isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Légumineuses",
    items: [
      { id: "legume2", name: "Fèves (cuites)", ig: "(IG: ~40)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "legume3", name: "Haricots (blancs, rouges, noirs, pinto - cuits)", ig: "(IG: ~30-40)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "legume1", name: "Lentilles (vertes/brunes, cuites)", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "legume4", name: "Pois cassés (cuits)", ig: "(IG: ~22)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "legume5", name: "Pois chiches (cuits)", ig: "(IG: ~28)", isFavorite: false, isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Viandes, Poissons et Œufs",
    items: [
      { id: "meat4", name: "Agneau (maigre)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat5", name: "Cabillaud", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat6", name: "Colin/Lieu", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat7", name: "Crevettes", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat8", name: "Dinde (poitrine)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat9", name: "Hareng", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat10", name: "Maquereau", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat1", name: "Œufs", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat2", name: "Poitrine de poulet", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat11", name: "Sardines", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat3", name: "Saumon", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat12", name: "Thon (au naturel)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat13", name: "Truite", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "meat14", name: "Veau (maigre)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Produits Laitiers et Alternatives",
    items: [
      { id: "dairy2", name: "Fromage blanc (nature, 0-3% MG)", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "dairy3", name: "Lait d'amande (non sucré)", ig: "(IG: ~25)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "dairy4", name: "Lait de soja (non sucré)", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "dairy5", name: "Lait écrémé ou demi-écrémé", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "dairy6", name: "Tofu", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "dairy1", name: "Yaourt grec (nature, sans sucre)", ig: "(IG: ~15)", isFavorite: false, isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Matières Grasses",
    items: [
      { id: "fat2", name: "Beurre de cacahuète (nature, sans sucre ajouté)", ig: "(IG: ~14)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fat3", name: "Huile de colza", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fat4", name: "Huile de lin", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fat1", name: "Huile d'olive", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
      { id: "fat5", name: "Huile de noix", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
    ],
  },
  {
    categoryName: "Assaisonnements et Autres",
    items: [
        { id: "other1", name: "Ail", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
        { id: "other2", name: "Curcuma", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
        { id: "other3", name: "Gingembre", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
        { id: "other4", name: "Herbes fraîches/sèches (persil, coriandre, etc.)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
        { id: "other5", name: "Jus de citron/lime", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
        { id: "other6", name: "Moutarde (sans sucre ajouté)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false },
        { id: "other7", name: "Épices (cannelle, cumin, paprika, etc.)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false },
        { id: "other8", name: "Vinaigre (de cidre, balsamique)", ig: "(IG: <5)", isFavorite: false, isDisliked: false, isAllergenic: false },
    ],
  }
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

  const handleFoodPreferenceChange = (categoryId: string, itemId: string, type: "isFavorite" | "isDisliked" | "isAllergenic", checked: boolean) => {
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
                Cochez les cases pour marquer les aliments comme favoris, non aimés ou allergènes.
                Seuls les aliments non marqués comme "non aimé" ou "allergène" seront considérés.
              </p>
              <div className="max-h-[400px] overflow-y-auto p-1 rounded-md border">
                <Accordion type="multiple" collapsible className="w-full">
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
                                />
                                <Label htmlFor={`${item.id}-favorite`} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer" title="Favori">
                                  <Star className="h-3.5 w-3.5" />
                                </Label>
                              </div>

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

    