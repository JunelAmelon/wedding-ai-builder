"use client";

import LoadingScreen from "@/components/shared/LoadingScreen";
import MatchingDiscoveryScreen from "@/components/couple/MatchingDiscoveryScreen";
import { areCategoriesMatching } from "@/lib/matching/category-matcher";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/couple/PageHeader";
import {
  CheckCircle2,
  Sparkles,
  Plus,
  X,
  Camera,
  Music,
  UtensilsCrossed,
  Building2,
  Flower2,
  HeartHandshake,
  Scissors,
  PartyPopper,
  Car,
  Home,
  Crown,
  Gem,
  Sparkle,
  RefreshCw,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Heart,
  Check,
  Video,
  Wine,
  Plane,
  Gift,
  Mail,
  CalendarCheck,
  Bus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tender, Proposal, WeddingProject } from "@/types/marketplace";
import type { BudgetBreakdown } from "@/types/domain";
import TenderFormModal from "@/components/couple/TenderFormModal";
import { ExpandableText } from "@/components/couple/ExpandableText";
import { VENDOR_CATEGORIES } from "@/lib/constants";

// const CATEGORIES = [...VENDOR_CATEGORIES];

const CATEGORY_ICON: Record<string, LucideIcon> = {
  "Domaine mariage": Home,
  "Auberge mariage": Home,
  "Hôtel mariage": Building2,
  "Restaurant mariage": UtensilsCrossed,
  "Salle mariage": Building2,
  "Château mariage": Building2,
  "Bateau mariage": Sparkle,
  "Mariages à la plage": Sparkles,
  "Traiteur mariage": UtensilsCrossed,
  "Wedding cake": Sparkles,
  "Faire part mariage": HeartHandshake,
  "Cadeaux invités mariage": Gem,
  "Liste de mariage": HeartHandshake,
  "Photo mariage": Camera,
  "Vidéo mariage": Camera,
  "Musique mariage": Music,
  "Voiture mariage": Car,
  "Bus mariage": Car,
  "Décoration mariage": Flower2,
  "Fleurs mariage": Flower2,
  "Chapiteau mariage": Building2,
  "Animation mariage": PartyPopper,
  "Wedding Planner": HeartHandshake,
  "Lune de miel": Sparkles,
  "Officiants": HeartHandshake,
  "Food Truck": UtensilsCrossed,
  "Vin et Spiritueux": UtensilsCrossed,
  "Bijoux mariage": Gem,
  "Robe de mariée": Crown,
  "Accessoires mariage": Crown,
  "Robe de cocktail": Crown,
  "Esthétique coiffure mariage": Scissors,
  "Costumes mariage": Scissors,
  "Soins beauté": Sparkle,
  "Accessoires marié": Gem,
  // Rétrocompatibilité anciens libellés
  "Photographe / Vidéaste": Camera,
  "Musique / DJ / Orchestre": Music,
  "Traiteur": UtensilsCrossed,
  "Lieu de réception": Building2,
  "Décoration / Fleuriste": Flower2,
  "Wedding planner": HeartHandshake,
  "Maquilleur / Coiffeur": Scissors,
  "Animation": PartyPopper,
  "Transport": Car,
  "Hébergement": Home,
  "Conception de robe de mariée": Crown,
  "Bijoutier": Gem,
  "Officiant": HeartHandshake,
  "Autre": Sparkles,
};

