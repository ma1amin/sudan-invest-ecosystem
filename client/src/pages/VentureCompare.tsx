import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle,
  Globe,
  Minus,
  Plus,
  Rocket,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

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
  investorReadinessFlag?: string;
  summary?: string;
}

interface Venture {
  id: number;
  title: string;
  titleAr?: string | null;
  tagline?: string | null;
  stage: string;
  country?: string | null;
  fundingTarget?: string | null;
  teamSize?: number | null;
  aiReadinessScore?: number | null;
  aiAnalysis?: AIAnalysis | null;
  moderationStatus: string;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function ScoreBar({ score, isRisk = false }: { score: number; isRisk?: boolean }) {
  const effective = isRisk ? 100 - score : score;
  const color = effective >= 70 ? "bg-emerald-500" : effective >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-bold w-8 text-right">{score}</span>
    </div>
  );
}

function Winner({ a, b, isRisk = false }: { a: number; b: number; isRisk?: boolean }) {
  const aEff = isRisk ? 100 - a : a;
  const bEff = isRisk ? 100 - b : b;
  if (Math.abs(aEff - bEff) < 5) return <Minus className="w-4 h-4 text-muted-foreground" />;
  return aEff > bEff
    ? <CheckCircle className="w-4 h-4 text-emerald-500" />
    : <X className="w-4 h-4 text-red-400" />;
}

const DIMENSIONS = [
  { key: "readinessScore", label: "Overall Readiness", labelAr: "الجاهزية الإجمالية", icon: <Star className="w-4 h-4" /> },
  { key: "marketClarity", label: "Market Clarity", labelAr: "وضوح السوق", icon: <Target className="w-4 h-4" /> },
  { key: "businessModelStrength", label: "Business Model", labelAr: "نموذج الأعمال", icon: <BarChart3 className="w-4 h-4" /> },
  { key: "teamReadiness", label: "Team Readiness", labelAr: "جاهزية الفريق", icon: <Users className="w-4 h-4" /> },
  { key: "scalabilityScore", label: "Scalability", labelAr: "قابلية التوسع", icon: <TrendingUp className="w-4 h-4" /> },
  { key: "impactScore", label: "Impact Potential", labelAr: "إمكانية التأثير", icon: <Globe className="w-4 h-4" /> },
  { key: "diasporaRelevance", label: "Diaspora Relevance", labelAr: "أهمية للمغتربين", icon: <Rocket className="w-4 h-4" /> },
  { key: "sectorAlignment", label: "Sector Alignment", labelAr: "التوافق مع القطاع", icon: <Star className="w-4 h-4" /> },
  { key: "regulatoryRisk", label: "Regulatory Risk", labelAr: "المخاطر التنظيمية", icon: <Shield className="w-4 h-4" />, isRisk: true },
];

