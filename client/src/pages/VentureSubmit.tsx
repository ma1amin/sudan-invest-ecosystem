import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Zap, CheckCircle, AlertCircle, Building2, Shield } from "lucide-react";

const STAGES = [
  { value: "idea", en: "Idea Stage", ar: "مرحلة الفكرة" },
  { value: "prototype", en: "Prototype", ar: "نموذج أولي" },
  { value: "mvp", en: "MVP", ar: "منتج أدنى قابل للتطبيق" },
  { value: "early_traction", en: "Early Traction", ar: "牵引 مبكرة" },
  { value: "growth", en: "Growth", ar: "نمو" },
  { value: "scaling", en: "Scaling", ar: "توسع" },
];

export default function VentureSubmit() {
  const { user, isAuthenticated, loading } = useAuth();
  const { language, isRTL, t } = useLanguage();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"form" | "submitting" | "scored">("form");
  const [ventureId, setVentureId] = useState<number | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);

  const { data: sectors } = trpc.sectors.list.useQuery();

  const [form, setForm] = useState({
    title: "",
    titleAr: "",
    tagline: "",
    description: "",
    sectorId: "",
    stage: "idea" as const,
    fundingTarget: "",
    country: "",
    teamSize: "",
    website: "",
  });

  const createVenture = trpc.ventures.create.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Venture saved as draft" : "تم حفظ المشروع كمسودة");
    },
    onError: (e) => toast.error(e.message),
  });

  const submitVenture = trpc.ventures.submit.useMutation({
    onSuccess: () => {
      setStep("scored");
    },
    onError: (e) => {
      toast.error(e.message);
      setStep("form");
    },
  });

  const myVentures = trpc.ventures.myVentures.useQuery(undefined, { enabled: isAuthenticated });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return;

    setStep("submitting");

    try {
      await createVenture.mutateAsync({
        title: form.title,
        titleAr: form.titleAr || undefined,
        tagline: form.tagline || undefined,
        description: form.description,
        sectorId: form.sectorId ? Number(form.sectorId) : undefined,
        stage: form.stage,
        fundingTarget: form.fundingTarget || undefined,
        country: form.country || undefined,
        teamSize: form.teamSize ? Number(form.teamSize) : undefined,
        website: form.website || undefined,
      });

      // Get the latest venture
      await myVentures.refetch();
      const ventures = myVentures.data;
      if (ventures && ventures.length > 0) {
        const latest = ventures[ventures.length - 1];
        setVentureId(latest.id);
        await submitVenture.mutateAsync({ id: latest.id });
        await myVentures.refetch();
        const updated = myVentures.data?.find((v) => v.id === latest.id);
        if (updated?.aiAnalysis) {
          setAiResult(updated.aiAnalysis);
        }
      }
    } catch (e) {
      setStep("form");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{language === "en" ? "Sign in Required" : "يجب تسجيل الدخول"}</h2>
            <a href={getLoginUrl()}><Button className="w-full mt-4">{t("nav.login")}</Button></a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      <div className="bg-white border-b border-border px-6 py-4">
        <h1 className="font-bold text-foreground">{language === "en" ? "Submit Your Venture" : "تقديم مشروعك"}</h1>
        <p className="text-muted-foreground text-sm">{language === "en" ? "Get AI-powered readiness scoring" : "احصل على تقييم الجاهزية الذكي"}</p>
      </div>

      <div className="container py-8 max-w-3xl">
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="w-5 h-5 text-primary" />
                  {language === "en" ? "Basic Information" : "المعلومات الأساسية"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Venture Name (English) *" : "اسم المشروع (إنجليزي) *"}</Label>
                    <Input
                      placeholder={language === "en" ? "e.g. AgriConnect Sudan" : "مثال: AgriConnect Sudan"}
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Venture Name (Arabic)" : "اسم المشروع (عربي)"}</Label>
                    <Input
                      dir="rtl"
                      placeholder="مثال: أجري كونكت السودان"
                      value={form.titleAr}
                      onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === "en" ? "Tagline" : "الشعار"}</Label>
                  <Input
                    placeholder={language === "en" ? "One sentence describing your venture" : "جملة واحدة تصف مشروعك"}
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === "en" ? "Description *" : "الوصف *"}</Label>
                  <Textarea
                    placeholder={language === "en"
                      ? "Describe your venture, the problem you solve, your solution, target market, and traction so far (minimum 50 characters)..."
                      : "صف مشروعك والمشكلة التي تحلها وحلك وسوقك المستهدف والتقدم المحرز حتى الآن..."}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={5}
                    required
                    minLength={50}
                  />
                  <p className="text-xs text-muted-foreground">{form.description.length}/50 {language === "en" ? "minimum" : "حد أدنى"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Classification */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-base">{language === "en" ? "Classification" : "التصنيف"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Sector" : "القطاع"}</Label>
                    <Select value={form.sectorId} onValueChange={(v) => setForm({ ...form, sectorId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select sector" : "اختر القطاع"} />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors?.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {language === "en" ? s.name : (s.nameAr ?? s.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Stage *" : "المرحلة *"}</Label>
                    <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {language === "en" ? s.en : s.ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Country" : "الدولة"}</Label>
                    <Input
                      placeholder={language === "en" ? "e.g. Sudan" : "مثال: السودان"}
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Team Size" : "حجم الفريق"}</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 5"
                      value={form.teamSize}
                      onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Funding Target (USD)" : "هدف التمويل (دولار)"}</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 500000"
                      value={form.fundingTarget}
                      onChange={(e) => setForm({ ...form, fundingTarget: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "en" ? "Website" : "الموقع الإلكتروني"}</Label>
                    <Input
                      type="url"
                      placeholder="https://yourventure.com"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Notice */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <Zap className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-blue-800 text-sm">
                {language === "en"
                  ? "After submission, our AI engine will analyze your venture and generate a readiness score, risk indicators, and personalized recommendations. Human moderators will review before publishing."
                  : "بعد التقديم، سيحلل محركنا الذكي مشروعك ويولد درجة جاهزية ومؤشرات مخاطر وتوصيات مخصصة. سيراجع المشرفون البشريون قبل النشر."}
              </p>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={form.description.length < 50}>
              {language === "en" ? "Submit for AI Analysis" : "تقديم للتحليل الذكي"}
              <Zap className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {step === "submitting" && (
          <Card className="border border-border">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                {language === "en" ? "AI Analysis in Progress" : "تحليل الذكاء الاصطناعي جارٍ"}
              </h2>
              <p className="text-muted-foreground">
                {language === "en"
                  ? "Our AI engine is analyzing your venture for readiness, risks, and opportunities..."
                  : "يقوم محركنا الذكي بتحليل مشروعك للجاهزية والمخاطر والفرص..."}
              </p>
            </CardContent>
          </Card>
        )}

        {step === "scored" && (
          <div className="space-y-6">
            <Card className="border border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="font-bold text-green-800 text-lg">
                    {language === "en" ? "Venture Submitted Successfully" : "تم تقديم المشروع بنجاح"}
                  </h2>
                </div>
                <p className="text-green-700 text-sm">
                  {language === "en"
                    ? "Your venture has been analyzed by our AI engine and is now in the moderation queue. Our team will review it shortly."
                    : "تم تحليل مشروعك بواسطة محركنا الذكي وهو الآن في قائمة الإشراف. سيراجعه فريقنا قريباً."}
                </p>
              </CardContent>
            </Card>

            {aiResult && (
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    {language === "en" ? "AI Analysis Results" : "نتائج تحليل الذكاء الاصطناعي"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Score Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: language === "en" ? "Readiness" : "الجاهزية", value: aiResult.readinessScore },
                      { label: language === "en" ? "Market Clarity" : "وضوح السوق", value: aiResult.marketClarity },
                      { label: language === "en" ? "Business Model" : "نموذج الأعمال", value: aiResult.businessModelStrength },
                      { label: language === "en" ? "Team" : "الفريق", value: aiResult.teamReadiness },
                      { label: language === "en" ? "Scalability" : "قابلية التوسع", value: aiResult.scalabilityScore },
                    ].map((score, i) => (
                      <div key={i} className="text-center p-4 bg-muted/50 rounded-xl">
                        <div className={`text-3xl font-bold ${score.value >= 70 ? "text-green-600" : score.value >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                          {score.value}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{score.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  {aiResult.summary && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 text-sm">{language === "en" ? "Executive Summary" : "الملخص التنفيذي"}</h4>
                      <p className="text-blue-700 text-sm">{aiResult.summary}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    {aiResult.strengths?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {language === "en" ? "Strengths" : "نقاط القوة"}
                        </h4>
                        <ul className="space-y-2">
                          {aiResult.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risks */}
                    {aiResult.riskIndicators?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          {language === "en" ? "Risk Indicators" : "مؤشرات المخاطر"}
                        </h4>
                        <ul className="space-y-2">
                          {aiResult.riskIndicators.map((r: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-orange-500 mt-0.5">•</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  {aiResult.recommendations?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 text-sm">
                        {language === "en" ? "Recommendations" : "التوصيات"}
                      </h4>
                      <ul className="space-y-2">
                        {aiResult.recommendations.map((r: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Badge className="text-xs bg-primary/10 text-primary border-primary/20 flex-shrink-0 mt-0.5">{i + 1}</Badge>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
                {language === "en" ? "Back to Dashboard" : "العودة إلى لوحة التحكم"}
              </Button>
              <Button onClick={() => { setStep("form"); setForm({ title: "", titleAr: "", tagline: "", description: "", sectorId: "", stage: "idea", fundingTarget: "", country: "", teamSize: "", website: "" }); }} className="flex-1">
                {language === "en" ? "Submit Another" : "تقديم مشروع آخر"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
