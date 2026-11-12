import assert from "node:assert/strict";
import { initializeApp, deleteApp } from "firebase/app";
import {
  connectFirestoreEmulator, deleteDoc, doc, getDocFromServer, getFirestore,
  serverTimestamp, setDoc, setLogLevel, terminate
} from "firebase/firestore";

assert.equal(process.env.FIRESTORE_EMULATOR_HOST, "127.0.0.1:8080");
setLogLevel("silent");
const app = initializeApp({ projectId: "demo-tutoronline", apiKey: "demo-key" }, "grpc-compat");
const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8080, { mockUserToken: { sub: "grpc-compat" } });
try {
  // Il client Node completo esercita davvero gRPC, a differenza di Firestore Lite.
  const ref = doc(db, "tutoronlineProfiles", "grpc-compat");
  await setDoc(ref, { name: "Test compatibilità gRPC", createdAt: serverTimestamp() });
  const saved = await getDocFromServer(ref);
  assert.equal(saved.data().name, "Test compatibilità gRPC");
  assert.ok(saved.data().createdAt.toMillis() > 0);
  await deleteDoc(ref);
  assert.equal((await getDocFromServer(ref)).exists(), false);
  console.log("PASS client Node Firestore/gRPC: scrittura, lettura server e cancellazione (solo emulatore)");
} finally {
  await terminate(db);
  await deleteApp(app);
}
