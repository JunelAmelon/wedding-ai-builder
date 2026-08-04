"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, Euro, Check, X, Download } from "lucide-react";

const SAGE = "#D8ECD9";
const INK = "#1c1c1c";

interface CagnotteItem {
  wishlist: { id: string; title: string; shareToken: string };
  couple: { firstName: string; lastName: string; email: string; phone: string | null } | null;
  totalPurchased: number;
  totalPayouts: number;
  remaining: number;
}

export default function AdminCagnottesPage() {
  const [items, setItems] = useState<CagnotteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CagnotteItem | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Virement SEPA");
  const [status, setStatus] = useState<"pending" | "completed">("completed");
  const [note, setNote] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cagnottes");
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setItems(data.cagnottes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      `${i.couple?.firstName} ${i.couple?.lastName} ${i.couple?.email} ${i.wishlist.title}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  function openModal(item: CagnotteItem) {
    setSelected(item);
    setAmount(item.remaining.toString());
    setMethod("Virement SEPA");
    setStatus("completed");
    setNote("");
    setPaidAt(new Date().toISOString().split("T")[0]);
    setError("");
  }

  function closeModal() {
    setSelected(null);
  }

  async function savePayout() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/cagnottes/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wishlistId: selected.wishlist.id,
          amount: parseFloat(amount),
          method,
          status,
          note,
          paidAt,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }
      closeModal();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  function exportCSV() {
    const header = ["Titre", "Couple", "Email", "Téléphone", "Récolté (€)", "Reversé (€)", "Reste (€)"];
    const rows = filtered.map((item) => [
      item.wishlist.title,
      item.couple ? `${item.couple.firstName} ${item.couple.lastName}` : "-",
      item.couple?.email || "-",
      item.couple?.phone || "-",
      String(item.totalPurchased),
      String(item.totalPayouts),
      String(item.remaining),
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cagnottes-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-display" style={{ color: INK }}>Cagnottes à reverser</h1>
          <p className="text-sm mt-1" style={{ color: `${INK}99` }}>{filtered.length} liste(s)</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#1c1c1c]/10 text-sm font-medium hover:bg-[#1c1c1c]/5 transition"
            style={{ color: INK }}
          >
            <Download size={16} />
            Exporter CSV
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: `${INK}99` }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-[#1c1c1c]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: INK }} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#1c1c1c]/10 shadow-[0_8px_30px_rgba(11,15,26,0.04)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1c1c1c]/10" style={{ backgroundColor: SAGE }}>
              <tr>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Liste</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Couple</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Email</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Récolté</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Reversé</th>
                <th className="text-left px-5 py-3 font-medium" style={{ color: `${INK}99` }}>Reste</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.wishlist.id} className="border-b border-[#1c1c1c]/5 hover:bg-[#1c1c1c]/[0.02]">
                  <td className="px-5 py-3.5 font-medium" style={{ color: INK }}>{item.wishlist.title}</td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>
                    {item.couple ? `${item.couple.firstName} ${item.couple.lastName}` : "-"}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>{item.couple?.email || "-"}</td>
                  <td className="px-5 py-3.5" style={{ color: INK }}>{item.totalPurchased.toLocaleString("fr-FR")} €</td>
                  <td className="px-5 py-3.5" style={{ color: `${INK}99` }}>{item.totalPayouts.toLocaleString("fr-FR")} €</td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: item.remaining > 0 ? "#3C8552" : `${INK}99` }}>
                    {item.remaining.toLocaleString("fr-FR")} €
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {item.remaining > 0 ? (
                      <button
                        onClick={() => openModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
                        style={{ backgroundColor: SAGE, color: INK }}
                      >
                        <Euro size={14} />
                        Marquer reversé
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[#3C8552]">
                        <Check size={14} /> Soldé
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center" style={{ color: `${INK}99` }}>
                    Aucune cagnotte trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold font-display" style={{ color: INK }}>Marquer un reversement</h2>
              <button
                onClick={closeModal}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#1c1c1c]/5"
              >
                <X size={18} style={{ color: `${INK}99` }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: `${INK}99` }}>Liste</label>
                <div className="font-medium" style={{ color: INK }}>{selected.wishlist.title}</div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: `${INK}99` }}>Montant reversé (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0.01}
                  max={selected.remaining}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#1c1c1c]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: `${INK}99` }}>Méthode</label>
                <input
                  type="text"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#1c1c1c]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: `${INK}99` }}>Statut</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "pending" | "completed")}
                  className="w-full px-3 py-2 rounded-xl border border-[#1c1c1c]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60 bg-white"
                >
                  <option value="completed">Virement effectué</option>
                  <option value="pending">Virement en attente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: `${INK}99` }}>Date du reversement</label>
                <input
                  type="date"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#1c1c1c]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: `${INK}99` }}>Note (optionnel)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-[#1c1c1c]/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#f4f1f7]/60 resize-none"
                />
              </div>

              {error && <p className="text-sm text-rose-600">{error}</p>}

              <button
                onClick={savePayout}
                disabled={saving || !amount || Number(amount) <= 0 || Number(amount) > selected.remaining}
                className="w-full py-2.5 rounded-xl text-white font-medium transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: INK }}
              >
                {saving ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Enregistrer le reversement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
