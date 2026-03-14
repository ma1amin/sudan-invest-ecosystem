import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Search, Building2, TrendingUp, MapPin, Users, Zap, ShieldCheck, Star, ArrowRight } from "lucide-react";

const STAGE_COLORS: Record<string, string> = {
  idea: "bg-gray-100 text-gray-700",
  prototype: "bg-blue-100 text-blue-700",
  mvp: "bg-purple-100 text-purple-700",
  early_traction: "bg-yellow-100 text-yellow-700",
  growth: "bg-green-100 text-green-700",
  scaling: "bg-teal-100 text-teal-700",
};

const SUDAN_REGIONS = [
  "Khartoum", "Omdurman", "North Khartoum", "Gezira", "Kassala",
  "Red Sea", "River Nile", "Northern", "North Darfur", "South Darfur",
  "West Darfur", "Central Darfur", "East Darfur", "North Kordofan",
  "South Kordofan", "West Kordofan", "Blue Nile", "Sennar", "White Nile", "Al Qadarif"
];

function getScoreColor(score: number) {
  if (score >= 75) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 55) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function getScoreLabel(score: number, language: string) {
  if (score >= 75) return language === "en" ? "Strong" : "قوي";
  if (score >= 55) return language === "en" ? "Moderate" : "متوسط";
  return language === "en" ? "Early" : "مبكر";
}