// Chips colorés pour toutes les catégories (anciennes + 35 nouvelles)
const CHIP_CATEGORIES = [
  // Anciennes catégories conservées
  { category: "Lieu de réception", emoji: "🏛️", bg: "#ffffff", color: "#0E0E10" },
  { category: "Traiteur", emoji: "🍽️", bg: "#E4DBFB", color: "#0E0E10" },
  { category: "Photographe / Vidéaste", emoji: "📸", bg: "#FEF3C7", color: "#0E0E10" },
  { category: "Musique / DJ / Orchestre", emoji: "🎵", bg: "#D8ECD9", color: "#0E0E10" },
  { category: "Décoration / Fleuriste", emoji: "💐", bg: "#FBE1E6", color: "#0E0E10" },
  { category: "Wedding planner", emoji: "💍", bg: "#ffffff", color: "#0E0E10" },
  { category: "Maquilleur / Coiffeur", emoji: "💄", bg: "#E4DBFB", color: "#0E0E10" },
  { category: "Animation", emoji: "🎉", bg: "#FEF3C7", color: "#0E0E10" },
  { category: "Transport", emoji: "🚗", bg: "#D8ECD9", color: "#0E0E10" },
  { category: "Hébergement", emoji: "🏨", bg: "#FBE1E6", color: "#0E0E10" },
  { category: "Créateur de robes", emoji: "👗", bg: "#ffffff", color: "#0E0E10" },
  { category: "Bijoutier", emoji: "💎", bg: "#E4DBFB", color: "#0E0E10" },
  { category: "Officiant", emoji: "⛪", bg: "#FEF3C7", color: "#0E0E10" },
  // Nouvelles catégories ajoutées
  { category: "Domaine mariage", emoji: "🏡", bg: "#ffffff", color: "#0E0E10" },
  { category: "Auberge mariage", emoji: "🏨", bg: "#E4DBFB", color: "#0E0E10" },
  { category: "Hôtel mariage", emoji: "🏩", bg: "#FEF3C7", color: "#0E0E10" },
  { category: "Restaurant mariage", emoji: "🍽️", bg: "#D8ECD9", color: "#0E0E10" },
  { category: "Salle mariage", emoji: "🏛️", bg: "#FBE1E6", color: "#0E0E10" },
  { category: "Château mariage", emoji: "🏰", bg: "#ffffff", color: "#0E0E10" },
  { category: "Bateau mariage", emoji: "🛥️", bg: "#E4DBFB", color: "#0E0E10" },
  { category: "Mariages à la plage", emoji: "🏖️", bg: "#FEF3C7", color: "#0E0E10" },
  { category: "Traiteur mariage", emoji: "🍲", bg: "#D8ECD9", color: "#0E0E10" },
  { category: "Wedding cake", emoji: "🎂", bg: "#FBE1E6", color: "#0E0E10" },
  { category: "Faire part mariage", emoji: "💌", bg: "#ffffff", color: "#0E0E10" },
  { category: "Cadeaux invités mariage", emoji: "🎁", bg: "#E4DBFB", color: "#0E0E10" },
  { category: "Liste de mariage", emoji: "📋", bg: "#FEF3C7", color: "#0E0E10" },
  { category: "Photo mariage", emoji: "📸", bg: "#D8ECD9", color: "#0E0E10" },
  { category: "Vidéo mariage", emoji: "🎥", bg: "#FBE1E6", color: "#0E0E10" },
  { category: "Musique mariage", emoji: "🎵", bg: "#ffffff", color: "#0E0E10" },
  { category: "Voiture mariage", emoji: "🚗", bg: "#E4DBFB", color: "#0E0E10" },
  { category: "Bus mariage", emoji: "🚌", bg: "#FEF3C7", color: "#0E0E10" },
  { category: "Décoration mariage", emoji: "🎨", bg: "#D8ECD9", color: "#0E0E10" },
  { category: "Fleurs mariage", emoji: "💐", bg: "#FBE1E6", color: "#0E0E10" },
  { category: "Chapiteau mariage", emoji: "⛺", bg: "#ffffff", color: "#0E0E10" },
  { category: "Animation mariage", emoji: "🎪", bg: "#E4DBFB", color: "#0E0E10" },
  { category: "Wedding Planner", emoji: "💍", bg: "#FEF3C7", color: "#0E0E10" },
  { category: "Lune de miel", emoji: "✈️", bg: "#D8ECD9", color: "#0E0E10" },
  { category: "Officiants", emoji: "⛪", bg: "#FBE1E6", color: "#0E0E10" },
  { category: "Food Truck", emoji: "🚚", bg: "#ffffff", color: "#0E0E10" },
  { category: "Vin et Spiritueux", emoji: "🍷", bg: "#E4DBFB", color: "#0E0E10" },
  { category: "Bijoux mariage", emoji: "💎", bg: "#FEF3C7", color: "#0E0E10" },
  { category: "Robe de mariée", emoji: "👗", bg: "#D8ECD9", color: "#0E0E10" },
  { category: "Accessoires mariage", emoji: "🎀", bg: "#FBE1E6", color: "#0E0E10" },
  { category: "Robe de cocktail", emoji: "💃", bg: "#ffffff", color: "#0E0E10" },
  { category: "Esthétique coiffure mariage", emoji: "💄", bg: "#E4DBFB", color: "#0E0E10" },
  { category: "Costumes mariage", emoji: "🤵", bg: "#FEF3C7", color: "#0E0E10" },
  { category: "Soins beauté", emoji: "✨", bg: "#D8ECD9", color: "#0E0E10" },
  { category: "Accessoires marié", emoji: "👔", bg: "#FBE1E6", color: "#0E0E10" },
];

// Regroupement thématique pour navigation ultra-rapide (5 familles)
const CATEGORY_FAMILY_GROUPS = [
  { id: "all", label: "Tous", emoji: "✨" },
  {
    id: "lieux",
    label: "Lieux",
    emoji: "🏰",
    items: [
      "Lieu de réception",
      "Hébergement",
      "Domaine mariage",
      "Auberge mariage",
      "Hôtel mariage",
      "Restaurant mariage",
      "Salle mariage",
      "Château mariage",
      "Bateau mariage",
      "Mariages à la plage",
      "Chapiteau mariage",
    ],
  },
  {
    id: "traiteur",
    label: "Traiteur & Saveurs",
    emoji: "🍽️",
    items: [
      "Traiteur",
      "Traiteur mariage",
      "Wedding cake",
      "Food Truck",
      "Vin et Spiritueux",
    ],
  },
  {
    id: "beaute",
    label: "Tenues & Beauté",
    emoji: "👗",
    items: [
      "Créateur de robes",
      "Maquilleur / Coiffeur",
      "Bijoutier",
      "Robe de mariée",
      "Costumes mariage",
      "Robe de cocktail",
      "Esthétique coiffure mariage",
      "Soins beauté",
      "Bijoux mariage",
      "Accessoires mariage",
      "Accessoires marié",
    ],
  },
  {
    id: "animation",
    label: "Photo, Musique & Fête",
    emoji: "📸",
    items: [
      "Photographe / Vidéaste",
      "Musique / DJ / Orchestre",
      "Animation",
      "Photo mariage",
      "Vidéo mariage",
      "Musique mariage",
      "Animation mariage",
    ],
  },
  {
    id: "orga",
    label: "Organisation & Déco",
    emoji: "💍",
    items: [
      "Wedding planner",
      "Décoration / Fleuriste",
      "Transport",
      "Officiant",
      "Wedding Planner",
      "Décoration mariage",
      "Fleurs mariage",
      "Officiants",
      "Faire part mariage",
      "Cadeaux invités mariage",
      "Liste de mariage",
      "Voiture mariage",
      "Bus mariage",
      "Lune de miel",
    ],
  },
];

