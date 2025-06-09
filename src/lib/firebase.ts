import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

console.log(
  "[firebase.ts] NEXT_PUBLIC_FIREBASE_PROJECT_ID:",
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);
console.log(
  "[firebase.ts] NEXT_PUBLIC_FIREBASE_API_KEY:",
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY
);
// Add console logs for all other expected env vars here

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app;
if (!getApps().length) {
  console.log("[firebase.ts] Initializing new Firebase app...");
  app = initializeApp(firebaseConfig);
} else {
  console.log("[firebase.ts] Using existing Firebase app.");
  app = getApp();
}

const db = getFirestore(app);

console.log(
  "[firebase.ts] Firebase App Initialized. Project ID from app.options:",
  app.options.projectId
);

export { app, db };
