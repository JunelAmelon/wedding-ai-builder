import type { UserAccount, VendorProfile, CoupleProfile } from "./marketplace";

export type AdminRole = "superadmin" | "moderator" | "support" | "commercial";

export interface AdminInvitation {
  id: string;
  email: string;
  role: AdminRole;
  token: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  acceptedBy: string | null;
}

export interface AdminUser extends UserAccount {
  role: "admin";
  adminRole: AdminRole;
}

export interface AdminDashboardStats {
  totalCouples: number;
  totalVendors: number;
  pendingVendors: number;
  totalProjects: number;
  newCouplesToday: number;
  newCouplesWeek: number;
  newCouplesMonth: number;
  newVendorsToday: number;
  newVendorsWeek: number;
  newVendorsMonth: number;
  quizToAccountRate: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  topCategories: { category: string; count: number }[];
}

export interface AdminCoupleListItem {
  user: UserAccount;
  profile: CoupleProfile | null;
  projectCount: number;
  createdAt: string;
}

export interface AdminVendorListItem {
  user: UserAccount;
  profile: VendorProfile | null;
  applicationStatus: "pending" | "approved" | "rejected" | null;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  status: "draft" | "published";
  authorId: string;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userRole: "couple" | "vendor" | "admin";
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month";
  commitmentMonths: number;
  stripePriceId: string | null;
  isActive: boolean;
  features: string[];
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string | null;
  status: "active" | "canceled" | "past_due" | "unpaid" | "trialing";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  planInterval: "month" | "year" | string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}
