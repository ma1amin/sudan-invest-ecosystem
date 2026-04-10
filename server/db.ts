import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  engagementNotificationLogs,
  engagementNotificationRules,
  fundingRounds,
  lpInvestors,
  lpFunds,
  lpReports,
  pushNotifications,
  notificationPreferences,
  savedSearches,
  searchAlerts,
  benchmarkComparisons,
  dealRoomDiscussions,
  dealRoomDocuments,
  dealRooms,
  investorReports,
  performanceBenchmarks,
  analyticsEvents,
  behavioralSignals,
  connectionRequests,
  diasporaEngagements,
  documents,
  InsertUser,
  investments,
  investorPreferences,
  matches,
  messages,
  notifications,
  sectors,
  users,
  ventures,
  ventureHistory,
  waitlist,
  type InsertAnalyticsEvent,
  type InsertBehavioralSignal,
  type InsertEngagementNotificationLog,
  type InsertEngagementNotificationRule,
  type InsertBenchmarkComparison,
  type InsertDealRoom,
  type InsertDealRoomDiscussion,
  type InsertDealRoomDocument,
  type InsertInvestorReport,
  type InsertPerformanceBenchmark,
  type InsertFundingRound,
  type InsertConnectionRequest,
  type InsertDiasporaEngagement,
  type InsertDocument,
  type InsertInvestment,
  type InsertInvestorPreference,
  type InsertMatch,
  type InsertMessage,
  type InsertNotification,
  type InsertSector,
  type InsertVenture,
  type InsertVentureHistory,
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


// ─────────────────────────────────────────────
// BEHAVIORAL SIGNALS & ENGAGEMENT SCORING
// ─────────────────────────────────────────────

export async function trackBehavioralSignal(data: InsertBehavioralSignal): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(behavioralSignals).values(data);
}

export async function getEngagementScore(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // Calculate engagement score based on behavioral signals from the last 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const signals = await db
    .select({ scoreContribution: sql<number>`SUM(scoreContribution)` })
    .from(behavioralSignals)
    .where(and(eq(behavioralSignals.userId, userId), sql`createdAt >= ${ninetyDaysAgo}`));

  const totalScore = Number(signals[0]?.scoreContribution ?? 0);
  // Cap at 100 for display purposes
  return Math.min(totalScore, 100);
}

export async function getFounderEngagementMetrics(founderId: number): Promise<{
  engagementScore: number;
  lastActive: Date | null;
  totalSignals: number;
}> {
  const db = await getDb();
  if (!db) return { engagementScore: 0, lastActive: null, totalSignals: 0 };

  const [signals, lastSignal] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(behavioralSignals).where(eq(behavioralSignals.userId, founderId)),
    db.select({ createdAt: behavioralSignals.createdAt }).from(behavioralSignals).where(eq(behavioralSignals.userId, founderId)).orderBy(desc(behavioralSignals.createdAt)).limit(1),
  ]);

  const engagementScore = await getEngagementScore(founderId);
  return {
    engagementScore,
    lastActive: lastSignal[0]?.createdAt ?? null,
    totalSignals: Number(signals[0]?.count ?? 0),
  };
}

// ─────────────────────────────────────────────
// VENTURE DEAL FLOW HISTORY
// ─────────────────────────────────────────────

export async function recordVentureStatusChange(data: InsertVentureHistory): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(ventureHistory).values(data);
}

export async function getVentureHistory(ventureId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ventureHistory).where(eq(ventureHistory.ventureId, ventureId)).orderBy(desc(ventureHistory.changedAt));
}

// ─────────────────────────────────────────────
// INVESTOR INVESTMENTS & PORTFOLIO
// ─────────────────────────────────────────────

export async function createInvestment(data: InsertInvestment): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(investments).values(data);
}

export async function getInvestorPortfolio(investorId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(investments)
    .where(eq(investments.investorId, investorId))
    .orderBy(desc(investments.investmentDate));
}

export async function getPortfolioStats(investorId: number): Promise<{
  totalInvested: number;
  activeInvestments: number;
  exitedInvestments: number;
  totalVentures: number;
  averageInvestmentSize: number;
}> {
  const db = await getDb();
  if (!db) return { totalInvested: 0, activeInvestments: 0, exitedInvestments: 0, totalVentures: 0, averageInvestmentSize: 0 };

  const portfolio = await db
    .select({
      amount: investments.amount,
      status: investments.status,
    })
    .from(investments)
    .where(eq(investments.investorId, investorId));

  const totalInvested = portfolio.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const activeInvestments = portfolio.filter((inv) => inv.status === "active").length;
  const exitedInvestments = portfolio.filter((inv) => inv.status === "exited").length;
  const totalVentures = portfolio.length;
  const averageInvestmentSize = totalVentures > 0 ? totalInvested / totalVentures : 0;

  return {
    totalInvested,
    activeInvestments,
    exitedInvestments,
    totalVentures,
    averageInvestmentSize,
  };
}

export async function getVentureInvestors(ventureId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(investments).where(eq(investments.ventureId, ventureId)).orderBy(desc(investments.investmentDate));
}


