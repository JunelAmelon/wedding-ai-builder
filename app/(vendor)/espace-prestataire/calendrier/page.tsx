"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Plus, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import VendorLayoutClient from "../VendorLayoutClient";

interface WeddingEvent {
  id: string;
  coupleName: string;
  date: string;
  location: string;
  status: "confirmed" | "pending" | "external";
  budget?: number;
  source: "platform" | "external";
  notes?: string;
}

export default function VendorCalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    coupleName: "",
    date: "",
    location: "",
    budget: "",
    notes: "",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await fetch("/api/vendor/calendar");
      if (res.status === 401) {
        router.push("/login?role=vendor");
        return;
      }
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error loading calendar:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addExternalEvent() {
    if (!newEvent.coupleName || !newEvent.date) return;
    
    try {
      const res = await fetch("/api/vendor/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleName: newEvent.coupleName,
          date: newEvent.date,
          location: newEvent.location,
          budget: newEvent.budget ? Number(newEvent.budget) : null,
          notes: newEvent.notes,
          source: "external",
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'ajout");
      
      setNewEvent({ coupleName: "", date: "", location: "", budget: "", notes: "" });
      setShowAddModal(false);
      loadEvents();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "confirmed":
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><CheckCircle2 size={12} /> Confirmé</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"><Clock size={12} /> En attente</span>;
      case "external":
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"><ExternalLink size={12} /> Hors plateforme</span>;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <VendorLayoutClient>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du calendrier...</p>
          </div>
        </div>
      </VendorLayoutClient>
    );
  }

  return (
    <VendorLayoutClient>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 lg:py-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b8b86] mb-2">Calendrier</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
              Vos mariages
            </h1>
            <p className="text-[#8b8b86] mt-2 max-w-md">
              Gérez vos mariages bookés via Mariage Facile et ajoutez vos mariages hors plateforme pour optimiser votre disponibilité.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1c1c1c] text-white rounded-lg font-medium hover:bg-[#333] transition-colors"
          >
            <Plus size={16} />
            Ajouter un mariage
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total mariages</div>
            <div className="text-2xl font-bold text-[#1c1c1c]">{events.length}</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Via plateforme</div>
            <div className="text-2xl font-bold text-[#1c1c1c]">{events.filter(e => e.source === "platform").length}</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Hors plateforme</div>
            <div className="text-2xl font-bold text-[#1c1c1c]">{events.filter(e => e.source === "external").length}</div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {events.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun mariage planifié</h3>
              <p className="text-gray-600 mb-4">Commencez par ajouter vos mariages bookés ou ceux reçus via la plateforme.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1c1c1c] text-white rounded-lg font-medium hover:bg-[#333] transition-colors"
              >
                <Plus size={16} />
                Ajouter un mariage
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {events
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((event) => (
                  <div key={event.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-[#1c1c1c]">{event.coupleName}</h3>
                          {getStatusBadge(event.status)}
                          {event.source === "platform" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#f4f1f7] text-[#1c1c1c] rounded-full text-xs font-medium">
                              Via Mariage Facile
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(event.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {event.location}
                          </div>
                          {event.budget && (
                            <div className="flex items-center gap-1">
                              <span>Budget : {event.budget.toLocaleString("fr-FR")} €</span>
                            </div>
                          )}
                        </div>
                        {event.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#ececec] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#ececec] flex items-center justify-center text-[#6b7076] hover:text-[#15181c] hover:bg-[#ececec] transition"
                aria-label="Fermer"
              >
                <XCircle size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#cbd5e1] flex items-center justify-center">
                  <Calendar size={26} className="text-[#15181c]" />
                </div>
                <div>
                  <p className="text-[#6b7076] text-xs font-bold font-sans uppercase tracking-wider">Calendrier</p>
                  <h2 className="font-display text-2xl font-bold text-[#15181c]">Ajouter un mariage</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                    Noms des mariés *
                  </label>
                  <input
                    type="text"
                    value={newEvent.coupleName}
                    onChange={(e) => setNewEvent({ ...newEvent, coupleName: e.target.value })}
                    placeholder="Ex. Marie & Pierre"
                    className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                    Date du mariage *
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                    Lieu *
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Ex. Château de Versailles"
                    className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                    Budget (optionnel)
                  </label>
                  <input
                    type="number"
                    value={newEvent.budget}
                    onChange={(e) => setNewEvent({ ...newEvent, budget: e.target.value })}
                    placeholder="Ex. 15000"
                    className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
                  />
                </div>

                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={newEvent.notes}
                    onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                    rows={3}
                    placeholder="Détails supplémentaires..."
                    className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 px-4 rounded-full border-2 border-[#ececec] bg-[#ffffff] text-sm font-bold font-sans text-[#15181c] hover:bg-[#ececec] transition"
                >
                  Annuler
                </button>
                <button
                  onClick={addExternalEvent}
                  disabled={!newEvent.coupleName || !newEvent.date}
                  className="flex-1 py-3.5 px-4 rounded-full bg-[#f4f1f7] text-[#15181c] font-bold font-sans hover:bg-[#94a3b8] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorLayoutClient>
  );
}