const STAGE_ORDER = ["idea", "prototype", "mvp", "early_traction", "growth", "scaling"];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function VentureCompare() {
  const { isRTL, language } = useLanguage();
  const [, navigate] = useLocation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: ventures, isLoading } = trpc.ventures.published.useQuery({ limit: 50, offset: 0 });

  const selectedVentures = (ventures ?? []).filter((v) => selectedIds.includes(v.id)) as Venture[];

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  const t = {
    title: isRTL ? "مقارنة المشاريع" : "Venture Comparison",
    subtitle: isRTL ? "قارن حتى 3 مشاريع جنباً إلى جنب عبر جميع أبعاد التقييم" : "Compare up to 3 ventures side-by-side across all evaluation dimensions",
    selectVentures: isRTL ? "اختر المشاريع للمقارنة (حتى 3)" : "Select ventures to compare (up to 3)",
    noAI: isRTL ? "لا يوجد تحليل ذكاء اصطناعي" : "No AI analysis",
    stage: isRTL ? "المرحلة" : "Stage",
    country: isRTL ? "الدولة" : "Country",
    funding: isRTL ? "هدف التمويل" : "Funding Target",
    team: isRTL ? "حجم الفريق" : "Team Size",
    winner: isRTL ? "الفائز" : "Winner",
    back: isRTL ? "رجوع" : "Back",
    clearAll: isRTL ? "مسح الكل" : "Clear All",
    selectAtLeast2: isRTL ? "اختر مشروعين على الأقل للمقارنة" : "Select at least 2 ventures to compare",
    noVentures: isRTL ? "لا توجد مشاريع منشورة للمقارنة" : "No published ventures available to compare",
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/ventures")}>
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
          {selectedIds.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
              {t.clearAll}
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Venture Selector */}
        <div>
          <h2 className="font-semibold mb-4">{t.selectVentures}</h2>
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          )}
          {!isLoading && (!ventures || ventures.length === 0) && (
            <p className="text-muted-foreground text-center py-8">{t.noVentures}</p>
          )}
          {!isLoading && ventures && ventures.length > 0 && (
            <Card className="border border-border p-6 bg-gradient-to-br from-primary/5 to-transparent mb-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {language === "en" ? "Portfolio Comparison Insights" : "رؤى مقارنة المحفظة"}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{language === "en" ? "Total Ventures" : "إجمالي المشاريع"}</p>
                  <p className="text-2xl font-bold text-foreground">{ventures.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{language === "en" ? "Avg. Readiness" : "متوسط الجاهزية"}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(ventures.reduce((sum, v) => sum + (v.aiReadinessScore || 0), 0) / ventures.length)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{language === "en" ? "Investor Ready" : "جاهز للمستثمرين"}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {ventures.filter((v) => {
                      const analysis = v.aiAnalysis as AIAnalysis | undefined;
                      return analysis?.investorReadinessFlag === "ready_for_investors";
                    }).length}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{language === "en" ? "Total Funding Target" : "إجمالي الهدف التمويلي"}</p>
                  <p className="text-lg font-bold text-foreground">
                    ${(ventures.reduce((sum, v) => sum + (parseFloat(v.fundingTarget || "0") || 0), 0) / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </Card>
          )}
          {!isLoading && ventures && ventures.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ventures.map((v) => {
                const isSelected = selectedIds.includes(v.id);
                const isDisabled = !isSelected && selectedIds.length >= 3;
                return (
                  <button
                    key={v.id}
                    onClick={() => !isDisabled && toggleSelect(v.id)}
                    disabled={isDisabled}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isDisabled
                        ? "border-muted opacity-40 cursor-not-allowed"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{v.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 capitalize">{v.stage.replace(/_/g, " ")} · {v.country ?? "N/A"}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-primary bg-primary" : "border-muted"}`}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    {(v.aiAnalysis as AIAnalysis)?.readinessScore != null && (
                      <div className="mt-2 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span className="text-xs font-medium">{(v.aiAnalysis as AIAnalysis).readinessScore}/100</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selectedIds.length < 2 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t.selectAtLeast2}</p>
          </div>
        )}

        {selectedVentures.length >= 2 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 bg-muted/50 rounded-tl-lg text-sm font-semibold w-40">
                    {isRTL ? "المعيار" : "Criterion"}
                  </th>
                  {selectedVentures.map((v, i) => (
                    <th key={v.id} className="p-3 bg-muted/50 text-sm font-semibold min-w-[180px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{v.title}</span>
                        <button onClick={() => toggleSelect(v.id)} className="text-muted-foreground hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                  {selectedVentures.length >= 2 && (
                    <th className="p-3 bg-primary/10 rounded-tr-lg text-sm font-semibold text-primary w-20">
                      {t.winner}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {/* Basic Info */}
                <tr className="border-t">
                  <td className="p-3 text-xs font-medium text-muted-foreground">{t.stage}</td>
                  {selectedVentures.map((v) => (
                    <td key={v.id} className="p-3">
                      <Badge variant="outline" className="capitalize text-xs">{v.stage.replace(/_/g, " ")}</Badge>
                    </td>
                  ))}
                  <td className="p-3">
                    {selectedVentures.length >= 2 && (() => {
                      const scores = selectedVentures.map((v) => STAGE_ORDER.indexOf(v.stage));
                      const maxScore = Math.max(...scores);
                      const minScore = Math.min(...scores);
                      if (maxScore === minScore) return <Minus className="w-4 h-4 text-muted-foreground" />;
                      return scores[0] === maxScore
                        ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                        : <X className="w-4 h-4 text-red-400" />;
                    })()}
                  </td>
                </tr>
                <tr className="border-t bg-muted/20">
                  <td className="p-3 text-xs font-medium text-muted-foreground">{t.country}</td>
                  {selectedVentures.map((v) => (
                    <td key={v.id} className="p-3 text-sm">{v.country ?? "—"}</td>
                  ))}
                  <td className="p-3" />
                </tr>
                <tr className="border-t">
                  <td className="p-3 text-xs font-medium text-muted-foreground">{t.funding}</td>
                  {selectedVentures.map((v) => (
                    <td key={v.id} className="p-3 text-sm">{v.fundingTarget ?? "—"}</td>
                  ))}
                  <td className="p-3" />
                </tr>
                <tr className="border-t bg-muted/20">
                  <td className="p-3 text-xs font-medium text-muted-foreground">{t.team}</td>
                  {selectedVentures.map((v) => (
                    <td key={v.id} className="p-3 text-sm">{v.teamSize ?? "—"}</td>
                  ))}
                  <td className="p-3" />
                </tr>

                {/* AI Score Dimensions */}
                {DIMENSIONS.map((dim, dimIdx) => (
                  <tr key={dim.key} className={`border-t ${dimIdx % 2 === 0 ? "" : "bg-muted/20"}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <span className="text-muted-foreground">{dim.icon}</span>
                        {isRTL ? dim.labelAr : dim.label}
                        {dim.isRisk && <span className="text-red-400 text-xs">{isRTL ? "(أقل أفضل)" : "(lower=better)"}</span>}
                      </div>
                    </td>
                    {selectedVentures.map((v) => {
                      const analysis = v.aiAnalysis as AIAnalysis | null;
                      const score = analysis ? (analysis[dim.key as keyof AIAnalysis] as number | undefined) : undefined;
                      return (
                        <td key={v.id} className="p-3">
                          {score != null ? (
                            <ScoreBar score={score} isRisk={dim.isRisk} />
                          ) : (
                            <span className="text-xs text-muted-foreground">{t.noAI}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center">
                      {selectedVentures.length >= 2 && (() => {
                        const analysis0 = selectedVentures[0].aiAnalysis as AIAnalysis | null;
                        const analysis1 = selectedVentures[1].aiAnalysis as AIAnalysis | null;
                        const s0 = analysis0 ? (analysis0[dim.key as keyof AIAnalysis] as number | undefined) : undefined;
                        const s1 = analysis1 ? (analysis1[dim.key as keyof AIAnalysis] as number | undefined) : undefined;
                        if (s0 == null || s1 == null) return <Minus className="w-4 h-4 text-muted-foreground mx-auto" />;
                        return <Winner a={s0} b={s1} isRisk={dim.isRisk} />;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Cards */}
        {selectedVentures.length >= 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedVentures.map((v) => {
              const analysis = v.aiAnalysis as AIAnalysis | null;
              return (
                <Card key={v.id} className="p-5">
                  <h3 className="font-bold mb-1">{v.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{analysis?.summary ?? "—"}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        analysis?.investorReadinessFlag === "ready_for_investors"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {analysis?.investorReadinessFlag === "ready_for_investors"
                        ? (isRTL ? "جاهز للمستثمرين" : "Investor Ready")
                        : (isRTL ? "يحتاج تطوير" : "Needs Development")}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => navigate(`/ventures/${v.id}`)}
                  >
                    {isRTL ? "عرض التفاصيل" : "View Details"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
