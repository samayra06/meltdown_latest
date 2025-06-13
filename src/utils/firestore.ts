import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

// Submit a new meltdown
export async function submitMeltdown(data: any) {
  await addDoc(collection(db, "meltdowns"), {
    ...data,
    timestamp: serverTimestamp(),
  });
}

// Fetch all meltdowns
export async function fetchMeltdowns() {
  const snapshot = await getDocs(collection(db, "meltdowns"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Add a reply to an existing meltdown
export async function addReplyToMeltdown(id: string, reply: string) {
  const ref = doc(db, "meltdowns", id);
  const snapshot = await getDocs(collection(db, "meltdowns"));
  const current = snapshot.docs.find((d) => d.id === id)?.data();
  const existingReplies = current?.replies || [];

  await updateDoc(ref, {
    replies: [...existingReplies, reply],
  });
}

// Burst a meltdown (mark as burst: true)
export async function burstMeltdown(id: string) {
  const ref = doc(db, "meltdowns", id);
  await updateDoc(ref, {
    burst: true,
  });
}
