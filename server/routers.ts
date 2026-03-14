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
  getFounderEngagementMetrics,
  getInvestorPortfolio,
  getPortfolioStats,
  getVentureHistory,
  getVentureInvestors,
  recordVentureStatusChange,
  trackBehavioralSignal,
  createInvestment,
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
          sudanRegion: z.string().max(100).optional(),
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

        // Trigger AI scoring — aligned with Sudan Innovation & Investment Ecosystem investment thesis
        try {
          const aiResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a senior venture analyst for the Sudan Innovation & Investment Ecosystem — a trusted AI-powered platform connecting Sudanese entrepreneurs with investors, mentors, and diaspora supporters to accelerate Sudan's economic rebuilding and innovation.

## PLATFORM INVESTMENT THESIS
This platform prioritizes ventures that:
1. Address real market gaps in Sudan (post-conflict economic recovery, infrastructure deficits, underserved Sudanese populations)
2. Operate in priority sectors: AgriTech, Renewable Energy, FinTech & Digital Finance, Logistics & Mobility, Healthcare & MedTech, EdTech, and Technology & Digital Transformation
3. Demonstrate potential for meaningful social and economic impact (job creation, youth empowerment, diaspora capital mobilization)
4. Are founded or co-founded by Sudanese nationals or entrepreneurs with deep understanding of the Sudanese market
5. Show a viable path to sustainability — not purely grant-dependent
6. Have diaspora relevance — potential to attract Sudanese diaspora investment, mentorship, or partnerships
7. Demonstrate awareness of and resilience to local regulatory, political, and infrastructure risks

## SCORING DIMENSIONS
Evaluate the venture across these 9 dimensions (each scored 0–100):

1. **readinessScore** (0–100): Composite overall readiness. Weight: marketClarity (25%), businessModelStrength (20%), teamReadiness (20%), scalabilityScore (15%), impactScore (10%), diasporaRelevance (5%), sectorAlignment (5%).

2. **marketClarity** (0–100): How clearly defined and validated is the target market? Consider: problem specificity, evidence of demand, customer segment clarity, market size awareness in the Sudanese context.

3. **businessModelStrength** (0–100): How robust and sustainable is the revenue model? Consider: revenue streams, unit economics awareness, path to profitability, pricing strategy, and avoidance of pure grant dependency.

4. **teamReadiness** (0–100): Does the team have the capability to execute? Consider: relevant domain expertise, founding team composition, local market knowledge, prior entrepreneurial experience, and team size relative to stage.

5. **scalabilityScore** (0–100): What is the potential for regional scale? Consider: technology leverage, replicability across Sudanese states and MENA markets, network effects, and infrastructure independence.

6. **impactScore** (0–100): What is the projected social and economic impact? Consider: job creation potential, youth and women empowerment, contribution to national economic recovery, food security, energy access, financial inclusion, or healthcare access.

7. **diasporaRelevance** (0–100): How attractive is this venture to Sudanese diaspora investors, mentors, or partners? Consider: sector familiarity for diaspora, investment ticket size accessibility, mentorship opportunity, emotional connection to Sudan's rebuilding, and cross-border commercial potential.

8. **sectorAlignment** (0–100): How well does this venture align with the platform's priority sectors? Score 100 for AgriTech, Renewable Energy, FinTech, Logistics, Healthcare, EdTech, or Technology. Score 60–80 for adjacent sectors. Score 30–50 for non-priority sectors.

9. **regulatoryRisk** (0–100): This is a RISK score — higher means MORE risk. Assess exposure to: currency instability, regulatory uncertainty in Sudan, cross-border payment restrictions, land/property rights issues, political instability, and infrastructure dependency.

## OUTPUT REQUIREMENTS
Also provide:
- **riskIndicators** (array of strings): Specific risk factors relevant to the Sudan context (regulatory, currency, infrastructure, security, political). Be precise — avoid generic statements.
- **strengths** (array of strings): Genuine differentiating strengths, especially those relevant to the platform's thesis.
- **recommendations** (array of strings): Actionable, specific improvement steps the founder can take to increase readiness and investor attractiveness on this platform.
- **summary** (string): A 3-sentence executive summary written for an investor reviewing this venture on the platform. Mention sector, stage, impact potential, and key concern.
- **investorReadinessFlag** (string): One of "ready_for_investors" | "needs_development" | "early_stage_incubation" based on overall readiness.
- **diasporaEngagementType** (string): The most suitable diaspora engagement type for this venture: "investment" | "mentorship" | "partnership" | "sponsorship" | "not_applicable".

## SCORING CALIBRATION
- Be rigorous but fair. Early-stage ventures in Sudan face genuine structural challenges — account for context.
- Do not penalize founders for operating in a difficult environment if they demonstrate awareness and resilience.
- Reward clarity of thought, market specificity, and honest risk acknowledgment.
- A score of 70+ on readinessScore indicates investor-ready. 50–69 indicates development needed. Below 50 indicates early incubation stage.
- Never fabricate information not present in the submission. If data is missing, note it as a risk indicator and recommendation.`,
              },
              {
                role: "user",
                content: `Analyze this venture submission for the Sudan Innovation & Investment Ecosystem platform:

**Venture Title:** ${venture.title}${venture.titleAr ? ` (Arabic: ${venture.titleAr})` : ""}
**Stage:** ${venture.stage}
**Sector:** ${venture.sectorId ? `Sector ID ${venture.sectorId}` : "Not specified"}${Array.isArray(venture.subsectors) && venture.subsectors.length > 0 ? ` | Subsectors: ${(venture.subsectors as string[]).join(", ")}` : ""}
**Country of Operation:** ${venture.country ?? "Sudan"}
**Sudan Region/State:** ${(venture as any).sudanRegion ?? "Not specified"}
**Team Size:** ${venture.teamSize ?? "Not specified"}
**Funding Target:** ${venture.fundingTarget ?? "Not specified"}
**Tagline:** ${venture.tagline ?? "Not provided"}

**Description:**
${venture.description}

${venture.website ? `**Website:** ${venture.website}` : ""}

Please evaluate this venture against the platform's investment thesis and scoring framework. Be specific to the Sudan context — reference Sudanese market conditions, regulatory environment, and economic recovery priorities in your analysis.`,
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
                    impactScore: { type: "number" },
                    diasporaRelevance: { type: "number" },
                    sectorAlignment: { type: "number" },
                    regulatoryRisk: { type: "number" },
                    riskIndicators: { type: "array", items: { type: "string" } },
                    strengths: { type: "array", items: { type: "string" } },
                    recommendations: { type: "array", items: { type: "string" } },
                    summary: { type: "string" },
                    investorReadinessFlag: { type: "string" },
                    diasporaEngagementType: { type: "string" },
                  },
                  required: [
                    "readinessScore", "marketClarity", "businessModelStrength",
                    "teamReadiness", "scalabilityScore", "impactScore",
                    "diasporaRelevance", "sectorAlignment", "regulatoryRisk",
                    "riskIndicators", "strengths", "recommendations",
                    "summary", "investorReadinessFlag", "diasporaEngagementType",
                  ],
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
        sudanRegion: z.string().max(100).optional(),
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

    getHistory: protectedProcedure
      .input(z.object({ ventureId: z.number() }))
      .query(async ({ ctx, input }) => {
        const venture = await getVentureById(input.ventureId);
        if (!venture) throw new TRPCError({ code: "NOT_FOUND" });
        // Allow founder or admin to view history
        if (venture.founderId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return getVentureHistory(input.ventureId);
      }),

    getInvestors: publicProcedure
      .input(z.object({ ventureId: z.number() }))
      .query(async ({ input }) => {
        return getVentureInvestors(input.ventureId);
      }),
  }),

  // ── ENGAGEMENT SCORING ───────────────────
  engagement: router({
    trackSignal: protectedProcedure
      .input(z.object({
        eventType: z.string(),
        referenceId: z.number().optional(),
        scoreContribution: z.number().default(1),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await trackBehavioralSignal({
          userId: ctx.user.id,
          eventType: input.eventType,
          referenceId: input.referenceId,
          scoreContribution: input.scoreContribution,
          metadata: input.metadata,
        });
        return { success: true };
      }),

    getFounderMetrics: publicProcedure
      .input(z.object({ founderId: z.number() }))
      .query(async ({ input }) => {
        return getFounderEngagementMetrics(input.founderId);
      }),
  }),

  // ── INVESTOR PORTFOLIO ────────────────────
  portfolio: router({
    recordInvestment: protectedProcedure
      .input(z.object({
        ventureId: z.number(),
        amount: z.string(),
        currency: z.string().default("USD"),
        investmentType: z.enum(["equity", "debt", "grant", "convertible", "revenue_share", "other"]).default("equity"),
        valuation: z.string().optional(),
        equityPercentage: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.platformRole !== "investor") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only investors can record investments" });
        }
        await createInvestment({
          investorId: ctx.user.id,
          ventureId: input.ventureId,
          amount: input.amount as any,
          currency: input.currency,
          investmentType: input.investmentType,
          valuation: input.valuation as any,
          equityPercentage: input.equityPercentage as any,
          notes: input.notes,
          status: "pending",
          investmentDate: new Date(),
        });
        return { success: true };
      }),

    getPortfolio: protectedProcedure.query(async ({ ctx }) => {
      return getInvestorPortfolio(ctx.user.id);
    }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      return getPortfolioStats(ctx.user.id);
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

        // Retrieve AI analysis for this venture to inform matching
        const aiAnalysis = venture.aiAnalysis as Record<string, unknown> | null;
        const ventureSectorId = venture.sectorId;
        const ventureStage = venture.stage;
        const ventureCountry = venture.country;

        // Priority sectors aligned with platform investment thesis
        const PRIORITY_SECTOR_IDS = new Set([1, 2, 3, 4, 5, 6, 7]); // AgriTech, Renewable Energy, FinTech, Logistics, Healthcare, EdTech, Technology

        for (const investor of investorUsers.slice(0, 20)) {
          const prefs = await getInvestorPreferences(investor.id);

          // ── INVESTMENT THESIS ALIGNMENT SCORING ──────────────────────
          // Factor 1: Sector alignment (30 points)
          let sectorScore = 0;
          if (prefs?.preferredSectors && Array.isArray(prefs.preferredSectors)) {
            const preferredSectors = prefs.preferredSectors as number[];
            if (ventureSectorId && preferredSectors.includes(ventureSectorId)) {
              sectorScore = 30; // Exact match
            } else if (ventureSectorId && PRIORITY_SECTOR_IDS.has(ventureSectorId)) {
              sectorScore = 20; // Priority sector even if not in prefs
            } else {
              sectorScore = 10; // Non-priority sector
            }
          } else {
            // No preferences set — give benefit of doubt for priority sectors
            sectorScore = ventureSectorId && PRIORITY_SECTOR_IDS.has(ventureSectorId) ? 25 : 15;
          }

          // Factor 2: Stage alignment (25 points)
          let stageScore = 0;
          if (prefs?.preferredStages && Array.isArray(prefs.preferredStages)) {
            const preferredStages = prefs.preferredStages as string[];
            if (preferredStages.includes(ventureStage)) {
              stageScore = 25; // Exact stage match
            } else {
              // Adjacent stage scoring
              const stageOrder = ["idea", "prototype", "mvp", "early_traction", "growth", "scaling"];
              const ventureIdx = stageOrder.indexOf(ventureStage);
              const hasAdjacentMatch = preferredStages.some((s) => {
                const prefIdx = stageOrder.indexOf(s);
                return Math.abs(prefIdx - ventureIdx) === 1;
              });
              stageScore = hasAdjacentMatch ? 15 : 8;
            }
          } else {
            stageScore = 18; // No preference set — neutral
          }

          // Factor 3: Geography alignment (15 points)
          let geoScore = 0;
          if (prefs?.preferredGeographies && Array.isArray(prefs.preferredGeographies)) {
            const preferredGeos = prefs.preferredGeographies as string[];
            const ventureCountryLower = ventureCountry?.toLowerCase() ?? "";
            const hasGeoMatch = preferredGeos.some((g) =>
              g.toLowerCase().includes(ventureCountryLower) ||
              ventureCountryLower.includes(g.toLowerCase()) ||
              g.toLowerCase() === "sudan" ||
              g.toLowerCase() === "khartoum" ||
              g.toLowerCase() === "east africa"
            );
            geoScore = hasGeoMatch ? 15 : (ventureCountry ? 8 : 5);
          } else {
            geoScore = 12; // No preference — neutral
          }

          // Factor 4: AI impact & thesis alignment (20 points)
          let aiAlignmentScore = 0;
          if (aiAnalysis) {
            const impactScore = (aiAnalysis.impactScore as number) ?? 50;
            const sectorAlignment = (aiAnalysis.sectorAlignment as number) ?? 50;
            const diasporaRelevance = (aiAnalysis.diasporaRelevance as number) ?? 50;
            // Normalize to 20-point scale
            aiAlignmentScore = Math.round(((impactScore * 0.4 + sectorAlignment * 0.4 + diasporaRelevance * 0.2) / 100) * 20);
          } else {
            aiAlignmentScore = 10; // No AI analysis yet — neutral
          }

          // Factor 5: Venture quality signal (10 points)
          const aiReadiness = (venture.aiReadinessScore as number) ?? 0;
          const qualityScore = aiReadiness > 0 ? Math.round((aiReadiness / 100) * 10) : 6;

          // ── COMPOSITE COMPATIBILITY SCORE ────────────────────────────
          const rawScore = sectorScore + stageScore + geoScore + aiAlignmentScore + qualityScore;
          const compatibilityScore = Math.min(100, Math.max(30, rawScore));

          // ── MATCH RATIONALE ──────────────────────────────────────────
          const rationaleFactors: string[] = [];
          if (sectorScore >= 25) rationaleFactors.push("strong sector alignment");
          if (stageScore >= 20) rationaleFactors.push("preferred funding stage");
          if (geoScore >= 12) rationaleFactors.push("geographic fit");
          if (aiAlignmentScore >= 15) rationaleFactors.push("high impact potential");
          if (qualityScore >= 8) rationaleFactors.push("strong AI readiness score");
          const rationale = rationaleFactors.length > 0
            ? `Matched based on: ${rationaleFactors.join(", ")}. This venture aligns with the platform's investment thesis for Sudan's economic rebuilding and development.`
            : `Potential opportunity in ${ventureStage} stage. Review venture details for full alignment assessment.`;

          await createMatch({
            ventureId: input.ventureId,
            investorId: investor.id,
            compatibilityScore,
            matchRationale: rationale,
            matchFactors: {
              sector: sectorScore >= 20,
              stage: stageScore >= 20,
              geography: geoScore >= 12,
              impactAlignment: aiAlignmentScore >= 12,
              ventureQuality: qualityScore >= 7,
            },
          });

          // Only notify investors with high compatibility (>= 65)
          if (compatibilityScore >= 65) {
            await createNotification({
              userId: investor.id,
              type: "new_match",
              title: `New matching opportunity: ${venture.title}`,
              titleAr: `فرصة مطابقة جديدة: ${venture.titleAr ?? venture.title}`,
              body: `Compatibility score: ${compatibilityScore}% — ${rationaleFactors[0] ?? "Review opportunity"}`,
              referenceId: input.ventureId,
              referenceType: "venture",
            });
          }
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
