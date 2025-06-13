import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBldhvu1lPn2e3rp_YeMokN_VuBNl9Q3qA",
  authDomain: "meltdown-787cd.firebaseapp.com",
  projectId: "meltdown-787cd",
  storageBucket: "meltdown-787cd.appspot.com", // ✅ corrected here
  messagingSenderId: "721027549148",
  appId: "1:721027549148:web:b07b2fc38d2bc4e2087119",
  measurementId: "G-7VFV9S2B23",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
