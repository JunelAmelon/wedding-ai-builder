"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, Search, Trash2, X, Mail, Calendar, User, MessageSquare, AlertCircle, CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import type { SupportTicket } from "@/types/admin";

const STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Fermé",
};
const STATUS_STYLES: Record<string, string> = {
  open: "bg-[#fee2e2] text-[#b91c1c]",
  in_progress: "bg-[#fef3c7] text-[#b45309]",
  resolved: "bg-[#e6f4ea] text-[#137333]",
  closed: "bg-[#f1f5f9] text-[#64748b]",
};
const STATUS_ICONS: Record<string, typeof AlertCircle> = {
  open: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle2,
  closed: XCircle,
};
const PRIORITY_LABELS: Record<string, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
};
const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-[#f1f5f9] text-[#64748b]",
  medium: "bg-[#fef3c7] text-[#b45309]",
  high: "bg-[#fee2e2] text-[#b91c1c]",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function fetchTickets() {
    const res = await fetch("/api/admin/support");
    const data = await res.json();
    setTickets(data.tickets || []);
    setLoading(false);
  }

  useEffect(() => { fetchTickets(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function updateTicket(id: string, updates: Partial<SupportTicket>) {
    const res = await fetch("/api/admin/support", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (res.ok) {
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, ...updates } : prev);
      showToast("Ticket mis à jour");
    } else {
      showToast("Erreur lors de la mise à jour");
    }
  }

  async function deleteTicket(id: string) {
    const res = await fetch(`/api/admin/support/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTickets((prev) => prev.filter((t) => t.id !== id));
      setConfirmDelete(null);
      if (selected?.id === id) setSelected(null);
      showToast("Ticket supprimé");
    } else {
      showToast("Erreur lors de la suppression");
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchesQuery = !q || `${t.subject} ${t.message} ${t.userEmail}`.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [tickets, query, statusFilter, priorityFilter]);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    high: tickets.filter((t) => t.priority === "high" && t.status !== "resolved" && t.status !== "closed").length,
  }), [tickets]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-[#db2777]" size={24} /></div>;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', var(--font-sans), Inter, system-ui, sans-serif" }}>
      <div>
        <h1 className="text-2xl font-semibold font-display text-[#0f172a]">Support</h1>
        <p className="text-sm mt-1 text-[#64748b]">Gérer les tickets utilisateurs</p>
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#0f172a] text-white text-sm shadow-lg animate-in">
          {toast}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-[16px] border border-[#f1f5f9] p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={16} className="text-[#64748b]" />
            <span className="text-xs text-[#64748b]">Total</span>
          </div>
          <p className="text-2xl font-semibold text-[#0f172a]">{stats.total}</p>
        </div>
        <div className="bg-white rounded-[16px] border border-[#f1f5f9] p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={16} className="text-[#b91c1c]" />
            <span className="text-xs text-[#64748b]">Ouverts</span>
          </div>
          <p className="text-2xl font-semibold text-[#b91c1c]">{stats.open}</p>
        </div>
        <div className="bg-white rounded-[16px] border border-[#f1f5f9] p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-[#b45309]" />
            <span className="text-xs text-[#64748b]">En cours</span>
          </div>
          <p className="text-2xl font-semibold text-[#b45309]">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-[16px] border border-[#f1f5f9] p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={16} className="text-[#db2777]" />
            <span className="text-xs text-[#64748b]">Priorité haute</span>
          </div>
          <p className="text-2xl font-semibold text-[#db2777]">{stats.high}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#f1f5f9] bg-white text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[#f1f5f9] px-4 py-2.5 text-sm bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
        >
          <option value="all">Tous les statuts</option>
          <option value="open">Ouvert</option>
          <option value="in_progress">En cours</option>
          <option value="resolved">Résolu</option>
          <option value="closed">Fermé</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-[#f1f5f9] px-4 py-2.5 text-sm bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
        >
          <option value="all">Toutes priorités</option>
          <option value="high">Haute</option>
          <option value="medium">Moyenne</option>
          <option value="low">Basse</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] border border-[#f1f5f9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#f1f5f9] bg-[#f8fafc]">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Utilisateur</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Sujet</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Statut</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Priorité</th>
                <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Date</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-[#64748b]">Aucun ticket</td></tr>
              )}
              {filtered.map((t) => {
                const StatusIcon = STATUS_ICONS[t.status] || AlertCircle;
                return (
                  <tr key={t.id} className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc]/50 cursor-pointer" onClick={() => setSelected(t)}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#0f172a]">{t.userEmail}</p>
                      <p className="text-xs capitalize text-[#94a3b8]">{t.userRole}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="font-medium truncate text-[#0f172a]">{t.subject}</p>
                      <p className="text-xs truncate text-[#94a3b8]">{t.message}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[t.status]}`}>
                        <StatusIcon size={10} />
                        {STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_STYLES[t.priority]}`}>
                        {PRIORITY_LABELS[t.priority]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#64748b]">
                      {new Date(t.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelected(t)}
                          className="p-1.5 rounded-lg bg-[#fce7f3] text-[#db2777] hover:bg-[#fbcfe8]"
                          title="Voir le détail"
                        >
                          <Eye size={16} />
                        </button>
                        {confirmDelete === t.id ? (
                          <>
                            <button
                              onClick={() => deleteTicket(t.id)}
                              className="px-2 py-1.5 rounded-lg text-xs font-medium bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca]"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f8fafc]"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(t.id)}
                            className="p-1.5 rounded-lg bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca]"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-[20px] border border-[#f1f5f9] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
              <h2 className="text-base font-semibold font-display text-[#0f172a]">Ticket #{selected.id.slice(0, 8)}</h2>
              <button onClick={() => setSelected(null)} className="h-8 w-8 rounded-full flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* User info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-[#fce7f3] text-[#db2777] flex items-center justify-center">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#64748b]">Email</p>
                    <p className="text-sm font-medium text-[#0f172a] truncate">{selected.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">Rôle</p>
                    <p className="text-sm font-medium text-[#0f172a] capitalize">{selected.userRole}</p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs text-[#64748b] mb-1">Sujet</p>
                <p className="text-base font-semibold text-[#0f172a]">{selected.subject}</p>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs text-[#64748b] mb-1">Message</p>
                <div className="rounded-xl bg-[#f8fafc] border border-[#f1f5f9] p-4 text-sm text-[#1e293b] whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-[#64748b]">
                <Calendar size={14} />
                Créé le {new Date(selected.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#f1f5f9]">
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1.5">Statut</label>
                  <select
                    value={selected.status}
                    onChange={(e) => updateTicket(selected.id, { status: e.target.value as SupportTicket["status"] })}
                    className="w-full px-3 py-2 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
                  >
                    <option value="open">Ouvert</option>
                    <option value="in_progress">En cours</option>
                    <option value="resolved">Résolu</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1.5">Priorité</label>
                  <select
                    value={selected.priority}
                    onChange={(e) => updateTicket(selected.id, { priority: e.target.value as SupportTicket["priority"] })}
                    className="w-full px-3 py-2 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-1.5">Assigné à (ID admin)</label>
                <input
                  value={selected.assignedTo || ""}
                  onChange={(e) => setSelected({ ...selected, assignedTo: e.target.value })}
                  onBlur={(e) => updateTicket(selected.id, { assignedTo: e.target.value || null })}
                  placeholder="Non assigné"
                  className="w-full px-3 py-2 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-6 border-t border-[#f1f5f9]">
              <button
                onClick={() => { setConfirmDelete(selected.id); }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm text-[#b91c1c] hover:bg-[#fee2e2] border border-[#fee2e2]"
              >
                <Trash2 size={16} /> Supprimer
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-[10px] text-sm font-medium text-white bg-[#db2777] hover:bg-[#be185d]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation (from modal) */}
      {confirmDelete && selected && confirmDelete === selected.id && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl border border-[#f1f5f9] shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-[#0f172a] mb-2">Supprimer ce ticket ?</h3>
            <p className="text-sm text-[#64748b] mb-5">Cette action est irréversible.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-[10px] text-sm text-[#64748b] hover:bg-[#f8fafc]">Annuler</button>
              <button onClick={() => deleteTicket(selected.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium text-white bg-[#b91c1c] hover:bg-[#991b1b]">
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
