function normalizeEnvBool(value: string | undefined): boolean {
  if (!value) return true;
  const cleaned = value.trim().replace(/^["']|["']$/g, "");
  return cleaned.toLowerCase() !== "false";
}

function isValidCredential(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.toLowerCase() === "undefined") return false;
  if (trimmed.startsWith("your-")) return false;
  if (trimmed.startsWith("firebase-adminsdk-" + "x".repeat(5))) return false;
  return true;
}

function isFirebaseConfigured(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  return isValidCredential(projectId) && isValidCredential(clientEmail) && isValidCredential(privateKey);
}

export function useLocal(): boolean {
  const envLocal = normalizeEnvBool(process.env.USE_LOCAL_DB);
  if (envLocal) return true;
  // Si Firebase est demandé mais non configuré, on bascule sur local avec un avertissement
  if (!isFirebaseConfigured()) {
    console.warn(
      "[db/repositories] USE_LOCAL_DB=false mais Firebase Admin n'est pas configuré (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY manquants). Bascule sur le stockage local."
    );
    return true;
  }
  return false;
}

export function getStoreBackend(): "local" | "firebase" {
  return useLocal() ? "local" : "firebase";
}
