import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// IMPORTANT: Replace with your actual Firebase configuration
const firebaseEnv=import.meta.env;


const firebaseConfig = {
  apiKey: firebaseEnv.VITE_apiKey,
  authDomain: firebaseEnv.VITE_authDomain,
  projectId: firebaseEnv.VITE_projectId,
  storageBucket: firebaseEnv.VITE_storageBucket,
  messagingSenderId: firebaseEnv.VITE_messagingSenderId,
  appId: firebaseEnv.VITE_appId,
  measurementId: firebaseEnv.VITE_measurementId,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);


export { app,db, storage };
