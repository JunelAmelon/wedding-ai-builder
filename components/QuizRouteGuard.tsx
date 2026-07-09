"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const QUIZ_PATHS = ["/quiz/", "/gate"];

export function QuizRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const previous = previousPathRef.current;
    const current = pathname;

    if (
      previous &&
      (previous === "/gate" || previous.startsWith("/quiz/")) &&
      current !== "/gate" &&
      !current?.startsWith("/quiz/") &&
      !current?.startsWith("/espace-couple")
    ) {
      window.localStorage.removeItem("wab_quiz_state");
    }

    previousPathRef.current = current ?? null;
  }, [pathname]);

  return <>{children}</>;
}
