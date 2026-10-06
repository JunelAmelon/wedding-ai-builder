import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac, randomBytes, pbkdf2Sync, timingSafeEqual } from "crypto";
import type { UserAccount } from "@/types/marketplace";
import type { AdminRole } from "@/types/admin";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { env } from "@/lib/env";

const COOKIE_NAME = "wab_session";
const JWT_SECRET = env.JWT_SECRET;
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 jours

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserAccount["role"];
  adminRole?: AdminRole;
}

export interface SessionPayload extends SessionUser {
  iat: number;
  exp: number;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 32, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
  try {
    const [salt, hash] = hashed.split(":");
    if (!salt || !hash) return false;
    const derived = pbkdf2Sync(password, salt, 100000, 32, "sha512").toString("hex");
    const derivedBuf = Buffer.from(derived);
    const hashBuf = Buffer.from(hash);
    if (derivedBuf.length !== hashBuf.length) return false;
    return timingSafeEqual(derivedBuf, hashBuf);
  } catch {
    return false;
  }
}

export function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function signSession(payload: SessionPayload): string {
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = createHmac("sha256", JWT_SECRET).update(payloadStr).digest("hex");
  return `${payloadStr}.${signature}`;
}

export function verifySession(token: string): SessionUser | null {
  try {
    const [payloadStr, signature] = token.split(".");
    if (!payloadStr || !signature) return null;

    const expected = createHmac("sha256", JWT_SECRET).update(payloadStr).digest("hex");

    // VULN-08: Protection contre les attaques temporelles (timing attacks)
    if (!safeCompare(signature, expected)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
    if (!payload || typeof payload !== "object") return null;

    // VULN-07: Vérification stricte du timestamp d'expiration
    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now > payload.exp) {
      return null;
    }

    // Validation d'intégrité des champs minimaux
    if (!payload.id || !payload.email || !payload.role) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      firstName: payload.firstName || "",
      lastName: payload.lastName || "",
      role: payload.role,
      ...(payload.adminRole ? { adminRole: payload.adminRole } : {}),
    };
  } catch {
    return null;
  }
}

export function createSession(user: UserAccount | SessionUser): string {
  const now = Math.floor(Date.now() / 1000);
  return signSession({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    ...(user.adminRole ? { adminRole: user.adminRole } : {}),
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
  });
}

export function getSessionUser(): SessionUser | null {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(COOKIE_NAME);
}

export async function requireAuth(): Promise<SessionUser> {
  const user = getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getFullUser(userId: string): Promise<UserAccount | null> {
  return userRepo.get(userId);
}

export async function requireAdmin(minRole?: "superadmin" | "moderator" | "support" | "commercial") {
  const sessionUser = getSessionUser();
  if (!sessionUser) throw new Error("Unauthorized");
  const user = await userRepo.get(sessionUser.id);
  if (!user || user.role !== "admin") throw new Error("Forbidden");
  if (!minRole) return user;
  const hierarchy: Record<string, number> = { commercial: 1, support: 2, moderator: 3, superadmin: 4 };
  const userLevel = hierarchy[user.adminRole || "commercial"];
  const requiredLevel = hierarchy[minRole];
  if (userLevel < requiredLevel) throw new Error("Forbidden");
  return user;
}
