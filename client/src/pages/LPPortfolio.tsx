import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Target, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LPPortfolio() {
  const { user, isAuthenticated } = useAuth();
  const { language, isRTL } = useLanguage();
  const isEn = language === "en";

  const { data: portfolio, isLoading } = trpc.lpPortal.getPortfolio.useQuery(undefined, {
    enabled: isAuthenticated && user?.platformRole === "investor",
  });

  if (!isAuthenticated || user?.platformRole !== "investor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{isEn ? "Access Denied" : "تم رفض الوصول"}</h2>
          <p className="text-muted-foreground">{isEn ? "Only investors can view LP portfolio" : "فقط المستثمرون يمكنهم عرض محفظة LP"}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const funds = portfolio || [];
  const totalCommitment = funds.reduce((sum, f) => sum + parseFloat(f.commitmentAmount as any), 0);
  const totalCapitalCalled = funds.reduce((sum, f) => sum + parseFloat(f.capitalCalled as any), 0);
  const totalDistributions = funds.reduce((sum, f) => sum + parseFloat(f.distributionsReceived as any), 0);
  const totalNAV = funds.reduce((sum, f) => sum + parseFloat(f.currentNAV as any), 0);
  const avgMOIC = funds.length > 0 ? (funds.reduce((sum, f) => sum + parseFloat(f.moic as any), 0) / funds.length).toFixed(2) : "0";
  const avgIRR = funds.length > 0 ? (funds.reduce((sum, f) => sum + parseFloat(f.irrToDate as any), 0) / funds.length).toFixed(2) : "0";

  const metrics = [
    {
      label: isEn ? "Total Commitment" : "إجمالي الالتزام",
      value: `$${(totalCommitment / 1000000).toFixed(2)}M`,
      icon: DollarSign,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: isEn ? "Capital Called" : "رأس المال المطلوب",
      value: `$${(totalCapitalCalled / 1000000).toFixed(2)}M`,
      icon: Target,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      label: isEn ? "Distributions" : "التوزيعات",
      value: `$${(totalDistributions / 1000000).toFixed(2)}M`,
      icon: TrendingUp,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: isEn ? "Current NAV" : "القيمة الحالية",
      value: `$${(totalNAV / 1000000).toFixed(2)}M`,
      icon: Zap,
      color: "bg-orange-500/10 text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isRTL ? "text-right" : "text-left"}`}>
            {isEn ? "LP Portfolio" : "محفظة LP"}
          </h1>
          <p className={`text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}>
            {isEn ? "Track your fund investments and performance" : "تتبع استثماراتك في الصناديق والأداء"}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${metric.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                {isEn ? "Average MOIC" : "متوسط MOIC"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{avgMOIC}x</div>
              <p className="text-sm text-muted-foreground mt-2">
                {isEn ? "Multiple on Invested Capital" : "مضاعف رأس المال المستثمر"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                {isEn ? "Average IRR" : "متوسط IRR"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600">{avgIRR}%</div>
              <p className="text-sm text-muted-foreground mt-2">
                {isEn ? "Internal Rate of Return" : "معدل العائد الداخلي"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Funds Table */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>{isEn ? "Your Fund Investments" : "استثماراتك في الصناديق"}</CardTitle>
          </CardHeader>
          <CardContent>
            {funds.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{isEn ? "No fund investments yet" : "لا توجد استثمارات في الصناديق حتى الآن"}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className={`text-sm font-semibold text-muted-foreground py-3 ${isRTL ? "text-right pr-4" : "text-left pl-4"}`}>
                        {isEn ? "Fund" : "الصندوق"}
                      </th>
                      <th className={`text-sm font-semibold text-muted-foreground py-3 ${isRTL ? "text-right" : "text-left"}`}>
                        {isEn ? "Vintage" : "السنة"}
                      </th>
                      <th className={`text-sm font-semibold text-muted-foreground py-3 ${isRTL ? "text-right" : "text-left"}`}>
                        {isEn ? "Commitment" : "الالتزام"}
                      </th>
                      <th className={`text-sm font-semibold text-muted-foreground py-3 ${isRTL ? "text-right" : "text-left"}`}>
                        {isEn ? "MOIC" : "MOIC"}
                      </th>
                      <th className={`text-sm font-semibold text-muted-foreground py-3 ${isRTL ? "text-right" : "text-left"}`}>
                        {isEn ? "IRR" : "IRR"}
                      </th>
                      <th className={`text-sm font-semibold text-muted-foreground py-3 ${isRTL ? "text-right" : "text-left"}`}>
                        {isEn ? "Status" : "الحالة"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {funds.map((fund) => (
                      <tr key={fund.fundId} className="border-b hover:bg-muted/50 transition-colors">
                        <td className={`py-4 ${isRTL ? "pr-4" : "pl-4"}`}>
                          <p className="font-medium">{fund.fundName}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-sm">{fund.vintageYear}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-sm font-medium">${(parseFloat(fund.commitmentAmount as any) / 1000000).toFixed(2)}M</p>
                        </td>
                        <td className="py-4">
                          <p className={`text-sm font-semibold ${parseFloat(fund.moic as any) >= 1 ? "text-green-600" : "text-red-600"}`}>
                            {fund.moic}x
                          </p>
                        </td>
                        <td className="py-4">
                          <p className={`text-sm font-semibold ${parseFloat(fund.irrToDate as any) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {fund.irrToDate}%
                          </p>
                        </td>
                        <td className="py-4">
                          <Badge variant={fund.status === "active" ? "default" : "secondary"}>
                            {fund.status === "active" ? (isEn ? "Active" : "نشط") : fund.status === "exited" ? (isEn ? "Exited" : "خرج") : (isEn ? "Pending" : "قيد الانتظار")}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
