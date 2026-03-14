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
