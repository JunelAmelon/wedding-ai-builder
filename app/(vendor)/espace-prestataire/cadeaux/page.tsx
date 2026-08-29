"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "@/components/shared/LoadingScreen";
import { Gift, Plus, Trash2, Edit, Upload, X, Image as ImageIcon } from "lucide-react";
import type { WishlistItem } from "@/types/marketplace";

export default function VendorGiftsPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [vendor, setVendor] = useState<{ id: string; companyName: string } | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    quantity: "1",
  });

  useEffect(() => {
    async function load() {
      try {
        const [giftsRes, profileRes] = await Promise.all([fetch("/api/vendor/gifts"), fetch("/api/vendor/profile")]);
        const giftsData = await giftsRes.json();
        const profileData = await profileRes.json();
        setItems(giftsData.items || []);
        if (profileData.profile) {
          setVendor({ id: profileData.profile.id, companyName: profileData.profile.companyName });
        }
      } catch (error) {
        console.error("Error loading gifts:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function addGift() {
    if (!newItem.name || !newItem.price || !vendor) return;
    try {
      const res = await fetch("/api/wishlist/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wishlistId: "vendor-default",
          name: newItem.name,
          description: newItem.description,
          price: parseFloat(newItem.price),
          imageUrl: newItem.imageUrl || undefined,
          vendorId: vendor.id,
          vendorName: vendor.companyName,
          quantity: parseInt(newItem.quantity) || 1,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'ajout");
      }

      const data = await res.json();
      setItems([...items, data.item]);
      setNewItem({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        quantity: "1",
      });
      setShowAddModal(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de l'ajout");
    }
  }

  async function deleteGift(itemId: string) {
    if (!confirm("Supprimer ce cadeau ?")) return;
    try {
      const res = await fetch(`/api/wishlist/items/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }
      setItems(items.filter((i) => i.id !== itemId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  }

  if (loading) return <LoadingScreen minHeight="80dvh" />;

  return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-[#fef2f4] to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#6B6B72] mb-2">Vos cadeaux</p>
            <h1 className="font-allura text-3xl sm:text-4xl font-normal tracking-tight text-[#0E0E10]">
              Gérer vos <span className="text-[#e64a5d]">cadeaux</span>
            </h1>
            <p className="text-[#6B6B72] mt-2">
              Les couples peuvent ajouter vos cadeaux à leur liste de mariage
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#e64a5d] text-white hover:brightness-110 font-semibold transition"
          >
            <Plus size={20} />
            Nouveau cadeau
          </button>
        </div>

        {/* Gifts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-[32px] bg-white border border-[#EDEDF0] shadow-[0_40px_120px_rgba(14,14,16,0.18)] overflow-hidden"
            >
              {item.imageUrl ? (
                <div className="h-48 bg-[#f7f7f9]">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-[#f7f7f9] flex items-center justify-center">
                  <ImageIcon size={48} className="text-[#6B6B72]" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-allura text-lg font-bold text-[#0E0E10]">{item.name}</h3>
                  <button
                    onClick={() => deleteGift(item.id)}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#fce7f3] text-[#6B6B72] hover:text-[#831843] transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-[#6B6B72] mb-4 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-allura text-2xl font-bold text-[#0E0E10]">{item.price} €</span>
                  <span className="text-sm text-[#6B6B72]">x{item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#f7f7f9] mb-4">
                <Gift size={32} className="text-[#6B6B72]" />
              </div>
              <p className="text-[#6B6B72] mb-4">Aucun cadeau proposé</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#e64a5d] text-white hover:brightness-110 font-semibold transition"
              >
                <Plus size={20} />
                Ajouter un cadeau
              </button>
            </div>
          )}
        </div>

        {/* Add Gift Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />
            <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#EDEDF0] rounded-[28px] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#EDEDF0] flex items-center justify-center text-[#6B6B72] hover:text-[#0E0E10] hover:bg-[#EDEDF0] transition"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-[28px] bg-[#fef2f4] flex items-center justify-center">
                  <Gift size={26} className="text-[#0E0E10]" />
                </div>
                <div>
                  <p className="text-[#6B6B72] text-xs font-bold font-sans uppercase tracking-wider">Cadeau</p>
                  <h3 className="font-allura text-2xl font-normal text-[#0E0E10]">Nouveau cadeau</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">Nom du cadeau</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Ex: Pack photo complet"
                    className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Description du cadeau..."
                    className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition min-h-[80px] resize-none"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">Prix (€)</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="Ex: 890"
                    className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">Image URL (optionnel)</label>
                  <input
                    type="url"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6B6B72] mb-2">Quantité</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    placeholder="1"
                    className="w-full bg-[#ffffff] border-2 border-[#EDEDF0] rounded-[28px] text-[#0E0E10] px-4 py-3.5 focus:outline-none focus:border-[#fef2f4] transition"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 px-4 rounded-full border-2 border-[#EDEDF0] bg-[#ffffff] text-sm font-bold font-sans text-[#0E0E10] hover:bg-[#EDEDF0] transition"
                >
                  Annuler
                </button>
                <button
                  onClick={addGift}
                  disabled={!newItem.name || !newItem.price}
                  className="flex-1 py-3.5 px-4 rounded-full bg-[#e64a5d] text-white font-bold font-sans hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

