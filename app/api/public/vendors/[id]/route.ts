import { NextResponse } from "next/server";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";

function pickPublicVendor(vendor: any) {
  return {
    id: vendor.id,
    companyName: vendor.companyName,
    brandName: vendor.brandName,
    logo: vendor.logo,
    description: vendor.description,
    serviceCategory: vendor.serviceCategory,
    otherCategory: vendor.otherCategory,
    styles: vendor.styles,
    yearsOfExperience: vendor.yearsOfExperience,
    website: vendor.website,
    priceRange: vendor.priceRange,
    pricingDetails: vendor.pricingDetails,
    serviceArea: vendor.serviceArea,
    portfolio: vendor.portfolio,
    address: vendor.address
      ? {
          city: vendor.address.city,
          country: vendor.address.country,
        }
      : null,
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vendor = await vendorProfileRepo.get(id);
    if (!vendor) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    if (vendor.status !== "approved") {
      return NextResponse.json({ error: "Profil non disponible" }, { status: 404 });
    }
    return NextResponse.json({ vendor: pickPublicVendor(vendor) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
