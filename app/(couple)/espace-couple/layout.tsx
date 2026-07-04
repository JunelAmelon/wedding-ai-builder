import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getFullUser } from "@/lib/auth";
import CoupleLayoutClient from "./CoupleLayoutClient";

export default async function CoupleLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get("wab_session")?.value;
  const sessionUser = token ? verifySession(token) : null;

  if (!sessionUser || sessionUser.role !== "couple") {
    redirect("/login?role=couple");
  }

  const user = await getFullUser(sessionUser.id);
  if (!user) {
    redirect("/login?role=couple");
  }

  return (
    <CoupleLayoutClient user={{ firstName: user.firstName, lastName: user.lastName, email: user.email, avatarUrl: user.avatarUrl }}>
      {children}
    </CoupleLayoutClient>
  );
}