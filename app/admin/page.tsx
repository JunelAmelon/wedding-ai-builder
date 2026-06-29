"use client";

import { useEffect, useState } from "react";
import { Lock, Users, Briefcase, FileText, CheckCircle2, XCircle, Clock, ExternalLink, Search, Calendar, Mail, Phone, MapPin, ArrowLeft, ShieldCheck, Trash2, Save } from "lucide-react";
import Link from "next/link";
import type { Lead, VendorApplication } from "@/types/domain";

const STATUS_LABELS: Record<VendorApplication["status"], string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
};

const STATUS_COLORS: Record<VendorApplication["status"], string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendors, setVendors] = useState<VendorApplication[]>([]);
  const [activeTab, setActiveTab] = useState<"leads" | "vendors">("leads");
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<VendorApplication | null>(null);
  const [notes, setNotes] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/data", {
        headers: { authorization: `Bearer ${password}` },
      });
      if (!res.ok) throw new Error("Mot de passe incorrect");
      const data = (await res.json()) as { leads: Lead[]; vendorApplications: VendorApplication[] };
      setToken(password);
      setLeads(data.leads);
      setVendors(data.vendorApplications);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Session expirée");
      const data = (await res.json()) as { leads: Lead[]; vendorApplications: VendorApplication[] };
      setLeads(data.leads);
      setVendors(data.vendorApplications);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  async function updateVendorStatus(id: string, status: VendorApplication["status"]) {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/vendor/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error("Échec de la mise à jour");
      const data = (await res.json()) as { application: VendorApplication };
      setVendors((prev) => prev.map((v) => (v.id === id ? data.application : v)));
      setSelectedVendor(data.application);
      setNotes("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  }

  useEffect(() => {
    if (token) refresh();
  }, []);

  const filteredLeads = leads.filter((l) =>
    [l.email, l.whatsapp, l.source].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const filteredVendors = vendors.filter((v) =>
    [v.companyName, v.email, v.phone, v.serviceCategory, v.contactName].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  if (!token) {
    return (
      <main className="min-h-[100dvh] bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-[0_30px_80px_rgba(11,15,26,0.08)]">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-6">
            <Lock className="text-primary" size={32} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-text-primary text-center mb-2">Espace Superadmin</h1>
          <p className="text-text-secondary text-center text-sm mb-6">Saisissez le mot de passe admin pour accéder aux soumissions.</p>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe admin"
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-white font-semibold disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Accéder au dashboard"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition">
              <ArrowLeft size={16} /> Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-background">
      <div className="border-b border-black/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-primary" size={24} />
            <h1 className="font-serif text-xl font-semibold text-text-primary">Superadmin</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="text-sm text-text-secondary hover:text-text-primary transition"
              disabled={loading}
            >
              {loading ? "Chargement..." : "Actualiser"}
            </button>
            <Link href="/" className="text-sm text-text-secondary hover:text-text-primary transition">
              Accueil
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-black/10 p-1">
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "leads" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Users size={16} /> Mariés ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab("vendors")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "vendors" ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Briefcase size={16} /> Professionnels ({vendors.length})
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full rounded-xl border border-black/10 pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {activeTab === "leads" && (
          <div className="rounded-2xl border border-black/10 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface text-text-secondary">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Email</th>
                    <th className="text-left px-4 py-3 font-medium">WhatsApp</th>
                    <th className="text-left px-4 py-3 font-medium">Source</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-surface/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-text-secondary" />
                          {lead.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">{lead.whatsapp || "—"}</td>
                      <td className="px-4 py-3"><span className="capitalize">{lead.source}</span></td>
                      <td className="px-4 py-3 text-text-secondary">{new Date(lead.capturedAt).toLocaleString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredLeads.length === 0 && <p className="p-6 text-center text-text-secondary">Aucune soumission marié.</p>}
          </div>
        )}

        {activeTab === "vendors" && (
          <div className="grid gap-4">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                onClick={() => {
                  setSelectedVendor(vendor);
                  setNotes(vendor.notes || "");
                }}
                className="cursor-pointer rounded-2xl border border-black/10 bg-white p-5 hover:border-primary/30 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Briefcase className="text-primary" size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary">{vendor.companyName}</div>
                      <div className="text-xs text-text-secondary">{vendor.serviceCategory}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[vendor.status]}`}>
                    {vendor.status === "pending" && <Clock size={12} />}
                    {vendor.status === "approved" && <CheckCircle2 size={12} />}
                    {vendor.status === "rejected" && <XCircle size={12} />}
                    {STATUS_LABELS[vendor.status]}
                  </span>
                </div>
                <div className="grid sm:grid-cols-3 gap-2 text-sm text-text-secondary">
                  <div className="flex items-center gap-2"><Mail size={14} /> {vendor.email}</div>
                  <div className="flex items-center gap-2"><Phone size={14} /> {vendor.phone}</div>
                  <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(vendor.createdAt).toLocaleDateString("fr-FR")}</div>
                </div>
              </div>
            ))}
            {filteredVendors.length === 0 && <p className="p-6 text-center text-text-secondary rounded-2xl border border-black/10 bg-white">Aucune candidature professionnelle.</p>}
          </div>
        )}
      </div>

      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedVendor(null)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl p-5 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl font-semibold text-text-primary">{selectedVendor.companyName}</h2>
              <button onClick={() => setSelectedVendor(null)} className="p-2 rounded-lg hover:bg-black/5"><XCircle size={20} className="text-text-secondary" /></button>
            </div>

            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary">SIRET</span>
                  <p className="font-medium text-text-primary">{selectedVendor.siret}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Marque</span>
                  <p className="font-medium text-text-primary">{selectedVendor.brandName || "—"}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Catégorie</span>
                  <p className="font-medium text-text-primary">{selectedVendor.serviceCategory}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Gamme</span>
                  <p className="font-medium text-text-primary capitalize">{selectedVendor.tier}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Expérience</span>
                  <p className="font-medium text-text-primary">{selectedVendor.yearsOfExperience} an(s)</p>
                </div>
                <div>
                  <span className="text-text-secondary">Formation</span>
                  <p className="font-medium text-text-primary">{selectedVendor.trainingDate ? new Date(selectedVendor.trainingDate).toLocaleDateString("fr-FR") : "—"}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Tarifs</span>
                  <p className="font-medium text-text-primary">{selectedVendor.priceRange.min} - {selectedVendor.priceRange.max} {selectedVendor.priceRange.currency}</p>
                </div>
                <div>
                  <span className="text-text-secondary">Zone</span>
                  <p className="font-medium text-text-primary">
                    {selectedVendor.serviceArea.regions.join(", ") || selectedVendor.serviceArea.cities.join(", ")}
                    {selectedVendor.serviceArea.radius ? ` (${selectedVendor.serviceArea.radius} km)` : ""}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-text-secondary">Adresse</span>
                  <p className="font-medium text-text-primary flex items-center gap-2"><MapPin size={14} /> {selectedVendor.address.street}, {selectedVendor.address.zipCode} {selectedVendor.address.city}, {selectedVendor.address.country}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-text-secondary">Contact</span>
                  <p className="font-medium text-text-primary">{selectedVendor.contactName} — {selectedVendor.contactRole}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-text-secondary">Description</span>
                  <p className="text-text-primary mt-1">{selectedVendor.description}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-text-secondary">Styles</span>
                  <p className="text-text-primary mt-1">{selectedVendor.styles.join(", ") || "—"}</p>
                </div>
                {selectedVendor.pricingDetails && (
                  <div className="sm:col-span-2">
                    <span className="text-text-secondary">Détails tarifaires</span>
                    <p className="text-text-primary mt-1">{selectedVendor.pricingDetails}</p>
                  </div>
                )}
                {selectedVendor.trainingDescription && (
                  <div className="sm:col-span-2">
                    <span className="text-text-secondary">Détail formation</span>
                    <p className="text-text-primary mt-1">{selectedVendor.trainingDescription}</p>
                  </div>
                )}
                {selectedVendor.serviceArea.travelPolicy && (
                  <div className="sm:col-span-2">
                    <span className="text-text-secondary">Déplacements</span>
                    <p className="text-text-primary mt-1">{selectedVendor.serviceArea.travelPolicy}</p>
                  </div>
                )}
                {selectedVendor.availability.noticePeriod && (
                  <div>
                    <span className="text-text-secondary">Préavis</span>
                    <p className="font-medium text-text-primary">{selectedVendor.availability.noticePeriod}</p>
                  </div>
                )}
              </div>

              <div>
                <span className="text-text-secondary text-sm">Portfolio ({selectedVendor.portfolio.images.length})</span>
                <div className="mt-2 grid gap-2">
                  {selectedVendor.portfolio.images.map((img) => (
                    <a
                      key={img.publicId}
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-black/10 bg-surface p-3 hover:border-primary/50 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText size={18} className="text-primary shrink-0" />
                        <span className="text-sm text-text-primary truncate">{img.filename}</span>
                      </div>
                      <ExternalLink size={16} className="text-text-secondary shrink-0" />
                    </a>
                  ))}
                  {selectedVendor.portfolio.images.length === 0 && <p className="text-sm text-text-secondary">Aucune image.</p>}
                </div>
              </div>

              <div>
                <span className="text-text-secondary text-sm">Documents ({selectedVendor.documents.length})</span>
                <div className="mt-2 grid gap-2">
                  {selectedVendor.documents.map((doc) => (
                    <a
                      key={doc.publicId}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-black/10 bg-surface p-3 hover:border-primary/50 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText size={18} className="text-primary shrink-0" />
                        <span className="text-sm text-text-primary truncate">{doc.filename}</span>
                      </div>
                      <ExternalLink size={16} className="text-text-secondary shrink-0" />
                    </a>
                  ))}
                  {selectedVendor.documents.length === 0 && <p className="text-sm text-text-secondary">Aucun document.</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Notes internes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => updateVendorStatus(selectedVendor.id, "approved")}
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-white text-sm font-semibold hover:bg-green-700 transition"
                >
                  <CheckCircle2 size={16} /> Approuver
                </button>
                <button
                  onClick={() => updateVendorStatus(selectedVendor.id, "rejected")}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-white text-sm font-semibold hover:bg-red-700 transition"
                >
                  <XCircle size={16} /> Rejeter
                </button>
                <button
                  onClick={() => updateVendorStatus(selectedVendor.id, "pending")}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 border border-amber-200 px-5 py-2.5 text-sm font-semibold hover:bg-amber-200 transition"
                >
                  <Clock size={16} /> Remettre en attente
                </button>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-text-secondary hover:bg-black/5 transition"
                >
                  <Trash2 size={16} /> Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