// Images par défaut pour chaque catégorie de prestataire
const CATEGORY_IMAGES: Record<string, string> = {
  // Clés historiques (pour que les anciens appels d'offres conservent exactement leurs images d'origine)
  "Photographe / Vidéaste": "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=400&fit=crop",
  "Musique / DJ / Orchestre": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  "Traiteur": "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=400&fit=crop",
  "Lieu de réception": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=400&fit=crop",
  "Décoration / Fleuriste": "https://images.unsplash.com/photo-1561128290-006dc4827214?w=400&h=400&fit=crop",
  "Wedding planner": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop",
  "Maquilleur / Coiffeur": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
  "Animation": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=400&fit=crop",
  "Transport": "https://images.pexels.com/photos/29624024/pexels-photo-29624024.jpeg",
  "Hébergement": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop",
  "Conception de robe de mariée": "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=400&h=400&fit=crop",
  "Bijoutier": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
  "Officiant": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop",

  // Les 35 catégories exactes
  "Domaine mariage": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=400&fit=crop",
  "Auberge mariage": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop",
  "Hôtel mariage": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop",
  "Restaurant mariage": "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=400&fit=crop",
  "Salle mariage": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=400&fit=crop",
  "Château mariage": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=400&fit=crop",
  "Bateau mariage": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop",
  "Mariages à la plage": "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400&h=400&fit=crop",
  "Traiteur mariage": "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=400&fit=crop",
  "Wedding cake": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=400&h=400&fit=crop",
  "Faire part mariage": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop",
  "Cadeaux invités mariage": "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop",
  "Liste de mariage": "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop",
  "Photo mariage": "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=400&fit=crop",
  "Vidéo mariage": "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=400&fit=crop",
  "Musique mariage": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  "Voiture mariage": "https://images.pexels.com/photos/29624024/pexels-photo-29624024.jpeg",
  "Bus mariage": "https://images.pexels.com/photos/29624024/pexels-photo-29624024.jpeg",
  "Décoration mariage": "https://images.unsplash.com/photo-1561128290-006dc4827214?w=400&h=400&fit=crop",
  "Fleurs mariage": "https://images.unsplash.com/photo-1561128290-006dc4827214?w=400&h=400&fit=crop",
  "Chapiteau mariage": "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=400&fit=crop",
  "Animation mariage": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=400&fit=crop",
  "Wedding Planner": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop",
  "Lune de miel": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
  "Officiants": "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop",
  "Food Truck": "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=400&h=400&fit=crop",
  "Vin et Spiritueux": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop",
  "Bijoux mariage": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
  "Robe de mariée": "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=400&h=400&fit=crop",
  "Accessoires mariage": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
  "Robe de cocktail": "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=400&h=400&fit=crop",
  "Esthétique coiffure mariage": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
  "Costumes mariage": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop",
  "Soins beauté": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
  "Accessoires marié": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop",
  "Autre": "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop",
};

// Couleurs pour les avatars contacts
const CONTACT_COLORS = [
  "linear-gradient(135deg,#e64a5d,#c43a4a)",
  "linear-gradient(135deg,#8B7BD8,#5B4FC4)",
  "linear-gradient(135deg,#F4D93E,#D4B520)",
  "linear-gradient(135deg,#3C8552,#2a6b3e)",
];

interface VendorPreview {
  id?: string;
  name?: string;
  businessName?: string;
  companyName?: string;
  logo?: string | { url?: string } | null;
  serviceCategory?: string;
  yearsOfExperience?: number;
  serviceArea?: { cities?: string[]; regions?: string[]; radius?: number | null };
  priceRange?: { min?: number; max?: number; currency?: string };
}
interface TenderWithProposals extends Tender {
  proposals?: Array<Proposal & { vendor?: VendorPreview }>;
}
type ConfirmedVendor = VendorPreview & { category: string };
interface Recommendation {
  match: { id: string; category: string; score: number; summary: string | null; vendorId: string };
  vendor: VendorPreview | null;
}

