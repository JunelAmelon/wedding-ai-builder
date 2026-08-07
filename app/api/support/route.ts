import { NextResponse } from "next/server";
import { z } from "zod";
import { adminRepo } from "@/lib/db/repositories/adminRepo";
import { getSessionUser } from "@/lib/auth";
import { userRepo } from "@/lib/db/repositories/userRepo";

export const dynamic = "force-dynamic";

const CreateTicketSchema = z.object({
  subject: z.string().min(3, "Le sujet doit faire au moins 3 caractères").max(200),
  message: z.string().min(10, "Le message doit faire au moins 10 caractères").max(5000),
  email: z.string().email().optional(),
  name: z.string().optional(),
});

// GET: list tickets for the authenticated user
export async function GET() {
  try {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      console.log("[support/GET] No session user found");
      return NextResponse.json({ error: "Non connecté" }, { status: 401 });
    }
    console.log("[support/GET] Session user:", sessionUser.id, sessionUser.email);
    const tickets = await adminRepo.listTicketsByUser(sessionUser.id);
    console.log("[support/GET] Found", tickets.length, "tickets for user", sessionUser.id);
    return NextResponse.json({ tickets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    console.error("[support/GET] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: create a ticket (authenticated or anonymous)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const { subject, message, email, name } = parsed.data;
    const sessionUser = getSessionUser();
    console.log("[support/POST] Session user:", sessionUser ? `${sessionUser.id} (${sessionUser.email})` : "null");

    let userId = "anonymous";
    let userEmail = email || "";
    let userRole: "couple" | "vendor" | "admin" = "couple";

    if (sessionUser) {
      const user = await userRepo.get(sessionUser.id);
      if (user) {
        userId = user.id;
        userEmail = user.email;
        userRole = user.role;
      } else {
        console.log("[support/POST] Session user not found in DB, using session data");
        userId = sessionUser.id;
        userEmail = sessionUser.email;
        userRole = sessionUser.role;
      }
    } else {
      // Anonymous ticket — require email
      if (!email) {
        return NextResponse.json({ error: "L'email est requis pour un ticket anonyme" }, { status: 400 });
      }
      // Check if the email matches an existing user
      const existing = await userRepo.getByEmail(email);
      if (existing) {
        userId = existing.id;
        userEmail = existing.email;
        userRole = existing.role;
      }
    }

    console.log("[support/POST] Creating ticket with userId:", userId, "userEmail:", userEmail);

    const ticket = await adminRepo.createTicket({
      userId,
      userEmail,
      userRole,
      subject,
      message,
      status: "open",
      priority: "medium",
      assignedTo: null,
    } as any);

    console.log("[support/POST] Ticket created:", ticket.id, "for user:", ticket.userId);
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    console.error("[support/create]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
