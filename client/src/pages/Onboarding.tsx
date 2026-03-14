import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, TrendingUp, MapPin, DollarSign, Target, ChevronRight, ChevronLeft } from "lucide-react";

const SECTORS = [
  { id: "agritech", en: "AgriTech", ar: "تقنية الزراعة", icon: "🌾" },
  { id: "fintech", en: "FinTech", ar: "التقنية المالية", icon: "💳" },
  { id: "renewable", en: "Renewable Energy", ar: "الطاقة المتجددة", icon: "☀️" },
  { id: "healthcare", en: "Healthcare", ar: "الرعاية الصحية", icon: "🏥" },
  { id: "edtech", en: "EdTech", ar: "تقنية التعليم", icon: "📚" },
  { id: "logistics", en: "Logistics", ar: "اللوجستيات", icon: "🚛" },
  { id: "ecommerce", en: "E-Commerce", ar: "التجارة الإلكترونية", icon: "🛒" },
  { id: "cleantech", en: "CleanTech", ar: "التقنية النظيفة", icon: "♻️" },
  { id: "telecom", en: "Telecom & ICT", ar: "الاتصالات وتقنية المعلومات", icon: "📡" },
  { id: "realestate", en: "Real Estate", ar: "العقارات", icon: "🏗️" },
  { id: "food", en: "Food & Beverage", ar: "الغذاء والمشروبات", icon: "🍽️" },
  { id: "other", en: "Other", ar: "أخرى", icon: "💡" },
];

const STAGES = [
  { value: "idea", en: "Idea Stage", ar: "مرحلة الفكرة", desc_en: "Pre-revenue, concept validation", desc_ar: "قبل الإيرادات، التحقق من الفكرة" },
  { value: "prototype", en: "Prototype", ar: "نموذج أولي", desc_en: "Working prototype built", desc_ar: "نموذج أولي يعمل" },
  { value: "mvp", en: "MVP", ar: "منتج أدنى قابل للتطبيق", desc_en: "Minimum viable product live", desc_ar: "منتج أدنى قابل للتطبيق" },
  { value: "early_traction", en: "Early Traction", ar: "牵引 مبكرة", desc_en: "First customers, early revenue", desc_ar: "أول عملاء، إيرادات مبكرة" },
  { value: "growth", en: "Growth", ar: "نمو", desc_en: "Scaling revenue and team", desc_ar: "توسيع الإيرادات والفريق" },
  { value: "scaling", en: "Scaling", ar: "توسع", desc_en: "Rapid market expansion", desc_ar: "توسع سريع في السوق" },
];

const TICKET_RANGES = [
  { value: "5k-25k", en: "$5K – $25K", ar: "5,000 – 25,000 دولار", desc_en: "Micro-investment / Grant", desc_ar: "استثمار صغير / منحة" },
  { value: "25k-100k", en: "$25K – $100K", ar: "25,000 – 100,000 دولار", desc_en: "Seed / Angel", desc_ar: "بذرة / ملاك أعمال" },
  { value: "100k-500k", en: "$100K – $500K", ar: "100,000 – 500,000 دولار", desc_en: "Pre-Series A", desc_ar: "ما قبل السلسلة أ" },
  { value: "500k-2m", en: "$500K – $2M", ar: "500,000 – 2 مليون دولار", desc_en: "Series A", desc_ar: "السلسلة أ" },
  { value: "2m+", en: "$2M+", ar: "أكثر من 2 مليون دولار", desc_en: "Series B and beyond", desc_ar: "السلسلة ب وما بعدها" },
];

const SUDAN_REGIONS = [
  "All Sudan", "Khartoum", "Omdurman", "Gezira", "Kassala",
  "Red Sea", "River Nile", "Northern", "North Darfur", "South Darfur",
  "West Darfur", "North Kordofan", "South Kordofan", "Blue Nile",
  "Sennar", "White Nile", "Al Qadarif"
];

const ENGAGEMENT_TYPES = [
  { value: "equity", en: "Equity Investment", ar: "استثمار بالأسهم", icon: "📈" },
  { value: "debt", en: "Debt / Loan", ar: "قرض / دين", icon: "🏦" },
  { value: "grant", en: "Grant / Donation", ar: "منحة / تبرع", icon: "🎁" },
  { value: "mentorship", en: "Mentorship Only", ar: "إرشاد فقط", icon: "🎓" },
  { value: "partnership", en: "Strategic Partnership", ar: "شراكة استراتيجية", icon: "🤝" },
];

