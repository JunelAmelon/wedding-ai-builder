"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Gift, Heart, Share2, Check, Users, MessageSquare, Eye, X } from "lucide-react";
import type { Wishlist, WishlistItem, WishlistPurchase } from "@/types/marketplace";

export default function WishlistPublicPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shareToken = Array.isArray(params.shareToken) ? params.shareToken[0] : params.shareToken;
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [purchases, setPurchases] = useState<WishlistPurchase[]>([]);
  const [couple, setCouple] = useState<{ firstName: string; lastName: string; avatarUrl: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal de contribution : soit lié à un cadeau précis, soit une contribution libre (Participer)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  async function loadWishlist() {
    try {
      const res = await fetch(`/api/wishlist/public?token=${shareToken}`);
      if (!res.ok) {
        router.push("/404");
        return;
      }
      const data = await res.json();
      setWishlist(data.wishlist);
      setItems(data.items || []);
      setPurchases(data.purchases || []);
      setCouple(data.couple || null);
    } catch (error) {
      console.error("Error loading wishlist:", error);
      router.push("/404");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareToken]);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const sessionId = searchParams.get("session_id");

    if (canceled) {
      setFlash({ type: "error", text: "Le paiement a été annulé." });
    } else if (success && sessionId) {
      setFlash({ type: "success", text: "Paiement confirmé, enregistrement en cours…" });
      fetch(`/api/wishlist/session?session_id=${sessionId}`)
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Erreur");
          }
          setFlash({ type: "success", text: "Merci pour votre contribution ! 🎉" });
          await loadWishlist();
        })
        .catch(() => {
          setFlash({ type: "success", text: "Merci ! La page va se mettre à jour dès que le paiement sera finalisé." });
          loadWishlist();
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, shareToken]);

  function openGeneralContribution() {
    setSelectedItem(null);
    setPurchaseError("");
    setSuccess(false);
    setAmount("");
    setModalOpen(true);
  }

  function openItemContribution(item: WishlistItem) {
    setSelectedItem(item);
    setPurchaseError("");
    setSuccess(false);
    setAmount(item.price.toString());
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedItem(null);
    setGuestName("");
    setGuestEmail("");
    setAmount("");
    setMessage("");
    setPurchaseError("");
  }

  async function handlePurchase() {
    if (!wishlist || !guestName || !guestEmail || !amount || Number(amount) <= 0) return;
    setPurchasing(true);
    setPurchaseError("");
    try {
      const res = await fetch("/api/wishlist/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareToken,
          itemId: selectedItem?.id,
          guestName,
          guestEmail,
          amount: parseFloat(amount),
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la préparation du paiement");
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Aucun lien de paiement reçu");
    } catch (error) {
      setPurchaseError(error instanceof Error ? error.message : "Erreur lors de la préparation du paiement");
    } finally {
      setPurchasing(false);
    }
  }

  async function share() {
    const link = window.location.href;
    const shareData = {
      title: wishlist ? `Liste de mariage - ${wishlist.title}` : "Liste de mariage",
      text: "Participez à notre liste de mariage !",
      url: link,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // l'utilisateur a annulé le partage natif, on retombe sur la copie du lien
      }
    }
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // fallback si clipboard indisponible
      const tmp = document.createElement("textarea");
      tmp.value = link;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const totalPurchased = purchases.reduce((sum, p) => sum + p.amount, 0);
  const donorCount = purchases.length;
  const messages = purchases.filter((p) => p.message && p.message.trim().length > 0);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#fbfafa] flex items-center justify-center">
        <div className="text-[#8b8b86]">Chargement...</div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-[100dvh] bg-[#fbfafa] flex items-center justify-center">
        <div className="text-[#8b8b86]">Liste de souhaits introuvable</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#fbfafa]">
      <header className="bg-white border-b border-[#e6e4dd] sticky top-0 z-30">
        <div className="max-w-[1220px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-semibold text-[#1c1c1c]">
            Mariage Facile
          </Link>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#1c1c1c] text-white hover:bg-[#333] transition"
          >
            Nous découvrir
          </Link>
        </div>
      </header>

      {flash && (
        <div
          className={`max-w-[1220px] mx-auto mt-4 px-6 ${
            flash.type === "success" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-rose-700 bg-rose-50 border-rose-100"
          } rounded-xl border p-4 text-sm font-medium`}
        >
          {flash.text}
        </div>
      )}

      <section className="py-10 sm:py-14 px-6 bg-white border-b border-[#e6e4dd]">
        <div className="max-w-[1220px] mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8ECD9] text-[#1c1c1c] text-xs font-medium mb-4">
              <Gift size={14} /> Liste de mariage
            </div>
            {couple ? (
              <>
                <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#1c1c1c] mb-4">
                  {couple.firstName} et {couple.lastName} vous invitent…
                </h1>
                <p className="text-lg text-[#8b8b86] max-w-2xl mx-auto leading-relaxed">
                  Hello ! {couple.firstName} et {couple.lastName} vous invitent à célébrer leur mariage et à faire partie de cette belle histoire. Votre geste, petit ou grand, compte énormément pour eux.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#1c1c1c] mb-4">Liste de mariage</h1>
                <p className="text-lg text-[#8b8b86] max-w-2xl mx-auto">Participez à cette belle aventure.</p>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-[1220px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start p-6">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">

          {/* Photo Card */}
          {wishlist.coverImage ? (
            <div className="rounded-2xl overflow-hidden h-[430px] bg-black">
              <img src={wishlist.coverImage.url} alt="Cover" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden h-[430px] bg-[#dff05a] flex items-center justify-center">
              <Gift size={64} className="text-[#1c1c1c]" />
            </div>
          )}

          {/* Description Card */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)]">
            <h2 className="text-2xl font-extrabold mb-4 text-[#1c1c1c]">{wishlist.title}</h2>
            <div className="text-[15px] leading-relaxed text-[#1a1a1a] whitespace-pre-line mb-5">
              {wishlist.description}
            </div>
            <div className="text-[13px] text-[#6b7280]">
              Créée le {new Date(wishlist.createdAt).toLocaleDateString("fr-FR")}
            </div>
          </div>

          {/* Messages Card */}
          <div className="bg-white rounded-2xl p-7 sm:p-8 border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)]">
            <div className="text-2xl font-extrabold mb-5 text-[#1c1c1c]">
              <span className="text-[#dff05a]">{messages.length}</span> Messages
            </div>

            <div className="space-y-6">
              {messages.map((purchase) => (
                <div key={purchase.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#dff05a] flex items-center justify-center flex-shrink-0">
                    <Users size={18} className="text-[#1c1c1c]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[15px] mb-1 text-[#1c1c1c]">
                      {purchase.guestName}
                      <span className="ml-2 text-xs font-normal text-[#8b8b86]">a offert {purchase.amount} €</span>
                    </div>
                    <div className="text-[15px] leading-relaxed text-[#1a1a1a]">{purchase.message}</div>
                    <div className="text-[13px] text-[#9ca3af] mt-1">
                      {new Date(purchase.createdAt).toLocaleString("fr-FR")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {messages.length === 0 && (
              <div className="text-[#6b7280] text-[15px]">Soyez le premier à laisser un message !</div>
            )}
          </div>

          {/* Items Card */}
          {items.length > 0 && (
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)]">
              <h2 className="text-2xl font-extrabold mb-5 text-[#1c1c1c]">Cadeaux</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {items.map((item) => {
                  const isPurchased = item.purchased;
                  const purchase = purchases.find((p) => p.itemId === item.id);
                  const remaining = item.remaining;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border border-[#e6e4dd] overflow-hidden ${
                        isPurchased ? "opacity-50" : ""
                      }`}
                    >
                      {item.imageUrl && (
                        <div className="h-40 bg-[#f7f7f9]">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-[#1c1c1c] mb-2">{item.name}</h3>
                        <p className="text-sm text-[#6b7280] mb-3 line-clamp-2">{item.description}</p>
                        {item.vendorName && (
                          <p className="text-xs text-[#6b7280] mb-3">Par {item.vendorName}</p>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-xl text-[#1c1c1c]">{item.price} €</span>
                          <span className="text-sm text-[#6b7280]">x{item.quantity}</span>
                        </div>
                        {isPurchased ? (
                          <div className="text-center py-2 px-3 rounded-xl bg-[#dcfce7] text-[#14532d] text-sm font-medium">
                            Offert par {purchase?.guestName}
                          </div>
                        ) : remaining === 0 ? (
                          <div className="text-center py-2 px-3 rounded-xl bg-[#fce7f3] text-[#831843] text-sm font-medium">
                            Épuisé
                          </div>
                        ) : (
                          <button
                            onClick={() => openItemContribution(item)}
                            className="w-full py-2 px-3 rounded-xl bg-[#1c1c1c] text-white font-bold hover:bg-[#333] transition"
                          >
                            Offrir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="bg-white rounded-2xl p-7 lg:p-8 lg:sticky lg:top-6 border border-[#e6e4dd] shadow-[0_40px_120px_rgba(14,14,16,0.18)]">
          <div className="text-2xl font-extrabold mb-2 text-[#1c1c1c]">{wishlist.title}</div>
          <div className="text-2xl font-extrabold text-[#1c1c1c]">
            {totalPurchased.toLocaleString("fr-FR")} € <span className="text-base font-medium text-[#4b5563] ml-1">récoltés</span>
          </div>

          <div className="flex justify-between mt-6 mb-6 max-w-[260px]">
            <div className="flex flex-col items-center gap-1">
              <Heart size={22} className="text-[#1c1c1c]" />
              <span className="text-[15px] font-bold text-[#1c1c1c]">{donorCount}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageSquare size={22} className="text-[#1c1c1c]" />
              <span className="text-[15px] font-bold text-[#1c1c1c]">{messages.length}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Eye size={22} className="text-[#1c1c1c]" />
              <span className="text-[15px] font-bold text-[#1c1c1c]">{items.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#dff05a] flex items-center justify-center flex-shrink-0">
              <Gift size={16} className="text-[#1c1c1c]" />
            </div>
            <div className="text-[14px] leading-relaxed text-[#1a1a1a]">
              <b>Liste de mariage</b> <span className="text-[#dff05a] ml-1">✔</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={share}
              className="w-12 h-12 rounded-xl bg-[#1c1c1c] flex items-center justify-center flex-shrink-0 hover:bg-[#333] transition"
              aria-label="Partager"
              title="Partager le lien"
            >
              {linkCopied ? <Check size={20} className="text-white" /> : <Share2 size={20} className="text-white" />}
            </button>
            <button
              onClick={openGeneralContribution}
              className="flex-1 bg-[#1c1c1c] text-white font-bold text-base rounded-xl flex items-center justify-center hover:bg-[#333] transition py-3"
            >
              Participer
            </button>
          </div>
          {linkCopied && (
            <p className="text-xs text-[#0F9D6E] font-semibold mt-2 text-center">Lien copié !</p>
          )}
        </div>
      </div>

      {/* Contribution Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#f3f2ee] rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#8b8b86] hover:text-[#1c1c1c] transition"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#dff05a] flex items-center justify-center">
                <Gift size={20} className="text-[#1c1c1c]" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-[#1c1c1c]">
                  {selectedItem ? "Offrir ce cadeau" : "Participer à la cagnotte"}
                </h2>
                <p className="text-[#8b8b86] text-sm">Contribuez au mariage de {wishlist.title}</p>
              </div>
            </div>

            {selectedItem ? (
              <div className="mb-6 p-4 rounded-xl bg-[#f7f7f9] border border-[#e6e4dd]">
                <h4 className="font-bold text-lg text-[#1c1c1c] mb-2">{selectedItem.name}</h4>
                <p className="text-sm text-[#8b8b86] mb-2">{selectedItem.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-2xl text-[#1c1c1c]">{selectedItem.price} €</span>
                  <span className="text-sm text-[#8b8b86]">x{selectedItem.quantity}</span>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-xl bg-[#f7f7f9] border border-[#e6e4dd]">
                <p className="text-sm text-[#8b8b86]">
                  Vous choisissez librement le montant de votre contribution à la cagnotte commune.
                </p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block font-bold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                  Votre nom *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                />
              </div>
              <div>
                <label className="block font-bold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                  Votre email *
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                />
              </div>
              <div>
                <label className="block font-bold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                  Montant (€) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={selectedItem ? selectedItem.price.toString() : "Ex: 50"}
                  className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a]"
                />
              </div>
              <div>
                <label className="block font-bold text-[11px] uppercase tracking-[0.14em] text-[#8b8b86] mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Un petit mot pour les mariés..."
                  className="w-full bg-white border border-[#e4e2db] rounded-xl text-[#1c1c1c] px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#dff05a] min-h-[80px] resize-none"
                />
              </div>
            </div>

            {purchaseError && (
              <div className="mt-4 p-3 rounded-xl bg-[#fce7f3] border border-[#fbcfe8]">
                <p className="text-sm text-[#831843]">{purchaseError}</p>
              </div>
            )}

            {success ? (
              <div className="mt-6 p-4 rounded-xl bg-[#dcfce7] border border-[#bbf7d0] text-center">
                <p className="text-sm font-semibold text-[#14532d] mb-3">
                  Merci ! Votre contribution a été envoyée aux mariés.
                </p>
                <button
                  onClick={closeModal}
                  className="py-2 px-5 rounded-full bg-[#1c1c1c] text-white text-sm font-semibold hover:bg-[#333] transition"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 rounded-full border border-[#e6e4dd] bg-white text-sm font-semibold text-[#1c1c1c] hover:bg-[#f1f0eb] transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || !guestName || !guestEmail || !amount || Number(amount) <= 0}
                  className="flex-1 py-3 px-4 rounded-full bg-[#1c1c1c] text-white font-semibold hover:bg-[#333] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? "Envoi..." : "Offrir"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
