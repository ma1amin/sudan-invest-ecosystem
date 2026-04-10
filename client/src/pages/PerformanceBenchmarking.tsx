import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function PerformanceBenchmarking() {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation() as any;
  const [selectedSector, setSelectedSector] = useState("all");

  // Redirect non-investors
  if (user?.platformRole !== "investor") {
    navigate("/dashboard");
    return null;
  }

  const { data: benchmarks } = trpc.benchmarking.getBenchmarks.useQuery({
    sector: selectedSector,
  });

  const { data: comparisons } = trpc.benchmarking.getComparisons.useQuery();

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className={isRTL ? "ml-auto" : ""}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === "en" ? "Performance Benchmarking" : "مقارنة الأداء"}
            </h1>
            <p className="text-muted-foreground">
              {language === "en"
                ? "Compare your performance against industry benchmarks"
                : "قارن أدائك مقابل معايير الصناعة"}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-6xl space-y-6">
        {/* Sector Filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", "tech", "agritech", "fintech", "healthcare"].map((sector) => (
            <Button
              key={sector}
              variant={selectedSector === sector ? "default" : "outline"}
              onClick={() => setSelectedSector(sector)}
              size="sm"
            >
              {sector.charAt(0).toUpperCase() + sector.slice(1)}
            </Button>
          ))}
        </div>

        {/* Your Performance vs Benchmarks */}
        {comparisons && comparisons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {language === "en" ? "Your Performance" : "أدائك"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparisons.map((comp: any) => (
                <Card key={comp.id} className="border border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {language === "en" ? "MOIC Percentile" : "نسبة MOIC المئوية"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">
                      {Number(comp.moicPercentile).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "en" ? "vs benchmark" : "مقابل المعيار"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Benchmarks List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {language === "en" ? "Available Benchmarks" : "المعايير المتاحة"}
          </h2>

          {benchmarks && benchmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benchmarks.map((benchmark: any) => (
                <Card key={benchmark.id} className="border border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {benchmark.benchmarkName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {benchmark.reportingPeriod}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {benchmark.metrics && (
                      <>
                        {benchmark.metrics.avgMOIC && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {language === "en" ? "Avg MOIC" : "متوسط MOIC"}
                            </span>
                            <span className="font-semibold text-foreground">
                              {Number(benchmark.metrics.avgMOIC).toFixed(2)}x
                            </span>
                          </div>
                        )}
                        {benchmark.metrics.avgIRR && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {language === "en" ? "Avg IRR" : "متوسط IRR"}
                            </span>
                            <span className="font-semibold text-foreground">
                              {Number(benchmark.metrics.avgIRR).toFixed(2)}%
                            </span>
                          </div>
                        )}
                        {benchmark.metrics.medianReturn && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {language === "en" ? "Median Return" : "العائد الوسيط"}
                            </span>
                            <span className="font-semibold text-foreground">
                              {Number(benchmark.metrics.medianReturn).toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {benchmark.fundCount && (
                      <p className="text-xs text-muted-foreground border-t border-border pt-2">
                        {language === "en" ? "Funds in benchmark" : "الصناديق في المعيار"}: {benchmark.fundCount}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-border p-8 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === "en"
                  ? "No benchmarks available for this sector"
                  : "لا توجد معايير متاحة لهذا القطاع"}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
