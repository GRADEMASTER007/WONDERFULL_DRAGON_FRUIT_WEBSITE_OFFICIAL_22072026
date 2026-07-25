import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDkAsX2kQblm18lNkLEp1vmGeaVH-1WZbo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wonderfuldf-firebase.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wonderfuldf-firebase",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wonderfuldf-firebase.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "944064943609",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:944064943609:web:813102a380706639e85928",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5BFHRDSP2K"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Firebase Cloud Messaging
let messaging: any = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
}).catch(err => console.log("FCM not supported:", err));

export async function verifyFirestoreConnection() {
  console.log("Verifying Firestore connection...");
  try {
    console.log("Firestore DB instance:", db);
    console.log("Firebase App initialized:", app.name);
    return true;
  } catch (error) {
    console.error("Firestore connection verification failed:", error);
    return false;
  }
}

export const requestForToken = async () => {
  try {
    if (!messaging) return null;
    const currentToken = await getToken(messaging, { vapidKey: "BKh9pxDwo_Ql6ZdRS8aYhuCwgSNoGvh10XeibY4vIF1ZcniCybuLCRm9A_aaUoYwOGWYhmMBLLnOlrUmM_kVP2A" });
    if (currentToken) {
      console.log('current token for client: ', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { app, auth, db, messaging };
