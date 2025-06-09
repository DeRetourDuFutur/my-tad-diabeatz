import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, addDoc, writeBatch, doc } from 'firebase/firestore'; // Added writeBatch and doc
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initialFoodCategories } from '../src/lib/food-data'; // Import initialFoodCategories
import { FoodItem } from '../src/lib/types'; // Changed Food to FoodItem

// Ensure dotenv is installed: npm install dotenv

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env.local');

console.log(`Attempting to load .env file from: ${envPath}`);

let dotenvResult: dotenv.DotenvConfigOutput = {};
try {
  dotenvResult = dotenv.config({ path: envPath, debug: process.env.DEBUG === 'true' });
  if (dotenvResult.error) {
    console.error('Error loading .env.local file with dotenv:', dotenvResult.error);
  } else {
    console.log('.env.local file processed by dotenv. Parsed values:', dotenvResult.parsed ? Object.keys(dotenvResult.parsed).length > 0 ? 'Some values parsed' : 'Parsed object is empty' : 'dotenvResult.parsed is undefined');
  }
} catch (e) {
  console.error('Exception during dotenv.config():', e);
}

if (!dotenvResult.parsed || Object.keys(dotenvResult.parsed).length === 0) {
  console.log('\n--- Attempting to read .env.local directly using fs ---');
  try {
    if (fs.existsSync(envPath)) {
      const rawEnvContent = fs.readFileSync(envPath, { encoding: 'utf8' });
      console.log('Raw content of .env.local:');
      console.log('------------------------------------');
      console.log(rawEnvContent);
      console.log('------------------------------------');
    } else {
      console.log('.env.local does not exist at the specified path according to fs.existsSync.');
    }
  } catch (fsError) {
    console.error('Error reading .env.local directly with fs:', fsError);
  }
  console.log('--- End of fs direct read attempt --- \n');
}

console.log('--- Environment Variables from process.env after dotenv processing ---');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('----------------------------------------------------');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
  console.log('Initializing Firebase app with config:', firebaseConfig);
  app = initializeApp(firebaseConfig);
} else {
  console.log('Using existing Firebase app.');
  app = getApps()[0];
}

const db = getFirestore(app);

async function migrateFoodsToFirestore() {
  console.log('--- Début de la migration des aliments vers Firestore ---');
  console.log('Firebase App Options used for initialization:', app.options);

  if (!app.options.projectId) {
    console.error("ERREUR FATALE: L'objet db Firestore est mal configuré ou le projectId est manquant!");
    console.error('Firebase App Options (from app.options):', app.options);
    console.error('Firebase Config used for initializeApp (from firebaseConfig variable):', firebaseConfig);
    console.log('--- Fin de la migration des aliments ---');
    return;
  }

  // Flatten the food items from categories first
  const allFoodItems: FoodItem[] = initialFoodCategories.reduce((acc, category) => {
    return acc.concat(category.items);
  }, [] as FoodItem[]);

  if (!allFoodItems || allFoodItems.length === 0) { // Changed 'foods' to 'allFoodItems'
    console.log('Aucune donnée alimentaire à migrer. Vérifiez food-data.ts.');
    console.log('--- Fin de la migration des aliments ---');
    return;
  }

  const foodsCollectionRef = collection(db, 'foods'); // Target collection
  const batchSize = 100; // Firestore batch limit is 500, using a smaller size for safety
  let itemsProcessed = 0;

  console.log(`Nombre total d'aliments à migrer: ${allFoodItems.length}`);

  try { // Added try block here to encompass the loop and batch commits
    for (let i = 0; i < allFoodItems.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = allFoodItems.slice(i, i + batchSize);
      console.log(`Traitement du lot ${Math.floor(i / batchSize) + 1}, taille: ${chunk.length}`);

      chunk.forEach((foodItem: FoodItem) => {
        const newFoodRef = doc(foodsCollectionRef);
        batch.set(newFoodRef, {
          ...foodItem,
          // Firestore handles Date objects directly, no need to convert to ISOString unless specifically required
          // lastModified: new Date() // Optionally add a timestamp for migration
        });
        itemsProcessed++;
      });

      try {
        await batch.commit();
        console.log(`Lot ${Math.floor(i / batchSize) + 1} écrit avec succès.`);
      } catch (error) {
        console.error(`Erreur lors de l'écriture du lot ${Math.floor(i / batchSize) + 1}: `, error);
        // Optionnel: arrêter le script en cas d'erreur sur un lot
        // return;
      }
    }

    console.log(`Migration terminée. ${itemsProcessed} aliments traités.`);
  } catch (error) { // Moved catch block inside the function and to wrap the main logic
    console.error(`Erreur générale lors de la migration des aliments: `, error);
    // Log specific details if available, e.g., if 'i' and 'batchSize' were relevant to the error context
    // console.error(`Erreur lors de l'écriture du lot ${Math.floor(i / batchSize) + 1} dans Firestore: `, error);
  }
  console.log('--- Fin de la migration des aliments ---'); // Ensure this is always logged
}

migrateFoodsToFirestore();