// ─────────────────────────────────────────────
// FUNDING ROUNDS
// ─────────────────────────────────────────────

export async function createFundingRound(data: InsertFundingRound): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(fundingRounds).values(data);
}

export async function getFundingRounds(ventureId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(fundingRounds)
    .where(eq(fundingRounds.ventureId, ventureId))
    .orderBy(desc(fundingRounds.announcementDate));
}

export async function getLatestFundingRound(ventureId: number): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;
  const rounds = await db
    .select()
    .from(fundingRounds)
    .where(eq(fundingRounds.ventureId, ventureId))
    .orderBy(desc(fundingRounds.announcementDate))
    .limit(1);
  return rounds[0] || null;
}

export async function updateFundingRound(id: number, data: Partial<InsertFundingRound>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(fundingRounds).set(data).where(eq(fundingRounds.id, id));
}

// ─────────────────────────────────────────────
// ENGAGEMENT NOTIFICATION RULES
// ─────────────────────────────────────────────

export async function createEngagementNotificationRule(data: InsertEngagementNotificationRule): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(engagementNotificationRules).values(data);
}

export async function getEngagementNotificationRules(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(engagementNotificationRules)
    .where(and(eq(engagementNotificationRules.userId, userId), eq(engagementNotificationRules.isActive, true)));
}

export async function updateEngagementNotificationRule(id: number, data: Partial<InsertEngagementNotificationRule>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(engagementNotificationRules).set(data).where(eq(engagementNotificationRules.id, id));
}

export async function logEngagementNotification(data: InsertEngagementNotificationLog): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(engagementNotificationLogs).values(data);
}

export async function getEngagementNotificationLogs(ruleId: number, limit: number = 10): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(engagementNotificationLogs)
    .where(eq(engagementNotificationLogs.ruleId, ruleId))
    .orderBy(desc(engagementNotificationLogs.createdAt))
    .limit(limit);
}

export async function getEngagementNotificationsForFounder(founderId: number, limit: number = 20): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(engagementNotificationLogs)
    .where(eq(engagementNotificationLogs.founderId, founderId))
    .orderBy(desc(engagementNotificationLogs.createdAt))
    .limit(limit);
}


// ─────────────────────────────────────────────
// INVESTOR REPORTING & ANALYTICS
// ─────────────────────────────────────────────

export async function createInvestorReport(data: InsertInvestorReport): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(investorReports).values(data);
}

export async function getInvestorReports(investorId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(investorReports)
    .where(eq(investorReports.investorId, investorId))
    .orderBy(desc(investorReports.createdAt));
}

export async function getInvestorReportById(id: number): Promise<any> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(investorReports)
    .where(eq(investorReports.id, id))
    .limit(1);
  return result[0] || null;
}

export async function updateInvestorReportStatus(id: number, status: string, pdfUrl?: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(investorReports)
    .set({ status, pdfUrl, updatedAt: new Date() })
    .where(eq(investorReports.id, id));
}

// ─────────────────────────────────────────────
// DEAL ROOM & COLLABORATION
// ─────────────────────────────────────────────

export async function createDealRoom(data: InsertDealRoom): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(dealRooms).values(data);
}

export async function getDealRoomsByFundingRound(fundingRoundId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dealRooms)
    .where(eq(dealRooms.fundingRoundId, fundingRoundId))
    .orderBy(desc(dealRooms.createdAt));
}

export async function getDealRoomById(id: number): Promise<any> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(dealRooms)
    .where(eq(dealRooms.id, id))
    .limit(1);
  return result[0] || null;
}

export async function uploadDealRoomDocument(data: InsertDealRoomDocument): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(dealRoomDocuments).values(data);
}

export async function getDealRoomDocuments(dealRoomId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dealRoomDocuments)
    .where(eq(dealRoomDocuments.dealRoomId, dealRoomId))
    .orderBy(desc(dealRoomDocuments.createdAt));
}

export async function createDealRoomDiscussion(data: InsertDealRoomDiscussion): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(dealRoomDiscussions).values(data);
}

export async function getDealRoomDiscussions(dealRoomId: number, limit = 20, offset = 0): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dealRoomDiscussions)
    .where(eq(dealRoomDiscussions.dealRoomId, dealRoomId))
    .orderBy(desc(dealRoomDiscussions.lastActivityAt))
    .limit(limit)
    .offset(offset);
}

export async function updateDiscussionReplyCount(id: number, increment: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const discussion = await db
    .select()
    .from(dealRoomDiscussions)
    .where(eq(dealRoomDiscussions.id, id))
    .limit(1);
  
  if (discussion[0]) {
    await db
      .update(dealRoomDiscussions)
      .set({
        replyCount: (discussion[0].replyCount || 0) + increment,
        lastActivityAt: new Date(),
      })
      .where(eq(dealRoomDiscussions.id, id));
  }
}

// ─────────────────────────────────────────────
// PERFORMANCE BENCHMARKING
// ─────────────────────────────────────────────

export async function createPerformanceBenchmark(data: InsertPerformanceBenchmark): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(performanceBenchmarks).values(data);
}

