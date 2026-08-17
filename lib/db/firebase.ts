import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { env } from "@/lib/env";

let app: App | null = null;

declare global {
  // eslint-disable-next-line no-var
  var __weddingFirestore: Firestore | undefined;
  // eslint-disable-next-line no-var
  var __weddingFirestoreSettingsApplied: boolean | undefined;
}

export function getFirebaseAdminApp(): App {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  const projectId = env.FIREBASE_PROJECT_ID;
  const clientEmail = env.FIREBASE_CLIENT_EMAIL;
  const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in your environment, or set USE_LOCAL_DB=true to use the local file store."
    );
  }

  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  return app;
}

export function getDb(): Firestore {
  if (globalThis.__weddingFirestore) return globalThis.__weddingFirestore;

  const firestore = getFirestore(getFirebaseAdminApp());
  // Firestore n'accepte pas les valeurs `undefined`.
  // En dev, Next.js peut recharger les modules (HMR) : settings() ne peut être appelé qu'une seule fois.
  if (!globalThis.__weddingFirestoreSettingsApplied) {
    try {
      firestore.settings({ ignoreUndefinedProperties: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Si Firestore a déjà été utilisé avant cet appel, settings() n'est plus autorisé.
      // On ne fait pas planter l'app : on continue avec la config existante.
      if (!message.toLowerCase().includes("settings()") && !message.toLowerCase().includes("initialized")) {
        throw err;
      }
    } finally {
      globalThis.__weddingFirestoreSettingsApplied = true;
    }
  }

  globalThis.__weddingFirestore = firestore;
  return firestore;
}
