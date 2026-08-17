import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac, randomBytes, pbkdf2Sync } from "crypto";
import type { UserAccount } from "@/types/marketplace";
import type { AdminRole } from "@/types/admin";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { env } from "@/lib/env";

const COOKIE_NAME = "wab_session";
const JWT_SECRET = env.JWT_SECRET;

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserAccount["role"];
  adminRole?: AdminRole;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 32, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
  const [salt, hash] = hashed.split(":");
  const derived = pbkdf2Sync(password, salt, 100000, 32, "sha512").toString("hex");
  return derived === hash;
}

function signSession(payload: SessionUser): string {
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = createHmac("sha256", JWT_SECRET).update(payloadStr).digest("hex");
  return `${payloadStr}.${signature}`;
}

export function verifySession(token: string): SessionUser | null {
  try {
    const [payloadStr, signature] = token.split(".");
    if (!payloadStr || !signature) return null;
    const expected = createHmac("sha256", JWT_SECRET).update(payloadStr).digest("hex");
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
    return payload as SessionUser;
  } catch {
    return null;
  }
}

export function createSession(user: UserAccount): string {
  return signSession({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    adminRole: user.adminRole,
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
    maxAge: 60 * 60 * 24 * 7,
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