export async function getPerformanceBenchmarks(sector = "all"): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(performanceBenchmarks)
    .where(eq(performanceBenchmarks.sector, sector))
    .orderBy(desc(performanceBenchmarks.createdAt));
}

export async function getBenchmarkById(id: number): Promise<any> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(performanceBenchmarks)
    .where(eq(performanceBenchmarks.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createBenchmarkComparison(data: InsertBenchmarkComparison): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(benchmarkComparisons).values(data);
}

export async function getBenchmarkComparison(investorId: number, benchmarkId: number): Promise<any> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(benchmarkComparisons)
    .where(and(eq(benchmarkComparisons.investorId, investorId), eq(benchmarkComparisons.benchmarkId, benchmarkId)))
    .limit(1);
  return result[0] || null;
}

export async function getInvestorBenchmarkComparisons(investorId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(benchmarkComparisons)
    .where(eq(benchmarkComparisons.investorId, investorId))
    .orderBy(desc(benchmarkComparisons.createdAt));
}


// ─────────────────────────────────────────────
// LP INVESTOR PORTAL
// ─────────────────────────────────────────────

export async function getLPFundsByManager(managerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lpFunds).where(eq(lpFunds.managerId, managerId));
}

export async function getLPInvestorsByFund(fundId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: lpInvestors.id,
      userId: lpInvestors.userId,
      commitmentAmount: lpInvestors.commitmentAmount,
      capitalCalled: lpInvestors.capitalCalled,
      distributionsReceived: lpInvestors.distributionsReceived,
      currentNAV: lpInvestors.currentNAV,
      irrToDate: lpInvestors.irrToDate,
      moic: lpInvestors.moic,
      status: lpInvestors.status,
      userName: users.name,
      userEmail: users.email,
    })
    .from(lpInvestors)
    .innerJoin(users, eq(lpInvestors.userId, users.id))
    .where(eq(lpInvestors.fundId, fundId));
}

export async function getLPInvestorPortfolio(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      fundId: lpInvestors.fundId,
      fundName: lpFunds.fundName,
      vintageYear: lpFunds.vintageYear,
      commitmentAmount: lpInvestors.commitmentAmount,
      capitalCalled: lpInvestors.capitalCalled,
      distributionsReceived: lpInvestors.distributionsReceived,
      currentNAV: lpInvestors.currentNAV,
      irrToDate: lpInvestors.irrToDate,
      moic: lpInvestors.moic,
      status: lpInvestors.status,
    })
    .from(lpInvestors)
    .innerJoin(lpFunds, eq(lpInvestors.fundId, lpFunds.id))
    .where(eq(lpInvestors.userId, userId));
}

export async function createLPReport(fundId: number, reportType: "quarterly" | "annual" | "custom", reportPeriod: string, content: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(lpReports).values({ fundId, reportType, reportPeriod, content });
}

export async function getLPReportsByFund(fundId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lpReports).where(eq(lpReports.fundId, fundId));
}

// ─────────────────────────────────────────────
// MOBILE PUSH NOTIFICATIONS
// ─────────────────────────────────────────────

export async function createPushNotification(
  userId: number,
  notificationType: string,
  title: string,
  body: string,
  relatedEntityId?: number,
  relatedEntityType?: string
) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(pushNotifications).values({
    userId,
    notificationType,
    title,
    body,
    relatedEntityId,
    relatedEntityType,
  });
}

export async function getPushNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(pushNotifications)
    .where(eq(pushNotifications.userId, userId))
    .orderBy(desc(pushNotifications.createdAt));
}

export async function markPushNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return null;
  return db
    .update(pushNotifications)
    .set({ status: "read", readAt: new Date() })
    .where(eq(pushNotifications.id, notificationId));
}

export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
  return result[0] || null;
}

export async function updateNotificationPreferences(userId: number, preferences: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  return db
    .update(notificationPreferences)
    .set(preferences)
    .where(eq(notificationPreferences.userId, userId));
}

// ─────────────────────────────────────────────
// ADVANCED SEARCH & FILTERS
// ─────────────────────────────────────────────

export async function createSavedSearch(userId: number, searchName: string, filters: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(savedSearches).values({ userId, searchName, filters });
}

export async function getSavedSearchesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(savedSearches).where(eq(savedSearches.userId, userId));
}

export async function updateSavedSearch(searchId: number, filters: Record<string, unknown>, resultCount: number) {
  const db = await getDb();
  if (!db) return null;
  return db
    .update(savedSearches)
    .set({ filters, resultCount, lastRunAt: new Date() })
    .where(eq(savedSearches.id, searchId));
}

export async function createSearchAlert(savedSearchId: number, ventureId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(searchAlerts).values({ savedSearchId, ventureId });
}

export async function getSearchAlertsBySearch(savedSearchId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(searchAlerts).where(eq(searchAlerts.savedSearchId, savedSearchId));
}

export async function markSearchAlertAsSent(alertId: number) {
  const db = await getDb();
  if (!db) return null;
  return db
    .update(searchAlerts)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(searchAlerts.id, alertId));
}
