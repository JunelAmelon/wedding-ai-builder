"use client";

import LoadingScreen from "@/components/shared/LoadingScreen";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Megaphone, Heart, Wallet, Star } from "lucide-react";
import type { Notification } from "@/types/marketplace";

export default function VendorNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
      body: JSON.stringify({ notificationId: id }),
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "proposal":
        return <Megaphone size={20} />;
      case "match":
        return <Heart size={20} />;
      case "payment":
        return <Wallet size={20} />;
      case "review":
        return <Star size={20} />;
      default:
        return <Bell size={20} />;
    }
  }

  function getNotificationColor(type: string) {
    switch (type) {
      case "proposal":
        return "bg-[#fef2f4] text-[#0E0E10]";
      case "match":
        return "bg-[#fce7f3] text-[#831843]";
      case "payment":
        return "bg-[#dbeafe] text-[#1e3a8a]";
      case "review":
        return "bg-[#ffedd5] text-[#7c2d12]";
      default:
        return "bg-[#fef2f4] text-[#6B6B72]";
    }
  }

  if (loading) return <LoadingScreen minHeight="80dvh" />

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#6B6B72] mb-2">Notifications</p>
          <h1 className="font-allura text-3xl sm:text-4xl font-normal tracking-tight text-[#0E0E10]">
            <span className="text-[#e64a5d]">Notifications</span>
          </h1>
          <p className="text-[#6B6B72] mt-2">
            Restez informé de vos opportunités.
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-[32px] bg-white border border-[#EDEDF0] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-12 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full mb-3 bg-[#fef2f4]">
            <Bell size={24} className="text-[#0E0E10]" />
          </div>
          <p className="text-[#6B6B72] italic">Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="rounded-[32px] bg-white border border-[#EDEDF0] shadow-[0_40px_120px_rgba(14,14,16,0.18)] overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between p-4 border-b border-[#EDEDF0] last:border-b-0 ${n.read ? "opacity-70" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${getNotificationColor(n.type)}`}>
                  {getNotificationIcon(n.type)}
                </div>
                <div>
                  <div className="font-medium text-[#0E0E10]">{n.title}</div>
                  <div className="text-sm text-[#6B6B72]">{n.content}</div>
                  <div className="font-allura text-[10px] uppercase tracking-[0.08em] text-[#6B6B72] mt-1">
                    {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="p-2 rounded-xl hover:bg-[#fef2f4] text-[#0E0E10] transition"
                  aria-label="Marquer comme lu"
                >
                  <Check size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

