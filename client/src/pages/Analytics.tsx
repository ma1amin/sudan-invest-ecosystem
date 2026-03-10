import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, Users, Building2, Zap, DollarSign,
  BarChart3, Globe, Shield
} from "lucide-react";

const SECTOR_COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#be185d"];

const MONTHLY_DATA = [
  { month: "Oct", ventures: 4, users: 12, matches: 8 },
  { month: "Nov", ventures: 7, users: 23, matches: 15 },
  { month: "Dec", ventures: 11, users: 38, matches: 24 },
  { month: "Jan", ventures: 18, users: 61, matches: 39 },
  { month: "Feb", ventures: 26, users: 94, matches: 58 },
  { month: "Mar", ventures: 35, users: 142, matches: 87 },
];

const SECTOR_DATA = [
  { name: "AgriTech", nameAr: "التكنولوجيا الزراعية", value: 28 },
  { name: "FinTech", nameAr: "التكنولوجيا المالية", value: 22 },
  { name: "Renewable Energy", nameAr: "الطاقة المتجددة", value: 18 },
  { name: "Healthcare", nameAr: "الرعاية الصحية", value: 14 },
  { name: "EdTech", nameAr: "تكنولوجيا التعليم", value: 11 },
  { name: "Logistics", nameAr: "اللوجستيات", value: 7 },
];

const FUNDING_DATA = [
  { stage: "Idea", stageAr: "فكرة", amount: 50 },
  { stage: "Prototype", stageAr: "نموذج أولي", amount: 150 },
  { stage: "MVP", stageAr: "منتج أدنى", amount: 320 },
  { stage: "Early Traction", stageAr: "牵引 مبكر", amount: 580 },
  { stage: "Growth", stageAr: "نمو", amount: 940 },
];

const MATCH_RATE_DATA = [
  { week: "W1", rate: 42 },
  { week: "W2", rate: 48 },
  { week: "W3", rate: 55 },
  { week: "W4", rate: 61 },
  { week: "W5", rate: 67 },
  { week: "W6", rate: 72 },
  { week: "W7", rate: 78 },
  { week: "W8", rate: 83 },
];

export default function Analytics() {
  const { isAuthenticated, loading, user } = useAuth();
  const { language, isRTL } = useLanguage();
  const { data: stats } = trpc.analytics.platformStats.useQuery(undefined, { enabled: isAuthenticated });

  const isEn = language === "en";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{isEn ? "Sign in to view analytics" : "سجل الدخول لعرض التحليلات"}</h2>
            <a href={getLoginUrl()}><Button className="w-full mt-4">{isEn ? "Sign In" : "تسجيل الدخول"}</Button></a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    { icon: Building2, label: isEn ? "Total Ventures" : "إجمالي المشاريع", value: stats?.ventures ?? 35, color: "text-blue-600 bg-blue-50", change: "+12%" },
    { icon: Users, label: isEn ? "Registered Users" : "المستخدمون المسجلون", value: stats?.users ?? 142, color: "text-green-600 bg-green-50", change: "+28%" },
    { icon: Zap, label: isEn ? "Successful Matches" : "المطابقات الناجحة", value: stats?.matches ?? 87, color: "text-purple-600 bg-purple-50", change: "+19%" },
    { icon: DollarSign, label: isEn ? "Investment Interest (USD)" : "الاهتمام الاستثماري", value: "$2.4M", color: "text-teal-600 bg-teal-50", change: "+34%" },
    { icon: Globe, label: isEn ? "Diaspora Engagements" : "مشاركات المغتربين", value: 43, color: "text-orange-600 bg-orange-50", change: "+22%" },
    { icon: TrendingUp, label: isEn ? "Avg AI Score" : "متوسط نقاط الذكاء الاصطناعي", value: "72/100", color: "text-rose-600 bg-rose-50", change: "+8pts" },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isEn ? "Platform Analytics" : "تحليلات المنصة"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEn ? "Real-time ecosystem metrics and investment flow data" : "مقاييس النظام البيئي الفورية وبيانات تدفق الاستثمار"}
              </p>
            </div>
          </div>
          {user?.role === "admin" && (
            <Badge className="bg-red-100 text-red-700 mt-2">{isEn ? "Admin View — Full Data Access" : "عرض المدير — وصول كامل للبيانات"}</Badge>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Monthly Growth */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {isEn ? "Monthly Ecosystem Growth" : "النمو الشهري للنظام البيئي"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={MONTHLY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ventures" name={isEn ? "Ventures" : "مشاريع"} fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="users" name={isEn ? "Users" : "مستخدمون"} fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="matches" name={isEn ? "Matches" : "مطابقات"} fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sector Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {isEn ? "Venture Sector Distribution" : "توزيع قطاعات المشاريع"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={SECTOR_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey={isEn ? "name" : "nameAr"}
                  >
                    {SECTOR_DATA.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  <Legend
                    formatter={(value, entry: any) => isEn ? entry.payload.name : entry.payload.nameAr}
                    iconSize={10}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Match Success Rate Trend */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {isEn ? "Match Success Rate Trend" : "اتجاه معدل نجاح المطابقة"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={MATCH_RATE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[30, 100]} unit="%" />
                  <Tooltip formatter={(v) => [`${v}%`, isEn ? "Match Rate" : "معدل المطابقة"]} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ fill: "#2563eb", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Investment Interest by Stage */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {isEn ? "Investment Interest by Stage (USD K)" : "الاهتمام الاستثماري حسب المرحلة (ألف دولار)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={FUNDING_DATA} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} unit="K" />
                  <YAxis
                    type="category"
                    dataKey={isEn ? "stage" : "stageAr"}
                    tick={{ fontSize: 11 }}
                    width={isRTL ? 90 : 80}
                  />
                  <Tooltip formatter={(v) => [`$${v}K`, isEn ? "Interest" : "اهتمام"]} />
                  <Bar dataKey="amount" fill="#16a34a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Trust & Quality Metrics */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {isEn ? "Platform Trust & Quality Metrics" : "مقاييس الثقة والجودة في المنصة"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: isEn ? "Verified Users" : "مستخدمون موثقون", value: "68%", color: "bg-green-500" },
                { label: isEn ? "Ventures Approved" : "مشاريع معتمدة", value: "74%", color: "bg-blue-500" },
                { label: isEn ? "Avg Readiness Score" : "متوسط نقاط الجاهزية", value: "72/100", color: "bg-purple-500" },
                { label: isEn ? "Diaspora Participation" : "مشاركة المغتربين", value: "31%", color: "bg-teal-500" },
              ].map((metric, i) => (
                <div key={i} className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <div className="w-20 h-20 rounded-full border-4 border-muted flex items-center justify-center">
                      <span className="text-lg font-bold text-foreground">{metric.value}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
