# 🛡️ Rapport d'Audit de Sécurité Complet — Mariage Facile (Wedding AI Builder)
**Date :** Octobre 2026  
**Cible :** Plateforme Web & API Next.js (App Router) — Mariage Facile  
**Statut global :** ⚠️ Failles critiques identifiées nécessitant un durcissement immédiat

---

## 📑 Sommaire
1. [Synthèse Exécutive](#1-synthèse-exécutive)
2. [Matrice des Risques & Vulnérabilités](#2-matrice-des-risques--vulnérabilités)
3. [Détail des Vulnérabilités Critiques (P0)](#3-détail-des-vulnérabilités-critiques-p0)
4. [Faiblesses Importantes d'Architecture & Auth (P1)](#4-faiblesses-importantes-darchitecture--auth-p1)
5. [Audit des Dépendances & CVEs NPM (P2)](#5-audit-des-dépendances--cves-npm-p2)
6. [Plan d'Action & Correctifs Recommandés](#6-plan-daction--correctifs-recommandés)
7. [Feuille de Route pour le Durcissement Continu](#7-feuille-de-route-pour-le-durcissement-continu)

---

## 1. Synthèse Exécutive

Un audit de sécurité défensif complet a été conduit sur l'ensemble de la base de code de l'application **wedding-ai-builder**. L'analyse a couvert :
- Les mécanismes d'authentification, de hachage et de gestion des sessions JWT.
- L'ensemble des 80+ endpoints d'API (routes `/api/admin/*`, `/api/couple/*`, `/api/vendor/*`, `/api/auth/*`, `/api/wishlist/*`, `/api/stripe/*`).
- Les flux de paiement Stripe et la logique financière (crédits, abonnements, cagnottes).
- La gestion des fichiers et uploads médias.
- La protection contre les attaques par déni de service (DoS) et l'épuisement financier d'API tierces (OpenAI, Cloudinary).
- Les en-têtes HTTP de sécurité et les dépendances du projet.

**Résultats clés :**
- **6 failles critiques** permettant le contournement de paiements, l'escalade de privilèges, le téléversement non restreint de fichiers et l'accès non autorisé à des données personnelles.
- **6 faiblesses importantes** liées à l'absence d'expiration des jetons de session, aux attaques temporelles, au spoofing d'IP et à l'absence totale d'en-têtes HTTP de protection.
- **32 vulnérabilités de packages npm** répertoriées (dont 1 critique et 20 de niveau élevé).

---

## 2. Matrice des Risques & Vulnérabilités

| Réf. | Composant / Route | Vulnérabilité | Sévérité | Impact |
| :--- | :--- | :--- | :---: | :--- |
| **VULN-01** | `/api/upload` | Upload public non authentifié et sans validation de type | ✅ **Corrigé** | Auth requise, MIME whitelist, max 5 Mo, rate-limiting |
| **VULN-02** | `/api/vendor/profile` | Mass Assignment / Élévation de privilèges | ✅ **Corrigé** | Schéma Zod en liste blanche + suppression des champs sensibles |
| **VULN-03** | `/api/credits` | Attribution arbitraire de crédits sans paiement | ✅ **Neutralisé** | Modèle de crédits supprimé, route désactivée (410) |
| **VULN-04** | `/api/stripe/checkout` | Période d'essai infinie contrôlée par le client | ✅ **Corrigé** | Validation Zod stricte, suppression de trialDays client, rate-limit |
| **VULN-05** | `/api/wishlist/*` | Failles IDOR & fuite de données personnelles | ✅ **Corrigé** | Contrôle de propriété systématique, masquage des emails, blocage des contributions non payées |
| **VULN-06** | `/api/quiz/complete` | DoS financier / Épuisement de quota OpenAI | 🔴 **Critique** | Épuisement du solde OpenAI, facturation abusive |
| **VULN-07** | `lib/auth.ts` | Sessions JWT sans date d'expiration (`exp`) | 🟠 **Élevé** | Tokens valides indéfiniment si interceptés |
| **VULN-08** | `lib/auth.ts` | Timing Attack sur la signature HMAC | 🟠 **Élevé** | Fuite d'informations cryptographiques |
| **VULN-09** | `lib/rate-limit.ts` | Contournement du rate-limit par spoofing d'IP | 🟠 **Élevé** | Attaques par force brute sur le login / reset |
| **VULN-10** | `next.config.js` | Absence d'en-têtes HTTP de sécurité | 🟠 **Élevé** | Clickjacking, MIME sniffing, absence de CSP |
| **VULN-11** | `middleware.ts` | Filtrage Edge incomplet | 🟠 **Élevé** | Routes sensibles non protégées au niveau passerelle |
| **VULN-12** | `/api/admin/vendors/generate-passwords` | Mots de passe renvoyés en clair dans la réponse API | 🟠 **Élevé** | Fuite de credentials |
| **VULN-13** | `package.json` | 32 CVEs npm (Nodemailer, PostCSS, UUID, etc.) | 🟡 **Moyen** | ReDoS, Path Traversal dans les dépendances |

---

## 3. Détail des Vulnérabilités Critiques (P0)

### ✅ VULN-01 : Upload de fichiers public et non authentifié (RÉSOLU)
- **Emplacement :** `app/api/upload/route.ts`
- **Statut :** **Corrigé**
- **Mesures appliquées :**
  1. `await requireAuth();` obligatoire (retourne 401 si non connecté).
  2. Validation stricte du type MIME via une liste blanche (`image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/heic`, `image/heif`, `application/pdf`, Word, Excel, TXT).
  3. Rejet immédiat des extensions exécutables et dangereuses (`.exe`, `.sh`, `.php`, `.js`, `.html`, `.svg`, etc.).
  4. Plafond de taille strict fixé à 5 Mo maximum (`MAX_FILE_SIZE = 5 * 1024 * 1024`).
  5. Rate-limiting actif via `checkRateLimit` (20 requêtes / minute par couple utilisateur + IP).

---

### ✅ VULN-02 : Mass Assignment sur le profil prestataire (RÉSOLU)
- **Emplacement :** `app/api/vendor/profile/route.ts`
- **Statut :** **Corrigé**
- **Mesures appliquées :**
  1. Schéma Zod strict en liste blanche (`VendorProfileUpdateSchema`) n'autorisant que les champs métier éditables par le professionnel (coordonnées, description, styles, zone de chalandise, tarifs).
  2. Filtrage automatique par Zod de tout champ non autorisé (`status`, `verified`, `tier`, `credits`, `notes`, `reviewedAt`, `reviewedBy`).
  3. Barrière défensive supplémentaire avec suppression explicite (`delete updates.status`, etc.) avant écriture en base.
  4. Calcul sécurisé de la complétion du profil (`profileCompletion`) directement par le backend au lieu de faire confiance au client.
  5. Préservation des métadonnées de vérification Google Business contre toute altération.

---

### ✅ VULN-03 : Fraude aux crédits sans passer par Stripe (RÉSOLU)
- **Emplacement :** `app/api/credits/route.ts`
- **Statut :** **Neutralisé** — Les crédits ont été intégralement retirés du modèle économique et du code au profit des formules d'abonnement Stripe.
- **Action effectuée :** L'endpoint `app/api/credits/route.ts` a été désactivé (renvoie HTTP 410 Gone), le stockage et l'incrémentation des crédits ont été éliminés de `vendorProfileRepo` et de l'ensemble des flux de données.

---

### ✅ VULN-04 : Période d'essai infinie contrôlée par le client (RÉSOLU)
- **Emplacement :** `app/api/stripe/checkout/route.ts`
- **Statut :** **Corrigé**
- **Mesures appliquées :**
  1. Suppression intégrale du paramètre client `trialDays` : l'objet `subscriptionData` ne prend plus aucune instruction de durée d'essai depuis la requête HTTP.
  2. Validation Zod stricte du `planId` (`"essential" | "premium" | "elite"`).
  3. Vérification du rôle utilisateur (`vendor` ou `admin`).
  4. Mise en place d'un rate-limiting préventif (10 sessions de checkout / minute par utilisateur + IP).
  5. Toute attribution de période d'essai est réservée exclusivement aux administrateurs via l'API sécurisée `/api/admin/subscriptions/[id]`.

---

### ✅ VULN-05 : Failles IDOR & Fuite de données personnelles sur la Liste de Mariage (RÉSOLU)
- **Emplacement :**
  - `app/api/wishlist/items/[id]/route.ts`
  - `app/api/wishlist/items/route.ts`
  - `app/api/wishlist/purchases/route.ts`
  - `app/api/wishlist/public/route.ts`
- **Statut :** **Corrigé**
- **Mesures appliquées :**
  1. **Contrôle d'accès & IDOR :** Vérification stricte de la propriété (`wishlist.coupleId === user.id` ou `admin`) sur `DELETE /api/wishlist/items/[id]` et `POST /api/wishlist/items`. Un couple ne peut plus modifier ni supprimer les cadeaux d'une autre liste.
  2. **Confidentialité & RGPD :** L'endpoint public `/api/wishlist/public` masque automatiquement les adresses email des invités ayant contribué (`guestEmail` exclu de la réponse publique).
  3. **Protection des achats :** L'endpoint `GET /api/wishlist/purchases` est désormais strictement authentifié et réservé au couple propriétaire de la liste ou à l'administrateur.
  4. **Intégrité financière :** `POST /api/wishlist/purchases` rejette toute injection directe de contribution sans paiement (`405 Method Not Allowed`), garantissant que seules les contributions vérifiées par Stripe (via `/api/wishlist/checkout` et le webhook Stripe) peuvent être enregistrées.

---

### ✅ VULN-06 : Déni de service financier sur la génération IA (RÉSOLU)
- **Emplacement :** `app/api/quiz/complete/route.ts`
- **Statut :** **Corrigé**
- **Mesures appliquées :**
  1. **Validation stricte Zod du Payload :** Validation du format de `sessionId` (nanoid / regex alphanumérique sécurisée, longueur bornée) et de `durationSeconds`. Rejet immédiat (`400 Bad Request`) en cas de charge utile invalide.
  2. **Rate Limiting double barrière :**
     - **Par IP :** 5 finalisations max par heure et par adresse IP (`429 Too Many Requests` avec en-tête `Retry-After`).
     - **Par Session :** 2 requêtes max par tranche de 15 minutes par `sessionId` pour bloquer les boucles de re-jeu rapides.
  3. **Idempotence & Économie de tokens :** Si le plan IA (`session.aiOutput`) a déjà été généré pour la session, l'endpoint renvoie immédiatement `{ ok: true, ready: true, cached: true }` sans jamais réinvoquer les 4 modèles d'OpenAI.
  4. **Validation de complétude du quiz :** Vérification qu'au moins 2 questions du questionnaire sont remplies avant d'autoriser la génération, empêchant les robots de brûler des tokens sur des sessions vides.
  5. **Verrou anti-concurrence (Burst / Thundering Herd) :** Mise en place d'un verrou temporaire en cache `lock:ai-generating:${sessionId}` avec libération garantie dans un bloc `finally`, empêchant les requêtes simultanées de déclencher des générations OpenAI parallèles sur une même session.

---

## 4. Faiblesses Importantes d'Architecture & Auth (P1)

### ✅ VULN-07 : Absence de timestamp d'expiration (`exp`) dans les sessions (RÉSOLU)
- **Emplacement :** `lib/auth.ts`
- **Statut :** **Corrigé**
- **Mesures appliquées :**
  1. **Ajout des claims temporels :** Le payload signé intègre désormais systématiquement `iat` (heure de création) et `exp` (heure d'expiration fixée à 7 jours).
  2. **Contrôle strict à la vérification :** `verifySession()` vérifie que `payload.exp` est un nombre valide et que `Math.floor(Date.now() / 1000) <= payload.exp`. Si le jeton est expiré, falsifié ou dépourvu de timestamp d'expiration, il est immédiatement rejeté (`null`).
  3. **Synchronisation avec le cookie de session :** Le paramètre `maxAge` du cookie HTTP-only `wab_session` est strictement aligné sur la durée de vie du jeton (7 jours).

### ✅ VULN-08 : Attaque temporelle sur la vérification HMAC et mot de passe (RÉSOLU)
- **Emplacement :** `lib/auth.ts`
- **Statut :** **Corrigé**
- **Mesures appliquées :**
  1. **Signature HMAC sécurisée :** Remplacement de l'opérateur d'égalité classique `signature !== expected` par `crypto.timingSafeEqual(sigBuf, expBuf)` pour empêcher l'analyse différentielle de temps d'exécution (side-channel timing attack).
  2. **Vérification des mots de passe durcie :** `verifyPassword()` utilise également `timingSafeEqual()` pour comparer le hash dérivé PBKDF2 avec le hash stocké.

---

### ✅ VULN-09 : Contournement du Rate Limiting par usurpation d'IP (RÉSOLU)
- **Emplacement :** `lib/rate-limit.ts`, `app/api/auth/login/route.ts`, `app/api/auth/reset-password/request/route.ts`
- **Statut :** **Corrigé**
- **Mesures appliquées :**
  1. **Validation cryptographique et réseau de l'IP :** `getClientIp()` valide chaque adresse avec `net.isIP()` (IPv4 et IPv6), priorise l'en-tête de bord Cloudflare `cf-connecting-ip`, puis le proxy direct `x-real-ip`, et parcourt la chaîne `x-forwarded-for` de droite à gauche en rejetant toute charge injectée frauduleusement par le client.
  2. **Assainissement des clés de cache :** `checkRateLimit` assainit les clés de cache (`replace(/[^a-zA-Z0-9_\-.:@]/g, "_")`) empêchant toute injection de caractères de contrôle ou d'évasion de namespace Redis.
  3. **Double barrière de Rate Limiting sur `/api/auth/login` :**
     - **Protection globale IP :** 15 requêtes max par minute par IP.
     - **Protection ciblée par compte :** 5 tentatives infructueuses max par tranche de 15 minutes par email (`rate:login:account:${email}`). Empêche les attaques par dictionnaire distribuées (botnets multi-IP).
     - **Réinitialisation automatique :** Dès qu'un mot de passe valide est soumis, le compteur d'échecs du compte est réinitialisé avec `resetRateLimit()`.
  4. **Protection anti-spam de reset password :** Ajout d'une limite par email (3 demandes max par heure) sur `/api/auth/reset-password/request`.

---

### ✅ VULN-10 : Absence d'en-têtes HTTP de sécurité (RÉSOLU)
- **Emplacement :** `next.config.js`
- **Statut :** **Corrigé**
- **Mesures appliquées :**
  Configuration globale d'en-têtes HTTP stricts sur toutes les routes (`/:path*`) :
  1. `X-Frame-Options: DENY` : Empêche toute intégration de l'application dans des iframes externes (neutralisation totale des attaques de Clickjacking).
  2. `X-Content-Type-Options: nosniff` : Empêche les navigateurs de deviner le type MIME de fichiers malveillants masqués (MIME sniffing).
  3. `Referrer-Policy: strict-origin-when-cross-origin` : Protège la vie privée et les paramètres d'URL confidentiels lors de la navigation vers des domaines tiers.
  4. `Permissions-Policy: camera=(), microphone=(), geolocation=(self)` : Bloque l'accès non autorisé à la caméra et au microphone, et restreint la géolocalisation à notre propre domaine.
  5. `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS) : Force l'utilisation exclusive du protocole HTTPS sécurisé pendant 2 ans avec protection des sous-domaines.
  6. `X-DNS-Prefetch-Control: on` : Optimisation du préchargement DNS sécurisé.

---

## 5. Audit des Dépendances & CVEs NPM (P2)

L'audit automatisé `npm audit` remonte **32 vulnérabilités** :
- **1 Critique :** Dépendance transitive dans les outils de compilation / templating.
- **20 Élevées :**
  - `nodemailer` (< 10.0.9) : Déni de service par expression régulière (ReDoS) lors de l'analyse d'adresses email.
  - `postcss` (< 8.5.23) : Vulnérabilité de lecture de fichiers arbitraires et traversée de répertoires.
- **11 Modérées :** `uuid`, `protobufjs`, `teeny-request`.

---

## 6. Plan d'Action & Correctifs Recommandés

### Phase 1 : Correctifs Immédiats (Routes & Données)
- [x] Sécuriser `app/api/upload/route.ts` (Authentification, MIME, 5 Mo max, rate-limiting).
- [x] Corriger le Mass Assignment dans `app/api/vendor/profile/route.ts` avec un schéma Zod whitelist.
- [x] Désactiver le point d'entrée non sécurisé `app/api/credits/route.ts` (modèle de crédits supprimé).
- [x] Supprimer le paramètre client `trialDays` dans `app/api/stripe/checkout/route.ts`.
- [x] Sécuriser les routes wishlist contre l'IDOR (`items/[id]`, `items`, `purchases`, `public`).
- [x] Poser un rate-limit strict sur `app/api/quiz/complete/route.ts`.

### Phase 2 : Durcissement Auth & En-têtes HTTP
- [x] Ajouter l'expiration `exp` et `timingSafeEqual()` dans `lib/auth.ts`.
- [x] Configurer les en-têtes HTTP de sécurité dans `next.config.js`.
- [x] Verrouiller le rate-limiting sur le login par email + IP.

### Phase 3 : Maintenance & Dépendances
- [ ] Exécuter `npm update nodemailer postcss` pour corriger les failles ReDoS et Path Traversal.
- [ ] Prévoir la montée de version Next.js vers la dernière sous-version sécurisée de la branche 14.x.

---

## 7. Feuille de Route pour le Durcissement Continu
1. **Journalisation d'audit de sécurité (Security Audit Logs) :** Enregistrer dans une table dédiée toutes les actions sensibles (connexion échouée, changement de mot de passe, virement cagnotte, modification de statut prestataire).
2. **Rotation des sessions :** Invalider tous les jetons actifs lors d'un changement de mot de passe en ajoutant un champ `tokenVersion` sur l'utilisateur.
3. **Protection CSRF :** Vérifier systématiquement l'en-tête `Origin` ou `Sec-Fetch-Site` sur toutes les requêtes POST/PUT/DELETE.

---
*Ce document sert de référence technique pour sécuriser durablement la plateforme avant toute mise en production à grande échelle.*
