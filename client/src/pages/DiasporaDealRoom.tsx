import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  DollarSign,
  Filter,
  Globe,
  HandHeart,
  Heart,
  Lightbulb,
  Rocket,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type EngagementType = "all" | "investment" | "mentorship" | "partnership" | "sponsorship" | "donation";
type TicketSize = "all" | "micro" | "small" | "medium" | "large";

interface AIAnalysis {
  readinessScore?: number;
  impactScore?: number;
  diasporaRelevance?: number;
  diasporaEngagementType?: string;
  investorReadinessFlag?: string;
}

interface Venture {
  id: number;
  title: string;
  titleAr?: string | null;
  tagline?: string | null;
  taglineAr?: string | null;
  stage: string;
  country?: string | null;
  fundingTarget?: string | null;
  teamSize?: number | null;
  aiReadinessScore?: number | null;
  aiAnalysis?: AIAnalysis | null;
  sectorId?: number | null;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const ENGAGEMENT_TYPES: { value: EngagementType; label: string; labelAr: string; icon: React.ReactNode; color: string }[] = [
  { value: "all", label: "All Opportunities", labelAr: "جميع الفرص", icon: <Globe className="w-4 h-4" />, color: "gray" },
  { value: "investment", label: "Investment", labelAr: "استثمار", icon: <DollarSign className="w-4 h-4" />, color: "emerald" },
  { value: "mentorship", label: "Mentorship", labelAr: "إرشاد", icon: <Lightbulb className="w-4 h-4" />, color: "blue" },
  { value: "partnership", label: "Partnership", labelAr: "شراكة", icon: <Users className="w-4 h-4" />, color: "purple" },
  { value: "sponsorship", label: "Sponsorship", labelAr: "رعاية", icon: <Star className="w-4 h-4" />, color: "amber" },
  { value: "donation", label: "Donation", labelAr: "تبرع", icon: <Heart className="w-4 h-4" />, color: "red" },
];

const TICKET_SIZES: { value: TicketSize; label: string; labelAr: string; range: string }[] = [
  { value: "all", label: "Any Size", labelAr: "أي حجم", range: "" },
  { value: "micro", label: "Micro (<$5K)", labelAr: "صغير جداً (<5,000$)", range: "<5000" },
  { value: "small", label: "Small ($5K–$25K)", labelAr: "صغير (5,000$–25,000$)", range: "5000-25000" },
  { value: "medium", label: "Medium ($25K–$100K)", labelAr: "متوسط (25,000$–100,000$)", range: "25000-100000" },
  { value: "large", label: "Large (>$100K)", labelAr: "كبير (>100,000$)", range: ">100000" },
];

function EngagementIcon({ type }: { type: string }) {
  const et = ENGAGEMENT_TYPES.find((e) => e.value === type);
  return et ? <>{et.icon}</> : <Globe className="w-4 h-4" />;
}

function EngagementBadge({ type, isRTL }: { type: string; isRTL: boolean }) {
  const et = ENGAGEMENT_TYPES.find((e) => e.value === type);
  if (!et) return null;
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
  };
  return (
    <Badge className={`${colorMap[et.color] ?? "bg-gray-100 text-gray-800"} flex items-center gap-1 w-fit`}>
      {et.icon}
      {isRTL ? et.labelAr : et.label}
    </Badge>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function DiasporaDealRoom() {
  const { isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [engagementFilter, setEngagementFilter] = useState<EngagementType>("all");
  const [ticketFilter, setTicketFilter] = useState<TicketSize>("all");
  const [expressedInterest, setExpressedInterest] = useState<Set<number>>(new Set());

  const { data: ventures, isLoading } = trpc.ventures.published.useQuery({ limit: 50, offset: 0 });
  const engageMutation = trpc.diaspora.engage.useMutation();

  // Filter ventures that have diaspora relevance
  const diasporaVentures = (ventures ?? []).filter((v) => {
    const analysis = v.aiAnalysis as AIAnalysis | null;
    if (!analysis) return false;
    if ((analysis.diasporaRelevance ?? 0) < 40) return false;

    // Engagement type filter
    if (engagementFilter !== "all") {
      const engType = analysis.diasporaEngagementType?.toLowerCase() ?? "";
      if (!engType.includes(engagementFilter)) return false;
    }

    return true;
  }) as Venture[];

  const handleExpressInterest = async (venture: Venture) => {
    if (!isAuthenticated) {
      toast.error(isRTL ? "يرجى تسجيل الدخول أولاً" : "Please log in first");
      return;
    }
    try {
      await engageMutation.mutateAsync({
        ventureId: venture.id,
        type: engagementFilter === "all" ? "investment" : engagementFilter as any,
        notes: `Expressed interest via Diaspora Deal Room`,
      });
      setExpressedInterest((prev) => { const next = new Set(Array.from(prev)); next.add(venture.id); return next; });
      toast.success(isRTL ? "تم التعبير عن اهتمامك بنجاح" : "Interest expressed successfully");
    } catch {
      toast.error(isRTL ? "فشل. يرجى المحاولة مرة أخرى" : "Failed. Please try again.");
    }
  };

  const t = {
    title: isRTL ? "غرفة صفقات المغتربين" : "Diaspora Deal Room",
    subtitle: isRTL
      ? "فرص استثمار وإرشاد وشراكة مُنتقاة خصيصاً للمغتربين السودانيين حول العالم"
      : "Curated investment, mentorship, and partnership opportunities for Sudanese diaspora worldwide",
    back: isRTL ? "رجوع" : "Back",
    filterBy: isRTL ? "تصفية حسب" : "Filter by",
    engagementType: isRTL ? "نوع المشاركة" : "Engagement Type",
    ticketSize: isRTL ? "حجم الاستثمار" : "Ticket Size",
    noResults: isRTL ? "لا توجد فرص تطابق المعايير المحددة" : "No opportunities match the selected criteria",
    expressInterest: isRTL ? "التعبير عن الاهتمام" : "Express Interest",
    interested: isRTL ? "تم التعبير عن الاهتمام" : "Interest Expressed",
    viewDetails: isRTL ? "عرض التفاصيل" : "View Details",
    diasporaScore: isRTL ? "ملاءمة المغتربين" : "Diaspora Fit",
    impactScore: isRTL ? "التأثير" : "Impact",
    readinessScore: isRTL ? "الجاهزية" : "Readiness",
    loginRequired: isRTL ? "يرجى تسجيل الدخول للتعبير عن اهتمامك" : "Please log in to express interest",
    totalOpportunities: isRTL ? "إجمالي الفرص" : "Total Opportunities",
    howItWorks: isRTL ? "كيف يعمل" : "How It Works",
    steps: isRTL
      ? ["تصفح الفرص المُنتقاة", "اختر نوع المشاركة المناسب", "عبّر عن اهتمامك بنقرة واحدة", "سيتواصل معك الفريق خلال 48 ساعة"]
      : ["Browse curated opportunities", "Choose your engagement type", "Express interest with one click", "Team will contact you within 48 hours"],
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/diaspora")}>
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-primary" />
              {t.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
          <Badge className="bg-primary/10 text-primary">
            {diasporaVentures.length} {t.totalOpportunities}
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* How It Works */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            {t.howItWorks}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {t.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-xs text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {t.filterBy}
          </div>

          {/* Engagement Type Filter */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">{t.engagementType}</div>
            <div className="flex flex-wrap gap-2">
              {ENGAGEMENT_TYPES.map((et) => (
                <button
                  key={et.value}
                  onClick={() => setEngagementFilter(et.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    engagementFilter === et.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  {et.icon}
                  {isRTL ? et.labelAr : et.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunities Grid */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && diasporaVentures.length === 0 && (
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">{t.noResults}</p>
          </div>
        )}

        {!isLoading && diasporaVentures.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {diasporaVentures.map((venture) => {
              const analysis = venture.aiAnalysis as AIAnalysis | null;
              const alreadyInterested = expressedInterest.has(venture.id);

              return (
                <Card key={venture.id} className="p-5 flex flex-col hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate">{isRTL && venture.titleAr ? venture.titleAr : venture.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {isRTL && venture.taglineAr ? venture.taglineAr : venture.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Engagement Type */}
                  {analysis?.diasporaEngagementType && (
                    <div className="mb-3">
                      <EngagementBadge type={analysis.diasporaEngagementType} isRTL={isRTL} />
                    </div>
                  )}

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">{t.diasporaScore}</div>
                      <div className="text-sm font-bold text-primary">{analysis?.diasporaRelevance ?? "—"}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">{t.impactScore}</div>
                      <div className="text-sm font-bold text-emerald-600">{analysis?.impactScore ?? "—"}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">{t.readinessScore}</div>
                      <div className="text-sm font-bold text-amber-600">{analysis?.readinessScore ?? "—"}</div>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="capitalize">{venture.stage.replace(/_/g, " ")}</span>
                    {venture.country && <span>· {venture.country}</span>}
                    {venture.fundingTarget && <span>· {venture.fundingTarget}</span>}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      variant={alreadyInterested ? "outline" : "default"}
                      disabled={alreadyInterested || engageMutation.isPending}
                      onClick={() => handleExpressInterest(venture)}
                    >
                      {alreadyInterested ? (
                        <><Rocket className="w-3 h-3 mr-1" />{t.interested}</>
                      ) : (
                        <><Heart className="w-3 h-3 mr-1" />{t.expressInterest}</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/ventures/${venture.id}`)}
                    >
                      {t.viewDetails}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
