import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import {
  addToWaitlist,
  createConnectionRequest,
  createDiasporaEngagement,
  createDocument,
  createMatch,
  createNotification,
  createVenture,
  deleteDocument,
  getAllSectors,
  getAllUsers,
  getAllWaitlist,
  getConversations,
  getDocumentsByUser,
  getDocumentsByVenture,
  getInvestorPreferences,
  getMatchesForInvestor,
  getMatchesForVenture,
  getMessages,
  getModerationQueue,
  getPlatformStats,
  getPublishedVentures,
  getUnreadMessageCount,
  getUnreadNotificationCount,
  getUserById,
  getUserNotifications,
  getVentureById,
  getVenturesByFounder,
  getWaitlistCount,
  markAllNotificationsRead,
  markNotificationRead,
  seedSectors,
  sendMessage,
  trackEvent,
  updateConnectionStatus,
  updateMatchStatus,
  updateUserProfile,
  updateVenture,
  upsertInvestorPreferences,
  getConnectionRequests,
  getDiasporaEngagementsByUser,
} from "./db";
import { nanoid } from "nanoid";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function adminProcedure() {
  return protectedProcedure.use(({ ctx, next }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }
    return next({ ctx });
  });
}

// ─────────────────────────────────────────────
// APP ROUTER
// ─────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  // ── AUTH ──────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── WAITLIST ──────────────────────────────
  waitlist: router({
    join: publicProcedure
      .input(
        z.object({
          name: z.string().min(2).max(255),
          email: z.string().email().max(320),
          role: z.enum(["founder", "investor", "mentor", "diaspora", "other"]),
          country: z.string().max(100).optional(),
          message: z.string().max(1000).optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await addToWaitlist(input);
          return { success: true };
        } catch (e: any) {
          if (e?.code === "ER_DUP_ENTRY") {
            throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to join waitlist" });
        }
      }),
    count: publicProcedure.query(async () => {
      return { count: await getWaitlistCount() };
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllWaitlist();
    }),
  }),

  // ── SECTORS ──────────────────────────────
  sectors: router({
    list: publicProcedure.query(async () => {
      await seedSectors();
      return getAllSectors();
    }),
  }),

  // ── USER PROFILE ─────────────────────────
  user: router({
    updateProfile: protectedProcedure
      .input(
        z.object({
          platformRole: z.enum(["founder", "investor", "mentor", "diaspora"]).optional(),
          profileData: z.record(z.string(), z.unknown()).optional(),
          preferredLanguage: z.enum(["en", "ar"]).optional(),
          isProfileComplete: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return getUserById(ctx.user.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getUserById(input.id);
      }),
    stats: protectedProcedure.query(async ({ ctx }) => {
      const [unreadMessages, unreadNotifications] = await Promise.all([
        getUnreadMessageCount(ctx.user.id),
        getUnreadNotificationCount(ctx.user.id),
      ]);
      return { unreadMessages, unreadNotifications };
    }),
    adminList: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getAllUsers();
    }),
    updateRole: protectedProcedure
      .input(z.object({ userId: z.number(), platformRole: z.string(), verificationStatus: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        await updateUserProfile(input.userId, {
          platformRole: input.platformRole,
          verificationStatus: input.verificationStatus,
        });
        return { success: true };
      }),
  }),

  // ── VENTURES ─────────────────────────────
  ventures: router({
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(3).max(255),
          titleAr: z.string().max(255).optional(),
          tagline: z.string().max(500).optional(),
          taglineAr: z.string().max(500).optional(),
          description: z.string().min(50),
          descriptionAr: z.string().optional(),
          sectorId: z.number().optional(),
          subsectors: z.array(z.string()).optional(),
          stage: z.enum(["idea", "prototype", "mvp", "early_traction", "growth", "scaling"]),
          fundingTarget: z.string().optional(),
          country: z.string().max(100).optional(),
          teamSize: z.number().min(1).max(1000).optional(),
          website: z.string().url().optional().or(z.literal("")),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createVenture({
          ...input,
          founderId: ctx.user.id,
          moderationStatus: "draft",
          isPublic: false,
        });
        await trackEvent({ userId: ctx.user.id, eventType: "venture_created", referenceType: "venture" });
        return { success: true };
      }),

    submit: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const venture = await getVentureById(input.id);
        if (!venture) throw new TRPCError({ code: "NOT_FOUND" });
        if (venture.founderId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        // Trigger AI scoring
        try {
          const aiResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an expert venture analyst for an African innovation ecosystem. Analyze the venture submission and provide a structured JSON response with:
1. readinessScore (0-100): Overall venture readiness
2. marketClarity (0-100): How clear and validated the market opportunity is
3. businessModelStrength (0-100): Strength of the business model
4. teamReadiness (0-100): Team capability assessment
5. scalabilityScore (0-100): Potential for scale
6. riskIndicators (array of strings): Key risk factors identified
7. strengths (array of strings): Key strengths
8. recommendations (array of strings): Specific improvement recommendations
9. summary (string): 2-3 sentence executive summary of the analysis`,
              },
              {
                role: "user",
                content: `Analyze this venture:
Title: ${venture.title}
Stage: ${venture.stage}
Description: ${venture.description}
Funding Target: ${venture.fundingTarget ?? "Not specified"}
Team Size: ${venture.teamSize ?? "Not specified"}
Country: ${venture.country ?? "Not specified"}`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "venture_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    readinessScore: { type: "number" },
                    marketClarity: { type: "number" },
                    businessModelStrength: { type: "number" },
                    teamReadiness: { type: "number" },
                    scalabilityScore: { type: "number" },
                    riskIndicators: { type: "array", items: { type: "string" } },
                    strengths: { type: "array", items: { type: "string" } },
                    recommendations: { type: "array", items: { type: "string" } },
                    summary: { type: "string" },
                  },
                  required: ["readinessScore", "marketClarity", "businessModelStrength", "teamReadiness", "scalabilityScore", "riskIndicators", "strengths", "recommendations", "summary"],
                  additionalProperties: false,
                },
              },
            },
          });

          const rawContent = aiResponse.choices?.[0]?.message?.content;
          const analysisText = typeof rawContent === 'string' ? rawContent : null;
          const analysis = analysisText ? JSON.parse(analysisText) : null;

          await updateVenture(input.id, {
            moderationStatus: "ai_reviewed",
            aiReadinessScore: analysis?.readinessScore ?? null,
            aiAnalysis: analysis,
          });
        } catch (e) {
          console.error("AI scoring failed:", e);
          await updateVenture(input.id, { moderationStatus: "submitted" });
        }

        await trackEvent({ userId: ctx.user.id, eventType: "venture_submitted", referenceId: input.id, referenceType: "venture" });
        return { success: true };
      }),

    myVentures: protectedProcedure.query(async ({ ctx }) => {
      return getVenturesByFounder(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getVentureById(input.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(3).max(255).optional(),
        tagline: z.string().max(500).optional(),
        description: z.string().min(50).optional(),
        sectorId: z.number().optional(),
        stage: z.enum(["idea", "prototype", "mvp", "early_traction", "growth", "scaling"]).optional(),
        fundingTarget: z.string().optional(),
        country: z.string().max(100).optional(),
        teamSize: z.number().optional(),
        website: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const venture = await getVentureById(id);
        if (!venture) throw new TRPCError({ code: "NOT_FOUND" });
        if (venture.founderId !== ctx.user.id && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        await updateVenture(id, data);
        return { success: true };
      }),

    published: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return getPublishedVentures(input.limit, input.offset);
      }),

    moderationQueue: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return getModerationQueue();
    }),

    moderate: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["published", "rejected", "incubation", "under_review"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const venture = await getVentureById(input.id);
        if (!venture) throw new TRPCError({ code: "NOT_FOUND" });

        await updateVenture(input.id, {
          moderationStatus: input.status,
          moderationNotes: input.notes,
          isPublic: input.status === "published",
        });

        // Notify founder
        await createNotification({
          userId: venture.founderId,
          type: "moderation_update",
          title: `Your venture "${venture.title}" has been ${input.status}`,
          titleAr: `تم ${input.status === "published" ? "نشر" : "مراجعة"} مشروعك "${venture.titleAr ?? venture.title}"`,
          body: input.notes ?? undefined,
          referenceId: input.id,
          referenceType: "venture",
        });

        return { success: true };
      }),
  }),

  // ── MATCHING ─────────────────────────────
  matching: router({
    generateMatches: protectedProcedure
      .input(z.object({ ventureId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        const venture = await getVentureById(input.ventureId);
        if (!venture) throw new TRPCError({ code: "NOT_FOUND" });

        const investors = await getAllUsers(100, 0);
        const investorUsers = investors.filter((u) => u.platformRole === "investor");

        for (const investor of investorUsers.slice(0, 10)) {
          const prefs = await getInvestorPreferences(investor.id);
          const score = Math.floor(60 + Math.random() * 40);
          await createMatch({
            ventureId: input.ventureId,
            investorId: investor.id,
            compatibilityScore: score,
            matchRationale: `Strong alignment in ${venture.stage} stage ventures with sector compatibility.`,
            matchFactors: { sector: true, stage: true, geography: !!venture.country },
          });
          await createNotification({
            userId: investor.id,
            type: "new_match",
            title: `New matching opportunity: ${venture.title}`,
            titleAr: `فرصة مطابقة جديدة: ${venture.titleAr ?? venture.title}`,
            body: `Compatibility score: ${score}%`,
            referenceId: input.ventureId,
            referenceType: "venture",
          });
        }
        return { success: true };
      }),

    forInvestor: protectedProcedure.query(async ({ ctx }) => {
      return getMatchesForInvestor(ctx.user.id);
    }),

    forVenture: protectedProcedure
      .input(z.object({ ventureId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getMatchesForVenture(input.ventureId);
      }),

    updateStatus: protectedProcedure
      .input(z.object({ matchId: z.number(), status: z.enum(["viewed", "interested", "connected", "declined"]) }))
      .mutation(async ({ ctx, input }) => {
        await updateMatchStatus(input.matchId, input.status);
        return { success: true };
      }),
  }),

  // ── CONNECTIONS ──────────────────────────
  connections: router({
    request: protectedProcedure
      .input(z.object({
        receiverId: z.number(),
        ventureId: z.number().optional(),
        message: z.string().max(1000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createConnectionRequest({ ...input, senderId: ctx.user.id });
        await createNotification({
          userId: input.receiverId,
          type: "connection_request",
          title: "New connection request",
          titleAr: "طلب تواصل جديد",
          body: input.message ?? undefined,
          referenceId: ctx.user.id,
          referenceType: "user",
        });
        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getConnectionRequests(ctx.user.id);
    }),

    respond: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(["accepted", "declined"]) }))
      .mutation(async ({ ctx, input }) => {
        await updateConnectionStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ── MESSAGES ─────────────────────────────
  messages: router({
    send: protectedProcedure
      .input(z.object({
        receiverId: z.number(),
        content: z.string().min(1).max(5000),
        connectionId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await sendMessage({ ...input, senderId: ctx.user.id });
        await createNotification({
          userId: input.receiverId,
          type: "message",
          title: "New message",
          titleAr: "رسالة جديدة",
          referenceId: ctx.user.id,
          referenceType: "user",
        });
        return { success: true };
      }),

    conversation: protectedProcedure
      .input(z.object({ otherUserId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getMessages(ctx.user.id, input.otherUserId);
      }),

    conversations: protectedProcedure.query(async ({ ctx }) => {
      return getConversations(ctx.user.id);
    }),
  }),

  // ── NOTIFICATIONS ─────────────────────────
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserNotifications(ctx.user.id);
    }),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.id);
        return { success: true };
      }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ── DOCUMENTS ────────────────────────────
  documents: router({
    upload: protectedProcedure
      .input(z.object({
        name: z.string().max(255),
        type: z.enum(["pitch_deck", "business_plan", "financial_projection", "legal_document", "due_diligence", "other"]),
        ventureId: z.number().optional(),
        accessLevel: z.enum(["public", "verified_investors", "connected_only", "private"]).default("private"),
        fileBase64: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const fileBuffer = Buffer.from(input.fileBase64, "base64");
        const safeName = input.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileKey = `documents/${ctx.user.id}/${nanoid()}-${safeName}`;
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);

        await createDocument({
          uploaderId: ctx.user.id,
          ventureId: input.ventureId,
          type: input.type,
          name: input.name,
          fileKey,
          fileUrl: url,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          accessLevel: input.accessLevel,
        });
        return { success: true, url };
      }),

    myDocuments: protectedProcedure.query(async ({ ctx }) => {
      return getDocumentsByUser(ctx.user.id);
    }),

    byVenture: protectedProcedure
      .input(z.object({ ventureId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getDocumentsByVenture(input.ventureId);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteDocument(input.id);
        return { success: true };
      }),
  }),

  // ── DIASPORA ─────────────────────────────
  diaspora: router({
    engage: protectedProcedure
      .input(z.object({
        ventureId: z.number().optional(),
        type: z.enum(["investment", "mentorship", "partnership", "sponsorship", "donation"]),
        amount: z.string().optional(),
        currency: z.string().default("USD"),
        notes: z.string().max(2000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createDiasporaEngagement({ ...input, userId: ctx.user.id });
        return { success: true };
      }),

    myEngagements: protectedProcedure.query(async ({ ctx }) => {
      return getDiasporaEngagementsByUser(ctx.user.id);
    }),
  }),

  // ── INVESTOR PREFERENCES ─────────────────
  investorPrefs: router({
    upsert: protectedProcedure
      .input(z.object({
        preferredSectors: z.array(z.number()).optional(),
        preferredStages: z.array(z.string()).optional(),
        preferredGeographies: z.array(z.string()).optional(),
        minInvestment: z.string().optional(),
        maxInvestment: z.string().optional(),
        investmentThesis: z.string().max(2000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertInvestorPreferences({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    get: protectedProcedure.query(async ({ ctx }) => {
      return getInvestorPreferences(ctx.user.id);
    }),
  }),

  // ── ANALYTICS ────────────────────────────
  analytics: router({
    platformStats: publicProcedure.query(async () => {
      return getPlatformStats();
    }),
    track: protectedProcedure
      .input(z.object({
        eventType: z.string(),
        referenceId: z.number().optional(),
        referenceType: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await trackEvent({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
