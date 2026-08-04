import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import VendorLayoutClient from "./VendorLayoutClient";

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get("wab_session")?.value;
  const user = token ? verifySession(token) : null;

  if (!user || user.role !== "vendor") {
    redirect("/login?role=vendor");
  }

  const profile = await vendorProfileRepo.getByUserId(user.id);

  if (!profile || profile.status !== "approved") {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-6">⏳</div>
          <h1 className="font-serif text-2xl font-bold text-text-primary mb-3">
            Profil en cours de validation
          </h1>
          <p className="text-text-secondary leading-relaxed">
            Votre profil professionnel est actuellement examiné par notre équipe. Vous recevrez un email dès qu&apos;il sera approuvé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <VendorLayoutClient
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyName: profile.companyName,
        brandName: profile.brandName,
        logo: profile.logo,
      }}
    >
      {children}
    </VendorLayoutClient>
  );
}
