import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminRepo } from "@/lib/db/repositories/adminRepo";
import { sendEmail } from "@/lib/email/send";
import { supportTicketUpdatedEmail } from "@/lib/email/emails";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const ticket = await adminRepo.getTicket(params.id);
    if (!ticket) return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
    return NextResponse.json({ ticket });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    await adminRepo.updateTicket(params.id, body);

    // Send email to the user about the ticket update
    try {
      const ticket = await adminRepo.getTicket(params.id);
      if (ticket?.userEmail) {
        const { subject, html } = supportTicketUpdatedEmail({
          userEmail: ticket.userEmail,
          ticketId: ticket.id,
          status: body.status || ticket.status || "mis à jour",
          reply: body.reply,
          supportUrl: `${APP_URL}/support`,
        });
        await sendEmail({ to: ticket.userEmail, subject, html });
      }
    } catch (emailErr) {
      console.error("[admin/support] Erreur envoi email:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin("superadmin");
    await adminRepo.deleteTicket(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
