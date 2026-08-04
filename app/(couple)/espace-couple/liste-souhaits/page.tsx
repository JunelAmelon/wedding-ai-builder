"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Plus, Trash2, Edit, Share2, Copy, Check, Heart, ShoppingBag, X, Star, Sparkles } from "lucide-react";
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
          weddingId: "default",
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

  const palette = [
    { bg: "bg-[#f4f1f7]", icon: "text-[#f4f1f7]", light: "bg-[#f4f1f7]/10" },
    { bg: "bg-[#cbd5e1]", icon: "text-[#cbd5e1]", light: "bg-[#cbd5e1]/10" },
    { bg: "bg-[#fde68a]", icon: "text-[#fcd34d]", light: "bg-[#fde68a]/10" },
  ];

  const avatars = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=60&h=60&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=60&h=60&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=60&h=60&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&h=60&q=80",
  ];

  if (loading) {
    return (
      <div className="min-h-[80dvh] bg-[#fff0f3] flex items-center justify-center font-sans">
        <div className="text-[#cbd5e1] flex items-center gap-2">
          <Sparkles size={20} className="animate-spin" />
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-[#fff0f3] to-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!selectedWishlist ? (
          <>
            {/* Hero Eduon */}
            <section className="relative pt-12 pb-10">
              <div className="max-w-5xl mx-auto px-4 text-center">
                <div className="trust-row inline-flex items-center gap-3 rounded-full border border-[#ececec] bg-[#ffffff] px-4 py-2 mb-10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#fde68a]">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
                  </svg>
                  <div className="flex -space-x-2">
                    {avatars.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Couple"
                        className="h-8 w-8 rounded-full border-2 border-[#ffffff] object-cover"
                      />
                    ))}
                  </div>
                  <span className="font-sans text-sm text-[#6b7076]">{wishlists.length + 124} couples nous font confiance</span>
                </div>

                <div className="hero-heading-row flex items-center justify-center gap-6 mb-6">
                  <svg className="side-illus-left hidden lg:block w-20 h-auto text-[#f4f1f7]" viewBox="0 0 80 120" fill="currentColor">
                    <circle cx="40" cy="30" r="16" opacity="0.25"/>
                    <path d="M20 60 C30 40, 50 40, 60 60 C70 80, 60 110, 40 120 C20 110, 10 80, 20 60 Z" opacity="0.35"/>
                    <path d="M10 70 Q40 50 70 70" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </svg>

                  <h1 className="font-display text-[46px] leading-tight font-bold text-[#15181c]">
                    <span className="inline-flex items-center gap-3">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="#f4f1f7">
                        <path d="M12 2C13.6 4.2 15.2 5.2 17.2 5.2C19.5 5.2 20.8 6.8 20.8 9.2C20.8 11.2 19.2 12.4 17.6 12.4C19.2 12.4 20.8 13.6 20.8 15.8C20.8 18.4 19.5 20 17.2 20C15.2 20 13.6 21 12 23C10.4 21 8.8 20 6.8 20C4.5 20 3.2 18.4 3.2 15.8C3.2 13.6 4.8 12.4 6.4 12.4C4.8 12.4 3.2 11.2 3.2 9.2C3.2 6.8 4.5 5.2 6.8 5.2C8.8 5.2 10.4 4.2 12 2Z"/>
                      </svg>
                      Vos listes
                    </span>
                    <br />
                    de souhaits
                  </h1>

                  <svg className="side-illus-right hidden lg:block w-20 h-auto text-[#cbd5e1]" viewBox="0 0 80 120" fill="currentColor">
                    <rect x="24" y="12" width="32" height="32" rx="8" opacity="0.2" transform="rotate(15 40 28)"/>
                    <circle cx="50" cy="70" r="12" opacity="0.3"/>
                    <path d="M20 90 C35 70, 55 70, 70 90" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                    <circle cx="20" cy="100" r="8" opacity="0.25"/>
                  </svg>
                </div>

                <p className="sub font-sans text-lg text-[#6b7076] max-w-2xl mx-auto mb-8">
                  Créez, organisez et partagez vos listes de cadeaux avec vos proches. Une expérience simple et joyeuse pour votre grand jour.
                </p>

                <div className="cta-row flex flex-wrap items-center justify-center gap-4">
                  <div className="inline-flex items-center gap-2 font-sans text-sm text-[#6b7076]">
                    <Gift size={20} className="text-[#94a3b8]" />
                    100 % gratuit
                  </div>

                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 h-14 px-7 rounded-full bg-[#fde68a] text-[#15181c] font-bold font-sans text-base hover:bg-[#fcd34d] transition"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7L8 5z"/>
                    </svg>
                    Nouvelle liste
                  </button>

                  <button className="inline-flex items-center justify-center h-14 w-14 rounded-full border border-[#ececec] bg-[#ffffff] text-[#15181c] hover:bg-[#ececec] transition">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8z"/>
                      <path d="M8 12h.01" strokeWidth="3"/>
                      <path d="M16 12h.01" strokeWidth="3"/>
                    </svg>
                  </button>
                </div>
              </div>
            </section>

            {/* Cards Section */}
            <section className="cards-section py-10">
              <div className="max-w-6xl mx-auto px-4">
                <div className="cards-grid grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  <div className="col-stack flex flex-col gap-6">
                    <div className="rounded-3xl bg-[#f4f1f7] p-6 text-[#15181c]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-[#15181c]/10 flex items-center justify-center">
                          <Gift size={22} className="text-[#15181c]" />
                        </div>
                        <span className="font-sans text-sm text-[#15181c]/80">Souhaits</span>
                      </div>
                      <h3 className="font-display text-2xl font-bold mb-2">Créez sans limite</h3>
                      <p className="font-sans text-sm text-[#15181c]/90">Ajoutez tous les cadeaux et expériences dont vous rêvez.</p>
                    </div>
                    <div className="rounded-3xl bg-[#cbd5e1] p-6 text-[#15181c]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-[#15181c]/10 flex items-center justify-center">
                          <Share2 size={22} className="text-[#15181c]" />
                        </div>
                        <span className="font-sans text-sm text-[#15181c]/80">Partage</span>
                      </div>
                      <h3 className="font-display text-2xl font-bold mb-2">Partagez en un clic</h3>
                      <p className="font-sans text-sm text-[#15181c]/90">Vos proches peuvent consulter et contribuer facilement.</p>
                    </div>
                  </div>

                  <div className="col-mid rounded-3xl overflow-hidden border border-[#ececec] bg-[#ffffff]">
                    <img
                      src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&h=800&q=80"
                      alt="Couple"
                      className="w-full h-full min-h-[320px] object-cover"
                    />
                    <div className="p-5">
                      <p className="font-sans text-sm text-[#6b7076]">Capturez chaque moment de votre histoire.</p>
                    </div>
                  </div>

                  <div className="card yellow rounded-3xl bg-[#fde68a] p-6 text-[#15181c] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-[#15181c]/10 flex items-center justify-center">
                          <Heart size={22} className="text-[#15181c]" />
                        </div>
                        <span className="font-sans text-sm text-[#6b7076]">Cadeaux</span>
                      </div>
                      <h3 className="font-display text-2xl font-bold mb-2">Soyez guidés</h3>
                      <p className="font-sans text-base text-[#6b7076] mb-6">Notre outil vous aide à choisir, organiser et suivre vos souhaits.</p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#15181c] text-[#ffffff] font-bold font-sans text-sm hover:bg-[#6b7076] transition"
                    >
                      <Plus size={18} />
                      Démarrer
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Wishlists List */}
            {wishlists.length > 0 ? (
              <section className="py-12">
                <div className="max-w-6xl mx-auto px-4">
                  <h2 className="font-display text-3xl font-bold text-[#15181c] mb-8 text-center">Vos listes de souhaits</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlists.map((wishlist, index) => {
                      const theme = palette[index % palette.length];
                      return (
                        <div
                          key={wishlist.id}
                          onClick={() => loadWishlistDetails(wishlist)}
                          className={`rounded-3xl ${theme.bg} p-6 cursor-pointer hover:-translate-y-1 transition text-[#15181c]`}
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-[#15181c]/10 flex items-center justify-center">
                              <Gift size={28} className="text-[#15181c]" />
                            </div>
                            <span className="text-[#15181c]/80 text-sm font-medium">{new Date(wishlist.createdAt).toLocaleDateString("fr-FR")}</span>
                          </div>
                          <h3 className="font-display text-2xl font-bold mb-2">{wishlist.title}</h3>
                          <p className="text-[#15181c]/90 text-sm line-clamp-2 mb-4">{wishlist.description}</p>
                          <div className="inline-flex items-center gap-2 bg-[#15181c]/10 rounded-full px-4 py-2 text-sm font-semibold">
                            <ShoppingBag size={16} />
                            Ouvrir la liste
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            ) : (
              <section className="py-12">
                <div className="max-w-2xl mx-auto px-4 text-center py-16 border border-[#ececec] rounded-3xl bg-[#ffffff]">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-[#f4f1f7]/10 mb-6">
                    <Gift size={40} className="text-[#f4f1f7]" />
                  </div>
                  <p className="text-[#6b7076] mb-6 font-medium font-sans">Aucune liste de souhaits</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#f4f1f7] text-[#15181c] font-bold font-sans hover:bg-[#94a3b8] transition"
                  >
                    <Plus size={20} />
                    Créer une liste
                  </button>
                </div>
              </section>
            )}
          </>
        ) : (
          /* Wishlist Detail */
          <div>
            <button
              onClick={() => setSelectedWishlist(null)}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#15181c] text-white font-bold font-sans text-sm hover:bg-[#6b7076] mb-6 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Retour aux listes
            </button>

            <div className="rounded-3xl bg-[#ffffff] border border-[#ececec] p-8 sm:p-10 mb-8 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-8 h-40 w-40 rounded-full bg-[#fde68a]/20 blur-2xl" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div>
                  <p className="text-[#6b7076] font-bold font-sans uppercase tracking-wider text-xs mb-2">Liste de mariage</p>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#15181c] mb-3">{selectedWishlist.title}</h2>
                  <p className="text-[#6b7076] font-sans max-w-xl">{selectedWishlist.description}</p>
                </div>
                <button
                  onClick={copyShareLink}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#fde68a] text-[#15181c] font-bold font-sans hover:bg-[#fcd34d] transition shadow-[0_8px_24px_rgba(246,195,68,0.35)]"
                >
                  {linkCopied ? <Check size={18} strokeWidth={2.5} /> : <Share2 size={18} strokeWidth={2.5} />}
                  {linkCopied ? "Copié !" : "Partager"}
                </button>
              </div>

              <div className="relative z-10 grid sm:grid-cols-3 gap-4 mt-8">
                <div className="bg-[#ffffff] border border-[#ececec] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[#6b7076] font-bold font-sans text-sm mb-1">
                    <Heart size={18} />
                    Offerts
                  </div>
                  <p className="font-display text-2xl font-bold text-[#15181c]">{purchases.reduce((sum, p) => sum + p.amount, 0).toLocaleString("fr-FR")} €</p>
                </div>
                <div className="bg-[#ffffff] border border-[#ececec] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[#6b7076] font-bold font-sans text-sm mb-1">
                    <ShoppingBag size={18} />
                    Cadeaux
                  </div>
                  <p className="font-display text-2xl font-bold text-[#15181c]">{items.length}</p>
                </div>
                <div className="bg-[#ffffff] border border-[#ececec] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[#6b7076] font-bold font-sans text-sm mb-1">
                    <Star size={18} />
                    Restants
                  </div>
                  <p className="font-display text-2xl font-bold text-[#15181c]">{items.reduce((sum, i) => sum + (i.remaining || 0), 0)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold text-[#15181c]">Cadeaux</h3>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#f4f1f7] text-[#15181c] font-bold font-sans hover:bg-[#94a3b8] transition"
              >
                <Plus size={20} />
                Ajouter un cadeau
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, index) => {
                const purchase = purchases.find((p) => p.itemId === item.id);
                const theme = palette[index % palette.length];
                return (
                  <div
                    key={item.id}
                    className="rounded-3xl bg-[#ffffff] border border-[#ececec] shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_16px_45px_rgba(0,0,0,0.1)] transition"
                  >
                    {item.imageUrl ? (
                      <div className="h-48 bg-[#ffffff]">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`h-40 ${theme.bg} flex items-center justify-center`}>
                        <Gift size={48} className="text-[#15181c]/70" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-display text-xl font-bold text-[#15181c]">{item.name}</h4>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="h-9 w-9 rounded-full flex items-center justify-center bg-[#ececec]/50 text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-[#6b7076] font-sans mb-3 line-clamp-2">{item.description}</p>
                      {item.vendorName && (
                        <p className="text-xs font-medium font-sans text-[#cbd5e1] mb-3">Par {item.vendorName}</p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-display text-2xl font-bold text-[#15181c]">{item.price} €</span>
                        <span className="text-sm font-semibold font-sans text-[#6b7076]">x{item.quantity}</span>
                      </div>
                      {item.purchased ? (
                        <div className="text-center py-2.5 px-4 rounded-full bg-[#f4f1f7] text-[#15181c] text-sm font-bold font-sans">
                          Offert par {purchase?.guestName}
                        </div>
                      ) : (
                        <div className="text-center py-2.5 px-4 rounded-full bg-[#fde68a] text-[#15181c] text-sm font-bold font-sans">
                          Disponible ({item.remaining} restant)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="col-span-full text-center py-16 border border-[#ececec] rounded-3xl bg-[#f4f1f7]">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#15181c]/10 mb-4">
                    <Gift size={32} className="text-[#15181c]" />
                  </div>
                  <p className="text-[#6b7076] mb-4 font-sans">Aucun cadeau dans cette liste</p>
                  <button
                    onClick={() => setShowAddItemModal(true)}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#cbd5e1] text-[#15181c] font-bold font-sans hover:bg-[#94a3b8] transition"
                  >
                    <Plus size={18} />
                    Ajouter un cadeau
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Wishlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#ececec] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#ececec] flex items-center justify-center text-[#6b7076] hover:text-[#15181c] hover:bg-[#ececec] transition"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#fde68a] flex items-center justify-center">
                  <Gift size={26} className="text-[#15181c]" />
                </div>
                <div>
                  <p className="text-[#6b7076] text-xs font-bold font-sans uppercase tracking-wider">Liste de mariage</p>
                  <h2 className="font-display text-2xl font-bold text-[#15181c]">
                    Nouvelle liste
                  </h2>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={newWishlistTitle}
                    onChange={(e) => setNewWishlistTitle(e.target.value)}
                    placeholder="Ex: Liste de mariage de Sarah & Marc"
                    className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                    Description
                  </label>
                  <textarea
                    value={newWishlistDescription}
                    onChange={(e) => setNewWishlistDescription(e.target.value)}
                    placeholder="Décrivez votre liste..."
                    className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition min-h-[80px] resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3.5 px-4 rounded-full border-2 border-[#ececec] bg-[#ffffff] text-sm font-bold font-sans text-[#15181c] hover:bg-[#ececec] transition"
                >
                  Annuler
                </button>
                <button
                  onClick={createWishlist}
                  disabled={!newWishlistTitle}
                  className="flex-1 py-3.5 px-4 rounded-full bg-[#f4f1f7] text-[#15181c] font-bold font-sans hover:bg-[#94a3b8] transition disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#ececec] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#ececec] flex items-center justify-center text-[#6b7076] hover:text-[#15181c] hover:bg-[#ececec] transition"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#cbd5e1] flex items-center justify-center">
                  <Gift size={26} className="text-[#15181c]" />
                </div>
                <div>
                  <p className="text-[#6b7076] text-xs font-bold font-sans uppercase tracking-wider">Cadeau</p>
                  <h2 className="font-display text-2xl font-bold text-[#15181c]">
                    Ajouter un cadeau
                  </h2>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                    Nom du cadeau *
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Ex: Service photo"
                    className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                    Description
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Description du cadeau..."
                    className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition min-h-[80px] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                      Prix (€) *
                    </label>
                    <input
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      placeholder="Ex: 890"
                      className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
                    />
                  </div>
                  <div>
                    <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                      Quantité
                    </label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      placeholder="1"
                      className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                    Image URL (optionnel)
                  </label>
                  <input
                    type="url"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
                  />
                </div>
                <div>
                  <label className="block font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#6b7076] mb-2">
                    Prestataire (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newItem.vendorName}
                    onChange={(e) => setNewItem({ ...newItem, vendorName: e.target.value })}
                    placeholder="Nom du prestataire"
                    className="w-full bg-[#ffffff] border-2 border-[#ececec] rounded-2xl text-[#15181c] px-4 py-3.5 focus:outline-none focus:border-[#f4f1f7] transition"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 py-3.5 px-4 rounded-full border-2 border-[#ececec] bg-[#ffffff] text-sm font-bold font-sans text-[#15181c] hover:bg-[#ececec] transition"
                >
                  Annuler
                </button>
                <button
                  onClick={addItem}
                  disabled={!newItem.name || !newItem.price}
                  className="flex-1 py-3.5 px-4 rounded-full bg-[#cbd5e1] text-[#15181c] font-bold font-sans hover:bg-[#94a3b8] transition disabled:opacity-50 disabled:cursor-not-allowed"
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
