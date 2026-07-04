import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import CoupleLayoutClient from "./CoupleLayoutClient";

export default async function CoupleLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get("wab_session")?.value;
  const user = token ? verifySession(token) : null;

  if (!user || user.role !== "couple") {
    redirect("/login?role=couple");
  }

  return (
    <CoupleLayoutClient user={{ firstName: user.firstName, lastName: user.lastName, email: user.email }}>
      {children}
    </CoupleLayoutClient>
  );
}