import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

// ─────────────────────────────────────────────
// USERS & IDENTITY
// ─────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  /** System role for RBAC */
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** Platform-specific role */
  platformRole: mysqlEnum("platformRole", [
    "founder",
    "investor",
    "mentor",
    "diaspora",
    "admin",
    "pending",
  ])
    .default("pending")
    .notNull(),
  /** Verification status */
  verificationStatus: mysqlEnum("verificationStatus", [
    "unverified",
    "pending",
    "verified",
    "rejected",
  ])
    .default("unverified")
    .notNull(),
  /** Profile data as JSON (bio, location, linkedin, avatar, etc.) */
  profileData: json("profileData"),
  /** Preferred language */
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "ar"])
    .default("en")
    .notNull(),
  isProfileComplete: boolean("isProfileComplete").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─────────────────────────────────────────────
// WAITLIST
// ─────────────────────────────────────────────

export const waitlist = mysqlTable("waitlist", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  role: mysqlEnum("role", ["founder", "investor", "mentor", "diaspora", "other"])
    .default("founder")
    .notNull(),
  country: varchar("country", { length: 100 }),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Waitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = typeof waitlist.$inferInsert;

// ─────────────────────────────────────────────
// SECTORS
// ─────────────────────────────────────────────

export const sectors = mysqlTable("sectors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  parentId: int("parentId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Sector = typeof sectors.$inferSelect;
export type InsertSector = typeof sectors.$inferInsert;

// ─────────────────────────────────────────────
// VENTURES / PROJECTS
// ─────────────────────────────────────────────

export const ventures = mysqlTable("ventures", {
  id: int("id").autoincrement().primaryKey(),
  founderId: int("founderId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  tagline: varchar("tagline", { length: 500 }),
  taglineAr: varchar("taglineAr", { length: 500 }),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr"),
  sectorId: int("sectorId"),
  subsectors: json("subsectors"), // array of strings
  stage: mysqlEnum("stage", [
    "idea",
    "prototype",
    "mvp",
    "early_traction",
    "growth",
    "scaling",
  ])
    .default("idea")
    .notNull(),
  fundingTarget: decimal("fundingTarget", { precision: 15, scale: 2 }),
  fundingRaised: decimal("fundingRaised", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("USD"),
  country: varchar("country", { length: 100 }),
  teamSize: int("teamSize").default(1),
  /** Sudan state/region where the venture operates */
  sudanRegion: varchar("sudanRegion", { length: 100 }),
  website: varchar("website", { length: 500 }),
  pitchDeckUrl: varchar("pitchDeckUrl", { length: 1000 }),
  /** AI-generated readiness score 0-100 */
  aiReadinessScore: int("aiReadinessScore"),
  /** Full AI analysis result as JSON */
  aiAnalysis: json("aiAnalysis"),
  /** Moderation status */
  moderationStatus: mysqlEnum("moderationStatus", [
    "draft",
    "submitted",
    "ai_reviewed",
    "under_review",
    "published",
    "rejected",
    "incubation",
  ])
    .default("draft")
    .notNull(),
  moderationNotes: text("moderationNotes"),
  isPublic: boolean("isPublic").default(false).notNull(),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Venture = typeof ventures.$inferSelect;
export type InsertVenture = typeof ventures.$inferInsert;

// ─────────────────────────────────────────────
// MATCHES
// ─────────────────────────────────────────────

export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  ventureId: int("ventureId").notNull(),
  investorId: int("investorId").notNull(),
  compatibilityScore: int("compatibilityScore"), // 0-100
  matchRationale: text("matchRationale"),
  matchFactors: json("matchFactors"), // sector, stage, geography, behavioral
  status: mysqlEnum("status", [
    "suggested",
    "viewed",
    "interested",
    "connected",
    "declined",
    "invested",
  ])
    .default("suggested")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

// ─────────────────────────────────────────────
// CONNECTION REQUESTS & MESSAGES
// ─────────────────────────────────────────────

export const connectionRequests = mysqlTable("connectionRequests", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  ventureId: int("ventureId"),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "accepted", "declined"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConnectionRequest = typeof connectionRequests.$inferSelect;
export type InsertConnectionRequest = typeof connectionRequests.$inferInsert;

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  connectionId: int("connectionId"),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "new_match",
    "connection_request",
    "message",
    "project_update",
    "funding_request",
    "moderation_update",
    "system",
  ])
    .default("system")
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  body: text("body"),
  bodyAr: text("bodyAr"),
  referenceId: int("referenceId"),
  referenceType: varchar("referenceType", { length: 50 }),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─────────────────────────────────────────────
// DOCUMENTS
// ─────────────────────────────────────────────

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  uploaderId: int("uploaderId").notNull(),
  ventureId: int("ventureId"),
  type: mysqlEnum("type", [
    "pitch_deck",
    "business_plan",
    "financial_projection",
    "legal_document",
    "due_diligence",
    "other",
  ])
    .default("other")
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 1000 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  /** Access level: public, verified_investors, connected_only, private */
  accessLevel: mysqlEnum("accessLevel", [
    "public",
    "verified_investors",
    "connected_only",
    "private",
  ])
    .default("private")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ─────────────────────────────────────────────
// DIASPORA ENGAGEMENT
// ─────────────────────────────────────────────

export const diasporaEngagements = mysqlTable("diasporaEngagements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ventureId: int("ventureId"),
  type: mysqlEnum("type", [
    "investment",
    "mentorship",
    "partnership",
    "sponsorship",
    "donation",
  ])
    .default("mentorship")
    .notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "active", "completed", "cancelled"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiasporaEngagement = typeof diasporaEngagements.$inferSelect;
export type InsertDiasporaEngagement = typeof diasporaEngagements.$inferInsert;

// ─────────────────────────────────────────────
// PLATFORM ANALYTICS EVENTS
// ─────────────────────────────────────────────

export const analyticsEvents = mysqlTable("analyticsEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  referenceId: int("referenceId"),
  referenceType: varchar("referenceType", { length: 50 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// ─────────────────────────────────────────────
// INVESTOR PREFERENCES
// ─────────────────────────────────────────────

export const investorPreferences = mysqlTable("investorPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  preferredSectors: json("preferredSectors"), // array of sector IDs
  preferredStages: json("preferredStages"), // array of stage strings
  preferredGeographies: json("preferredGeographies"), // array of country strings
  minInvestment: decimal("minInvestment", { precision: 15, scale: 2 }),
  maxInvestment: decimal("maxInvestment", { precision: 15, scale: 2 }),
  investmentThesis: text("investmentThesis"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvestorPreference = typeof investorPreferences.$inferSelect;
export type InsertInvestorPreference = typeof investorPreferences.$inferInsert;

// ─────────────────────────────────────────────
// BEHAVIORAL SIGNALS & ENGAGEMENT SCORING
// ─────────────────────────────────────────────

export const behavioralSignals = mysqlTable("behavioralSignals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Event type: login, profile_update, venture_submit, message_sent, document_upload, etc. */
  eventType: varchar("eventType", { length: 100 }).notNull(),
  /** Reference to the entity (venture ID, message ID, etc.) */
  referenceId: int("referenceId"),
  /** Score contribution for this signal (0-10) */
  scoreContribution: int("scoreContribution").default(1),
  metadata: json("metadata"), // Additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BehavioralSignal = typeof behavioralSignals.$inferSelect;
export type InsertBehavioralSignal = typeof behavioralSignals.$inferInsert;

// ─────────────────────────────────────────────
// INVESTOR INVESTMENTS & PORTFOLIO
// ─────────────────────────────────────────────

export const investments = mysqlTable("investments", {
  id: int("id").autoincrement().primaryKey(),
  investorId: int("investorId").notNull(),
  ventureId: int("ventureId").notNull(),
  /** Investment amount in the specified currency */
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  /** Investment type: equity, debt, grant, convertible, etc. */
  investmentType: mysqlEnum("investmentType", [
    "equity",
    "debt",
    "grant",
    "convertible",
    "revenue_share",
    "other",
  ])
    .default("equity")
    .notNull(),
  /** Valuation at time of investment */
  valuation: decimal("valuation", { precision: 15, scale: 2 }),
  /** Equity percentage (if applicable) */
  equityPercentage: decimal("equityPercentage", { precision: 5, scale: 2 }),
  /** Investment status: pending, active, exited, written_off */
  status: mysqlEnum("status", [
    "pending",
    "active",
    "exited",
    "written_off",
  ])
    .default("pending")
    .notNull(),
  /** Notes about the investment */
  notes: text("notes"),
  investmentDate: timestamp("investmentDate"),
  exitDate: timestamp("exitDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = typeof investments.$inferInsert;

// ─────────────────────────────────────────────
// VENTURE DEAL FLOW HISTORY
// ─────────────────────────────────────────────

export const ventureHistory = mysqlTable("ventureHistory", {
  id: int("id").autoincrement().primaryKey(),
  ventureId: int("ventureId").notNull(),
  /** Previous moderation status */
  previousStatus: varchar("previousStatus", { length: 50 }),
  /** New moderation status */
  newStatus: varchar("newStatus", { length: 50 }).notNull(),
  /** Admin who made the change */
  changedBy: int("changedBy"),
  /** Reason for status change */
  reason: text("reason"),
  /** Timestamp of the status change */
  changedAt: timestamp("changedAt").defaultNow().notNull(),
});

export type VentureHistory = typeof ventureHistory.$inferSelect;
export type InsertVentureHistory = typeof ventureHistory.$inferInsert;


// ─────────────────────────────────────────────
// FUNDING ROUNDS
// ─────────────────────────────────────────────

export const fundingRounds = mysqlTable("fundingRounds", {
  id: int("id").autoincrement().primaryKey(),
  ventureId: int("ventureId").notNull(),
  /** Round type: Seed, Series A, Series B, Series C, etc. */
  roundType: varchar("roundType", { length: 50 }).notNull(),
  /** Total amount raised in this round */
  amountRaised: decimal("amountRaised", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  /** Post-money valuation after this round */
  postMoneyValuation: decimal("postMoneyValuation", { precision: 15, scale: 2 }),
  /** Lead investor name */
  leadInvestor: varchar("leadInvestor", { length: 255 }),
  /** Number of investors in this round */
  investorCount: int("investorCount"),
  /** Round status: planned, active, closed, cancelled */
  status: mysqlEnum("status", [
    "planned",
    "active",
    "closed",
    "cancelled",
  ])
    .default("planned")
    .notNull(),
  /** Announcement date */
  announcementDate: timestamp("announcementDate"),
  /** Round completion date */
  closureDate: timestamp("closureDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundingRound = typeof fundingRounds.$inferSelect;
export type InsertFundingRound = typeof fundingRounds.$inferInsert;

// ─────────────────────────────────────────────
// ENGAGEMENT NOTIFICATION RULES
// ─────────────────────────────────────────────

export const engagementNotificationRules = mysqlTable("engagementNotificationRules", {
  id: int("id").autoincrement().primaryKey(),
  /** Investor or mentor ID who receives the notification */
  userId: int("userId").notNull(),
  /** Venture ID to monitor */
  ventureId: int("ventureId").notNull(),
  /** Engagement score threshold (0-100) */
  engagementThreshold: int("engagementThreshold").default(30).notNull(),
  /** Days of inactivity before triggering notification */
  inactivityDays: int("inactivityDays").default(14).notNull(),
  /** Is the rule active */
  isActive: boolean("isActive").default(true).notNull(),
  /** Last notification sent at */
  lastNotificationAt: timestamp("lastNotificationAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EngagementNotificationRule = typeof engagementNotificationRules.$inferSelect;
export type InsertEngagementNotificationRule = typeof engagementNotificationRules.$inferInsert;

// ─────────────────────────────────────────────
// ENGAGEMENT NOTIFICATION LOGS
// ─────────────────────────────────────────────

export const engagementNotificationLogs = mysqlTable("engagementNotificationLogs", {
  id: int("id").autoincrement().primaryKey(),
  /** Rule ID that triggered this notification */
  ruleId: int("ruleId").notNull(),
  /** Founder ID being monitored */
  founderId: int("founderId").notNull(),
  /** Engagement score at time of notification */
  engagementScoreAtTime: int("engagementScoreAtTime"),
  /** Days since last activity */
  daysSinceLastActivity: int("daysSinceLastActivity"),
  /** Notification message sent */
  message: text("message"),
  /** Was the notification sent successfully */
  sentSuccessfully: boolean("sentSuccessfully").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EngagementNotificationLog = typeof engagementNotificationLogs.$inferSelect;
export type InsertEngagementNotificationLog = typeof engagementNotificationLogs.$inferInsert;


// ─────────────────────────────────────────────
// INVESTOR REPORTING & ANALYTICS
// ─────────────────────────────────────────────

export const investorReports = mysqlTable("investorReports", {
  id: int("id").autoincrement().primaryKey(),
  investorId: int("investorId").notNull(),
  /** Report type: quarterly, annual, custom */
  reportType: varchar("reportType", { length: 50 }).notNull(),
  /** Reporting period: Q1 2024, 2024, custom date range */
  reportingPeriod: varchar("reportingPeriod", { length: 100 }).notNull(),
  /** Report data as JSON: portfolio metrics, exits, performance, etc. */
  reportData: json("reportData").notNull(),
  /** Total portfolio value */
  totalPortfolioValue: decimal("totalPortfolioValue", { precision: 15, scale: 2 }),
  /** Total unrealized value */
  unrealizedValue: decimal("unrealizedValue", { precision: 15, scale: 2 }),
  /** Total realized value */
  realizedValue: decimal("realizedValue", { precision: 15, scale: 2 }),
  /** Report status: draft, generated, sent */
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  /** PDF file URL (if generated) */
  pdfUrl: text("pdfUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvestorReport = typeof investorReports.$inferSelect;
export type InsertInvestorReport = typeof investorReports.$inferInsert;

// ─────────────────────────────────────────────
// DEAL ROOM & COLLABORATION
// ─────────────────────────────────────────────

export const dealRooms = mysqlTable("dealRooms", {
  id: int("id").autoincrement().primaryKey(),
  fundingRoundId: int("fundingRoundId").notNull(),
  ventureId: int("ventureId").notNull(),
  /** Room name/title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Room description */
  description: text("description"),
  /** Room status: active, archived, closed */
  status: varchar("status", { length: 50 }).default("active").notNull(),
  /** Access control: investors, advisors, all */
  accessLevel: varchar("accessLevel", { length: 50 }).default("investors").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DealRoom = typeof dealRooms.$inferSelect;
export type InsertDealRoom = typeof dealRooms.$inferInsert;

// ─────────────────────────────────────────────
// DEAL ROOM DOCUMENTS & DISCUSSIONS
// ─────────────────────────────────────────────

export const dealRoomDocuments = mysqlTable("dealRoomDocuments", {
  id: int("id").autoincrement().primaryKey(),
  dealRoomId: int("dealRoomId").notNull(),
  uploadedById: int("uploadedById").notNull(),
  /** Document name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Document type: term_sheet, cap_table, financial, legal, other */
  documentType: varchar("documentType", { length: 50 }).notNull(),
  /** S3 file URL */
  fileUrl: text("fileUrl").notNull(),
  /** File size in bytes */
  fileSize: int("fileSize"),
  /** MIME type */
  mimeType: varchar("mimeType", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DealRoomDocument = typeof dealRoomDocuments.$inferSelect;
export type InsertDealRoomDocument = typeof dealRoomDocuments.$inferInsert;

export const dealRoomDiscussions = mysqlTable("dealRoomDiscussions", {
  id: int("id").autoincrement().primaryKey(),
  dealRoomId: int("dealRoomId").notNull(),
  userId: int("userId").notNull(),
  /** Discussion thread title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Discussion content */
  content: text("content").notNull(),
  /** Number of replies */
  replyCount: int("replyCount").default(0).notNull(),
  /** Last activity timestamp */
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DealRoomDiscussion = typeof dealRoomDiscussions.$inferSelect;
export type InsertDealRoomDiscussion = typeof dealRoomDiscussions.$inferInsert;

// ─────────────────────────────────────────────
// PERFORMANCE BENCHMARKING
// ─────────────────────────────────────────────

export const performanceBenchmarks = mysqlTable("performanceBenchmarks", {
  id: int("id").autoincrement().primaryKey(),
  /** Benchmark name: Sudan VC Index, Africa VC Index, Global VC Index */
  benchmarkName: varchar("benchmarkName", { length: 255 }).notNull(),
  /** Sector focus: all, tech, agritech, fintech, etc. */
  sector: varchar("sector", { length: 100 }).default("all").notNull(),
  /** Reporting period: Q1 2024, 2024, etc. */
  reportingPeriod: varchar("reportingPeriod", { length: 100 }).notNull(),
  /** Benchmark metrics as JSON: avg MOIC, avg IRR, median return, etc. */
  metrics: json("metrics").notNull(),
  /** Number of funds in benchmark */
  fundCount: int("fundCount"),
  /** Total AUM in benchmark */
  totalAUM: decimal("totalAUM", { precision: 15, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PerformanceBenchmark = typeof performanceBenchmarks.$inferSelect;
export type InsertPerformanceBenchmark = typeof performanceBenchmarks.$inferInsert;

export const benchmarkComparisons = mysqlTable("benchmarkComparisons", {
  id: int("id").autoincrement().primaryKey(),
  investorId: int("investorId").notNull(),
  benchmarkId: int("benchmarkId").notNull(),
  /** Investor's MOIC vs benchmark */
  moicPercentile: decimal("moicPercentile", { precision: 5, scale: 2 }),
  /** Investor's IRR vs benchmark */
  irrPercentile: decimal("irrPercentile", { precision: 5, scale: 2 }),
  /** Investor's return vs benchmark */
  returnPercentile: decimal("returnPercentile", { precision: 5, scale: 2 }),
  /** Performance attribution: outperformance/underperformance reason */
  attribution: text("attribution"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BenchmarkComparison = typeof benchmarkComparisons.$inferSelect;
export type InsertBenchmarkComparison = typeof benchmarkComparisons.$inferInsert;


// ─────────────────────────────────────────────
// LP INVESTOR PORTAL
// ─────────────────────────────────────────────

export const lpInvestors = mysqlTable("lpInvestors", {
  id: int("id").autoincrement().primaryKey(),
  /** Fund ID this LP is invested in */
  fundId: int("fundId").notNull(),
  /** LP user ID */
  userId: int("userId").notNull(),
  /** Commitment amount */
  commitmentAmount: decimal("commitmentAmount", { precision: 15, scale: 2 }).notNull(),
  /** Capital called to date */
  capitalCalled: decimal("capitalCalled", { precision: 15, scale: 2 }).default("0"),
  /** Distributions received */
  distributionsReceived: decimal("distributionsReceived", { precision: 15, scale: 2 }).default("0"),
  /** Current NAV (Net Asset Value) */
  currentNAV: decimal("currentNAV", { precision: 15, scale: 2 }).default("0"),
  /** IRR to date */
  irrToDate: decimal("irrToDate", { precision: 5, scale: 2 }).default("0"),
  /** MOIC (Multiple on Invested Capital) */
  moic: decimal("moic", { precision: 5, scale: 2 }).default("0"),
  /** LP status: active, exited, pending */
  status: mysqlEnum("status", ["active", "exited", "pending"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LPInvestor = typeof lpInvestors.$inferSelect;
export type InsertLPInvestor = typeof lpInvestors.$inferInsert;

export const lpFunds = mysqlTable("lpFunds", {
  id: int("id").autoincrement().primaryKey(),
  /** Fund name */
  fundName: varchar("fundName", { length: 255 }).notNull(),
  /** Fund manager/investor ID */
  managerId: int("managerId").notNull(),
  /** Fund vintage year */
  vintageYear: int("vintageYear").notNull(),
  /** Target fund size */
  targetSize: decimal("targetSize", { precision: 15, scale: 2 }).notNull(),
  /** Current fund size raised */
  currentSize: decimal("currentSize", { precision: 15, scale: 2 }).default("0"),
  /** Fund status: raising, active, closed */
  status: mysqlEnum("status", ["raising", "active", "closed"]).default("raising").notNull(),
  /** Fund metrics as JSON: total investments, exits, avg return, etc. */
  metrics: json("metrics"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LPFund = typeof lpFunds.$inferSelect;
export type InsertLPFund = typeof lpFunds.$inferInsert;

export const lpReports = mysqlTable("lpReports", {
  id: int("id").autoincrement().primaryKey(),
  /** Fund ID */
  fundId: int("fundId").notNull(),
  /** Report type: quarterly, annual, custom */
  reportType: mysqlEnum("reportType", ["quarterly", "annual", "custom"]).notNull(),
  /** Report period: Q1 2024, 2024, etc. */
  reportPeriod: varchar("reportPeriod", { length: 100 }).notNull(),
  /** Report content as JSON: performance metrics, portfolio updates, etc. */
  content: json("content").notNull(),
  /** PDF URL if generated */
  pdfUrl: text("pdfUrl"),
  /** Report status: draft, generated, sent */
  status: mysqlEnum("status", ["draft", "generated", "sent"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LPReport = typeof lpReports.$inferSelect;
export type InsertLPReport = typeof lpReports.$inferInsert;

// ─────────────────────────────────────────────
// MOBILE PUSH NOTIFICATIONS
// ─────────────────────────────────────────────

export const pushNotifications = mysqlTable("pushNotifications", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID receiving notification */
  userId: int("userId").notNull(),
  /** Notification type: venture_update, investor_message, deal_alert, etc. */
  notificationType: varchar("notificationType", { length: 100 }).notNull(),
  /** Title of notification */
  title: varchar("title", { length: 255 }).notNull(),
  /** Body of notification */
  body: text("body").notNull(),
  /** Related entity ID (venture, investment, message, etc.) */
  relatedEntityId: int("relatedEntityId"),
  /** Related entity type (venture, investment, message, etc.) */
  relatedEntityType: varchar("relatedEntityType", { length: 100 }),
  /** Notification status: pending, sent, failed, read */
  status: mysqlEnum("status", ["pending", "sent", "failed", "read"]).default("pending").notNull(),
  /** Sent timestamp */
  sentAt: timestamp("sentAt"),
  /** Read timestamp */
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PushNotification = typeof pushNotifications.$inferSelect;
export type InsertPushNotification = typeof pushNotifications.$inferInsert;

export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID */
  userId: int("userId").notNull().unique(),
  /** Enable venture updates */
  ventureUpdates: boolean("ventureUpdates").default(true).notNull(),
  /** Enable investor messages */
  investorMessages: boolean("investorMessages").default(true).notNull(),
  /** Enable deal alerts */
  dealAlerts: boolean("dealAlerts").default(true).notNull(),
  /** Enable portfolio updates */
  portfolioUpdates: boolean("portfolioUpdates").default(true).notNull(),
  /** Notification digest: immediate, daily, weekly */
  digestFrequency: mysqlEnum("digestFrequency", ["immediate", "daily", "weekly"]).default("immediate").notNull(),
  /** Quiet hours: start time (HH:MM) */
  quietHoursStart: varchar("quietHoursStart", { length: 5 }),
  /** Quiet hours: end time (HH:MM) */
  quietHoursEnd: varchar("quietHoursEnd", { length: 5 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

// ─────────────────────────────────────────────
// ADVANCED SEARCH & FILTERS
// ─────────────────────────────────────────────

export const savedSearches = mysqlTable("savedSearches", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID who saved the search */
  userId: int("userId").notNull(),
  /** Search name */
  searchName: varchar("searchName", { length: 255 }).notNull(),
  /** Search filters as JSON: sectors, stages, regions, team size, funding range, etc. */
  filters: json("filters").notNull(),
  /** Number of results */
  resultCount: int("resultCount").default(0),
  /** Last run timestamp */
  lastRunAt: timestamp("lastRunAt"),
  /** Enable alerts for new matches */
  alertsEnabled: boolean("alertsEnabled").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

export const searchAlerts = mysqlTable("searchAlerts", {
  id: int("id").autoincrement().primaryKey(),
  /** Saved search ID */
  savedSearchId: int("savedSearchId").notNull(),
  /** Venture ID that matches */
  ventureId: int("ventureId").notNull(),
  /** Alert status: pending, sent, dismissed */
  status: mysqlEnum("status", ["pending", "sent", "dismissed"]).default("pending").notNull(),
  /** Sent timestamp */
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SearchAlert = typeof searchAlerts.$inferSelect;
export type InsertSearchAlert = typeof searchAlerts.$inferInsert;
