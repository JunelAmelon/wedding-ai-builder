"use client";
import { useEffect, useState, useMemo } from "react";
import { Search, Loader2, Trash2, Pencil, X, Mail, Phone, MapPin, Shield, Crown, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phone: string | null;
  address: string | null;
  role: string;
  adminRole: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile: { companyName: string | null; weddingDate: string | null; status: string | null; serviceCategory: string | null } | null;
}

const ROLE_LABELS: Record<string, string> = {
  couple: "Couple",
  vendor: "Prestataire",
  admin: "Admin",
};
const ROLE_STYLES: Record<string, string> = {
  couple: "bg-[#fce7f3] text-[#db2777]",
  vendor: "bg-[#e6f4ea] text-[#137333]",
  admin: "bg-[#fef3c7] text-[#b45309]",
};
const ADMIN_ROLE_LABELS: Record<string, string> = {
  commercial: "Commercial",
  support: "Support",
  moderator: "Modérateur",
  superadmin: "Superadmin",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", role: "", adminRole: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery = !q || `${u.firstName} ${u.lastName} ${u.email} ${u.phone ?? ""}`.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  function startEdit(user: AdminUser) {
    setEditing(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      address: user.address ?? "",
      role: user.role,
      adminRole: user.adminRole ?? "",
      password: "",
    });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone || null,
        address: editForm.address || null,
        role: editForm.role,
      };
      if (editForm.role === "admin" && editForm.adminRole) {
        body.adminRole = editForm.adminRole;
      }
      if (editForm.password) {
        body.password = editForm.password;
      }
      const res = await fetch(`/api/admin/users/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === editing.id ? { ...u, ...data.user } : u)));
        setEditing(null);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la modification");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setConfirmDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', var(--font-sans), Inter, system-ui, sans-serif" }}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-display text-[#0f172a]">Utilisateurs</h1>
          <p className="text-sm mt-1 text-[#64748b]">{filtered.length} utilisateur(s) — tous rôles confondus</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-[#f1f5f9] px-4 py-2.5 text-sm bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
          >
            <option value="all">Tous les rôles</option>
            <option value="couple">Couples</option>
            <option value="vendor">Prestataires</option>
            <option value="admin">Admins</option>
          </select>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-lg border border-[#f1f5f9] bg-white text-sm text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#db2777]" /></div>
      ) : (
        <div className="bg-white rounded-[20px] border border-[#f1f5f9] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                <tr>
                  <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Utilisateur</th>
                  <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Email</th>
                  <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Rôle</th>
                  <th className="text-left px-5 py-3.5 font-medium text-[#64748b]">Inscrit le</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const initials = `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();
                  const displayName = u.profile?.companyName || `${u.firstName} ${u.lastName}`;
                  return (
                    <tr key={u.id} className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc]/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.avatarUrl ? (
                            <div className="relative h-9 w-9 shrink-0">
                              <Image src={u.avatarUrl} alt={initials} fill sizes="36px" className="rounded-full object-cover border border-[#f1f5f9]" unoptimized />
                            </div>
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-[#fce7f3] text-[#db2777] flex items-center justify-center text-xs font-semibold">
                              {initials || "·"}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-[#0f172a]">{displayName}</div>
                            {u.profile?.companyName && <div className="text-xs text-[#94a3b8]">{u.firstName} {u.lastName}</div>}
                            {u.profile?.serviceCategory && <div className="text-xs text-[#94a3b8]">{u.profile.serviceCategory}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#1e293b]">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${ROLE_STYLES[u.role] || "bg-[#f1f5f9] text-[#64748b]"}`}>
                            {u.role === "admin" && <Shield size={10} />}
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                          {u.role === "admin" && u.adminRole && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#fef3c7] text-[#b45309]">
                              <Crown size={10} />
                              {ADMIN_ROLE_LABELS[u.adminRole] || u.adminRole}
                            </span>
                          )}
                          {u.role === "vendor" && u.profile?.status && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.profile.status === "approved" ? "bg-[#e6f4ea] text-[#137333]" : u.profile.status === "pending" ? "bg-[#fef3c7] text-[#b45309]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
                              {u.profile.status === "approved" ? "Validé" : u.profile.status === "pending" ? "En attente" : "Refusé"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#1e293b]">{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {u.role !== "admin" && (
                            <Link
                              href={u.role === "vendor" ? `/admin/pros/${u.id}` : `/admin/couples/${u.id}`}
                              className="p-1.5 rounded-lg bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9]"
                              title="Voir le profil"
                            >
                              <Eye size={16} />
                            </Link>
                          )}
                          <button
                            onClick={() => startEdit(u)}
                            className="p-1.5 rounded-lg bg-[#fce7f3] text-[#db2777] hover:bg-[#fbcfe8]"
                            title="Modifier"
                          >
                            <Pencil size={16} />
                          </button>
                          {u.role !== "admin" && (
                            <>
                              {confirmDelete === u.id ? (
                                <>
                                  <button
                                    onClick={() => handleDelete(u.id)}
                                    disabled={deleting}
                                    className="px-2 py-1.5 rounded-lg text-xs font-medium bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca] disabled:opacity-50"
                                  >
                                    {deleting ? "..." : "Confirmer"}
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
                                  onClick={() => setConfirmDelete(u.id)}
                                  className="p-1.5 rounded-lg bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca]"
                                  title="Supprimer définitivement"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-[#64748b]">Aucun utilisateur</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-[20px] border border-[#f1f5f9] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#f1f5f9]">
              <h2 className="text-base font-semibold font-display text-[#0f172a]">Modifier l'utilisateur</h2>
              <button onClick={() => setEditing(null)} className="h-8 w-8 rounded-full flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1">Prénom</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1">Nom</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-1">Téléphone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-1">Adresse</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1">Rôle</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
                  >
                    <option value="couple">Couple</option>
                    <option value="vendor">Prestataire</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {editForm.role === "admin" && (
                  <div>
                    <label className="block text-xs font-medium text-[#64748b] mb-1">Rôle admin</label>
                    <select
                      value={editForm.adminRole}
                      onChange={(e) => setEditForm({ ...editForm, adminRole: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
                    >
                      <option value="commercial">Commercial</option>
                      <option value="support">Support</option>
                      <option value="moderator">Modérateur</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-1">Nouveau mot de passe (optionnel, min 8 caractères)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Laisser vide pour ne pas changer"
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#db2777]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#f1f5f9]">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-[10px] text-sm text-[#64748b] hover:bg-[#f8fafc]"
              >
                Annuler
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium text-white bg-[#db2777] hover:bg-[#be185d] disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Pencil size={16} />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
