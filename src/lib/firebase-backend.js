import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where
} from "firebase/firestore/lite";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

export function createFirebaseBackend(mode) {
  const emulator = mode === "emulator";
  const config = emulator ? {
    projectId: "demo-tutoronline",
    apiKey: "demo-tutoronline-key"
  } : {
    apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
    projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
    appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
  };
  if (!Object.values(config).every(Boolean)) {
    throw new Error("Completa la configurazione Firebase nel file .env.");
  }

  const app = initializeApp(config);
  const appCheckKey = import.meta.env.PUBLIC_FIREBASE_APP_CHECK_KEY;
  if (!emulator && appCheckKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(appCheckKey),
      isTokenAutoRefreshEnabled: true
    });
  }

  const db = getFirestore(app);
  if (emulator) {
    const host = import.meta.env.PUBLIC_EMULATOR_HOST || "127.0.0.1";
    connectFirestoreEmulator(db, host, 8080);
  }

  return {
    mode,
    async sendContact(data) {
      await addDoc(collection(db, "tutoronlineContacts"), { ...data, createdAt: serverTimestamp() });
    },
    async sendReview(data) {
      await addDoc(collection(db, "tutoronlineReviews"), {
        ...data,
        status: "pending",
        createdAt: serverTimestamp()
      });
    },
    async listReviews() {
      const approved = query(
        collection(db, "tutoronlineReviews"),
        where("status", "==", "approved"),
        orderBy("createdAt", "desc"),
        limit(30)
      );
      const snapshot = await getDocs(approved);
      return snapshot.docs.map(item => {
        const { name, rating, comment } = item.data();
        return { name, rating, comment };
      });
    }
  };
}
