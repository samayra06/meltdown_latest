// src/lib/firestore.ts
import { collection, addDoc, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export interface OrbMemory {
  id?: string;
  x: number;
  y: number;
  size: number;
  color: string;
  preview: string;
  fullText: string;
  timestamp: string;
}

const ORBS_COLLECTION = "orbs";

export async function saveOrb(orb: OrbMemory) {
  try {
    await addDoc(collection(db, ORBS_COLLECTION), orb);
  } catch (err) {
    console.error("Failed to save orb:", err);
  }
}

export async function fetchOrbs(): Promise<OrbMemory[]> {
  const snapshot = await getDocs(collection(db, ORBS_COLLECTION));
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as OrbMemory)
  );
}

export function subscribeToOrbs(callback: (orbs: OrbMemory[]) => void) {
  return onSnapshot(collection(db, ORBS_COLLECTION), (snapshot) => {
    const orbs = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as OrbMemory)
    );
    callback(orbs);
  });
}
