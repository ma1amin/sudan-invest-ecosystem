import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Save, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";

export default function AdvancedSearch() {
  const { isAuthenticated } = useAuth();
  const { language, isRTL } = useLanguage();
  const isEn = language === "en";

  const [searchName, setSearchName] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [minFunding, setMinFunding] = useState("");
  const [maxFunding, setMaxFunding] = useState("");

  const { data: sectors, isLoading: sectorsLoading } = trpc.sectors.list.useQuery();
  const { data: ventures, isLoading: venturesLoading } = trpc.ventures.published.useQuery(
    { limit: 100, offset: 0 },
    { enabled: isAuthenticated }
  );
  const { data: savedSearches, isLoading: savedSearchesLoading } = trpc.search.getSavedSearches.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createSavedSearch = trpc.search.createSavedSearch.useMutation();

  const filters = useMemo(
    () => ({
      sectors: selectedSectors,
      stages: selectedStages,
      regions: selectedRegions,
      minFunding: minFunding ? parseInt(minFunding) : undefined,
      maxFunding: maxFunding ? parseInt(maxFunding) : undefined,
    }),
    [selectedSectors, selectedStages, selectedRegions, minFunding, maxFunding]
  );

  const filteredVentures = useMemo(() => {
    if (!ventures) return [];
    return ventures.filter((v: any) => {
      if (selectedSectors.length > 0 && !selectedSectors.includes(v.sector)) return false;
      if (selectedStages.length > 0 && !selectedStages.includes(v.stage)) return false;
      if (selectedRegions.length > 0 && !selectedRegions.includes(v.sudanRegion)) return false;
      if (minFunding && v.fundingTarget < minFunding) return false;
      if (maxFunding && v.fundingTarget > maxFunding) return false;
      return true;
    });
  }, [ventures, selectedSectors, selectedStages, selectedRegions, minFunding, maxFunding]);

  const handleSaveSearch = () => {
    if (!searchName.trim()) return;
    createSavedSearch.mutate({
      searchName,
      filters,
    });
    setSearchName("");
  };

  const stages = ["Pre-seed", "Seed", "Series A", "Series B", "Series C", "Growth"];
  const sudanRegions = ["Khartoum", "Gezira", "Red Sea", "Kassala", "Darfur", "Kordofan"];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{isEn ? "Sign In Required" : "تسجيل الدخول مطلوب"}</h2>
          <p className="text-muted-foreground">{isEn ? "Please sign in to use advanced search" : "يرجى تسجيل الدخول لاستخدام البحث المتقدم"}</p>
        </div>
      </div>
    );
  }

  if (sectorsLoading || venturesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="lg:col-span-2 h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Search className="w-8 h-8" />
            {isEn ? "Advanced Search" : "البحث المتقدم"}
          </h1>
          <p className={`text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}>
            {isEn ? "Find ventures matching your investment criteria" : "ابحث عن المشاريع التي تطابق معايير استثمارك"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            {/* Sectors Filter */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  {isEn ? "Sectors" : "القطاعات"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sectors?.map((sector: any) => (
                  <label key={sector.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSectors.includes(sector.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSectors([...selectedSectors, sector.name]);
                        } else {
                          setSelectedSectors(selectedSectors.filter((s) => s !== sector.name));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{sector.name}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Stages Filter */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{isEn ? "Funding Stage" : "مرحلة التمويل"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stages.map((stage) => (
                  <label key={stage} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStages.includes(stage)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStages([...selectedStages, stage]);
                        } else {
                          setSelectedStages(selectedStages.filter((s) => s !== stage));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{stage}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Regions Filter */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{isEn ? "Sudan Regions" : "مناطق السودان"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sudanRegions.map((region) => (
                  <label key={region} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes(region)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRegions([...selectedRegions, region]);
                        } else {
                          setSelectedRegions(selectedRegions.filter((r) => r !== region));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{region}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Funding Range Filter */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{isEn ? "Funding Range" : "نطاق التمويل"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">{isEn ? "Min ($)" : "الحد الأدنى ($)"}</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minFunding}
                    onChange={(e) => setMinFunding(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{isEn ? "Max ($)" : "الحد الأقصى ($)"}</label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={maxFunding}
                    onChange={(e) => setMaxFunding(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Search */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{isEn ? "Save Search" : "حفظ البحث"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder={isEn ? "Search name..." : "اسم البحث..."}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                <Button
                  onClick={handleSaveSearch}
                  disabled={!searchName.trim() || createSavedSearch.isPending}
                  className="w-full flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isEn ? "Save" : "حفظ"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Searches */}
            {savedSearches && savedSearches.length > 0 && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{isEn ? "Saved Searches" : "عمليات البحث المحفوظة"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {savedSearches.map((search: any) => (
                      <div key={search.id} className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                        <span className="text-sm font-medium">{search.searchName}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {isEn ? "Results" : "النتائج"} ({filteredVentures.length})
              </h2>
            </div>

            {/* Ventures Grid */}
            <div className="space-y-4">
              {filteredVentures.length === 0 ? (
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-12 pb-12 text-center">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground text-lg">
                      {isEn ? "No ventures match your criteria" : "لا توجد مشاريع تطابق معاييرك"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredVentures.map((venture: any) => (
                  <Card key={venture.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className={`flex items-start justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-1">{venture.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{venture.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge>{venture.sector}</Badge>
                            <Badge variant="outline">{venture.stage}</Badge>
                            <Badge variant="secondary">{venture.sudanRegion}</Badge>
                          </div>
                        </div>
                        <div className={`text-right ${isRTL ? "text-left" : ""}`}>
                          <p className="text-sm text-muted-foreground">{isEn ? "Seeking" : "يبحث عن"}</p>
                          <p className="text-xl font-bold">${(venture.fundingTarget / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