export default function CoupleVendorsPage() {
  const router = useRouter();
  const [category, setCategory] = useState<string>("");
  const [tenders, setTenders] = useState<TenderWithProposals[]>([]);
  const [project, setProject] = useState<WeddingProject | null>(null);
  const [aiBudget, setAiBudget] = useState<BudgetBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmedVendors, setConfirmedVendors] = useState<ConfirmedVendor[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const [replaceAction, setReplaceAction] = useState<"replace" | "keep">("keep");
  const [selectedFamily, setSelectedFamily] = useState<string>("all");
  const [isExpanded, setIsExpanded] = useState(false);

  const chipsScrollRef = useRef<HTMLDivElement>(null);

  const scrollChips = (direction: "left" | "right") => {
    if (chipsScrollRef.current) {
      const scrollAmount = direction === "left" ? -460 : 460;
      chipsScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleSelectFamily = (familyId: string) => {
    setSelectedFamily(familyId);
    chipsScrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const visibleChips = React.useMemo(() => {
    if (selectedFamily === "all") return CHIP_CATEGORIES;
    const group = CATEGORY_FAMILY_GROUPS.find((g) => g.id === selectedFamily);
    if (!group || !group.items) return CHIP_CATEGORIES;
    return CHIP_CATEGORIES.filter((c) => group.items.includes(c.category));
  }, [selectedFamily]);

  const [isFirstDiscovery, setIsFirstDiscovery] = useState(false);

  useEffect(() => {
    async function load() {
      // Détecter si le couple a déjà visité la page prestataires
      const hasDiscovered = typeof window !== "undefined" && window.localStorage.getItem("wab_couple_matches_discovered");
      if (!hasDiscovered) {
        setIsFirstDiscovery(true);
      }

      try {
        const [tendersRes, projectRes, recommendationsRes, resultRes] = await Promise.allSettled([
          fetch("/api/couple/tenders"),
          fetch("/api/couple/project"),
          fetch("/api/couple/recommendations"),
          fetch("/api/couple/result"),
        ]);

        // Check auth via tenders response
        if (tendersRes.status === "fulfilled" && tendersRes.value.status === 401) {
          router.push("/login?role=couple");
          return;
        }

        // Parse tenders
        if (tendersRes.status === "fulfilled" && tendersRes.value.ok) {
          const tendersJson = await tendersRes.value.json();
          setTenders((tendersJson.tenders || []) as TenderWithProposals[]);
          const confirmed: ConfirmedVendor[] = [];
          ((tendersJson.tenders || []) as TenderWithProposals[]).forEach((t) => {
            (t.proposals || []).forEach((p) => {
              if (p.status === "accepted" && p.vendor) {
                confirmed.push({ ...p.vendor, id: p.vendorId, category: t.category });
              }
            });
          });
          setConfirmedVendors(confirmed);
        }

        // Parse project
        if (projectRes.status === "fulfilled" && projectRes.value.ok) {
          const projectJson = await projectRes.value.json();
          setProject(projectJson.project as WeddingProject | null);
        }

        // Parse recommendations
        if (recommendationsRes.status === "fulfilled" && recommendationsRes.value.ok) {
          const recommendationsJson = await recommendationsRes.value.json();
          setRecommendations((recommendationsJson.recommendations || []) as Recommendation[]);
          if (!hasDiscovered && (recommendationsJson.recommendations || []).length > 0) {
            // Petite pause visuelle pour laisser le couple apprécier l'animation d'analyse
            await new Promise((r) => setTimeout(r, 1800));
            window.localStorage.setItem("wab_couple_matches_discovered", "true");
            setIsFirstDiscovery(false);
          }
        }

        // Parse AI budget breakdown
        if (resultRes.status === "fulfilled" && resultRes.value.ok) {
          const resultJson = await resultRes.value.json().catch(() => ({}));
          const breakdown =
            resultJson.session?.aiOutput?.budgetBreakdown ||
            resultJson.project?.aiOutput?.budgetBreakdown ||
            null;
          if (breakdown) setAiBudget(breakdown);
        }
      } catch {
        // Don't set error — let the page render with empty state
      } finally {
        setLoading(false);
        setIsFirstDiscovery(false);
      }
    }
    load();
  }, [router]);

  function openCategory(cat: string) {
    setSelectedCategory(cat);
  }

  function closeCategory() {
    setSelectedCategory(null);
  }

  function tryLaunchTender(cat: string) {
    const hasExisting = recommendations.some((r) => areCategoriesMatching(r.match.category, cat));
    if (hasExisting) {
      setPendingCategory(cat);
      setShowReplaceDialog(true);
    } else {
      setCategory(cat);
      setShowForm(true);
    }
  }

  function confirmReplace(action: "replace" | "keep") {
    setShowReplaceDialog(false);
    if (pendingCategory) setCategory(pendingCategory);
    setShowForm(true);
    setReplaceAction(action);
  }

  // Vérifier si une catégorie a déjà un appel d'offres
  const hasTenderForCategory = (cat: string) => tenders.some((t) => areCategoriesMatching(t.category, cat));

  if (loading && isFirstDiscovery) return <MatchingDiscoveryScreen />;
  if (loading) return <LoadingScreen minHeight={"80dvh"} />;
  if (error) return (
    <div className="min-h-[80dvh] bg-gradient-to-b from-[#fef2f4] to-white flex items-center justify-center px-6">
      <div className="bg-white border border-[#fef2f4] rounded-[28px] p-6 text-center max-w-md">
        <p className="text-[#c43a4a]">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fef2f4] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <PageHeader
          eyebrow="Appels d'offres"
          title={<>Mes <span className="text-[#c43a4a]">prestataires</span></>}
          titleClassName="font-allura font-normal"
          description="Lancez une demande, recevez des propositions ciblées, comparez et choisissez sereinement."
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {/* ===== COLONNE PRINCIPALE ===== */}
          <div className="flex-1 min-w-0">
            {/* ---- SECTION 1 : Vos prestataires (Grille 5 par ligne, 2 à 3 lignes max par défaut) ---- */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-allura text-2xl font-normal text-[#0E0E10] tracking-tight">
                    Choisissez vos prestataires
                  </h2>
                  <span className="text-[11px] font-semibold text-[#8E8E93] bg-[#F4F4F6] px-2 py-0.5 rounded-full">
                    {visibleChips.length}
                  </span>
                </div>
              </div>

              {/* Filtres par familles d'univers (Lieux, Traiteur, Tenues, Photo, Organisation) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3.5 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
                {CATEGORY_FAMILY_GROUPS.map((group) => {
                  const isSelected = selectedFamily === group.id;
                  const count =
                    group.id === "all"
                      ? CHIP_CATEGORIES.length
                      : group.items?.length || 0;
                  return (
                    <button
                      key={group.id}
                      onClick={() => {
                        setSelectedFamily(group.id);
                        setIsExpanded(false);
                      }}
                      className={`h-7 px-2.5 rounded-full text-[11.5px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${isSelected
                        ? "bg-[#0E0E10] text-white shadow-xs"
                        : "bg-white text-[#6B6B72] border border-[#EDEDF0] hover:text-[#0E0E10] hover:border-[#0E0E10]/30"
                        }`}
                    >
                      <span>{group.emoji}</span>
                      <span>{group.label}</span>
                      <span
                        className={`text-[9.5px] font-semibold px-1.5 py-0.2 rounded-full ${isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[#EDEDF0] text-[#6B6B72]"
                          }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Grille 5 par ligne (2 ou 3 lignes max par défaut = 15 tuiles) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {(isExpanded || selectedFamily !== "all"
                  ? visibleChips
                  : visibleChips.slice(0, 15)
                ).map((chip) => {
                  const tender = tenders.find((t) => areCategoriesMatching(t.category, chip.category));
                  const hasTender = !!tender;
                  // Les matches s'affichent toujours pour chaque catégorie même si un appel d'offres existe (dédupliqué par prestataire unique)
                  const matchCount = new Set(
                    recommendations
                      .filter((r) => areCategoriesMatching(r.match.category, chip.category))
                      .map((r) => r.match.vendorId || r.vendor?.id)
                      .filter(Boolean)
                  ).size;

                  return (
                    <button
                      key={chip.category}
                      onClick={() => openCategory(chip.category)}
                      className="rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between min-h-[105px] text-left transition-all hover:-translate-y-0.5 hover:shadow-md border border-[#EDEDF0] shadow-sm relative group cursor-pointer"
                      style={{ background: chip.bg, color: chip.color }}
                    >
                      <div className="flex items-start justify-between w-full">
                        <span className="text-[22px] sm:text-[24px]">{chip.emoji}</span>
                        <div className="flex items-center gap-1">
                          {matchCount > 0 && (
                            <span className="h-5 min-w-5 px-1.5 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-[10.5px] font-bold text-[#0E0E10] border border-black/5 shadow-2xs">
                              {matchCount}
                            </span>
                          )}
                          {hasTender && (
                            <span className="h-5 w-5 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center">
                              <CheckCircle2 size={12} className="text-[#3C8552]" />
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-2.5">
                        <span className="text-[12.5px] sm:text-[13px] font-semibold leading-snug line-clamp-2 block">
                          {chip.category}
                        </span>
                        {matchCount > 0 && (
                          <span className="text-[10px] text-[#6B6B72] font-medium block mt-0.5">
                            {matchCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bouton Voir plus / Réduire (si 'Tous' est sélectionné et qu'il y a plus de 15 catégories) */}
              {selectedFamily === "all" && visibleChips.length > 15 && (
                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#F4F4F6] border border-[#EDEDF0] text-[12px] font-semibold text-[#0E0E10] shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>
                      {isExpanded
                        ? "Afficher moins (15)"
                        : `Voir toutes les catégories (${visibleChips.length})`}
                    </span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              )}
            </div>

            {/* ---- SECTION 2 : Cartes des appels d'offres (style events) ---- */}
            {tenders.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tenders.slice(0, 6).map((tender) => {
                  const proposals = tender.proposals || [];
                  const Icon = CATEGORY_ICON[tender.category] || Sparkle;
                  const validatedProposal = proposals.find(
                    (p) => p.status === "accepted" || p.id === tender.selectedProposalId
                  );
                  const validatedVendor = validatedProposal?.vendor;
                  const validatedLogo = validatedVendor
                    ? (typeof validatedVendor.logo === "string"
                      ? validatedVendor.logo
                      : validatedVendor.logo?.url)
                    : null;
                  const firstVendorLogo = proposals[0]
                    ? (typeof proposals[0].vendor?.logo === "string"
                      ? proposals[0].vendor.logo
                      : proposals[0].vendor?.logo?.url)
                    : null;
                  const bgImage =
                    tender.status === "closed" && validatedLogo
                      ? validatedLogo
                      : tender.status === "responded" && firstVendorLogo
                        ? firstVendorLogo
                        : (CATEGORY_IMAGES[tender.category] || CATEGORY_IMAGES["Autre"]);
                  return (
                    <Link
                      key={tender.id}
                      href={`/espace-couple/prestataires/${tender.id}`}
                      className="relative rounded-[28px] overflow-hidden aspect-square flex flex-col justify-end p-4 text-white group"
                    >
                      {/* Image de fond par catégorie ou prestataire */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${bgImage})` }}
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 z-0" />

                      {/* Badge "Validé" pour les appels d'offres clôturés avec un prestataire retenu */}
                      {tender.status === "closed" && validatedVendor && (
                        <div className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 rounded-full bg-[#3C8552] px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                          <CheckCircle2 size={11} /> Validé
                        </div>
                      )}

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="text-[10px] opacity-90 mb-1">
                          {tender.status === "searching" ? "En recherche" : tender.status === "responded" ? "Réponses reçues" : "Clôturé"}
                        </div>
                        <div className="font-bold text-[13px] mb-1 flex items-center gap-2">
                          <Icon size={14} />
                          {tender.category}
                        </div>
                        <div className="text-[9.5px] opacity-85">
                          {tender.budgetRange ? `${tender.budgetRange.min}€ - ${tender.budgetRange.max}€` : "Budget non défini"}
                        </div>

                        {/* Nom du prestataire validé pour les appels clôturés */}
                        {tender.status === "closed" && validatedVendor && (
                          <div className="mt-1.5 text-[11px] font-semibold text-white/95 truncate">
                            {validatedVendor.businessName || validatedVendor.name || validatedVendor.companyName || "Prestataire retenu"}
                          </div>
                        )}

                        {/* Avatars des prestataires ayant répondu */}
                        {proposals.length > 0 && (
                          <div className="flex mt-2 -space-x-1.5">
                            {proposals.slice(0, 4).map((p, idx) => {
                              const logoUrl = typeof p.vendor?.logo === "string" ? p.vendor.logo : p.vendor?.logo?.url;
                              const isValidated = p.id === tender.selectedProposalId || p.status === "accepted";
                              return (
                                <span
                                  key={idx}
                                  className={`h-[17px] w-[17px] rounded-full border-[1.5px] bg-gray-300 bg-cover bg-center ${isValidated ? "border-[#3C8552] ring-1 ring-[#3C8552]" : "border-white"
                                    }`}
                                  style={{
                                    backgroundImage: logoUrl ? `url(${logoUrl})` : undefined,
                                    background: !logoUrl ? CONTACT_COLORS[idx % CONTACT_COLORS.length] : undefined,
                                  }}
                                />
                              );
                            })}
                            {proposals.length > 4 && (
                              <span className="h-[17px] w-[17px] rounded-full border-[1.5px] border-white bg-black/40 flex items-center justify-center text-[8px] font-bold">
                                +{proposals.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {tenders.length === 0 && (
              <div className="rounded-[28px] bg-white border border-[#EDEDF0] p-8 shadow-[0_4px_20px_rgba(14,14,16,0.05)] text-center">
                <div className="h-14 w-14 rounded-[28px] bg-[#fef2f4] flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={22} className="text-[#0E0E10]" />
                </div>
                <h3 className="font-allura text-lg font-semibold text-[#0E0E10] mb-2">
                  Aucun appel d'offres pour l'instant
                </h3>
                <p className="text-[#6B6B72] text-sm mb-6 max-w-sm mx-auto">
                  Cliquez sur un type de prestataire ci-dessus pour lancer votre premier appel d'offres.
                </p>
              </div>
            )}
          </div>

          {/* ===== PANNEAU LATÉRAL ===== */}
          <div className="w-full lg:w-[230px] shrink-0 lg:border-l lg:border-[#EDEDF0] lg:pl-6 space-y-6">
            {/* Contact : prestataires validés */}
            <div>
              <h3 className="font-bold text-[16px] text-[#0E0E10] mb-4">Contact</h3>
              {confirmedVendors.length === 0 ? (
                <p className="text-[13px] text-[#6B6B72] leading-relaxed">
                  Aucun prestataire confirmé pour l'instant. Validez une proposition pour voir vos contacts ici.
                </p>
              ) : (
                <ul className="space-y-3.5">
                  {confirmedVendors.slice(0, 4).map((vendor, i) => {
                    const logoUrl = typeof vendor.logo === "string" ? vendor.logo : vendor.logo?.url;
                    return (
                      <li key={vendor.id || i}>
                        <Link
                          href={`/espace-couple/prestataires/profil/${vendor.id}`}
                          className="flex items-center gap-2.5 group"
                        >
                          <div
                            className="h-[34px] w-[34px] rounded-full shrink-0 bg-cover bg-center"
                            style={{
                              background: logoUrl ? `url(${logoUrl}) center/cover` : CONTACT_COLORS[i % CONTACT_COLORS.length],
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-[#0E0E10] truncate group-hover:underline">
                              {vendor.businessName || vendor.name || vendor.companyName || "Prestataire"}
                            </div>
                            <div className="text-[10.5px] text-[#6B6B72] truncate">
                              {vendor.category}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Groups : catégories d'appels d'offres */}
            <div>
              <h3 className="font-bold text-[16px] text-[#0E0E10] mb-4">Catégories</h3>
              {tenders.length === 0 ? (
                <p className="text-[13px] text-[#6B6B72]">Aucune catégorie active.</p>
              ) : (
                <ul className="space-y-4">
                  {Array.from(new Set(tenders.map((t) => t.category))).slice(0, 4).map((cat, i) => {
                    const Icon = CATEGORY_ICON[cat] || Sparkle;
                    const count = tenders.filter((t) => t.category === cat).length;
                    const groupColors = ["#FEF3C7", "#D8ECD9", "#FBE1E6", "#E4DBFB"];
                    return (
                      <li key={cat} className="flex items-center gap-2.5">
                        <div
                          className="h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0"
                          style={{ background: groupColors[i % groupColors.length] }}
                        >
                          <Icon size={15} className="text-[#0E0E10]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-semibold text-[#0E0E10] truncate">{cat}</div>
                          <div className="text-[10px] text-[#6B6B72]">{count} appel{count > 1 ? "s" : ""}</div>
                        </div>
                        <span className="min-w-[17px] h-[17px] rounded-full bg-[#fef2f4] text-[#0E0E10] text-[10px] font-bold flex items-center justify-center">
                          {count}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODALE — formulaire de nouvelle demande ===== */}
      <TenderFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setCategory("");
        }}
        project={project}
        budgetBreakdown={aiBudget}
        preselectedCategory={category || undefined}
        replaceMode={replaceAction}
        existingTenders={tenders}
        onLaunched={async () => {
          setCategory("");
          setReplaceAction("keep");
          try {
            const recRes = await fetch("/api/couple/recommendations");
            const recJson = await recRes.json();
            if (recRes.ok) setRecommendations(recJson.recommendations || []);
            const tendersRes = await fetch("/api/couple/tenders");
            if (tendersRes.ok) {
              const tendersJson = await tendersRes.json();
              setTenders((tendersJson.tenders || []) as TenderWithProposals[]);
            }
          } catch { /* ignore */ }
        }}
      />

      {/* ===== MODALE — détail catégorie (suggestions auto) ===== */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#EDEDF0] rounded-[28px] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeCategory}
              className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[#ffffff] border border-[#EDEDF0] flex items-center justify-center text-[#6B6B72] hover:text-[#0E0E10] hover:bg-[#EDEDF0] transition"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-[28px] bg-[#fef2f4] flex items-center justify-center">
                {React.createElement(CATEGORY_ICON[selectedCategory] || Sparkle, { size: 26, className: "text-[#0E0E10]" })}
              </div>
              <div>
                <p className="text-[#6B6B72] text-xs font-bold font-sans uppercase tracking-wider">Suggestions auto</p>
                <h2 className="font-allura text-2xl font-normal text-[#0E0E10]">{selectedCategory}</h2>
              </div>
            </div>

            {(() => {
              // Dédupliquer les prestataires par vendorId pour éviter tout affichage en double
              const rawRecs = recommendations.filter((r) => areCategoriesMatching(r.match.category, selectedCategory));
              const seenVendorIds = new Set<string>();
              const catRecs = rawRecs.filter((r) => {
                const vid = r.match.vendorId || r.vendor?.id;
                if (!vid || seenVendorIds.has(vid)) return false;
                seenVendorIds.add(vid);
                return true;
              });
              const activeTender = tenders.find((t) => areCategoriesMatching(t.category, selectedCategory) && t.status !== "closed");
              const catTender = activeTender || tenders.find((t) => areCategoriesMatching(t.category, selectedCategory));

              const catValidatedProposal = (catTender?.proposals || []).find(
                (p) => p.status === "accepted" || p.id === catTender?.selectedProposalId
              );
              const catValidatedVendor = catValidatedProposal?.vendor;

              return (
                <div className="space-y-6">
                  {/* Bloc 1 : Statut de l'appel d'offres s'il existe */}
                  {catTender && (
                    <div className="rounded-[24px] bg-[#fafafa] border border-[#EDEDF0] p-4">
                      {catTender.status === "closed" && catValidatedVendor ? (
                        <div className="text-center py-2">
                          <div className="h-10 w-10 rounded-full bg-[#D8ECD9] flex items-center justify-center mx-auto mb-2">
                            <CheckCircle2 size={18} className="text-[#3C8552]" />
                          </div>
                          <p className="font-semibold text-[10px] uppercase tracking-[0.22em] text-[#3C8552] mb-1">Prestataire retenu</p>
                          <h3 className="text-base font-bold text-[#0E0E10] mb-1">
                            {catValidatedVendor.businessName || catValidatedVendor.name || catValidatedVendor.companyName || "Prestataire retenu"}
                          </h3>
                          <div className="flex gap-2 justify-center mt-3">
                            {catValidatedProposal && (
                              <Link
                                href={`/espace-couple/prestataires/profil/${catValidatedProposal.vendorId}`}
                                onClick={closeCategory}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#0E0E10] text-white hover:bg-[#333] transition"
                              >
                                Voir le profil <ArrowRight size={12} />
                              </Link>
                            )}
                            <Link
                              href={`/espace-couple/prestataires/${catTender.id}`}
                              onClick={closeCategory}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-[#EDEDF0] text-[#0E0E10] hover:bg-white transition"
                            >
                              Voir l'appel d'offres
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B72]">
                              {catTender.status === "closed" ? "Appel d'offres clôturé" : "Appel d'offres en cours"}
                            </p>
                            <p className="text-sm font-bold text-[#0E0E10] mt-0.5">
                              {catTender.status === "searching" ? "En recherche de prestataires" : catTender.status === "responded" ? "Réponses reçues" : "Clôturé"}
                              {" — "}
                              {(catTender.proposals || []).length} proposition{(catTender.proposals || []).length > 1 ? "s" : ""}
                            </p>
                          </div>
                          <Link
                            href={`/espace-couple/prestataires/${catTender.id}`}
                            onClick={closeCategory}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0E0E10] text-white text-xs font-semibold hover:bg-[#333] transition"
                          >
                            Consulter <ArrowRight size={12} />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bloc 2 : Suggestions automatiques de la catégorie */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#6B6B72]">
                        {catRecs.length > 0 ? `${catRecs.length} suggestion${catRecs.length > 1 ? "s" : ""} trouvée${catRecs.length > 1 ? "s" : ""}` : "Suggestions automatiques"}
                      </p>
                      {catRecs.length > 0 && (
                        <button
                          onClick={async () => {
                            setRefreshing(true);
                            try {
                              const res = await fetch("/api/couple/recommendations", { method: "POST" });
                              const json = await res.json();
                              if (res.ok) setRecommendations(json.recommendations || []);
                            } catch { /* ignore */ } finally {
                              setRefreshing(false);
                            }
                          }}
                          disabled={refreshing}
                          className="text-[11.5px] text-[#6B6B72] hover:text-[#0E0E10] transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                          Rafraîchir
                        </button>
                      )}
                    </div>

                    {catRecs.length > 0 ? (
                      <div className="space-y-3">
                        {catRecs.map((rec) => {
                          const vendor = rec.vendor;
                          const logoUrl = typeof vendor?.logo === "string" ? vendor.logo : (vendor?.logo as { url?: string } | undefined)?.url;
                          return (
                            <div key={rec.match.id} className="rounded-[24px] bg-white border border-[#EDEDF0] p-4 shadow-[0_2px_12px_rgba(14,14,16,0.04)] flex items-start gap-3.5">
                              <div
                                className="h-12 w-12 rounded-[20px] bg-cover bg-center shrink-0 border border-black/5"
                                style={{ backgroundImage: logoUrl ? `url(${logoUrl})` : `url(${CATEGORY_IMAGES[selectedCategory] || CATEGORY_IMAGES["Autre"]})` }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-sm text-[#0E0E10] truncate">
                                    {vendor?.companyName || vendor?.businessName || vendor?.name || "Prestataire"}
                                  </h3>
                                  <span className="text-[10px] font-bold bg-[#fef2f4] text-[#e64a5d] px-2 py-0.5 rounded-full shrink-0">
                                    {rec.match.score}% match
                                  </span>
                                </div>
                                {vendor?.serviceArea?.cities?.[0] && (
                                  <p className="text-[11px] text-[#6B6B72] flex items-center gap-1 mb-1">
                                    <MapPin size={10} /> {vendor.serviceArea.cities[0]}
                                  </p>
                                )}
                                {rec.match.summary && (
                                  <div className="text-[12px] text-[#6B6B72] mt-1">
                                    <ExpandableText text={rec.match.summary} lines={2} />
                                  </div>
                                )}
                                <div className="mt-2.5">
                                  <Link
                                    href={`/espace-couple/prestataires/profil/${rec.match.vendorId}`}
                                    onClick={closeCategory}
                                    className="text-[12px] font-bold text-[#0E0E10] hover:text-[#e64a5d] transition-colors inline-flex items-center gap-1"
                                  >
                                    Voir le profil <ArrowRight size={12} />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-[24px] bg-[#fafafa] border border-[#EDEDF0] p-5 text-center">
                        <Sparkles size={20} className="text-[#6B6B72] mx-auto mb-2 opacity-70" />
                        <p className="text-xs text-[#6B6B72]">
                          Aucun prestataire ne correspond actuellement pour cette catégorie spécifique.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bouton d'action pour lancer ou relancer un appel d'offres */}
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        closeCategory();
                        if (catTender) {
                          tryLaunchTender(selectedCategory);
                        } else {
                          setCategory(selectedCategory);
                          setShowForm(true);
                        }
                      }}
                      className="w-full py-3.5 px-4 rounded-full bg-[#e64a5d] text-white font-bold font-sans hover:brightness-110 transition flex items-center justify-center gap-2"
                      iconLeft={<Plus size={16} />}
                    >
                      {catTender ? "Relancer un appel d'offres" : "Lancer un appel d'offres"}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ===== DIALOG — remplacer ou conserver les suggestions ===== */}
      {showReplaceDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#fef2f4] flex items-center justify-center">
                <Sparkles size={20} className="text-[#0E0E10]" />
              </div>
              <h3 className="font-allura text-lg font-bold text-[#0E0E10]">
                Nouvelles suggestions ou en plus ?
              </h3>
            </div>
            <p className="text-sm text-[#6B6B72] mb-6">
              Vous avez déjà des suggestions pour <strong>{pendingCategory}</strong>. Souhaitez-vous remplacer les suggestions actuelles par de nouvelles, ou les conserver et ajouter de nouveaux prestataires ?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => confirmReplace("replace")}
                className="w-full px-4 py-3.5 rounded-[28px] bg-[#e64a5d] text-white text-sm font-bold hover:brightness-110 transition flex items-center justify-center gap-2"
              >
                Remplacer les suggestions
              </button>
              <button
                onClick={() => confirmReplace("keep")}
                className="w-full px-4 py-3.5 rounded-[28px] border-2 border-[#EDEDF0] text-sm font-bold text-[#6B6B72] hover:bg-[#fef2f4] transition"
              >
                Conserver + ajouter de nouvelles
              </button>
              <button
                onClick={() => setShowReplaceDialog(false)}
                className="w-full px-4 py-2 text-sm text-[#6B6B72] hover:text-[#0E0E10] transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




