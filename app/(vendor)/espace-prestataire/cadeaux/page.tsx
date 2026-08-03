"use client";

import { useEffect, useState } from "react";
import { Gift, Plus, Trash2, Edit, Upload, Image as ImageIcon } from "lucide-react";
import type { WishlistItem } from "@/types/marketplace";

export default function VendorGiftsPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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
        const res = await fetch("/api/vendor/gifts");
        const data = await res.json();
        setItems(data.items || []);
      } catch (error) {
        console.error("Error loading gifts:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function addGift() {
    if (!newItem.name || !newItem.price) return;
    try {
      const res = await fetch("/api/wishlist/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wishlistId: "vendor-default", // À adapter
          name: newItem.name,
          description: newItem.description,
          price: parseFloat(newItem.price),
          imageUrl: newItem.imageUrl || undefined,
          vendorId: "current-vendor-id", // À adapter avec l'ID du prestataire connecté
          vendorName: "Nom du prestataire", // À adapter
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

  if (loading) {
    return (
      <div className="min-h-[80dvh] bg-[#fbfafa] flex items-center justify-center">
        <div className="text-[#8b8b86]">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[80dvh] bg-[#fbfafa]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b8b86] mb-2">Vos cadeaux</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
              Gérer vos cadeaux
            </h1>
            <p className="text-[#8b8b86] mt-2">
              Les couples peuvent ajouter vos cadeaux à leur liste de mariage
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#1c1c1c] text-white font-semibold hover:bg-[#333] transition"
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
              className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] overflow-hidden"
            >
              {item.imageUrl ? (
                <div className="h-48 bg-[#f7f7f9]">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-[#f7f7f9] flex items-center justify-center">
                  <ImageIcon size={48} className="text-[#8b8b86]" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display text-lg font-bold text-[#1c1c1c]">{item.name}</h3>
                  <button
                    onClick={() => deleteGift(item.id)}
                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#fce7f3] text-[#8b8b86] hover:text-[#831843] transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-[#8b8b86] mb-4 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-bold text-[#1c1c1c]">{item.price} €</span>
                  <span className="text-sm text-[#8b8b86]">x{item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#f7f7f9] mb-4">
                <Gift size={32} className="text-[#8b8b86]" />
              </div>
              <p className="text-[#8b8b86] mb-4">Aucun cadeau proposé</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#1c1c1c] text-white font-semibold hover:bg-[#333] transition"
              >
                <Plus size={20} />
                Ajouter un cadeau
              </button>
            </div>
          )}
        </div>

        {/* Add Gift Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <div className="relative bg-white rounded-[32px] border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,18,0.18)] p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="font-display text-xl font-bold text-[#1c1c1c] mb-6">Nouveau cadeau</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Nom du cadeau</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Ex: Pack photo complet"
                    className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Description du cadeau..."
                    className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a] min-h-[80px] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Prix (€)</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="Ex: 890"
                    className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Image URL (optionnel)</label>
                  <input
                    type="url"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1c1c1c] mb-2">Quantité</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    placeholder="1"
                    className="w-full px-4 py-3 bg-white border border-[#e6e4dd] rounded-xl text-[14px] text-[#1c1c1c] placeholder:text-[#8b8b86] focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 rounded-full border border-[#e6e4dd] bg-white text-sm font-semibold text-[#1c1c1c] hover:bg-[#f1f0eb] transition"
                >
                  Annuler
                </button>
                <button
                  onClick={addGift}
                  disabled={!newItem.name || !newItem.price}
                  className="flex-1 py-3 px-4 rounded-full bg-[#1c1c1c] text-white font-semibold hover:bg-[#333] transition disabled:opacity-50 disabled:cursor-not-allowed"
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
