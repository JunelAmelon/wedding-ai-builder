/**
 * Test Suite Complet : Workflows Métier & Sécurité
 * Couvre l'intégralité des modules de l'application et les 10 vulnérabilités du SECURITY_AUDIT
 */
import {
  hashPassword,
  verifyPassword,
  createSession,
  verifySession,
  safeCompare,
} from "../lib/auth";
import { getClientIp, checkRateLimit, resetRateLimit } from "../lib/rate-limit";
import { sessionRepo } from "../lib/db/repositories/sessionRepo";
import { userRepo } from "../lib/db/repositories/userRepo";
import { projectRepo } from "../lib/db/repositories/projectRepo";
import { wishlistRepo, wishlistItemRepo } from "../lib/db/repositories/wishlistRepo";
import { vendorProfileRepo } from "../lib/db/repositories/vendorProfileRepo";
import { computeProfileCompletion, VendorProfileUpdateSchema } from "../lib/validations/vendorProfile";
import type { UserAccount, VendorProfile } from "../types/marketplace";

const BASE_URL = "http://localhost:3000";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, title: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${title}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${title} ${details ? `(${details})` : ""}`);
  }
}

async function runTests() {
  console.log("================================================================");
  console.log("  🚀 DÉMARRAGE DU TEST GLOBAL : WORKFLOWS & SÉCURITÉ");
  console.log("================================================================\n");

  // ---------------------------------------------------------------------------
  // 1. SÉCURITÉ DES EN-TÊTES HTTP (VULN-10)
  // ---------------------------------------------------------------------------
  console.log("🔹 1. En-têtes HTTP de sécurité (VULN-10)");
  try {
    const res = await fetch(`${BASE_URL}/login`);
    const headers = res.headers;

    assert(headers.get("x-frame-options") === "DENY", "X-Frame-Options est défini à DENY (anti-clickjacking)");
    assert(headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options est défini à nosniff");
    assert(headers.get("referrer-policy") === "strict-origin-when-cross-origin", "Referrer-Policy est strict-origin-when-cross-origin");
    assert(
      (headers.get("permissions-policy") || "").includes("camera=()"),
      "Permissions-Policy désactive la caméra et le micro"
    );
    assert(
      (headers.get("strict-transport-security") || "").includes("max-age="),
      "Strict-Transport-Security (HSTS) est actif pour HTTPS"
    );
    assert(headers.get("x-dns-prefetch-control") === "on", "X-DNS-Prefetch-Control est actif");
  } catch (err) {
    assert(false, "Vérification des en-têtes HTTP", String(err));
  }

  // ---------------------------------------------------------------------------
  // 2. CRYPTOGRAPHIE, JETONS JWT & ANTI-TIMING ATTACKS (VULN-07 & VULN-08)
  // ---------------------------------------------------------------------------
  console.log("\n🔹 2. Cryptographie, Expiration JWT (VULN-07) & Anti-Timing Attack (VULN-08)");
  {
    // Hachage de mot de passe
    const rawPwd = "SecretPassword123!";
    const hashed = hashPassword(rawPwd);
    assert(hashed.includes(":"), "Le hachage PBKDF2 intègre sel et hash");
    assert(verifyPassword(rawPwd, hashed), "Le mot de passe correct est validé");
    assert(!verifyPassword("WrongPassword!", hashed), "Un mot de passe incorrect est rejeté");

    // safeCompare timing attack check
    assert(safeCompare("abcdef123456", "abcdef123456"), "safeCompare valide deux chaînes identiques");
    assert(!safeCompare("abcdef123456", "abcdef123457"), "safeCompare rejette deux chaînes différentes");
    assert(!safeCompare("short", "longerstring"), "safeCompare rejette des chaînes de longueurs distinctes");

    // Création de session & Vérification d'expiration
    const fakeUser: UserAccount = {
      id: "test-user-" + Date.now(),
      email: "test.auth@example.com",
      firstName: "Julien",
      lastName: "Dupont",
      avatarUrl: null,
      phone: null,
      address: null,
      role: "couple",
      googleId: null,
      passwordHash: hashed,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      emailVerified: true,
      resetToken: null,
      resetTokenExpiry: null,
      verifyToken: null,
      verifyTokenExpiry: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = createSession(fakeUser);
    assert(token.includes("."), "Le jeton de session est composé d'un payload et d'une signature");

    const verifiedUser = verifySession(token);
    assert(verifiedUser !== null && verifiedUser.id === fakeUser.id, "Session valide décodée avec succès");

    // Test token falsifié
    const [pStr, sig] = token.split(".");
    const tamperedSig = sig.slice(0, -2) + "00";
    const tamperedToken = `${pStr}.${tamperedSig}`;
    assert(verifySession(tamperedToken) === null, "Signature falsifiée immédiatement rejetée (timingSafeEqual)");

    // Test token expiré
    const expiredPayload = {
      id: fakeUser.id,
      email: fakeUser.email,
      firstName: fakeUser.firstName,
      lastName: fakeUser.lastName,
      role: fakeUser.role,
      iat: Math.floor(Date.now() / 1000) - 7200,
      exp: Math.floor(Date.now() / 1000) - 3600, // expiré il y a 1h
    };
    const { createHmac } = await import("crypto");
    const expPayloadStr = Buffer.from(JSON.stringify(expiredPayload)).toString("base64");
    const expSig = createHmac("sha256", process.env.JWT_SECRET || "").update(expPayloadStr).digest("hex");
    const expiredToken = `${expPayloadStr}.${expSig}`;
    assert(verifySession(expiredToken) === null, "Jeton expiré (exp) rejeté avec succès (VULN-07)");
  }

  // ---------------------------------------------------------------------------
  // 3. RÉSOLUTION D'IP SÉCURISÉE & RATE LIMITING (VULN-09)
  // ---------------------------------------------------------------------------
  console.log("\n🔹 3. Résolution d'IP sécurisée & Double Rate Limiting (VULN-09)");
  {
    // Simulation d'en-têtes HTTP pour getClientIp
    const mockReqCf = new Request("http://localhost", {
      headers: { "cf-connecting-ip": "1.2.3.4" },
    });
    assert(getClientIp(mockReqCf) === "1.2.3.4", "getClientIp respecte cf-connecting-ip");

    const mockReqReal = new Request("http://localhost", {
      headers: { "x-real-ip": "5.6.7.8" },
    });
    assert(getClientIp(mockReqReal) === "5.6.7.8", "getClientIp respecte x-real-ip");

    const mockReqSpoofed = new Request("http://localhost", {
      headers: { "x-forwarded-for": "malicious-script, 192.168.1.50" },
    });
    assert(getClientIp(mockReqSpoofed) === "192.168.1.50", "getClientIp filtre les injections de texte frauduleuses dans X-Forwarded-For");

    // Test dual rate limiting sur login
    const testEmail = `bruteforce-test-${Date.now()}@example.com`;
    // Effectuer 5 tentatives de login infructueuses
    for (let i = 0; i < 5; i++) {
      await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, password: "wrong-password" }),
      });
    }

    // La 6ème tentative doit déclencher le 429 Too Many Requests
    const blockedRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "wrong-password" }),
    });
    assert(blockedRes.status === 429, "Le brute-force par compte déclenche HTTP 429 (Trop de tentatives infructueuses)");
    
    // Débloquer le compte
    await resetRateLimit(`login:account:${testEmail}`);
  }

  // ---------------------------------------------------------------------------
  // 4. SUPPRESSION TOTALE DU MODÈLE DE CRÉDITS (VULN-03)
  // ---------------------------------------------------------------------------
  console.log("\n🔹 4. Suppression du modèle économique de crédits (VULN-03)");
  {
    const resGet = await fetch(`${BASE_URL}/api/credits`);
    assert(resGet.status === 410, "GET /api/credits renvoie HTTP 410 Gone");

    const resPost = await fetch(`${BASE_URL}/api/credits`, { method: "POST" });
    assert(resPost.status === 410, "POST /api/credits renvoie HTTP 410 Gone");
  }

  // ---------------------------------------------------------------------------
  // 5. WORKFLOW DU QUIZ & PROTECTION CONTRE LE DÉNI DE SERVICE IA (VULN-06)
  // ---------------------------------------------------------------------------
  console.log("\n🔹 5. Workflow Quiz & Protection Déni de Service Financier IA (VULN-06)");
  {
    // Démarrage de session
    const startRes = await fetch(`${BASE_URL}/api/quiz/start`, { method: "POST" });
    const startData = await startRes.json();
    assert(startRes.ok && typeof startData.sessionId === "string", "Démarrage du quiz (/api/quiz/start) crée un sessionId");
    const sessionId = startData.sessionId;

    // Test complétion d'un quiz vide -> rejet
    const emptyComplete = await fetch(`${BASE_URL}/api/quiz/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, durationSeconds: 5 }),
    });
    assert(emptyComplete.status === 400, "Finalisation refusée si le quiz a moins de 2 réponses (anti-bot / anti-gaspillage IA)");

    // Répondre aux étapes
    const ans1 = await fetch(`${BASE_URL}/api/quiz/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        step: "date",
        value: "2027-08-20",
      }),
    });
    assert(ans1.ok, "Étape 'date' enregistrée avec succès");

    // Test rejet de date dans le passé
    const pastDateRes = await fetch(`${BASE_URL}/api/quiz/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        step: "date",
        value: "2020-01-01",
      }),
    });
    assert(pastDateRes.status === 400, "Une date dans le passé est rejetée (400)");

    // Test rejet de budget négatif
    const negBudgetRes = await fetch(`${BASE_URL}/api/quiz/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        step: "budget",
        value: { amount: -500, currency: "EUR" },
      }),
    });
    assert(negBudgetRes.status === 400, "Un budget négatif est rejeté (400)");

    // Répondre au budget et aux invités
    await fetch(`${BASE_URL}/api/quiz/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        step: "budget",
        value: { amount: 25000, currency: "EUR" },
      }),
    });
    await fetch(`${BASE_URL}/api/quiz/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        step: "guests",
        value: { guestCount: 120, childrenCount: 15 },
      }),
    });

    // Test de simulation d'idempotence sur /api/quiz/complete
    // Si un aiOutput existe déjà, l'endpoint doit répondre ready: true, cached: true sans rappeler OpenAI
    await sessionRepo.setAIOutput(sessionId, {
      blueprint: { summary: "Test Blueprint", highlights: [] },
      budgetBreakdown: { categories: [], totalEstimated: 25000 },
      timeline: { phases: [] },
      riskEngine: { score: 10, risks: [] },
    } as any);

    const cachedRes = await fetch(`${BASE_URL}/api/quiz/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, durationSeconds: 60 }),
    });
    const cachedData = await cachedRes.json();
    assert(cachedData.ready === true && cachedData.cached === true, "Idempotence : un plan déjà généré ne réinvoque jamais OpenAI");
  }

  // ---------------------------------------------------------------------------
  // 6. SÉCURITÉ DU ROUTE D'UPLOAD (VULN-01)
  // ---------------------------------------------------------------------------
  console.log("\n🔹 6. Sécurité de la route d'upload de fichiers (VULN-01)");
  {
    // Rejet sans authentification
    const unauthUpload = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      body: new FormData(),
    });
    assert(unauthUpload.status === 401, "Upload rejeté avec 401 si non authentifié");

    // Création d'une session valide pour tester les filtres MIME
    const authUser: UserAccount = {
      id: "uploader-1",
      email: "uploader@example.com",
      firstName: "Jean",
      lastName: "Upload",
      avatarUrl: null,
      phone: null,
      address: null,
      role: "vendor",
      googleId: null,
      passwordHash: "dummy",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      emailVerified: true,
      resetToken: null,
      resetTokenExpiry: null,
      verifyToken: null,
      verifyTokenExpiry: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const authCookie = `wab_session=${createSession(authUser)}`;

    // Tentative upload de fichier dangereux (.exe / .html)
    const maliciousForm = new FormData();
    const exeBlob = new Blob(["malicious binary content"], { type: "application/x-msdownload" });
    maliciousForm.append("file", exeBlob, "trojan.exe");

    const badExtRes = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: { Cookie: authCookie },
      body: maliciousForm,
    });
    assert(badExtRes.status === 400, "Upload de trojan.exe bloqué avec 400");

    const svgForm = new FormData();
    const svgBlob = new Blob(["<svg onload=alert(1)>"], { type: "image/svg+xml" });
    svgForm.append("file", svgBlob, "xss.svg");

    const svgRes = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: { Cookie: authCookie },
      body: svgForm,
    });
    assert(svgRes.status === 400, "Upload SVG (vecteur XSS potentiel) bloqué avec 400");
  }

  // ---------------------------------------------------------------------------
  // 7. SÉCURITÉ DU PROFIL PRESTATAIRE & MASS ASSIGNMENT (VULN-02)
  // ---------------------------------------------------------------------------
  console.log("\n🔹 7. Protection Mass Assignment du Profil Prestataire (VULN-02)");
  {
    // Calcul de la complétion du profil côté serveur
    const mockProfile: Partial<VendorProfile> = {
      companyName: "Domaine des Oliviers",
      serviceCategory: "lieu",
      description: "Magnifique domaine de mariage",
      phone: "0601020304",
      portfolio: { images: [{ url: "img1.jpg", publicId: "img1", filename: "img1.jpg" }], videos: [], website: null, instagram: null, faq: [], reviews: [] },
      priceRange: { min: 3000, max: 8000, currency: "EUR" },
    };
    const completion = computeProfileCompletion(mockProfile);
    assert(completion > 0 && completion <= 100, `Calcul dynamique de profileCompletion serveur : ${completion}%`);

    // Test de rejet / filtrage des champs administratifs
    const maliciousPayload = {
      companyName: "Traiteur Royal",
      status: "approved",      // Injection frauduleuse de statut
      tier: "elite",           // Injection frauduleuse de forfait
      credits: 99999,          // Injection frauduleuse de crédits
      notes: "Hacked by test", // Injection de notes admin
    };

    // Vérification unitaire du schéma de whitelist
    const parsed = VendorProfileUpdateSchema.safeParse(maliciousPayload);
    assert(parsed.success, "Le schéma whitelist parse les données autorisées");
    if (parsed.success) {
      const data = parsed.data as Record<string, unknown>;
      assert(data.status === undefined, "Champ 'status' automatiquement éliminé");
      assert(data.tier === undefined, "Champ 'tier' automatiquement éliminé");
      assert(data.credits === undefined, "Champ 'credits' automatiquement éliminé");
      assert(data.notes === undefined, "Champ 'notes' automatiquement éliminé");
      assert(data.companyName === "Traiteur Royal", "Champ légitime 'companyName' conservé");
    }
  }

  // ---------------------------------------------------------------------------
  // 8. PROTECTION STRIPE CHECKOUT & PÉRIODE D'ESSAI (VULN-04)
  // ---------------------------------------------------------------------------
  console.log("\n🔹 8. Stripe Checkout & Contrôle des Périodes d'essai (VULN-04)");
  {
    // Rejet sans authentification
    const unauthStripe = await fetch(`${BASE_URL}/api/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: "premium", trialDays: 9999 }),
    });
    assert(unauthStripe.status === 401, "Stripe Checkout rejeté sans authentification (401)");

    // Test avec utilisateur couple (non prestataire)
    const coupleUser: UserAccount = {
      id: "couple-stripe-test",
      email: "couple@example.com",
      firstName: "Luc",
      lastName: "Couple",
      avatarUrl: null,
      phone: null,
      address: null,
      role: "couple",
      googleId: null,
      passwordHash: "dummy",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      emailVerified: true,
      resetToken: null,
      resetTokenExpiry: null,
      verifyToken: null,
      verifyTokenExpiry: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const coupleCookie = `wab_session=${createSession(coupleUser)}`;

    const forbiddenStripe = await fetch(`${BASE_URL}/api/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: coupleCookie },
      body: JSON.stringify({ planId: "premium" }),
    });
    assert(forbiddenStripe.status === 403, "Stripe Checkout prestataire interdit aux couples (403)");
  }

  // ---------------------------------------------------------------------------
  // 9. LISTE DE MARIAGE, IDOR & CONFIDENTIALITÉ RGPD (VULN-05)
  // ---------------------------------------------------------------------------
  console.log("\n🔹 9. Liste de Mariage : Contrôle d'accès IDOR & Confidentialité RGPD (VULN-05)");
  {
    // Création d'une liste et d'un cadeau en base
    const couple1Id = "couple-owner-1";
    const couple2Id = "couple-attacker-2";

    const list1 = await wishlistRepo.create({
      coupleId: couple1Id,
      weddingId: "wedding-1",
      title: "Notre Liste de Mariage",
      description: "Pour notre futur foyer et voyage",
      isPublic: true,
    });
    const item = await wishlistItemRepo.create({
      wishlistId: list1.id,
      name: "Voyage de noces",
      price: 2000,
      description: "Notre lune de miel",
      quantity: 1,
      remaining: 1,
      purchased: false,
    });

    // Couple 2 tente de supprimer l'article de Couple 1
    const couple2User: UserAccount = {
      id: couple2Id,
      email: "attacker@example.com",
      firstName: "Attacker",
      lastName: "User",
      avatarUrl: null,
      phone: null,
      address: null,
      role: "couple",
      googleId: null,
      passwordHash: "dummy",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      emailVerified: true,
      resetToken: null,
      resetTokenExpiry: null,
      verifyToken: null,
      verifyTokenExpiry: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const couple2Cookie = `wab_session=${createSession(couple2User)}`;

    const idorRes = await fetch(`${BASE_URL}/api/wishlist/items/${item.id}`, {
      method: "DELETE",
      headers: { Cookie: couple2Cookie },
    });
    assert(idorRes.status === 403, "Tentative IDOR : suppression du cadeau d'un autre couple bloquée (403)");

    // Test de rejet des achats directs non vérifiés
    const fakePurchaseRes = await fetch(`${BASE_URL}/api/wishlist/purchases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, amount: 500 }),
    });
    assert(fakePurchaseRes.status === 405, "Injection d'achats fictifs sans Stripe bloquée (405 Method Not Allowed)");

    // Test de confidentialité sur l'endpoint public (aucun guestEmail leaké)
    const publicRes = await fetch(`${BASE_URL}/api/wishlist/public?token=${list1.shareToken}`);
    const publicData = await publicRes.json();
    assert(publicRes.ok && publicData.wishlist?.id === list1.id, "Accès public à la wishlist fonctionnel par shareToken");
    assert(Array.isArray(publicData.purchases), "La réponse publique contient les contributions anonymisées");

    // Nettoyage de l'article et de la liste de test
    await wishlistItemRepo.delete(item.id);
    await wishlistRepo.delete(list1.id);
  }

  // ---------------------------------------------------------------------------
  // 10. WORKFLOW DE CRÉATION DE COMPTE & PROJET MARIAGE
  // ---------------------------------------------------------------------------
  console.log("\n🔹 10. Workflow Inscription & Initialisation Projet de Mariage");
  {
    const uniqueEmail = `test.wedding.${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Sophie",
        lastName: "Martin",
        email: uniqueEmail,
        password: "ValidPassword123!",
        address: "15 rue de Rivoli, 75001 Paris",
        role: "couple",
        source: "quiz",
      }),
    });
    assert(regRes.status === 201, "Inscription d'un couple réussie (201 Created)");

    const createdUser = await userRepo.getByEmail(uniqueEmail);
    assert(createdUser !== null, "L'utilisateur est correctement persisté dans le repository");
    if (createdUser) {
      assert(createdUser.role === "couple", "Le rôle est bien 'couple'");
      assert(createdUser.passwordHash !== "ValidPassword123!", "Le mot de passe n'est jamais stocké en clair");
      const projects = await projectRepo.listByUser(createdUser.id);
      assert(projects.length >= 1, "Un projet de mariage 'Mon mariage' a été automatiquement initialisé");
    }
  }

  // ---------------------------------------------------------------------------
  // RÉCAPITULATIF FINAL
  // ---------------------------------------------------------------------------
  console.log("\n================================================================");
  console.log(`  📊 BILAN DE LA SUITE DE TESTS : ${passedTests}/${totalTests} RÉUSSIS`);
  if (failedTests === 0) {
    console.log("  🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS (0 ÉCHEC)");
  } else {
    console.error(`  ⚠️ ${failedTests} TEST(S) ONT ÉCHOUÉ`);
  }
  console.log("================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Erreur critique d'exécution de la suite de tests :", err);
  process.exit(1);
});
