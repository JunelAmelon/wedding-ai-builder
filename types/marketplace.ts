import type { WeddingStyle } from "./domain";
import type { AdminRole } from "./admin";

export type UserRole = "couple" | "vendor" | "admin";

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phone: string | null;
  address: string | null;
  role: UserRole;
  adminRole?: AdminRole;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  emailVerified: boolean;
  resetToken: string | null;
  resetTokenExpiry: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VendorProfile {
  id: string; // same as userId
  userId: string;
  status: "pending" | "approved" | "rejected";
  companyName: string;
  siret: string;
  brandName: string | null;
  email: string;
  phone: string;
  website: string | null;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
    geo?: { lat: number; lng: number };
  };
  serviceCategory: string;
  otherCategory: string | null;
  logo: { url: string; publicId: string; filename: string } | null;
  yearsOfExperience: number;
  trainingDate: string | null;
  trainingDescription: string | null;
  description: string;
  styles: string[];
  contactName: string;
  contactRole: string;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  pricingDetails: string | null;
  serviceArea: {
    regions: string[];
    cities: string[];
    radius: number | null;
    travelPolicy: string | null;
    geo?: { lat: number; lng: number };
  };
  availability: {
    noticePeriod: string | null;
    peakSeasons: string[];
    unavailableDates: string[];
  };
  portfolio: {
    images: { url: string; publicId: string; filename: string }[];
    website: string | null;
    instagram: string | null;
    videos: string[];
    faq: { question: string; answer: string }[];
    reviews: { author: string; rating: number; text: string; date: string }[];
  };
  tier: "economique" | "standard" | "premium" | "luxe";
  documents: { url: string; publicId: string; filename: string }[];
  acceptedTerms: boolean;
  credits: number;
  profileCompletion: number; // 0-100
  preferences?: { emailNotifications: boolean; opportunityAlerts: boolean };
  verified: boolean;
  reviewedAt: string | null;
  reviewedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CoupleProfile {
  id: string; // same as userId
  userId: string;
  weddingDate: string | null;
  location: { city: string; country: string; geo?: { lat: number; lng: number } } | null;
  guestCount: number | null;
  budget: { amount: number; currency: string } | null;
  style: WeddingStyle | null;
  customStyle: string | null;
  customStyleDescription: string | null;
  mainPriority: string | null;
  stressLevel: number | null;
  favoriteVendorIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WeddingProject {
  id: string;
  userId: string;
  coupleProfileId: string;
  sessionId: string | null;
  name: string;
  weddingDate: string | null;
  location: { city: string; country: string; geo?: { lat: number; lng: number } } | null;
  guestCount: number | null;
  childrenCount: number | null;
  budget: { amount: number; currency: string } | null;
  style: WeddingStyle | null;
  customStyle: string | null;
  customStyleDescription: string | null;
  ambiance: string[] | null;
  desiredCategories: string[] | null;
  dietaryNeeds: string[] | null;
  dietaryDetails: string | null;
  mobilityNeeds: boolean | null;
  guestsFromFar: boolean | null;
  mainPriority: string | null;
  stressLevel: number | null;
  createdAt: string;
  updatedAt: string;
}

export type MatchStatus = "pending" | "suggested" | "shortlisted" | "rejected" | "contacted";

export interface ProjectVendorMatch {
  id: string;
  projectId: string;
  tenderId: string | null;
  vendorId: string;
  category: string;
  score: number; // 0-100
  reasons: string[];
  summary: string | null;
  vendorPitch: string | null;
  regenCount: number;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
}

export type TenderStatus = "searching" | "responded" | "closed";

export interface Tender {
  id: string;
  projectId: string;
  category: string;
  status: TenderStatus;
  matchIds: string[];
  selectedProposalId: string | null;
  budgetRange: { min: number; max: number; currency: string } | null;
  guestCount: number | null;
  location: { city: string; country: string; geo?: { lat: number; lng: number } } | null;
  weddingDate: string | null;
  style: WeddingStyle | null;
  customStyle: string | null;
  requirements: string[];
  priority: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProposalStatus = "pending" | "accepted" | "declined" | "archived";

export interface Proposal {
  id: string;
  projectId: string;
  tenderId: string | null;
  vendorId: string;
  matchId: string | null;
  message: string;
  amount: number | null;
  currency: string | null;
  description: string | null;
  includedServices: string[];
  responseDelayHours: number | null;
  attachments: { url: string; filename: string }[];
  status: ProposalStatus;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  proposalId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  attachments: { url: string; filename: string }[];
  readAt: string | null;
  createdAt: string;
}

export type NotificationType =
  | "new_opportunity"
  | "new_proposal"
  | "proposal_accepted"
  | "proposal_declined"
  | "message_received"
  | "profile_verified"
  | "credits_purchased"
  | "credits_low";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export type CreditTransactionType = "purchase" | "spend" | "refund" | "bonus";

export interface CreditTransaction {
  id: string;
  vendorId: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  proposalId: string | null;
  createdAt: string;
}

export interface WeddingExpense {
  id: string;
  projectId: string;
  category: string;
  label: string;
  plannedAmount: number;
  actualAmount: number | null;
  currency: string;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineTask {
  id: string;
  projectId: string;
  title: string;
  monthsBeforeWedding: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  credits: number;
  newOpportunities: number;
  sentProposals: number;
  activeProposals: number;
  pendingProposals: number;
  declinedProposals: number;
  archivedProposals: number;
  responseRate: number;
  averageCompatibility: number;
  wonContracts: number;
  profileCompletion: number;
  verified: boolean;
}

export interface CoupleDashboard {
  riskScore: number | null;
  progress: number;
  nextTasks: TimelineTask[];
  unreadMessages: number;
  recommendedVendors: ProjectVendorMatch[];
  unreadNotifications: number;
}

export interface VendorMatchDetail extends ProjectVendorMatch {
  project: WeddingProject;
  vendor: VendorProfile;
}

export interface ProposalDetail extends Proposal {
  project: WeddingProject;
  vendor: VendorProfile;
  couple: CoupleProfile;
  lastMessage?: Message | null;
  unreadCount?: number;
}

export interface Witness {
  id: string;
  projectId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string; // "Témoin marié", "Témoin mariée", "Coordinateur", etc.
  photo: { url: string; publicId?: string; filename?: string; name?: string } | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  id: string;
  coupleId: string;
  weddingId: string;
  title: string;
  description: string;
  coverImage?: { url: string; publicId: string; filename: string };
  shareToken: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  vendorId?: string;
  vendorName?: string;
  purchased: boolean;
  purchasedBy?: string;
  purchasedAt?: string;
  quantity: number;
  remaining: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistPurchase {
  id: string;
  wishlistId: string;
  itemId?: string;
  itemName?: string;
  guestName: string;
  guestEmail: string;
  amount: number;
  message?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
}

export interface WishlistPayout {
  id: string;
  wishlistId: string;
  amount: number;
  method: string;
  note?: string;
  paidAt: string;
  status: "pending" | "completed";
  createdAt: string;
}
