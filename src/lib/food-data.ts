
// @/lib/food-data.ts

// IMPORTANT: Les valeurs nutritionnelles ci-dessous sont des EXEMPLES FICTIFS ou des PLACEHOLDERS.
// Il est CRUCIAL de remplacer "X g", "Y kcal", etc., par des données nutritionnelles exactes 
// provenant d'une base de données nutritionnelle fiable (par exemple, Ciqual pour la France, USDA FoodData Central, etc.)
// pour chaque aliment avant toute utilisation en production ou pour des conseils de santé.

export interface FoodItem {
  id: string;
  name: string;
  ig: string; // Indice Glycémique
  isFavorite: boolean;
  isDisliked: boolean;
  isAllergenic: boolean;
  calories?: string; // e.g., "Approx. X kcal / 100g"
  carbs?: string;    // e.g., "Glucides: Xg / 100g"
  protein?: string;  // e.g., "Protéines: Xg / 100g"
  fat?: string;      // e.g., "Lipides: Xg / 100g"
  sugars?: string;   // e.g., "dont Sucres: Xg / 100g"
  fiber?: string;    // e.g., "Fibres: Xg / 100g"
  sodium?: string;   // e.g., "Sel: Xmg / 100g (Sodium: Ymg)"
  notes?: string;    // Pour des remarques additionnelles, e.g. "Valeurs pour portion de Xg"
}

export interface FoodCategory {
  categoryName: string;
  items: FoodItem[];
}

