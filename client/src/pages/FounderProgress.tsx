import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  Lightbulb,
  Rocket,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface AIDimension {
  key: string;
  label: string;
  labelAr: string;
  score: number;
  icon: React.ReactNode;
  color: string;
  description: string;
  descriptionAr: string;
  resources: { title: string; titleAr: string; action: string }[];
  milestones: { text: string; textAr: string; completed: boolean }[];
}

interface AIAnalysis {
  readinessScore?: number;
  marketClarity?: number;
  businessModelStrength?: number;
  teamReadiness?: number;
  scalabilityScore?: number;
  impactScore?: number;
  diasporaRelevance?: number;
  sectorAlignment?: number;
  regulatoryRisk?: number;
  riskIndicators?: string[];
  strengths?: string[];
  recommendations?: string[];
  summary?: string;
  investorReadinessFlag?: string;
  diasporaEngagementType?: string;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
}

function getScoreBg(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function getScoreLabel(score: number, isRTL: boolean): string {
  if (score >= 70) return isRTL ? "جيد" : "Strong";
  if (score >= 50) return isRTL ? "يحتاج تطوير" : "Needs Work";
  return isRTL ? "ضعيف" : "Critical";
}

function buildDimensions(analysis: AIAnalysis, isRTL: boolean): AIDimension[] {
  return [
    {
      key: "marketClarity",
      label: "Market Clarity",
      labelAr: "وضوح السوق",
      score: analysis.marketClarity ?? 0,
      icon: <Target className="w-5 h-5" />,
      color: "blue",
      description: "How clearly you have defined your target market, customer segments, and validated demand in the Sudanese/African context.",
      descriptionAr: "مدى وضوح تعريفك للسوق المستهدف وشرائح العملاء والطلب المُتحقق منه في السياق السوداني/الأفريقي.",
      resources: [
        { title: "Customer Discovery Framework", titleAr: "إطار اكتشاف العملاء", action: "Conduct 20 customer interviews in your target market" },
        { title: "Market Sizing Template", titleAr: "قالب تحديد حجم السوق", action: "Document TAM, SAM, and SOM for Sudan/Africa" },
        { title: "Problem Validation", titleAr: "التحقق من المشكلة", action: "Create a one-page problem validation summary with evidence" },
      ],
      milestones: [
        { text: "Defined primary customer segment", textAr: "تحديد شريحة العملاء الأساسية", completed: (analysis.marketClarity ?? 0) >= 30 },
        { text: "Validated problem with 10+ interviews", textAr: "التحقق من المشكلة مع 10+ مقابلات", completed: (analysis.marketClarity ?? 0) >= 55 },
        { text: "Documented market size (TAM/SAM/SOM)", textAr: "توثيق حجم السوق", completed: (analysis.marketClarity ?? 0) >= 70 },
        { text: "Identified key competitors and gaps", textAr: "تحديد المنافسين الرئيسيين والفجوات", completed: (analysis.marketClarity ?? 0) >= 85 },
      ],
    },
    {
      key: "businessModelStrength",
      label: "Business Model",
      labelAr: "نموذج الأعمال",
      score: analysis.businessModelStrength ?? 0,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "purple",
      description: "The robustness and sustainability of your revenue model, including revenue streams, unit economics, and path to profitability.",
      descriptionAr: "متانة واستدامة نموذج إيراداتك، بما في ذلك مصادر الإيرادات والاقتصاديات الوحدوية والمسار نحو الربحية.",
      resources: [
        { title: "Revenue Model Canvas", titleAr: "لوحة نموذج الإيرادات", action: "Map all revenue streams and pricing strategy" },
        { title: "Unit Economics Calculator", titleAr: "حاسبة الاقتصاديات الوحدوية", action: "Calculate CAC, LTV, and payback period" },
        { title: "Financial Projections", titleAr: "التوقعات المالية", action: "Build 3-year financial model with realistic assumptions" },
      ],
      milestones: [
        { text: "Defined primary revenue stream", textAr: "تحديد مصدر الإيرادات الأساسي", completed: (analysis.businessModelStrength ?? 0) >= 30 },
        { text: "Calculated unit economics (CAC/LTV)", textAr: "حساب الاقتصاديات الوحدوية", completed: (analysis.businessModelStrength ?? 0) >= 55 },
        { text: "Built 12-month financial projection", textAr: "بناء توقعات مالية لـ 12 شهراً", completed: (analysis.businessModelStrength ?? 0) >= 70 },
        { text: "Demonstrated path to profitability", textAr: "إثبات المسار نحو الربحية", completed: (analysis.businessModelStrength ?? 0) >= 85 },
      ],
    },
    {
      key: "teamReadiness",
      label: "Team Readiness",
      labelAr: "جاهزية الفريق",
      score: analysis.teamReadiness ?? 0,
      icon: <Users className="w-5 h-5" />,
      color: "green",
      description: "Your team's capability to execute — domain expertise, local market knowledge, founding team composition, and prior experience.",
      descriptionAr: "قدرة فريقك على التنفيذ — الخبرة في المجال، ومعرفة السوق المحلي، وتكوين الفريق المؤسس، والخبرة السابقة.",
      resources: [
        { title: "Team Skills Matrix", titleAr: "مصفوفة مهارات الفريق", action: "Map team skills against required capabilities" },
        { title: "Advisor Recruitment", titleAr: "استقطاب المستشارين", action: "Identify and approach 2-3 domain advisors on this platform" },
        { title: "Co-founder Search", titleAr: "البحث عن شريك مؤسس", action: "Define missing roles and post on the platform" },
      ],
      milestones: [
        { text: "Founding team of 2+ members", textAr: "فريق مؤسس من عضوين أو أكثر", completed: (analysis.teamReadiness ?? 0) >= 30 },
        { text: "Domain expertise demonstrated", textAr: "إثبات الخبرة في المجال", completed: (analysis.teamReadiness ?? 0) >= 55 },
        { text: "Advisory board established", textAr: "تأسيس مجلس استشاري", completed: (analysis.teamReadiness ?? 0) >= 70 },
        { text: "Full team with all key roles filled", textAr: "فريق كامل بجميع الأدوار الرئيسية", completed: (analysis.teamReadiness ?? 0) >= 85 },
      ],
    },
    {
      key: "scalabilityScore",
      label: "Scalability",
      labelAr: "قابلية التوسع",
      score: analysis.scalabilityScore ?? 0,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "orange",
      description: "The potential for regional or continental scale — technology leverage, replicability across African markets, and network effects.",
      descriptionAr: "إمكانية التوسع الإقليمي أو القاري — الاستفادة من التكنولوجيا، وقابلية التكرار عبر الأسواق الأفريقية، وتأثيرات الشبكة.",
      resources: [
        { title: "Scalability Assessment", titleAr: "تقييم قابلية التوسع", action: "Document how the model replicates across 3 African markets" },
        { title: "Technology Stack Review", titleAr: "مراجعة المكدس التقني", action: "Ensure technology can support 10x growth without redesign" },
        { title: "Expansion Roadmap", titleAr: "خارطة طريق التوسع", action: "Create 3-year geographic expansion plan" },
      ],
      milestones: [
        { text: "Core product works in pilot market", textAr: "المنتج الأساسي يعمل في السوق التجريبية", completed: (analysis.scalabilityScore ?? 0) >= 30 },
        { text: "Technology supports scale", textAr: "التكنولوجيا تدعم التوسع", completed: (analysis.scalabilityScore ?? 0) >= 55 },
        { text: "Expansion plan documented", textAr: "خطة التوسع موثقة", completed: (analysis.scalabilityScore ?? 0) >= 70 },
        { text: "Proven replication in second market", textAr: "إثبات التكرار في سوق ثانية", completed: (analysis.scalabilityScore ?? 0) >= 85 },
      ],
    },
    {
      key: "impactScore",
      label: "Impact Potential",
      labelAr: "إمكانية التأثير",
      score: analysis.impactScore ?? 0,
      icon: <Star className="w-5 h-5" />,
      color: "yellow",
      description: "Projected social and economic impact — job creation, youth empowerment, contribution to Sudan's economic recovery and development goals.",
      descriptionAr: "التأثير الاجتماعي والاقتصادي المتوقع — خلق فرص العمل، وتمكين الشباب، والمساهمة في التعافي الاقتصادي للسودان.",
      resources: [
        { title: "Impact Measurement Framework", titleAr: "إطار قياس التأثير", action: "Define 3-5 measurable impact KPIs for your venture" },
        { title: "SDG Alignment", titleAr: "التوافق مع أهداف التنمية المستدامة", action: "Map venture to relevant UN Sustainable Development Goals" },
        { title: "Job Creation Projection", titleAr: "توقعات خلق فرص العمل", action: "Document direct and indirect job creation over 3 years" },
      ],
      milestones: [
        { text: "Impact thesis articulated", textAr: "صياغة أطروحة التأثير", completed: (analysis.impactScore ?? 0) >= 30 },
        { text: "Impact KPIs defined and measurable", textAr: "مؤشرات الأداء الرئيسية للتأثير محددة وقابلة للقياس", completed: (analysis.impactScore ?? 0) >= 55 },
        { text: "Baseline impact data collected", textAr: "جمع بيانات التأثير الأساسية", completed: (analysis.impactScore ?? 0) >= 70 },
        { text: "Impact report published", textAr: "نشر تقرير التأثير", completed: (analysis.impactScore ?? 0) >= 85 },
      ],
    },
    {
      key: "diasporaRelevance",
      label: "Diaspora Relevance",
      labelAr: "أهمية للمغتربين",
      score: analysis.diasporaRelevance ?? 0,
      icon: <Globe className="w-5 h-5" />,
      color: "teal",
      description: "How attractive this venture is to Sudanese diaspora investors, mentors, or partners — sector familiarity, ticket size, and emotional connection.",
      descriptionAr: "مدى جاذبية هذا المشروع للمستثمرين والمرشدين والشركاء من المغتربين السودانيين — الألفة بالقطاع وحجم الاستثمار والارتباط العاطفي.",
      resources: [
        { title: "Diaspora Pitch Deck", titleAr: "عرض تقديمي للمغتربين", action: "Create a diaspora-specific pitch highlighting Sudan connection" },
        { title: "Diaspora Network Mapping", titleAr: "رسم خريطة شبكة المغتربين", action: "Identify 5 diaspora communities relevant to your sector" },
        { title: "Engagement Type Selection", titleAr: "اختيار نوع المشاركة", action: "Define preferred diaspora engagement type (investment/mentorship/partnership)" },
      ],
      milestones: [
        { text: "Diaspora engagement type identified", textAr: "تحديد نوع مشاركة المغتربين", completed: (analysis.diasporaRelevance ?? 0) >= 30 },
        { text: "Diaspora pitch materials prepared", textAr: "إعداد مواد العرض للمغتربين", completed: (analysis.diasporaRelevance ?? 0) >= 55 },
        { text: "First diaspora connection made", textAr: "إجراء أول اتصال مع المغتربين", completed: (analysis.diasporaRelevance ?? 0) >= 70 },
        { text: "Active diaspora supporter engaged", textAr: "مشاركة داعم نشط من المغتربين", completed: (analysis.diasporaRelevance ?? 0) >= 85 },
      ],
    },
    {
      key: "sectorAlignment",
      label: "Sector Alignment",
      labelAr: "التوافق مع القطاع",
      score: analysis.sectorAlignment ?? 0,
      icon: <Rocket className="w-5 h-5" />,
      color: "indigo",
      description: "How well your venture aligns with the platform's 7 priority sectors: AgriTech, Renewable Energy, FinTech, Logistics, Healthcare, EdTech, and Technology.",
      descriptionAr: "مدى توافق مشروعك مع القطاعات السبعة ذات الأولوية في المنصة: التكنولوجيا الزراعية، والطاقة المتجددة، والتكنولوجيا المالية، والخدمات اللوجستية، والرعاية الصحية، والتكنولوجيا التعليمية، والتكنولوجيا.",
      resources: [
        { title: "Sector Positioning", titleAr: "تحديد موقع القطاع", action: "Clearly define your primary sector and subsectors in your profile" },
        { title: "Sector Narrative", titleAr: "سرد القطاع", action: "Write a 200-word sector context statement for your venture" },
        { title: "Sector Benchmarking", titleAr: "قياس أداء القطاع", action: "Research 3 comparable ventures in your sector across Africa" },
      ],
      milestones: [
        { text: "Primary sector selected", textAr: "اختيار القطاع الأساسي", completed: (analysis.sectorAlignment ?? 0) >= 30 },
        { text: "Subsectors tagged", textAr: "وضع علامات على القطاعات الفرعية", completed: (analysis.sectorAlignment ?? 0) >= 55 },
        { text: "Sector narrative documented", textAr: "توثيق سرد القطاع", completed: (analysis.sectorAlignment ?? 0) >= 70 },
        { text: "Sector expertise demonstrated", textAr: "إثبات الخبرة في القطاع", completed: (analysis.sectorAlignment ?? 0) >= 85 },
      ],
    },
    {
      key: "regulatoryRisk",
      label: "Regulatory Risk",
      labelAr: "المخاطر التنظيمية",
      score: analysis.regulatoryRisk ?? 0,
      icon: <Shield className="w-5 h-5" />,
      color: "red",
      description: "Risk score (lower is better) — exposure to currency instability, regulatory uncertainty, cross-border restrictions, and infrastructure dependency in Sudan.",
      descriptionAr: "درجة المخاطرة (أقل = أفضل) — التعرض لعدم استقرار العملة، وعدم اليقين التنظيمي، والقيود العابرة للحدود، والاعتماد على البنية التحتية في السودان.",
      resources: [
        { title: "Risk Mitigation Plan", titleAr: "خطة تخفيف المخاطر", action: "Document specific mitigation strategies for each identified risk" },
        { title: "Legal Structure Review", titleAr: "مراجعة الهيكل القانوني", action: "Consult a local legal advisor on regulatory requirements" },
        { title: "Currency Risk Strategy", titleAr: "استراتيجية مخاطر العملة", action: "Define USD/local currency strategy for revenue and expenses" },
      ],
      milestones: [
        { text: "Key regulatory risks identified", textAr: "تحديد المخاطر التنظيمية الرئيسية", completed: (analysis.regulatoryRisk ?? 0) <= 70 },
        { text: "Legal structure established", textAr: "تأسيس الهيكل القانوني", completed: (analysis.regulatoryRisk ?? 0) <= 55 },
        { text: "Risk mitigation plan documented", textAr: "توثيق خطة تخفيف المخاطر", completed: (analysis.regulatoryRisk ?? 0) <= 40 },
        { text: "Regulatory compliance achieved", textAr: "تحقيق الامتثال التنظيمي", completed: (analysis.regulatoryRisk ?? 0) <= 25 },
      ],
    },
  ];
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function FounderProgress() {
  const { language, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedVentureId, setSelectedVentureId] = useState<number | null>(null);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  const { data: myVentures, isLoading: venturesLoading } = trpc.ventures.myVentures.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const selectedVenture = selectedVentureId
    ? myVentures?.find((v) => v.id === selectedVentureId)
    : myVentures?.[0];

  const aiAnalysis = selectedVenture?.aiAnalysis as AIAnalysis | null;

  const dimensions = aiAnalysis ? buildDimensions(aiAnalysis, isRTL) : [];

  // Sort by score ascending (lowest first = highest priority)
  const sortedDimensions = [...dimensions].sort((a, b) => {
    // Regulatory risk is inverted — higher score = more risk = higher priority
    const aScore = a.key === "regulatoryRisk" ? (100 - a.score) : a.score;
    const bScore = b.key === "regulatoryRisk" ? (100 - b.score) : b.score;
    return aScore - bScore;
  });

  const overallScore = aiAnalysis?.readinessScore ?? 0;
  const investorFlag = aiAnalysis?.investorReadinessFlag ?? "needs_development";

  const t = {
    title: isRTL ? "مسار تقدم المؤسس" : "Founder Progress Tracker",
    subtitle: isRTL
      ? "خارطة طريق مخصصة لتحسين جاهزيتك للمستثمرين بناءً على تحليل الذكاء الاصطناعي"
      : "Your personalized roadmap to improve investor readiness based on AI analysis",
    selectVenture: isRTL ? "اختر مشروعاً" : "Select a Venture",
    noVentures: isRTL ? "لا توجد مشاريع بعد" : "No ventures yet",
    noAnalysis: isRTL ? "لا يوجد تحليل ذكاء اصطناعي بعد" : "No AI analysis yet",
    submitFirst: isRTL
      ? "قدّم مشروعك أولاً للحصول على تحليل الذكاء الاصطناعي وخارطة التقدم"
      : "Submit your venture first to get AI analysis and your progress roadmap",
    overallScore: isRTL ? "الدرجة الإجمالية" : "Overall Score",
    priorityActions: isRTL ? "الإجراءات ذات الأولوية" : "Priority Actions",
    strengths: isRTL ? "نقاط القوة" : "Strengths",
    risks: isRTL ? "مؤشرات المخاطر" : "Risk Indicators",
    recommendations: isRTL ? "التوصيات" : "Recommendations",
    milestones: isRTL ? "المعالم" : "Milestones",
    resources: isRTL ? "الموارد" : "Resources",
    back: isRTL ? "رجوع" : "Back",
    submitVenture: isRTL ? "قدّم مشروعاً" : "Submit a Venture",
    investorReady: isRTL ? "جاهز للمستثمرين" : "Investor Ready",
    needsDevelopment: isRTL ? "يحتاج تطوير" : "Needs Development",
    earlyIncubation: isRTL ? "مرحلة الحضانة المبكرة" : "Early Incubation",
    lowestScoring: isRTL ? "الأبعاد الأقل تقييماً (أعلى أولوية)" : "Lowest Scoring Dimensions (Highest Priority)",
    viewAll: isRTL ? "عرض الكل" : "View All",
    summary: isRTL ? "ملخص التحليل" : "Analysis Summary",
    actionStep: isRTL ? "خطوة الإجراء" : "Action Step",
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center p-8">
          <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{isRTL ? "تسجيل الدخول مطلوب" : "Login Required"}</h2>
          <p className="text-muted-foreground mb-4">{isRTL ? "يرجى تسجيل الدخول للوصول إلى مسار التقدم" : "Please log in to access your progress tracker"}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Venture Selector */}
        {myVentures && myVentures.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {myVentures.map((v) => (
              <Button
                key={v.id}
                variant={selectedVenture?.id === v.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedVentureId(v.id)}
              >
                {v.title}
              </Button>
            ))}
          </div>
        )}

        {/* No ventures state */}
        {!venturesLoading && (!myVentures || myVentures.length === 0) && (
          <Card className="p-12 text-center">
            <Rocket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t.noVentures}</h2>
            <p className="text-muted-foreground mb-6">{t.submitFirst}</p>
            <Button onClick={() => navigate("/ventures/submit")}>
              {t.submitVenture}
            </Button>
          </Card>
        )}

        {/* No AI analysis state */}
        {selectedVenture && !aiAnalysis && (
          <Card className="p-12 text-center">
            <Zap className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t.noAnalysis}</h2>
            <p className="text-muted-foreground mb-6">{t.submitFirst}</p>
            <Button onClick={() => navigate(`/ventures/${selectedVenture.id}`)}>
              {isRTL ? "عرض المشروع" : "View Venture"}
            </Button>
          </Card>
        )}

        {/* Main Progress Dashboard */}
        {selectedVenture && aiAnalysis && (
          <>
            {/* Overall Score Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-1 p-6 text-center border-2 border-primary/20">
                <div className="text-5xl font-black text-primary mb-1">{overallScore}</div>
                <div className="text-sm text-muted-foreground mb-3">{t.overallScore} / 100</div>
                <Badge
                  className={
                    investorFlag === "ready_for_investors"
                      ? "bg-emerald-100 text-emerald-800"
                      : investorFlag === "needs_development"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {investorFlag === "ready_for_investors"
                    ? t.investorReady
                    : investorFlag === "needs_development"
                    ? t.needsDevelopment
                    : t.earlyIncubation}
                </Badge>
                {/* Overall progress bar */}
                <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getScoreBg(overallScore)}`}
                    style={{ width: `${overallScore}%` }}
                  />
                </div>
              </Card>

              <Card className="md:col-span-2 p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {t.summary}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{aiAnalysis.summary}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{isRTL ? "نوع مشاركة المغتربين:" : "Diaspora Engagement:"}</span>
                  <Badge variant="outline" className="capitalize">
                    {aiAnalysis.diasporaEngagementType?.replace(/_/g, " ") ?? "N/A"}
                  </Badge>
                </div>
              </Card>
            </div>

            {/* Score Grid — All 8 Dimensions */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                {isRTL ? "تقييم الأبعاد" : "Dimension Scores"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {dimensions.map((dim) => (
                  <button
                    key={dim.key}
                    onClick={() => setExpandedDimension(expandedDimension === dim.key ? null : dim.key)}
                    className="text-left w-full"
                  >
                    <Card className={`p-4 hover:shadow-md transition-all cursor-pointer border-2 ${expandedDimension === dim.key ? "border-primary" : "border-transparent"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {dim.icon}
                          <span className="text-xs font-medium">{isRTL ? dim.labelAr : dim.label}</span>
                        </div>
                        <span className={`text-lg font-black ${getScoreColor(dim.key === "regulatoryRisk" ? 100 - dim.score : dim.score)}`}>
                          {dim.score}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getScoreBg(dim.key === "regulatoryRisk" ? 100 - dim.score : dim.score)}`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {getScoreLabel(dim.key === "regulatoryRisk" ? 100 - dim.score : dim.score, isRTL)}
                        {dim.key === "regulatoryRisk" && (
                          <span className="text-red-400 ml-1">{isRTL ? "(أقل = أفضل)" : "(lower = better)"}</span>
                        )}
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            </div>

            {/* Expanded Dimension Detail */}
            {expandedDimension && (() => {
              const dim = dimensions.find((d) => d.key === expandedDimension);
              if (!dim) return null;
              return (
                <Card className="border-2 border-primary/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {dim.icon}
                      {isRTL ? dim.labelAr : dim.label}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedDimension(null)}>
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{isRTL ? dim.descriptionAr : dim.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Milestones */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        {t.milestones}
                      </h4>
                      <div className="space-y-2">
                        {dim.milestones.map((m, i) => (
                          <div key={i} className="flex items-start gap-2">
                            {m.completed
                              ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              : <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            }
                            <span className={`text-sm ${m.completed ? "text-foreground" : "text-muted-foreground"}`}>
                              {isRTL ? m.textAr : m.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        {t.resources}
                      </h4>
                      <div className="space-y-3">
                        {dim.resources.map((r, i) => (
                          <div key={i} className="bg-muted/50 rounded-lg p-3">
                            <div className="font-medium text-sm">{isRTL ? r.titleAr : r.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              <span className="font-medium">{t.actionStep}:</span> {r.action}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })()}

            {/* Priority Actions — Top 3 Lowest Scoring */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                {t.priorityActions}
              </h2>
              <div className="space-y-3">
                {sortedDimensions.slice(0, 3).map((dim, idx) => (
                  <Card key={dim.key} className="p-4 border-l-4 border-l-red-400">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{isRTL ? dim.labelAr : dim.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {isRTL ? dim.descriptionAr : dim.description}
                          </div>
                          {dim.resources[0] && (
                            <div className="mt-2 text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded inline-block">
                              ✦ {dim.resources[0].action}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xl font-black ${getScoreColor(dim.key === "regulatoryRisk" ? 100 - dim.score : dim.score)}`}>
                          {dim.score}
                        </span>
                        <div className="text-xs text-muted-foreground">/100</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  {t.recommendations}
                </h2>
                <div className="space-y-3">
                  {aiAnalysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Strengths & Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiAnalysis.strengths && aiAnalysis.strengths.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-emerald-700">
                    <CheckCircle className="w-4 h-4" />
                    {t.strengths}
                  </h3>
                  <div className="space-y-2">
                    {aiAnalysis.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Star className="w-3 h-3 text-emerald-500 mt-1 shrink-0" />
                        <p className="text-sm">{s}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {aiAnalysis.riskIndicators && aiAnalysis.riskIndicators.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {t.risks}
                  </h3>
                  <div className="space-y-2">
                    {aiAnalysis.riskIndicators.map((r, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 text-red-400 mt-1 shrink-0" />
                        <p className="text-sm">{r}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
