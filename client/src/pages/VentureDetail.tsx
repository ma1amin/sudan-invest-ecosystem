import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Zap, MapPin, Users, TrendingUp, CheckCircle, AlertCircle, Globe, MessageSquare, Heart, Globe2, Shield, BarChart3 } from "lucide-react";

export default function VentureDetail() {
  const { language, isRTL } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const ventureId = Number(params.id);

  const { data: venture, isLoading } = trpc.ventures.getById.useQuery({ id: ventureId }, { enabled: !!ventureId });
  const { data: sectors } = trpc.sectors.list.useQuery();

  const requestConnection = trpc.connections.request.useMutation({
    onSuccess: () => toast.success(language === "en" ? "Connection request sent!" : "تم إرسال طلب التواصل!"),
    onError: (e) => toast.error(e.message),
  });

  const getSectorName = (id: number | null) => {
    if (!id) return null;
    const sector = sectors?.find((s) => s.id === id);
    return sector ? (language === "en" ? sector.name : (sector.nameAr ?? sector.name)) : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-bold text-foreground mb-2">{language === "en" ? "Venture not found" : "المشروع غير موجود"}</h2>
          <Button onClick={() => navigate("/ventures")}>{language === "en" ? "Back to Ventures" : "العودة إلى المشاريع"}</Button>
        </div>
      </div>
    );
  }

  const aiAnalysis = venture.aiAnalysis as any;
  const isOwner = user?.id === venture.founderId;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      <header className="bg-white border-b border-border px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/ventures")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-foreground">{venture.title}</h1>
          {venture.tagline && <p className="text-muted-foreground text-sm">{venture.tagline}</p>}
        </div>
        {venture.aiReadinessScore !== null && (
          <div className="text-center">
            <div className={`text-2xl font-bold ${(venture.aiReadinessScore ?? 0) >= 70 ? "text-green-600" : "text-yellow-600"}`}>{venture.aiReadinessScore}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3" /> AI Score</div>
          </div>
        )}
      </header>

      <div className="container py-8 max-w-4xl space-y-6">
        {/* Meta */}
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3 mb-4">
              {venture.stage && <Badge className="capitalize">{venture.stage.replace("_", " ")}</Badge>}
              {getSectorName(venture.sectorId) && <Badge variant="outline">{getSectorName(venture.sectorId)}</Badge>}
            </div>
            <p className="text-foreground leading-relaxed mb-4">{venture.description}</p>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              {venture.country && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{venture.country}</span>}
              {venture.teamSize && <span className="flex items-center gap-1"><Users className="w-4 h-4" />{venture.teamSize} {language === "en" ? "team members" : "أعضاء الفريق"}</span>}
              {venture.fundingTarget && <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" />${Number(venture.fundingTarget).toLocaleString()} {language === "en" ? "target" : "هدف"}</span>}
              {venture.website && <a href={venture.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Globe className="w-4 h-4" />{language === "en" ? "Website" : "الموقع"}</a>}
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis — Investment Thesis Aligned */}
        {aiAnalysis && (
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="w-5 h-5 text-primary" />
                  {language === "en" ? "AI Investment Analysis" : "تحليل الذكاء الاصطناعي"}
                </CardTitle>
                {aiAnalysis.investorReadinessFlag && (
                  <Badge className={`text-xs ${
                    aiAnalysis.investorReadinessFlag === "ready_for_investors" ? "bg-green-100 text-green-700 border-green-200" :
                    aiAnalysis.investorReadinessFlag === "needs_development" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                    "bg-orange-100 text-orange-700 border-orange-200"
                  }`}>
                    {aiAnalysis.investorReadinessFlag === "ready_for_investors" ? (language === "en" ? "✓ Investor Ready" : "✓ جاهز للمستثمرين") :
                     aiAnalysis.investorReadinessFlag === "needs_development" ? (language === "en" ? "⚠ Needs Development" : "⚠ يحتاج تطوير") :
                     (language === "en" ? "○ Early Incubation" : "○ حضانة مبكرة")}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Executive Summary */}
              {aiAnalysis.summary && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-foreground text-sm leading-relaxed">{aiAnalysis.summary}</p>
                </div>
              )}

              {/* Core Readiness Scores */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {language === "en" ? "Readiness Dimensions" : "أبعاد الجاهزية"}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: language === "en" ? "Overall" : "إجمالي", value: aiAnalysis.readinessScore, icon: BarChart3 },
                    { label: language === "en" ? "Market" : "السوق", value: aiAnalysis.marketClarity, icon: TrendingUp },
                    { label: language === "en" ? "Business Model" : "نموذج الأعمال", value: aiAnalysis.businessModelStrength, icon: BarChart3 },
                    { label: language === "en" ? "Team" : "الفريق", value: aiAnalysis.teamReadiness, icon: Users },
                  ].map((s, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-3 text-center">
                      <div className={`text-2xl font-bold ${
                        s.value >= 70 ? "text-green-600" : s.value >= 50 ? "text-yellow-600" : "text-red-500"
                      }`}>{s.value ?? "—"}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                      <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${
                          (s.value ?? 0) >= 70 ? "bg-green-500" : (s.value ?? 0) >= 50 ? "bg-yellow-500" : "bg-red-400"
                        }`} style={{ width: `${s.value ?? 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thesis Alignment Scores */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {language === "en" ? "Investment Thesis Alignment" : "توافق أطروحة الاستثمار"}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: language === "en" ? "Scale" : "التوسع", value: aiAnalysis.scalabilityScore, icon: Globe2, color: "blue" },
                    { label: language === "en" ? "Impact" : "الأثر", value: aiAnalysis.impactScore, icon: Heart, color: "purple" },
                    { label: language === "en" ? "Diaspora Fit" : "ملاءمة المغتربين", value: aiAnalysis.diasporaRelevance, icon: Globe, color: "teal" },
                    { label: language === "en" ? "Sector Fit" : "ملاءمة القطاع", value: aiAnalysis.sectorAlignment, icon: Zap, color: "orange" },
                  ].map((s, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-3 text-center">
                      <div className={`text-2xl font-bold ${
                        s.value >= 70 ? "text-green-600" : s.value >= 50 ? "text-yellow-600" : "text-red-500"
                      }`}>{s.value ?? "—"}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                      <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${
                          (s.value ?? 0) >= 70 ? "bg-green-500" : (s.value ?? 0) >= 50 ? "bg-yellow-500" : "bg-red-400"
                        }`} style={{ width: `${s.value ?? 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory Risk & Diaspora Engagement */}
              <div className="grid md:grid-cols-2 gap-4">
                {aiAnalysis.regulatoryRisk !== undefined && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-800">
                        {language === "en" ? "Regulatory Risk" : "المخاطر التنظيمية"}
                      </span>
                      <span className={`ml-auto text-lg font-bold ${
                        aiAnalysis.regulatoryRisk <= 30 ? "text-green-600" :
                        aiAnalysis.regulatoryRisk <= 60 ? "text-yellow-600" : "text-red-600"
                      }`}>{aiAnalysis.regulatoryRisk}</span>
                    </div>
                    <p className="text-xs text-orange-700">
                      {aiAnalysis.regulatoryRisk <= 30
                        ? (language === "en" ? "Low regulatory exposure" : "تعرض تنظيمي منخفض")
                        : aiAnalysis.regulatoryRisk <= 60
                        ? (language === "en" ? "Moderate regulatory risk — monitor closely" : "مخاطرة تنظيمية متوسطة")
                        : (language === "en" ? "High regulatory risk — due diligence required" : "مخاطرة تنظيمية عالية")}
                    </p>
                  </div>
                )}
                {aiAnalysis.diasporaEngagementType && aiAnalysis.diasporaEngagementType !== "not_applicable" && (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-teal-600" />
                      <span className="text-sm font-semibold text-teal-800">
                        {language === "en" ? "Diaspora Opportunity" : "فرصة المغتربين"}
                      </span>
                    </div>
                    <p className="text-xs text-teal-700 capitalize">
                      {language === "en"
                        ? `Best suited for diaspora ${aiAnalysis.diasporaEngagementType}`
                        : `مناسب لمشاركة المغتربين: ${aiAnalysis.diasporaEngagementType}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Strengths & Risks */}
              <div className="grid md:grid-cols-2 gap-4">
                {aiAnalysis.strengths?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {language === "en" ? "Strengths" : "نقاط القوة"}
                    </h4>
                    <ul className="space-y-1.5">
                      {aiAnalysis.strengths.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiAnalysis.riskIndicators?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      {language === "en" ? "Risk Indicators" : "مؤشرات المخاطر"}
                    </h4>
                    <ul className="space-y-1.5">
                      {aiAnalysis.riskIndicators.map((r: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {aiAnalysis.recommendations?.length > 0 && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    {language === "en" ? "AI Recommendations" : "توصيات الذكاء الاصطناعي"}
                  </h4>
                  <ol className="space-y-2">
                    {aiAnalysis.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-bold min-w-[1.2rem]">{i + 1}.</span>{rec}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {isAuthenticated && !isOwner && (
          <div className="flex gap-3">
            <Button
              onClick={() => requestConnection.mutate({ receiverId: venture.founderId, ventureId: venture.id, message: `Interested in ${venture.title}` })}
              disabled={requestConnection.isPending}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {language === "en" ? "Connect with Founder" : "التواصل مع المؤسس"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
