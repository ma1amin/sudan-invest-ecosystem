import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Zap, MapPin, Users, TrendingUp, CheckCircle, AlertCircle, Globe, MessageSquare } from "lucide-react";

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

        {/* AI Analysis */}
        {aiAnalysis && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="w-5 h-5 text-primary" />
                {language === "en" ? "AI Analysis" : "تحليل الذكاء الاصطناعي"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[
                  { label: language === "en" ? "Readiness" : "الجاهزية", value: aiAnalysis.readinessScore },
                  { label: language === "en" ? "Market" : "السوق", value: aiAnalysis.marketClarity },
                  { label: language === "en" ? "Model" : "النموذج", value: aiAnalysis.businessModelStrength },
                  { label: language === "en" ? "Team" : "الفريق", value: aiAnalysis.teamReadiness },
                  { label: language === "en" ? "Scale" : "التوسع", value: aiAnalysis.scalabilityScore },
                ].map((s, i) => (
                  <div key={i} className="text-center bg-muted/50 rounded-xl p-3">
                    <div className={`text-2xl font-bold ${s.value >= 70 ? "text-green-600" : s.value >= 50 ? "text-yellow-600" : "text-red-600"}`}>{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              {aiAnalysis.summary && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-blue-800 text-sm">{aiAnalysis.summary}</p>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {aiAnalysis.strengths?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />{language === "en" ? "Strengths" : "نقاط القوة"}</h4>
                    <ul className="space-y-1">{aiAnalysis.strengths.map((s: string, i: number) => <li key={i} className="text-sm text-muted-foreground">• {s}</li>)}</ul>
                  </div>
                )}
                {aiAnalysis.riskIndicators?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" />{language === "en" ? "Risks" : "المخاطر"}</h4>
                    <ul className="space-y-1">{aiAnalysis.riskIndicators.map((r: string, i: number) => <li key={i} className="text-sm text-muted-foreground">• {r}</li>)}</ul>
                  </div>
                )}
              </div>
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
