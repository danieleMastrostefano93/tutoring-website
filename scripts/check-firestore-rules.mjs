import assert from "node:assert/strict";
import { initializeApp, deleteApp } from "firebase/app";
import {
  addDoc, collection, connectFirestoreEmulator, deleteDoc, getDoc,
  getDocs, getFirestore, limit, orderBy, query, serverTimestamp, setLogLevel,
  updateDoc, where, doc, setDoc
} from "firebase/firestore/lite";

// Questo controllo può usare esclusivamente l'emulatore locale.
const host = process.env.FIRESTORE_EMULATOR_HOST;
assert.equal(host, "127.0.0.1:8080", "Avvia il controllo con Firebase emulators:exec.");
setLogLevel("silent");
const app = initializeApp({ projectId: "demo-tutoronline", apiKey: "demo-key" });
const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8080);
let checks = 0;
async function denied(action) {
  await assert.rejects(action, error => error.code === "permission-denied");
  checks++;
}
const message = {
  name: "Test emulatore", email: "test@example.com", education: "altro",
  phone: "", message: "Vorrei informazioni sulle lezioni.",
  subject: "", plan: "", createdAt: serverTimestamp()
};

try {
  const contacts = collection(db, "tutoronlineContacts");
  const saved = await addDoc(contacts, message);
  checks++;
  await addDoc(contacts, { ...message, phone: "+393331234567", subject: "matematica", plan: "5" });
  checks++;
  for (const invalid of [
    { name: "" }, { email: "non-valida" }, { phone: "abc" },
    { education: "non-valido" }, { message: "" }, { message: "x".repeat(1201) },
    { plan: "99" }, { subject: "non-valida" }, { unexpected: true },
    { createdAt: new Date(0) }
  ]) {
    await denied(() => addDoc(contacts, { ...message, ...invalid }));
  }
  const { email, ...missingEmail } = message;
  await denied(() => addDoc(contacts, missingEmail));
  await denied(() => getDoc(saved));
  await denied(() => getDocs(query(contacts, limit(1))));
  await denied(() => updateDoc(saved, { message: "Modifica anonima" }));
  await denied(() => deleteDoc(saved));

  await addDoc(collection(db, "Contatti"), {
    name: "Test", surname: "Emulatore", email: "test@example.com",
    phone: "3331234567", education: "altro", message: "Modulo precedente",
    timestamp: new Date()
  });
  checks++;
  await denied(() => addDoc(collection(db, "recensioni"), { test: true }));
  await getDocs(query(collection(db, "recensioni"), limit(1)));
  checks++;
  await addDoc(collection(db, "recensioni"), {
    name: "Test", rating: 5, comment: "Compatibilità Angular", createdAt: serverTimestamp()
  });
  checks++;
  await denied(() => addDoc(collection(db, "tutoronlineProfiles"), { name: "anonimo" }));
  const ownerApp = initializeApp({ projectId: "demo-tutoronline", apiKey: "demo-key" }, "owner");
  const ownerDb = getFirestore(ownerApp);
  connectFirestoreEmulator(ownerDb, "127.0.0.1", 8080, { mockUserToken: { sub: "owner", user_id: "owner" } });
  for (const group of ["users", "tutoronlineProfiles"]) {
    const own = doc(ownerDb, group, "owner");
    await setDoc(own, { name: "Test privato" });
    assert.equal((await getDoc(own)).data().name, "Test privato");
    checks += 2;
    await denied(() => getDoc(doc(db, group, "owner")));
    await denied(() => getDoc(doc(ownerDb, group, "other")));
    await denied(() => setDoc(doc(ownerDb, group, "other"), { name: "altro" }));
    await denied(() => getDocs(collection(ownerDb, group)));
  }
  await denied(() => getDocs(collection(ownerDb, "tutoronlineContacts")));
  await denied(() => addDoc(collection(ownerDb, "unrelated"), { test: true }));
  await deleteApp(ownerApp);
  await denied(() => addDoc(collection(db, "users"), { test: true }));

  const reviews = collection(db, "tutoronlineReviews");
  const pending = await addDoc(reviews, {
    name: "", rating: 5, comment: "Test locale", status: "pending", createdAt: serverTimestamp()
  });
  checks++;
  await denied(() => getDoc(pending));
  await denied(() => addDoc(reviews, {
    name: "", rating: 5, comment: "Test", status: "approved", createdAt: serverTimestamp()
  }));
  await denied(() => getDocs(query(reviews, limit(30))));
  await denied(() => getDocs(query(reviews, where("status", "==", "approved"), limit(31))));
  const approved = await getDocs(query(
    reviews, where("status", "==", "approved"), orderBy("createdAt", "desc"), limit(30)
  ));
  assert.equal(approved.size, 0);
  checks++;
  console.log(`${checks} controlli sulle regole superati (solo emulatore, nessun dato reale).`);
} finally {
  await deleteApp(app);
}
