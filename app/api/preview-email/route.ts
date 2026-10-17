import { NextResponse } from "next/server";
import {
  welcomeCoupleEmail,
  newTenderEmail,
  newProposalEmail,
  vendorApprovedEmail,
} from "@/lib/email/emails";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "tender";

  let result;

  switch (type) {
    case "welcome-couple":
      result = welcomeCoupleEmail({
        firstName: "Sophie",
        verifyUrl: "http://localhost:3000/verify?token=example",
      });
      break;
    case "proposal-couple":
      result = newProposalEmail({
        coupleFirstName: "Sophie",
        vendorName: "Château de Montmirail",
        category: "Château mariage",
        amount: 6800,
        tenderUrl: "http://localhost:3000/espace-couple/prestataires",
      });
      break;
    case "vendor-approved":
      result = vendorApprovedEmail({
        firstName: "Éléonore",
        companyName: "Château de Montmirail",
        loginUrl: "http://localhost:3000/login?role=vendor",
        tempPassword: "Password123!",
      });
      break;
    case "tender":
    default:
      result = newTenderEmail({
        vendorFirstName: "Éléonore",
        category: "Château mariage",
        budgetMin: 5000,
        budgetMax: 9000,
        city: "Chantilly (60)",
        weddingDate: "2027-06-19",
        tenderUrl: "http://localhost:3000/espace-prestataire/opportunites",
      });
      break;
  }

  return new Response(result.html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
