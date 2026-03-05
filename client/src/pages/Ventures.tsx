import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { Search, Building2, TrendingUp, MapPin, Users, ArrowLeft, Zap } from "lucide-react";

const STAGE_COLORS: Record<string, string> = {
  idea: "bg-gray-100 text-gray-700",
  prototype: "bg-blue-100 text-blue-700",
  mvp: "bg-purple-100 text-purple-700",
  early_traction: "bg-yellow-100 text-yellow-700",
  growth: "bg-green-100 text-green-700",
  scaling: "bg-teal-100 text-teal-700",
};

export default function Ventures() {
  const { language, isRTL } = useLanguage();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");

  const { data: ventures, isLoading } = trpc.ventures.published.useQuery({ limit: 50, offset: 0 });
  const { data: sectors } = trpc.sectors.list.useQuery();

  const filtered = ventures?.filter((v) => {
    if (!search) return true;
    return (
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description?.toLowerCase().includes(search.toLowerCase()) ||
      v.country?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getSectorName = (id: number | null) => {
    if (!id) return null;
    const sector = sectors?.find((s) => s.id === id);
    return sector ? (language === "en" ? sector.name : (sector.nameAr ?? sector.name)) : null;
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      <header className="bg-white border-b border-border px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-foreground">{language === "en" ? "Investment Opportunities" : "فرص الاستثمار"}</h1>
          <p className="text-muted-foreground text-sm">{language === "en" ? "Verified ventures seeking investment" : "مشاريع موثقة تبحث عن استثمار"}</p>
        </div>
      </header>

      <div className="container py-8 max-w-5xl">
        {/* Search */}
        <div className="relative mb-8">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
          <Input
            placeholder={language === "en" ? "Search ventures by name, sector, or country..." : "ابحث عن المشاريع بالاسم أو القطاع أو الدولة..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={isRTL ? "pr-9" : "pl-9"}
          />
        </div>

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
              <p className="text-muted-foreground text-sm">
                {language === "en"
                  ? "No published ventures yet. Be the first to submit yours!"
                  : "لا توجد مشاريع منشورة بعد. كن أول من يقدم مشروعه!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered.map((venture) => (
              <Card
                key={venture.id}
                className="border border-border hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/ventures/${venture.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-foreground">{venture.title}</h3>
                        {venture.stage && (
                          <Badge className={`text-xs ${STAGE_COLORS[venture.stage] ?? "bg-gray-100 text-gray-700"}`}>
                            {venture.stage.replace("_", " ")}
                          </Badge>
                        )}
                        {getSectorName(venture.sectorId) && (
                          <Badge variant="outline" className="text-xs">{getSectorName(venture.sectorId)}</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{venture.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        {venture.country && (
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
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> ${Number(venture.fundingTarget).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {venture.aiReadinessScore !== null && (
                      <div className="text-center flex-shrink-0 bg-muted/50 rounded-xl p-3">
                        <div className={`text-2xl font-bold ${(venture.aiReadinessScore ?? 0) >= 70 ? "text-green-600" : (venture.aiReadinessScore ?? 0) >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                          {venture.aiReadinessScore}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Zap className="w-3 h-3" /> AI Score
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