export default function Ventures() {
  const { language, isRTL } = useLanguage();
  const [location, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [sortBy, setSortBy] = useState<"score" | "newest" | "funding">("score");

  const [isPersonalized, setIsPersonalized] = useState(false);

  // Parse query params on mount and apply pre-filters
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const sectors = params.get("sectors");
    const regions = params.get("regions");
    if (sectors || regions) {
      setIsPersonalized(true);
      if (sectors) setSelectedSector(sectors.split(",")[0]);
      if (regions) setSelectedRegion(regions.split(",")[0]);
    }
  }, [location]);
  const { data: ventures, isLoading } = trpc.ventures.published.useQuery({ limit: 100, offset: 0 });
  const { data: sectors } = trpc.sectors.list.useQuery();

  const getSectorName = (id: number | null) => {
    if (!id) return null;
    const sector = sectors?.find((s) => s.id === id);
    return sector ? (language === "en" ? sector.name : (sector.nameAr ?? sector.name)) : null;
  };

  const filtered = ventures
    ?.filter((v) => {
      const matchSearch = !search ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.description?.toLowerCase().includes(search.toLowerCase()) ||
        v.country?.toLowerCase().includes(search.toLowerCase());
      const matchSector = selectedSector === "all" || String(v.sectorId) === selectedSector;
      const matchStage = selectedStage === "all" || v.stage === selectedStage;
      const matchRegion = selectedRegion === "all" || (v as any).sudanRegion === selectedRegion;
      return matchSearch && matchSector && matchStage && matchRegion;
    })
    .sort((a, b) => {
      if (sortBy === "score") return (b.aiReadinessScore ?? 0) - (a.aiReadinessScore ?? 0);
      if (sortBy === "funding") return Number(b.fundingTarget ?? 0) - Number(a.fundingTarget ?? 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      {/* Page Header */}
      <div className="bg-white border-b border-border px-6 py-5">
        <div className="container max-w-5xl">
          <h1 className="text-xl font-bold text-foreground">
            {language === "en" ? "Investment Opportunities" : "فرص الاستثمار"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === "en"
              ? "Verified Sudanese ventures seeking investment — scored by AI, curated for quality"
              : "مشاريع سودانية موثقة تبحث عن استثمار — مُقيَّمة بالذكاء الاصطناعي، منتقاة للجودة"}
          </p>
        </div>
      </div>

      <div className="container py-8 max-w-5xl">
        {/* Search & Filters */}
        <div className="bg-white border border-border rounded-xl p-4 mb-6 space-y-3">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
            <Input
              placeholder={language === "en" ? "Search by name, description, or location..." : "ابحث بالاسم أو الوصف أو الموقع..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={isRTL ? "pr-9" : "pl-9"}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder={language === "en" ? "All Sectors" : "كل القطاعات"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "en" ? "All Sectors" : "كل القطاعات"}</SelectItem>
                {sectors?.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {language === "en" ? s.name : (s.nameAr ?? s.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder={language === "en" ? "All Stages" : "كل المراحل"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "en" ? "All Stages" : "كل المراحل"}</SelectItem>
                {["idea","prototype","mvp","early_traction","growth","scaling"].map(s => (
                  <SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder={language === "en" ? "All Regions" : "كل الولايات"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "en" ? "All Regions" : "كل الولايات"}</SelectItem>
                {SUDAN_REGIONS.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder={language === "en" ? "Sort by" : "ترتيب حسب"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">{language === "en" ? "AI Score" : "تقييم الذكاء"}</SelectItem>
                <SelectItem value="newest">{language === "en" ? "Newest" : "الأحدث"}</SelectItem>
                <SelectItem value="funding">{language === "en" ? "Funding Target" : "هدف التمويل"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {ventures && (
            <p className="text-xs text-muted-foreground">
              {language === "en"
                ? `Showing ${filtered?.length ?? 0} of ${ventures.length} ventures`
                : `عرض ${filtered?.length ?? 0} من ${ventures.length} مشروع`}
            </p>
          )}
        </div>

        {/* Venture Cards */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-border">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded animate-pulse mb-3 w-1/3" />
                  <div className="h-3 bg-muted rounded animate-pulse mb-2 w-full" />
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="p-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {language === "en" ? "No ventures found" : "لم يتم العثور على مشاريع"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {language === "en"
                  ? "Try adjusting your filters or search terms."
                  : "جرب تعديل الفلاتر أو مصطلحات البحث."}
              </p>
              <Button variant="outline" onClick={() => { setSearch(""); setSelectedSector("all"); setSelectedStage("all"); setSelectedRegion("all"); }}>
                {language === "en" ? "Clear Filters" : "مسح الفلاتر"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered.map((venture) => {
              const score = venture.aiReadinessScore;
              const hasKyc = (venture as any).kycVerified;
              const region = (venture as any).sudanRegion;
              const sectorName = getSectorName(venture.sectorId);

              return (
                <Card
                  key={venture.id}
                  className="border border-border hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/ventures/${venture.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title Row */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {venture.title}
                          </h3>
                          {hasKyc && (
                            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              {language === "en" ? "Verified" : "موثق"}
                            </span>
                          )}
                          {venture.stage && (
                            <Badge className={`text-xs ${STAGE_COLORS[venture.stage] ?? "bg-gray-100 text-gray-700"}`}>
                              {venture.stage.replace("_", " ")}
                            </Badge>
                          )}
                          {sectorName && (
                            <Badge variant="outline" className="text-xs">{sectorName}</Badge>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{venture.description}</p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          {region && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-primary" />
                              {region}, Sudan
                            </span>
                          )}
                          {!region && venture.country && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {venture.country}
                            </span>
                          )}
                          {venture.teamSize && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {venture.teamSize} {language === "en" ? "team" : "فريق"}
                            </span>
                          )}
                          {venture.fundingTarget && (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <TrendingUp className="w-3 h-3 text-green-600" />
                              ${Number(venture.fundingTarget).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* AI Score Badge */}
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        {score !== null && score !== undefined ? (
                          <div className={`text-center border rounded-xl p-3 min-w-[72px] ${getScoreColor(score)}`}>
                            <div className="text-2xl font-bold leading-none">{score}</div>
                            <div className="text-xs mt-1 flex items-center justify-center gap-1">
                              <Zap className="w-3 h-3" />
                              {getScoreLabel(score, language)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center border border-dashed border-border rounded-xl p-3 min-w-[72px] text-muted-foreground">
                            <div className="text-xs">{language === "en" ? "Not scored" : "غير مقيّم"}</div>
                          </div>
                        )}
                        <ArrowRight className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ${isRTL ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
