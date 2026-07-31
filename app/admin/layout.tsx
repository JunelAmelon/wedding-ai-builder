import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getFullUser } from "@/lib/auth";
import AdminLayoutClient from "@/app/admin/AdminLayoutClient";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get("wab_session")?.value;
  const sessionUser = token ? verifySession(token) : null;

  if (!sessionUser || sessionUser.role !== "admin") {
    redirect("/admin-login");
  }

  const user = await getFullUser(sessionUser.id);
  if (!user || user.role !== "admin") {
    redirect("/admin-login");
  }

  return (
    <AdminLayoutClient
      user={{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        adminRole: user.adminRole || "commercial",
      }}
    >
      {children}
    </AdminLayoutClient>
  );
}