export const initialFoodCategories: FoodCategory[] = [
  {
    categoryName: "Fruits",
    items: [
      { 
        id: "fruit1", name: "Abricot", ig: "(IG: ~34)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 48 kcal / 100g",
        carbs: "11g", protein: "1.4g", fat: "0.4g", sugars: "9g", fiber: "2g",
        notes: "Valeurs pour 100g d'abricot frais."
      },
      { 
        id: "fruit2", name: "Avocat", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 160 kcal / 100g",
        carbs: "8.5g", protein: "2g", fat: "14.7g", sugars: "0.7g", fiber: "6.7g",
        notes: "Riche en bonnes graisses."
      },
      { 
        id: "fruit3", name: "Baies (Myrtilles, Framboises, Mûres, Groseilles)", ig: "(IG: ~25-40)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 40-60 kcal / 100g", // Moyenne indicative
        carbs: "10-14g", protein: "0.7-1.2g", fat: "0.3-0.5g", sugars: "5-10g", fiber: "2-7g",
        notes: "Varie selon le type de baie."
      },
      { id: "fruit4", name: "Cerises", ig: "(IG: ~22)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit5", name: "Clémentine/Mandarine", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit6", name: "Coing", ig: "(IG: ~35)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit7", name: "Figue fraîche", ig: "(IG: ~35)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit8", name: "Fraises", ig: "(IG: ~40)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit9", name: "Grenade", ig: "(IG: ~35)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit10", name: "Kiwi", ig: "(IG: ~50)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit11", name: "Nectarine", ig: "(IG: ~43)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit12", name: "Orange", ig: "(IG: ~43)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit13", name: "Pamplemousse", ig: "(IG: ~25)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit14", name: "Papaye", ig: "(IG: ~56)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit15", name: "Pêche", ig: "(IG: ~42)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit16", name: "Poire", ig: "(IG: ~38)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit17", name: "Pomme", ig: "(IG: ~38)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit18", name: "Prune", ig: "(IG: ~40)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fruit19", name: "Raisin", ig: "(IG: ~46-59)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
    ],
  },
  {
    categoryName: "Légumes",
    items: [
      { 
        id: "veg1", name: "Ail", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 149 kcal / 100g",
        carbs: "33g", protein: "6.4g", fat: "0.5g", sugars: "1g", fiber: "2.1g",
        notes: "Utilisé en petites quantités."
      },
      { 
        id: "veg2", name: "Artichaut", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 47 kcal / 100g (cuit)",
        carbs: "10.5g", protein: "2.9g", fat: "0.3g", sugars: "1g", fiber: "5.7g"
      },
      { 
        id: "veg3", name: "Asperge", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 20 kcal / 100g",
        carbs: "3.9g", protein: "2.2g", fat: "0.1g", sugars: "1.9g", fiber: "2.1g"
      },
      { id: "veg4", name: "Aubergine", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg5", name: "Betterave (crue)", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg6", name: "Betterave (cuite)", ig: "(IG: ~64)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg7", name: "Blette", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg8", name: "Brocoli", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg9", name: "Carotte (crue)", ig: "(IG: ~16)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg10", name: "Carotte (cuite)", ig: "(IG: ~39)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg11", name: "Céleri branche", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg12", name: "Céleri rave (cuit)", ig: "(IG: ~35)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg13", name: "Champignons (tous types)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg14", name: "Chou (tous types: blanc, rouge, frisé, kale, romanesco, de Bruxelles)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg15", name: "Chou-fleur", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg16", name: "Concombre", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg17", name: "Courge (Butternut, Spaghetti, Potimarron)", ig: "(IG: ~51-75)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg18", name: "Courgette", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg19", name: "Cresson", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg20", name: "Endive", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg21", name: "Épinards", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg22", name: "Fenouil", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg23", name: "Haricots verts", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg24", name: "Laitue/Salades vertes (tous types: romaine, batavia, feuille de chêne)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg25", name: "Mâche", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg26", name: "Navet (cuit)", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg27", name: "Oignon", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg28", name: "Panais (cuit)", ig: "(IG: ~52)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg29", name: "Patates douces (cuites)", ig: "(IG: ~50)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg30", name: "Petit pois (frais)", ig: "(IG: ~35)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg31", name: "Poireau", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg32", name: "Poivron (tous types)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg33", name: "Radis", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg34", name: "Roquette", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg35", name: "Salsifis (cuit)", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg36", name: "Tomate", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "veg37", name: "Topinambour (cuit)", ig: "(IG: ~50)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
    ],
  },
  {
    categoryName: "Fruits à coque et Graines",
    items: [
      { 
        id: "nut1", name: "Amandes", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 579 kcal / 100g",
        carbs: "21.6g", protein: "21.2g", fat: "49.9g", sugars: "4.4g", fiber: "12.5g"
      },
      { 
        id: "nut2", name: "Graines de chia", ig: "(IG: ~1)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 486 kcal / 100g",
        carbs: "42.1g", protein: "16.5g", fat: "30.7g", sugars: "0g", fiber: "34.4g"
      },
      { id: "nut3", name: "Graines de courge", ig: "(IG: ~25)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "nut4", name: "Graines de lin", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "nut5", name: "Graines de pavot", ig: "(IG: ~35)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "nut6", name: "Graines de sésame", ig: "(IG: ~35)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "nut7", name: "Graines de tournesol", ig: "(IG: ~20)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "nut8", name: "Noisettes", ig: "(IG: ~15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "nut9", name: "Noix", ig: "(IG: ~15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "nut10", name: "Noix de cajou", ig: "(IG: ~25)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "nut11", name: "Noix de macadamia", ig: "(IG: ~10)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "nut12", name: "Noix de pécan", ig: "(IG: ~10)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "nut13", name: "Noix du Brésil", ig: "(IG: ~1)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "nut14", name: "Pignons de pin", ig: "(IG: ~15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "nut15", name: "Pistaches", ig: "(IG: ~15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
    ],
  },
  {
    categoryName: "Céréales, Grains et Féculents",
    items: [
      { 
        id: "grain1", name: "Avoine (flocons)", ig: "(IG: ~55)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 389 kcal / 100g",
        carbs: "66.3g", protein: "16.9g", fat: "6.9g", sugars: "0g", fiber: "10.6g"
      },
      { id: "grain2", name: "Blé (Ebly, grains entiers)", ig: "(IG: ~45)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain3", name: "Boulgour", ig: "(IG: ~48)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain4", name: "Crêpe de sarrasin", ig: "(IG: ~40)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain5", name: "Fonio", ig: "(IG: ~55)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain6", name: "Millet", ig: "(IG: ~55)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain7", name: "Orge perlé", ig: "(IG: ~25)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain8", name: "Pain de blé entier (100%)", ig: "(IG: ~51)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain9", name: "Pain de seigle complet", ig: "(IG: ~45)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain10", name: "Pain au levain (complet)", ig: "(IG: ~53)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain11", name: "Pâtes complètes (al dente)", ig: "(IG: ~40-50)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain12", name: "Pâtes de lentilles corail", ig: "(IG: ~22)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain13", name: "Petit épeautre", ig: "(IG: ~40)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain14", name: "Quinoa (cuit)", ig: "(IG: ~53)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain15", name: "Riz basmati complet", ig: "(IG: ~45)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain16", name: "Riz rouge", ig: "(IG: ~55)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain17", name: "Riz sauvage", ig: "(IG: ~45)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain18", name: "Sarrasin (Kasha)", ig: "(IG: ~40)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain19", name: "Semoule de blé dur complète (couscous complet)", ig: "(IG: ~45)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain20", name: "Son d'avoine", ig: "(IG: ~15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "grain21", name: "Teff", ig: "(IG: ~57)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
    ],
  },
  {
    categoryName: "Légumineuses",
    items: [
      { id: "legume1", name: "Fèves (cuites)", ig: "(IG: ~40)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "legume2", name: "Flageolets (cuits)", ig: "(IG: ~25)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "legume3", name: "Haricots (blancs, rouges, noirs, pinto, azuki - cuits)", ig: "(IG: ~30-40)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "legume4", name: "Lentilles (vertes, brunes, corail - cuites)", ig: "(IG: ~25-30)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "legume5", name: "Lupin", ig: "(IG: ~15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "legume6", name: "Pois cassés (cuits)", ig: "(IG: ~22)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "legume7", name: "Pois chiches (cuits)", ig: "(IG: ~28)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "legume8", name: "Soja (edamame, fèves)", ig: "(IG: ~15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
    ],
  },
  {
    categoryName: "Viandes, Volailles, Poissons et Œufs",
    items: [
      { id: "meat1", name: "Agneau (maigre)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { 
        id: "meat2", name: "Bœuf (maigre: steak haché 5%, rumsteck, filet)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 150-200 kcal / 100g (selon morceau)",
        carbs: "0g", protein: "20-26g", fat: "5-12g"
      },
      { 
        id: "meat3", name: "Cabillaud", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 82 kcal / 100g (cuit)",
        carbs: "0g", protein: "18g", fat: "0.7g"
      },
      { id: "meat4", name: "Colin/Lieu", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat5", name: "Crevettes/Gambas", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat6", name: "Dinde (escalope, filet)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat7", name: "Dorade", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat8", name: "Faisan", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat9", name: "Hareng", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat10", name: "Lapin", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat11", name: "Lotte", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat12", name: "Maquereau", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat13", name: "Merlan", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat14", name: "Moules", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { 
        id: "meat15", name: "Œufs", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 78 kcal / œuf moyen (50g)",
        carbs: "0.6g", protein: "6.3g", fat: "5.3g"
      },
      { id: "meat16", name: "Pintade", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat17", name: "Poitrine de poulet (sans peau)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat18", name: "Porc (filet mignon)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat19", name: "Sardines (fraîches ou en conserve au naturel)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat20", name: "Saumon", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat21", name: "Sole", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat22", name: "Thon (au naturel)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat23", name: "Truite", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "meat24", name: "Veau (escalope, noix)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
    ],
  },
  {
    categoryName: "Produits Laitiers et Alternatives Végétales",
    items: [
      { 
        id: "dairy1", name: "Fromage blanc (nature, 0-3% MG)", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 45-75 kcal / 100g",
        carbs: "4-5g", protein: "7-8g", fat: "0-3g"
      },
      { id: "dairy2", name: "Fromage frais (type St Moret, Carré Frais, nature)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy3", name: "Fromages affinés (chèvre frais, comté, emmental, etc. - avec modération)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy4", name: "Kéfir de lait (nature)", ig: "(IG: ~20)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy5", name: "Lait d'amande (non sucré)", ig: "(IG: ~25)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy6", name: "Lait de coco (non sucré, avec modération)", ig: "(IG: ~40)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy7", name: "Lait de noisette (non sucré)", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy8", name: "Lait de soja (non sucré)", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy9", name: "Lait écrémé ou demi-écrémé", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy10", name: "Petits suisses (nature, 0-3% MG)", ig: "(IG: ~30)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy11", name: "Skyr (nature)", ig: "(IG: ~15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy12", name: "Tofu (nature, fumé)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy13", name: "Yaourt de brebis (nature)", ig: "(IG: ~20)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy14", name: "Yaourt de chèvre (nature)", ig: "(IG: ~20)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy15", name: "Yaourt grec (nature, sans sucre)", ig: "(IG: ~15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy16", name: "Yaourt nature (lait de vache)", ig: "(IG: ~20)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "dairy17", name: "Yaourt végétal (soja, amande, coco - nature, non sucré)", ig: "(IG: ~20-35)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
    ],
  },
  {
    categoryName: "Matières Grasses (avec modération)",
    items: [
      { id: "fat1", name: "Beurre de cacahuète (nature, sans sucre ajouté)", ig: "(IG: ~14)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fat2", name: "Beurre d'amande/noisette (nature, sans sucre ajouté)", ig: "(IG: <10)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fat3", name: "Ghee (beurre clarifié)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fat4", name: "Huile de colza", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fat5", name: "Huile de lin", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fat6", name: "Huile de noix", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { 
        id: "fat7", name: "Huile d'olive (vierge extra)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false,
        calories: "Env. 884 kcal / 100g",
        carbs: "0g", protein: "0g", fat: "100g"
      },
      { id: "fat8", name: "Margarine végétale (non hydrogénée, riche en oméga-3)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
      { id: "fat9", name: "Olives", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
    ],
  },
  {
    categoryName: "Assaisonnements et Autres",
    items: [
        { id: "other1", name: "Bouillon de légumes/volaille (dégraissé, pauvre en sel)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other2", name: "Cacao en poudre (non sucré)", ig: "(IG: ~20)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other3", name: "Cannelle", ig: "(IG: <5)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other4", name: "Citronnelle", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other5", name: "Clou de girofle", ig: "(IG: <5)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other6", name: "Concentré de tomate (sans sucre ajouté)", ig: "(IG: ~35)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other7", name: "Coriandre (graines ou fraîche)", ig: "(IG: <5)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other8", name: "Cumin", ig: "(IG: <5)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other9", name: "Curcuma", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other10", name: "Curry en poudre", ig: "(IG: <5)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other11", name: "Échalote", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other12", name: "Gingembre (frais ou en poudre)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other13", name: "Gomasio (sésame grillé et sel)", ig: "(IG: ~35)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other14", name: "Herbes fraîches/sèches (persil, basilic, thym, romarin, aneth, ciboulette, menthe, origan)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other15", name: "Jus de citron/lime", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other16", name: "Levure maltée/nutritionnelle", ig: "(IG: <10)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other17", name: "Moutarde (sans sucre ajouté)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other18", name: "Muscade", ig: "(IG: <5)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other19", name: "Paprika", ig: "(IG: <5)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other20", name: "Piment (doux, fort)", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other21", name: "Poivre (noir, blanc, rose)", ig: "(IG: <5)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other22", name: "Raifort", ig: "(IG: <15)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other23", name: "Sauce soja/tamari (pauvre en sel)", ig: "(IG: <20)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other24", name: "Sel (avec modération, iodé de préférence)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other25", name: "Stevia ou autres édulcorants non caloriques (avec modération)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other26", name: "Vanille (extrait ou gousse, non sucrée)", ig: "(IG: 0)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other27", name: "Vinaigre (de cidre, balsamique, de vin - sans sucre ajouté)", ig: "(IG: <5)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
        { id: "other28", name: "Wasabi", ig: "(IG: ~10)", isFavorite: false, isDisliked: false, isAllergenic: false, calories: "X kcal", carbs: "Xg", protein: "Xg", fat: "Xg" },
    ],
  }
].map(category => ({
  ...category,
  items: category.items.sort((a, b) => a.name.localeCompare(b.name))
}));

