import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analyticsEvents,
  connectionRequests,
  diasporaEngagements,
  documents,
  InsertUser,
  investorPreferences,
  matches,
  messages,
  notifications,
  sectors,
  users,
  ventures,
  waitlist,
  type InsertAnalyticsEvent,
  type InsertConnectionRequest,
  type InsertDiasporaEngagement,
  type InsertDocument,
  type InsertInvestorPreference,
  type InsertMatch,
  type InsertMessage,
  type InsertNotification,
  type InsertSector,
  type InsertVenture,
  type InsertWaitlist,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUserProfile(
  userId: number,
  data: {
    platformRole?: string;
    profileData?: unknown;
    preferredLanguage?: string;
    isProfileComplete?: boolean;
    verificationStatus?: string;
  }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data as any).where(eq(users.id, userId));
}

export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
}

// ─────────────────────────────────────────────
// WAITLIST
// ─────────────────────────────────────────────

export async function addToWaitlist(data: InsertWaitlist) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(waitlist).values(data);
}

export async function getWaitlistCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(waitlist);
  return Number(result[0]?.count ?? 0);
}

export async function getAllWaitlist() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(waitlist).orderBy(desc(waitlist.createdAt));
}

// ─────────────────────────────────────────────
// SECTORS
// ─────────────────────────────────────────────

export async function getAllSectors() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sectors).where(eq(sectors.isActive, true)).orderBy(sectors.name);
}

export async function createSector(data: InsertSector) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(sectors).values(data);
}

export async function seedSectors() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ count: sql<number>`count(*)` }).from(sectors);
  if (Number(existing[0]?.count) > 0) return;

  const defaultSectors: InsertSector[] = [
    { name: "AgriTech", nameAr: "التكنولوجيا الزراعية", slug: "agritech", description: "Agricultural technology and food systems" },
    { name: "FinTech", nameAr: "التكنولوجيا المالية", slug: "fintech", description: "Financial technology and digital finance" },
    { name: "Renewable Energy", nameAr: "الطاقة المتجددة", slug: "renewable-energy", description: "Clean and renewable energy solutions" },
    { name: "Healthcare & MedTech", nameAr: "الرعاية الصحية", slug: "healthcare", description: "Healthcare and medical technology" },
    { name: "EdTech", nameAr: "تكنولوجيا التعليم", slug: "edtech", description: "Education technology and learning platforms" },
    { name: "Logistics & Mobility", nameAr: "اللوجستيات والتنقل", slug: "logistics", description: "Logistics, transport, and mobility solutions" },
    { name: "E-Commerce", nameAr: "التجارة الإلكترونية", slug: "ecommerce", description: "Digital commerce and marketplaces" },
    { name: "Climate Tech", nameAr: "تقنيات المناخ", slug: "climate-tech", description: "Climate and sustainability technology" },
    { name: "Infrastructure", nameAr: "البنية التحتية", slug: "infrastructure", description: "Infrastructure and construction technology" },
    { name: "Creative Industries", nameAr: "الصناعات الإبداعية", slug: "creative", description: "Media, arts, and creative technology" },
    { name: "Digital Services", nameAr: "الخدمات الرقمية", slug: "digital-services", description: "Digital platforms and services" },
    { name: "Food & Agro-Processing", nameAr: "الغذاء والتصنيع الزراعي", slug: "food-agro", description: "Food processing and agro-industry" },
  ];

  await db.insert(sectors).values(defaultSectors);
}

// ─────────────────────────────────────────────
// VENTURES
// ─────────────────────────────────────────────

export async function createVenture(data: InsertVenture) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(ventures).values(data);
  return result;
}

export async function getVenturesByFounder(founderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ventures).where(eq(ventures.founderId, founderId)).orderBy(desc(ventures.createdAt));
}

export async function getVentureById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ventures).where(eq(ventures.id, id)).limit(1);
  return result[0];
}

export async function updateVenture(id: number, data: Partial<InsertVenture>) {
  const db = await getDb();
  if (!db) return;
  await db.update(ventures).set(data as any).where(eq(ventures.id, id));
}

