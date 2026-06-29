"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SharePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<{ riskScore: number; sessionId: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/share/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = (await res.json()) as { riskScore: number; sessionId: string };
        setRecord(data);
      } catch {
        setError("Lien invalide.");
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  if (loading) return <div className="min-h-[100dvh] bg-background" />;
  if (error) return <div className="min-h-[100dvh] bg-background p-6">{error}</div>;

  return (
    <div className="min-h-[100dvh] bg-background px-6 py-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Wedding Risk Score</h1>
      <p className="text-text-secondary">Score partagé: {record?.riskScore}/100</p>
    </div>
  );
}