type Step = "sectors" | "stages" | "ticket" | "regions" | "engagement" | "complete";

export default function Onboarding() {
  const { isAuthenticated, loading } = useAuth();
  const { language, isRTL } = useLanguage();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<Step>("sectors");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string>("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedEngagement, setSelectedEngagement] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const savePrefs = trpc.investorPrefs.upsert.useMutation({
    onSuccess: () => {
      setStep("complete");
    },
    onError: (e: any) => {
      toast.error(e.message);
      setSaving(false);
    }
  });

  const toggleItem = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter(x => x !== value) : [...list, value]);
  };

  const handleFinish = async () => {
    setSaving(true);
    const [, navigate] = useLocation();
    await savePrefs.mutateAsync({
      preferredSectors: selectedSectors.map(Number).filter(n => !isNaN(n)),
      preferredStages: selectedStages as any,
      minInvestment: selectedTicket.split("-")[0] || undefined,
      maxInvestment: selectedTicket.split("-")[1] || undefined,
      preferredGeographies: selectedRegions,
      investmentThesis: selectedEngagement.join(", "),
    });
    // Redirect to ventures with pre-filters
    const sectorsParam = selectedSectors.join(",");
    const regionsParam = selectedRegions.join(",");
    navigate(`/ventures?sectors=${sectorsParam}&regions=${regionsParam}`);
  };

  const steps: Step[] = ["sectors", "stages", "ticket", "regions", "engagement"];
  const stepIndex = steps.indexOf(step);
  const progress = step === "complete" ? 100 : Math.round(((stepIndex + 1) / steps.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-green-50 to-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {language === "en" ? "You're all set!" : "أنت جاهز!"}
          </h1>
          <p className="text-muted-foreground mb-2">
            {language === "en"
              ? "Your investment preferences have been saved. The AI matching engine will now surface opportunities aligned with your thesis."
              : "تم حفظ تفضيلاتك الاستثمارية. سيعرض محرك المطابقة بالذكاء الاصطناعي الآن الفرص المتوافقة مع أطروحتك."}
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <Button onClick={() => navigate("/ventures")} size="lg" className="w-full">
              {language === "en" ? "Explore Investment Opportunities →" : "استكشف فرص الاستثمار →"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
              {language === "en" ? "Go to Dashboard" : "الذهاب إلى لوحة التحكم"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {language === "en" ? "Set Up Your Investment Profile" : "إعداد ملفك الاستثماري"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {language === "en"
              ? "Help us match you with the right Sudanese ventures. This takes about 2 minutes."
              : "ساعدنا في مطابقتك مع المشاريع السودانية المناسبة. يستغرق هذا حوالي دقيقتين."}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{language === "en" ? `Step ${stepIndex + 1} of ${steps.length}` : `الخطوة ${stepIndex + 1} من ${steps.length}`}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((s, i) => (
              <div key={s} className={`text-xs ${i <= stepIndex ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {language === "en"
                  ? s === "sectors" ? "Sectors" : s === "stages" ? "Stages" : s === "ticket" ? "Ticket" : s === "regions" ? "Regions" : "Engagement"
                  : s === "sectors" ? "القطاعات" : s === "stages" ? "المراحل" : s === "ticket" ? "الحجم" : s === "regions" ? "المناطق" : "النوع"}
              </div>
            ))}
          </div>
        </div>

        {/* Step: Sectors */}
        {step === "sectors" && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                {language === "en" ? "Which sectors interest you?" : "ما القطاعات التي تهمك؟"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Select all that apply. The AI will prioritize matching ventures in these sectors." : "اختر كل ما ينطبق. سيعطي الذكاء الاصطناعي الأولوية للمشاريع في هذه القطاعات."}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SECTORS.map((sector) => {
                  const isSelected = selectedSectors.includes(sector.id);
                  return (
                    <button
                      key={sector.id}
                      onClick={() => toggleItem(selectedSectors, setSelectedSectors, sector.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="text-xl">{sector.icon}</span>
                      <span className="text-sm font-medium">{language === "en" ? sector.en : sector.ar}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-primary ms-auto flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {selectedSectors.length > 0 && (
                <p className="text-xs text-primary mt-3">{selectedSectors.length} {language === "en" ? "selected" : "محدد"}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step: Stages */}
        {step === "stages" && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {language === "en" ? "What investment stages do you target?" : "ما مراحل الاستثمار التي تستهدفها؟"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Select all stages you're comfortable investing in." : "اختر جميع المراحل التي تشعر بالراحة للاستثمار فيها."}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {STAGES.map((stage) => {
                  const isSelected = selectedStages.includes(stage.value);
                  return (
                    <button
                      key={stage.value}
                      onClick={() => toggleItem(selectedStages, setSelectedStages, stage.value)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-sm">{language === "en" ? stage.en : stage.ar}</div>
                        <div className="text-xs text-muted-foreground">{language === "en" ? stage.desc_en : stage.desc_ar}</div>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Ticket Size */}
        {step === "ticket" && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                {language === "en" ? "What is your typical ticket size?" : "ما حجم استثمارك المعتاد؟"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Select the range that best describes your investment capacity." : "اختر النطاق الذي يصف بشكل أفضل قدرتك الاستثمارية."}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {TICKET_RANGES.map((ticket) => {
                  const isSelected = selectedTicket === ticket.value;
                  return (
                    <button
                      key={ticket.value}
                      onClick={() => setSelectedTicket(ticket.value)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">{language === "en" ? ticket.en : ticket.ar}</div>
                        <div className="text-xs text-muted-foreground">{language === "en" ? ticket.desc_en : ticket.desc_ar}</div>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Regions */}
        {step === "regions" && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {language === "en" ? "Which regions in Sudan do you focus on?" : "ما المناطق في السودان التي تركز عليها؟"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Select all regions. Choose 'All Sudan' for no geographic restriction." : "اختر جميع المناطق. اختر 'كل السودان' لعدم وجود قيود جغرافية."}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUDAN_REGIONS.map((region) => {
                  const isSelected = selectedRegions.includes(region);
                  return (
                    <button
                      key={region}
                      onClick={() => {
                        if (region === "All Sudan") {
                          setSelectedRegions(["All Sudan"]);
                        } else {
                          const withoutAll = selectedRegions.filter(r => r !== "All Sudan");
                          toggleItem(withoutAll, setSelectedRegions, region);
                        }
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 text-left text-sm transition-all ${
                        isSelected ? "border-primary bg-primary/5 font-medium" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span>{region}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Engagement Types */}
        {step === "engagement" && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {language === "en" ? "How do you want to engage?" : "كيف تريد المشاركة؟"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Select all engagement types you're open to." : "اختر جميع أنواع المشاركة التي تقبلها."}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {ENGAGEMENT_TYPES.map((type) => {
                  const isSelected = selectedEngagement.includes(type.value);
                  return (
                    <button
                      key={type.value}
                      onClick={() => toggleItem(selectedEngagement, setSelectedEngagement, type.value)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-medium text-sm">{language === "en" ? type.en : type.ar}</span>
                      {isSelected && <CheckCircle className="w-5 h-5 text-primary ms-auto flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              const prev = steps[stepIndex - 1];
              if (prev) setStep(prev);
              else navigate("/dashboard");
            }}
            className="flex items-center gap-2"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {language === "en" ? "Back" : "رجوع"}
          </Button>

          {step !== "engagement" ? (
            <Button
              onClick={() => {
                const next = steps[stepIndex + 1];
                if (next) setStep(next);
              }}
              disabled={
                (step === "sectors" && selectedSectors.length === 0) ||
                (step === "stages" && selectedStages.length === 0) ||
                (step === "ticket" && !selectedTicket) ||
                (step === "regions" && selectedRegions.length === 0)
              }
              className="flex items-center gap-2"
            >
              {language === "en" ? "Next" : "التالي"}
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={selectedEngagement.length === 0 || saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === "en" ? "Saving..." : "جاري الحفظ..."}
                </span>
              ) : (
                <>
                  {language === "en" ? "Complete Setup" : "إتمام الإعداد"}
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            {language === "en" ? "Skip for now, I'll set this up later" : "تخطي الآن، سأعدّ هذا لاحقاً"}
          </button>
        </div>
      </div>
    </div>
  );
}