export async function getPublishedVentures(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(ventures)
    .where(eq(ventures.moderationStatus, "published"))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(ventures.createdAt));
}

export async function getModerationQueue() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(ventures)
    .where(or(eq(ventures.moderationStatus, "submitted"), eq(ventures.moderationStatus, "ai_reviewed")))
    .orderBy(desc(ventures.createdAt));
}

export async function getVentureCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(ventures);
  return Number(result[0]?.count ?? 0);
}

// ─────────────────────────────────────────────
// MATCHES
// ─────────────────────────────────────────────

export async function createMatch(data: InsertMatch) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(matches).values(data);
}

export async function getMatchesForInvestor(investorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(matches).where(eq(matches.investorId, investorId)).orderBy(desc(matches.compatibilityScore));
}

export async function getMatchesForVenture(ventureId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(matches).where(eq(matches.ventureId, ventureId)).orderBy(desc(matches.compatibilityScore));
}

export async function updateMatchStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(matches).set({ status: status as any }).where(eq(matches.id, id));
}

// ─────────────────────────────────────────────
// CONNECTIONS & MESSAGES
// ─────────────────────────────────────────────

export async function createConnectionRequest(data: InsertConnectionRequest) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(connectionRequests).values(data);
}

export async function getConnectionRequests(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(connectionRequests)
    .where(or(eq(connectionRequests.senderId, userId), eq(connectionRequests.receiverId, userId)))
    .orderBy(desc(connectionRequests.createdAt));
}

export async function updateConnectionStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(connectionRequests).set({ status: status as any }).where(eq(connectionRequests.id, id));
}

export async function sendMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(messages).values(data);
}

export async function getMessages(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
      )
    )
    .orderBy(messages.createdAt);
}

export async function getConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
    .orderBy(desc(messages.createdAt));
}

export async function getUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));
  return Number(result[0]?.count ?? 0);
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return Number(result[0]?.count ?? 0);
}

// ─────────────────────────────────────────────
// DOCUMENTS
// ─────────────────────────────────────────────

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(documents).values(data);
}

export async function getDocumentsByVenture(ventureId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.ventureId, ventureId)).orderBy(desc(documents.createdAt));
}

export async function getDocumentsByUser(uploaderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.uploaderId, uploaderId)).orderBy(desc(documents.createdAt));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(documents).where(eq(documents.id, id));
}

// ─────────────────────────────────────────────
// DIASPORA ENGAGEMENTS
// ─────────────────────────────────────────────

export async function createDiasporaEngagement(data: InsertDiasporaEngagement) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(diasporaEngagements).values(data);
}

export async function getDiasporaEngagementsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(diasporaEngagements).where(eq(diasporaEngagements.userId, userId)).orderBy(desc(diasporaEngagements.createdAt));
}

// ─────────────────────────────────────────────
// INVESTOR PREFERENCES
// ─────────────────────────────────────────────

export async function upsertInvestorPreferences(data: InsertInvestorPreference) {
  const db = await getDb();
  if (!db) return;
  await db.insert(investorPreferences).values(data).onDuplicateKeyUpdate({ set: data as any });
}

export async function getInvestorPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(investorPreferences).where(eq(investorPreferences.userId, userId)).limit(1);
  return result[0];
}

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────

export async function trackEvent(data: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analyticsEvents).values(data);
}

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return { users: 0, ventures: 0, investors: 0, matches: 0, waitlist: 0 };

  const [userCount, ventureCount, investorCount, matchCount, waitlistCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(ventures).where(eq(ventures.moderationStatus, "published")),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.platformRole, "investor")),
    db.select({ count: sql<number>`count(*)` }).from(matches).where(eq(matches.status, "connected")),
    db.select({ count: sql<number>`count(*)` }).from(waitlist),
  ]);

  return {
    users: Number(userCount[0]?.count ?? 0),
    ventures: Number(ventureCount[0]?.count ?? 0),
    investors: Number(investorCount[0]?.count ?? 0),
    matches: Number(matchCount[0]?.count ?? 0),
    waitlist: Number(waitlistCount[0]?.count ?? 0),
  };
}
