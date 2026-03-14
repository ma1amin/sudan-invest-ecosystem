import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Target, CheckCircle, XCircle, Clock } from "lucide-react";

export default function InvestorPortfolio() {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation() as any;

  // Redirect non-investors
  if (user?.platformRole !== "investor") {
    navigate("/dashboard");
    return null;
  }

  const { data: portfolio, isLoading: portfolioLoading } = trpc.portfolio.getPortfolio.useQuery();
  const { data: stats } = trpc.portfolio.getStats.useQuery();

  if (portfolioLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Prepare chart data
  const investmentsByType = portfolio
    ? Object.entries(
        portfolio.reduce(
          (acc, inv) => {
            acc[inv.investmentType] = (acc[inv.investmentType] || 0) + Number(inv.amount || 0);
            return acc;
          },
          {} as Record<string, number>
        )
      ).map(([type, amount]) => ({
        name: type,
        value: amount,
      }))
    : [];

  const investmentsByStatus = portfolio
    ? Object.entries(
        portfolio.reduce(
          (acc, inv) => {
            acc[inv.status] = (acc[inv.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      ).map(([status, count]) => ({
        name: status,
        value: count,
      }))
    : [];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const getInvestmentTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      equity: { en: "Equity", ar: "حقوق الملكية" },
      debt: { en: "Debt", ar: "الديون" },
      grant: { en: "Grant", ar: "منحة" },
      convertible: { en: "Convertible", ar: "قابل للتحويل" },
      revenue_share: { en: "Revenue Share", ar: "مشاركة الإيرادات" },
      other: { en: "Other", ar: "أخرى" },
    };
    return labels[type]?.[language as keyof typeof labels[string]] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, Record<string, string>> = {
      pending: { en: "Pending", ar: "قيد الانتظار" },
      active: { en: "Active", ar: "نشط" },
      exited: { en: "Exited", ar: "خرج" },
      written_off: { en: "Written Off", ar: "شطب" },
    };
    return labels[status]?.[language as keyof typeof labels[string]] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      exited: "bg-blue-100 text-blue-800",
      written_off: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <h1 className="text-3xl font-bold text-foreground">
          {language === "en" ? "Investment Portfolio" : "محفظة الاستثمارات"}
        </h1>
        <p className="text-muted-foreground">
          {language === "en" ? "Track your investments and portfolio performance" : "تابع استثماراتك وأداء محفظتك"}
        </p>
      </div>

      <div className="container py-8 max-w-6xl space-y-6">
        {/* Portfolio Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "en" ? "Total Invested" : "إجمالي المستثمر"}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      ${stats.totalInvested.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "en" ? "Active Investments" : "الاستثمارات النشطة"}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeInvestments}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "en" ? "Exited Investments" : "الاستثمارات المغلقة"}
                    </p>
                    <p className="text-2xl font-bold text-foreground">{stats.exitedInvestments}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "en" ? "Avg. Investment Size" : "متوسط حجم الاستثمار"}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      ${stats.averageInvestmentSize.toLocaleString()}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        {portfolio && portfolio.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Investment Type Distribution */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>{language === "en" ? "By Investment Type" : "حسب نوع الاستثمار"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={investmentsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name }) => getInvestmentTypeLabel(name)}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {investmentsByType.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Investment Status Distribution */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>{language === "en" ? "By Status" : "حسب الحالة"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={investmentsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Portfolio Investments Table */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>{language === "en" ? "Your Investments" : "استثماراتك"}</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolio && portfolio.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        {language === "en" ? "Venture" : "المشروع"}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        {language === "en" ? "Type" : "النوع"}
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">
                        {language === "en" ? "Amount" : "المبلغ"}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        {language === "en" ? "Status" : "الحالة"}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        {language === "en" ? "Date" : "التاريخ"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {portfolio.map((investment: any) => (
                      <tr key={investment.id} className="hover:bg-muted/50">
                        <td className="py-3 px-4 text-foreground">{investment.ventureId}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{getInvestmentTypeLabel(investment.investmentType)}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-foreground">
                          {investment.currency} ${Number(investment.amount).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(investment.status)}>
                            {getStatusLabel(investment.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {investment.investmentDate
                            ? new Date(investment.investmentDate).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {language === "en" ? "No investments recorded yet" : "لم يتم تسجيل أي استثمارات حتى الآن"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
