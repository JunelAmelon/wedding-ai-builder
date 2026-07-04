"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Loader2 } from "lucide-react";
import { PageHeader, Card } from "../_ui";

export default function VendorNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login?role=vendor");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setNotifications(json.notifications || []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function markRead(id: string) {
    const res = await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  }

  async function markAllRead() {
    const res = await fetch("/api/notifications", { method: "PUT" });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  if (loading) return <div className="min-h-[80dvh] bg-background" />;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <PageHeader
        label="Notifications"
        title="Notifications"
        subtitle="Restez informé de vos opportunités."
      />

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full mb-3 bg-sky-100">
            <Bell size={24} className="text-sky-600" />
          </div>
          <p className="text-text-secondary italic">Aucune notification pour le moment.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`flex items-start justify-between p-4 ${n.read ? "opacity-70" : ""}`}
            >
              <div>
                <div className="font-medium text-text-primary">{n.title}</div>
                <div className="text-sm text-text-secondary">{n.message}</div>
                <div className="font-sans text-[10px] uppercase tracking-[0.08em] text-text-secondary mt-1">
                  {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="p-2 rounded-xl hover:bg-emerald-100 text-emerald-700 transition"
                  aria-label="Marquer comme lu"
                >
                  <Check size={18} />
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
