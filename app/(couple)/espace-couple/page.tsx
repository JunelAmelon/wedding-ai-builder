"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CoupleDashboardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/espace-couple/result");
  }, [router]);
  return <div className="min-h-[80dvh] bg-surface" />;
}
