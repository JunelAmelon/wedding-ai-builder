import { nanoid } from "nanoid";
import { getDb } from "@/lib/db/firebase";
import { userRepo } from "./userRepo";
import type { UserAccount } from "@/types/marketplace";
import type {
  AdminInvitation,
  AdminDashboardStats,
  AdminCoupleListItem,
  AdminVendorListItem,
  BlogPost,
  SupportTicket,
  SubscriptionPlan,
  UserSubscription,
} from "@/types/admin";
import type { VendorProfile } from "@/types/marketplace";
import { coupleProfileRepo } from "./coupleProfileRepo";
import { vendorProfileRepo } from "./vendorProfileRepo";
import { projectRepo } from "./projectRepo";
import { vendorRepo } from "./vendorRepo";

const INVITES_COL = "adminInvitations";
const POSTS_COL = "blogPosts";
const TICKETS_COL = "supportTickets";
const PLANS_COL = "subscriptionPlans";
const SUBS_COL = "userSubscriptions";

function getCol(name: string) {
  return getDb().collection(name);
}

function now() {
  return new Date().toISOString();
}

export const adminRepo = {
  // Invitations
  async createInvitation(data: {
    email: string;
    role: AdminInvitation["role"];
    invitedBy: string;
  }): Promise<AdminInvitation> {
    const token = nanoid(32);
    const id = nanoid(12);
    const invitedAt = now();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const invite: AdminInvitation = {
      id,
      ...data,
      token,
      invitedAt,
      expiresAt,
      acceptedAt: null,
      acceptedBy: null,
    };
    await getCol(INVITES_COL).doc(id).set(invite);
    return invite;
  },

  async getInvitationByToken(token: string): Promise<AdminInvitation | null> {
    const snap = await getCol(INVITES_COL).where("token", "==", token).limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0].data() as AdminInvitation;
  },

  async markInvitationAccepted(id: string, userId: string): Promise<void> {
    await getCol(INVITES_COL).doc(id).update({
      acceptedAt: now(),
      acceptedBy: userId,
    });
  },

  async listInvitations(): Promise<AdminInvitation[]> {
    const snap = await getCol(INVITES_COL).orderBy("invitedAt", "desc").get();
    return snap.docs.map((d) => d.data() as AdminInvitation);
  },

  // Users / admins
  async listAdmins(): Promise<UserAccount[]> {
    const snap = await getDb().collection("users").where("role", "==", "admin").get();
    return snap.docs.map((d) => d.data() as UserAccount);
  },

  async getUserByEmail(email: string): Promise<UserAccount | null> {
    return userRepo.getByEmail(email);
  },

  // Couples & vendors
  async listCouples(limit = 100): Promise<AdminCoupleListItem[]> {
    const users = await userRepo.list();
    const couples = users.filter((u) => u.role === "couple");
    const items: AdminCoupleListItem[] = [];
    for (const user of couples.slice(0, limit)) {
      const [profile, projects] = await Promise.all([
        coupleProfileRepo.getByUserId(user.id).catch(() => null),
        projectRepo.listByUser(user.id).catch(() => []),
      ]);
      items.push({ user, profile, projectCount: projects.length, createdAt: user.createdAt });
    }
    return items;
  },

  async listVendors(): Promise<AdminVendorListItem[]> {
    const [users, applications] = await Promise.all([userRepo.list(), vendorRepo.list()]);
    const vendors = users.filter((u) => u.role === "vendor");
    const items: AdminVendorListItem[] = [];
    for (const user of vendors) {
      const [profile, app] = await Promise.all([
        vendorProfileRepo.getByUserId(user.id).catch(() => null),
        Promise.resolve(applications.find((a) => a.userId === user.id) || null),
      ]);
      items.push({
        user,
        profile,
        applicationStatus: app ? app.status : null,
        createdAt: user.createdAt,
      });
    }
    return items;
  },

  // Dashboard stats
  async getStats(): Promise<AdminDashboardStats> {
    const [allUsers, applications, projects] = await Promise.all([
      userRepo.list(),
      vendorRepo.list(),
      projectRepo.list().catch(() => []),
    ]);

    const couples = allUsers.filter((u) => u.role === "couple");
    const vendors = allUsers.filter((u) => u.role === "vendor");
    const pendingVendors = applications.filter((a) => a.status === "pending").length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newCouplesToday = couples.filter((u) => new Date(u.createdAt) >= today).length;
    const newCouplesWeek = couples.filter((u) => new Date(u.createdAt) >= weekAgo).length;
    const newCouplesMonth = couples.filter((u) => new Date(u.createdAt) >= monthAgo).length;
    const newVendorsToday = vendors.filter((u) => new Date(u.createdAt) >= today).length;
    const newVendorsWeek = vendors.filter((u) => new Date(u.createdAt) >= weekAgo).length;
    const newVendorsMonth = vendors.filter((u) => new Date(u.createdAt) >= monthAgo).length;

    const sessionsSnap = await getDb().collection("sessions").get().catch(() => null);
    const sessions = sessionsSnap?.docs.map((d) => d.data() as { userId?: string; createdAt?: string }) ?? [];
    const quizToAccountRate = sessions.length
      ? Math.round((couples.length / sessions.length) * 100)
      : 0;

    const categoryCounts: Record<string, number> = {};
    for (const v of vendors) {
      const profile = (await vendorProfileRepo.getByUserId(v.id).catch(() => null)) as VendorProfile | null;
      const cat = profile?.serviceCategory || "Non renseigné";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const subsSnap = await getCol(SUBS_COL).where("status", "==", "active").get().catch(() => null);
    const activeSubscriptions = subsSnap?.docs.length ?? 0;
    const monthlyRecurringRevenue = activeSubscriptions * 39;

    return {
      totalCouples: couples.length,
      totalVendors: vendors.length,
      pendingVendors,
      totalProjects: projects.length,
      newCouplesToday,
      newCouplesWeek,
      newCouplesMonth,
      newVendorsToday,
      newVendorsWeek,
      newVendorsMonth,
      quizToAccountRate,
      activeSubscriptions,
      monthlyRecurringRevenue,
      topCategories,
    };
  },

  // Blog
  async createBlogPost(data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): Promise<BlogPost> {
    const id = nanoid(12);
    const t = now();
    const post: BlogPost = { ...data, id, createdAt: t, updatedAt: t };
    await getCol(POSTS_COL).doc(id).set(post);
    return post;
  },

  async updateBlogPost(id: string, data: Partial<Omit<BlogPost, "id" | "createdAt" | "updatedAt">>): Promise<BlogPost> {
    const ref = getCol(POSTS_COL).doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error("Article introuvable");
    const current = snap.data() as BlogPost;
    const updated: BlogPost = { ...current, ...data, updatedAt: now() };
    await ref.update({ ...data, updatedAt: now() });
    return updated;
  },

  async deleteBlogPost(id: string): Promise<void> {
    await getCol(POSTS_COL).doc(id).delete();
  },

  async getBlogPostById(id: string): Promise<BlogPost | null> {
    const snap = await getCol(POSTS_COL).doc(id).get();
    return snap.exists ? (snap.data() as BlogPost) : null;
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const snap = await getCol(POSTS_COL).where("slug", "==", slug).limit(1).get();
    return snap.empty ? null : (snap.docs[0].data() as BlogPost);
  },

  async listBlogPosts(limit = 100): Promise<BlogPost[]> {
    const snap = await getCol(POSTS_COL).orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs.map((d) => d.data() as BlogPost);
  },

  // Support tickets
  async createTicket(data: Omit<SupportTicket, "id" | "createdAt" | "updatedAt">): Promise<SupportTicket> {
    const id = nanoid(12);
    const t = now();
    const ticket: SupportTicket = { ...data, id, createdAt: t, updatedAt: t };
    await getCol(TICKETS_COL).doc(id).set(ticket);
    return ticket;
  },

  async listTickets(limit = 100): Promise<SupportTicket[]> {
    const snap = await getCol(TICKETS_COL).orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs.map((d) => d.data() as SupportTicket);
  },

  async updateTicket(id: string, data: Partial<SupportTicket>): Promise<void> {
    await getCol(TICKETS_COL).doc(id).update({ ...data, updatedAt: now() });
  },

  // Subscriptions / plans
  async listPlans(): Promise<SubscriptionPlan[]> {
    const snap = await getCol(PLANS_COL).get();
    return snap.docs.map((d) => d.data() as SubscriptionPlan);
  },

  async createPlan(data: Omit<SubscriptionPlan, "id">): Promise<SubscriptionPlan> {
    const id = nanoid(12);
    const plan = { ...data, id };
    await getCol(PLANS_COL).doc(id).set(plan);
    return plan;
  },

  async listUserSubscriptions(): Promise<UserSubscription[]> {
    const snap = await getCol(SUBS_COL).orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => d.data() as UserSubscription);
  },

  async getUserSubscriptionById(id: string): Promise<UserSubscription | null> {
    const snap = await getCol(SUBS_COL).doc(id).get();
    return snap.exists ? (snap.data() as UserSubscription) : null;
  },

  async updateUserSubscription(id: string, data: Partial<Omit<UserSubscription, "id" | "createdAt">>): Promise<UserSubscription> {
    const ref = getCol(SUBS_COL).doc(id);
    const snap = await ref.get();
    const t = now();
    if (snap.exists) {
      const updated = { ...(snap.data() as UserSubscription), ...data, updatedAt: t } as UserSubscription;
      await ref.update({ ...data, updatedAt: t });
      return updated;
    }
    const created: UserSubscription = {
      id,
      userId: data.userId || "",
      planId: data.planId || null,
      status: data.status || "active",
      stripeCustomerId: data.stripeCustomerId || null,
      stripeSubscriptionId: data.stripeSubscriptionId || null,
      currentPeriodStart: data.currentPeriodStart || t,
      currentPeriodEnd: data.currentPeriodEnd || t,
      canceledAt: data.canceledAt || null,
      planInterval: data.planInterval || "month",
      amount: data.amount || 3900,
      currency: data.currency || "eur",
      createdAt: t,
      updatedAt: t,
    };
    await ref.set(created);
    return created;
  },
};
