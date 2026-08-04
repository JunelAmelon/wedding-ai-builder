"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Plus, Trash2, Edit, Share2, Copy, Check, Heart, ShoppingBag, X } from "lucide-react";
import type { Wishlist, WishlistItem, WishlistPurchase } from "@/types/marketplace";

export default function WishlistManagementPage() {
  const router = useRouter();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [purchases, setPurchases] = useState<WishlistPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newWishlistTitle, setNewWishlistTitle] = useState("");
  const [newWishlistDescription, setNewWishlistDescription] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    vendorId: "",
    vendorName: "",
    quantity: "1",
  });
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetch("/api/wishlist");
        const json = await data.json();
        setWishlists(json.wishlists || []);
      } catch (error) {
        console.error("Error loading wishlists:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function loadWishlistDetails(wishlist: Wishlist) {
    setSelectedWishlist(wishlist);
    const res = await fetch(`/api/wishlist/items?wishlistId=${wishlist.id}`);
    const data = await res.json();
    setItems(data.items || []);
    
    const purchasesRes = await fetch(`/api/wishlist/purchases?wishlistId=${wishlist.id}`);
    const purchasesData = await purchasesRes.json();
    setPurchases(purchasesData.purchases || []);
  }

  async function createWishlist() {
    if (!newWishlistTitle) return;
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newWishlistTitle,
          description: newWishlistDescription,
          weddingId: "default", // À adapter selon votre logique
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création");
      }

      const data = await res.json();
      setWishlists([...wishlists, data.wishlist]);
      setNewWishlistTitle("");
      setNewWishlistDescription("");
      setShowCreateModal(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de la création");
    }
  }

  async function addItem() {
    if (!selectedWishlist || !newItem.name || !newItem.price) return;
    try {
      const res = await fetch("/api/wishlist/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wishlistId: selectedWishlist.id,
          name: newItem.name,
          description: newItem.description,
          price: parseFloat(newItem.price),
          imageUrl: newItem.imageUrl || undefined,
          vendorId: newItem.vendorId || undefined,
          vendorName: newItem.vendorName || undefined,
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
        vendorId: "",
        vendorName: "",
        quantity: "1",
      });
      setShowAddItemModal(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erreur lors de l'ajout");
    }
  }

  async function deleteItem(itemId: string) {
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

  function copyShareLink() {
    if (!selectedWishlist) return;
    const link = `${window.location.origin}/wishlist/${selectedWishlist.shareToken}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff0f3] to-white flex items-center justify-center">
        <div className="text-[#8b8b86]">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff0f3] to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b8b86] mb-2">Liste de mariage</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1c1c]">
              Vos listes de souhaits
            </h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#1c1c1c] text-white font-semibold hover:bg-[#333] transition"
          >
            <Plus size={20} />
            Nouvelle liste
          </button>
        </div>

        {!selectedWishlist ? (
          /* Wishlist List */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((wishlist) => (
              <div
                key={wishlist.id}
                onClick={() => loadWishlistDetails(wishlist)}
                className="rounded-2xl bg-white border border-[#e4e2db] shadow-sm p-6 cursor-pointer hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-[#88b7b5] flex items-center justify-center">
                    <Gift size={24} className="text-[#1c1c1c]" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#1c1c1c]">{wishlist.title}</h3>
                    <p className="text-sm text-[#8b8b86]">{new Date(wishlist.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <p className="text-sm text-[#8b8b86] line-clamp-2">{wishlist.description}</p>
              </div>
            ))}
            {wishlists.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#f7f7f9] mb-4">
                  <Gift size={32} className="text-[#8b8b86]" />
                </div>
                <p className="text-[#8b8b86] mb-4">Aucune liste de souhaits</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#1c1c1c] text-white font-semibold hover:bg-[#333] transition"
                >
                  <Plus size={20} />
                  Créer une liste
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Wishlist Detail */
          <div>
            <button
              onClick={() => setSelectedWishlist(null)}
              className="text-sm text-[#8b8b86] hover:text-[#1c1c1c] mb-6 flex items-center gap-2"
            >
              ← Retour aux listes
            </button>

            <div className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] p-6 sm:p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display text-3xl font-bold text-[#1c1c1c] mb-2">{selectedWishlist.title}</h2>
                  <p className="text-[#8b8b86]">{selectedWishlist.description}</p>
                </div>
                <button
                  onClick={copyShareLink}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#e6e4dd] bg-white text-sm font-semibold text-[#1c1c1c] hover:bg-[#f1f0eb] transition"
                >
                  {linkCopied ? <Check size={16} /> : <Share2 size={16} />}
                  {linkCopied ? "Copié !" : "Partager"}
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm text-[#8b8b86]">
                <div className="flex items-center gap-2">
                  <Heart size={16} />
                  <span>{purchases.reduce((sum, p) => sum + p.amount, 0).toLocaleString("fr-FR")} € offerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} />
                  <span>{items.length} cadeaux</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-[#1c1c1c]">Cadeaux</h3>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[#1c1c1c] text-white font-semibold hover:bg-[#333] transition"
              >
                <Plus size={16} />
                Ajouter un cadeau
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const purchase = purchases.find((p) => p.itemId === item.id);
                return (
                  <div
                    key={item.id}
                    className="rounded-[32px] bg-white border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)] overflow-hidden"
                  >
                    {item.imageUrl && (
                      <div className="h-48 bg-[#f7f7f9]">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-display text-lg font-bold text-[#1c1c1c]">{item.name}</h4>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[#fce7f3] text-[#8b8b86] hover:text-[#831843] transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-[#8b8b86] mb-4 line-clamp-2">{item.description}</p>
                      {item.vendorName && (
                        <p className="text-xs text-[#8b8b86] mb-4">Par {item.vendorName}</p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-display text-2xl font-bold text-[#1c1c1c]">{item.price} €</span>
                        <span className="text-sm text-[#8b8b86]">x{item.quantity}</span>
                      </div>
                      {item.purchased ? (
                        <div className="text-center py-2 px-4 rounded-full bg-[#dcfce7] text-[#14532d] text-sm font-medium">
                          Offert par {purchase?.guestName}
                        </div>
                      ) : (
                        <div className="text-center py-2 px-4 rounded-full bg-[#f7f7f9] text-[#8b8b86] text-sm font-medium">
                          Disponible ({item.remaining} restant)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-[#8b8b86]">Aucun cadeau dans cette liste</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Wishlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-gradient-to-b from-[#fff0f3] to-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#8b8b86] hover:text-[#1c1c1c] transition"
                aria-label="Fermer"
              >
                <X size={15} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#88b7b5] flex items-center justify-center">
                  <Gift size={20} className="text-[#1c1c1c]" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-[#1c1c1c]">
                    Nouvelle liste de souhaits
                  </h2>
                  <p className="text-[#8b8b86] text-sm">Créez votre liste de mariage pour partager avec vos invités</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={newWishlistTitle}
                    onChange={(e) => setNewWishlistTitle(e.target.value)}
                    placeholder="Ex: Liste de mariage de Sarah & Marc"
                    className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#88b7b5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                    Description
                  </label>
                  <textarea
                    value={newWishlistDescription}
                    onChange={(e) => setNewWishlistDescription(e.target.value)}
                    placeholder="Décrivez votre liste..."
                    className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#88b7b5] min-h-[80px] resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 px-4 rounded-full border border-[#e4e2db] bg-white text-sm font-semibold text-[#1c1c1c] hover:bg-[#f1f0eb] transition"
                >
                  Annuler
                </button>
                <button
                  onClick={createWishlist}
                  disabled={!newWishlistTitle}
                  className="flex-1 py-3 px-4 rounded-full bg-[#1c1c1c] text-white font-semibold hover:bg-[#333] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-gradient-to-b from-[#fff0f3] to-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#8b8b86] hover:text-[#1c1c1c] transition"
                aria-label="Fermer"
              >
                <X size={15} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#88b7b5] flex items-center justify-center">
                  <Gift size={20} className="text-[#1c1c1c]" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-[#1c1c1c]">
                    Ajouter un cadeau
                  </h2>
                  <p className="text-[#8b8b86] text-sm">Ajoutez un cadeau à votre liste de mariage</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                    Nom du cadeau *
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Ex: Service photo"
                    className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#88b7b5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                    Description
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Description du cadeau..."
                    className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#88b7b5] min-h-[80px] resize-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="Ex: 890"
                    className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#88b7b5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                    Image URL (optionnel)
                  </label>
                  <input
                    type="url"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#88b7b5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                    Prestataire (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newItem.vendorName}
                    onChange={(e) => setNewItem({ ...newItem, vendorName: e.target.value })}
                    placeholder="Nom du prestataire"
                    className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#88b7b5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    placeholder="1"
                    className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#88b7b5]"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 py-3 px-4 rounded-full border border-[#e4e2db] bg-white text-sm font-semibold text-[#1c1c1c] hover:bg-[#f1f0eb] transition"
                >
                  Annuler
                </button>
                <button
                  onClick={addItem}
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




