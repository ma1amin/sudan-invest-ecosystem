import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  TrendingUp, Users, MessageSquare, Bell, FileText, Settings,
  Plus, ArrowRight, Zap, Shield, BarChart3, Globe, LogOut,
  Building2, Star, Clock, CheckCircle, AlertCircle,
  Home, Layers, Languages, GraduationCap, ChevronRight,
  Leaf, Sun, Banknote, Heart, BookOpen, Truck
} from "lucide-react";
import { useState } from "react";

type SidebarItem = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  labelEn: string;
  labelAr: string;
  href?: string;
  badge?: number;
};

const STAGE_COLORS: Record<string, string> = {
  idea: "bg-gray-100 text-gray-700",
  prototype: "bg-blue-100 text-blue-700",
  mvp: "bg-purple-100 text-purple-700",
  early_traction: "bg-yellow-100 text-yellow-700",
  growth: "bg-green-100 text-green-700",
  scaling: "bg-teal-100 text-teal-700",
};

const SECTOR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  AgriTech: Leaf,
  "Renewable Energy": Sun,
  FinTech: Banknote,
  Healthcare: Heart,
  EdTech: BookOpen,
  Logistics: Truck,
};

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { language, isRTL, toggleLanguage } = useLanguage();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState("overview");

  const platformRole = (user as any)?.platformRole ?? "founder";

  // Data queries
  const { data: myVentures } = trpc.ventures.myVentures.useQuery(undefined, { enabled: isAuthenticated && platformRole === "founder" });
  const { data: publishedVentures } = trpc.ventures.published.useQuery({ limit: 6, offset: 0 }, { enabled: isAuthenticated && (platformRole === "investor" || platformRole === "mentor") });
  const { data: matches } = trpc.matching.forInvestor.useQuery(undefined, { enabled: isAuthenticated && (platformRole === "investor" || platformRole === "mentor" || platformRole === "diaspora") });
  const { data: conversations } = trpc.messages.conversations.useQuery(undefined, { enabled: isAuthenticated });
  const { data: notifications } = trpc.notifications.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: platformStats } = trpc.analytics.platformStats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: sectors } = trpc.sectors.list.useQuery();
  const { data: myEngagements } = trpc.diaspora.myEngagements.useQuery(undefined, { enabled: isAuthenticated && platformRole === "diaspora" });
  const { data: moderationQueue } = trpc.ventures.moderationQueue.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  const markNotificationRead = trpc.notifications.markRead.useMutation();

  const unreadNotifications = notifications?.filter((n: any) => !n.isRead).length ?? 0;
  const unreadMessages = conversations?.filter((c: any) => !c.isRead).length ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">{language === "en" ? "Loading your dashboard..." : "جاري تحميل لوحة التحكم..."}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {language === "en" ? "Sign in to access your dashboard" : "سجل الدخول للوصول إلى لوحة التحكم"}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {language === "en" ? "Join Africa's trusted investment ecosystem." : "انضم إلى النظام البيئي الاستثماري الموثوق في أفريقيا."}
            </p>
            <a href={getLoginUrl()}>
              <Button className="w-full h-11 font-semibold">
                {language === "en" ? "Sign In" : "تسجيل الدخول"}
              </Button>
            </a>
            <Button variant="ghost" className="w-full mt-2" onClick={() => navigate("/")}>
              {language === "en" ? "Back to Home" : "العودة إلى الرئيسية"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sidebar items based on role
  const getSidebarItems = (): SidebarItem[] => {
    const common: SidebarItem[] = [
      { id: "overview", icon: Home, labelEn: "Overview", labelAr: "نظرة عامة" },
      { id: "messages", icon: MessageSquare, labelEn: "Messages", labelAr: "الرسائل", badge: unreadMessages > 0 ? unreadMessages : undefined },
      { id: "notifications", icon: Bell, labelEn: "Notifications", labelAr: "الإشعارات", badge: unreadNotifications > 0 ? unreadNotifications : undefined },
      { id: "profile", icon: Settings, labelEn: "Profile", labelAr: "الملف الشخصي" },
    ];

    if (platformRole === "founder") {
      return [
        common[0],
        { id: "ventures", icon: Building2, labelEn: "My Ventures", labelAr: "مشاريعي" },
        { id: "matches", icon: Zap, labelEn: "Matches", labelAr: "المطابقات" },
        { id: "documents", icon: FileText, labelEn: "Documents", labelAr: "المستندات" },
        ...common.slice(1),
      ];
    }
    if (platformRole === "investor") {
      return [
        common[0],
        { id: "opportunities", icon: TrendingUp, labelEn: "Opportunities", labelAr: "الفرص" },
        { id: "matches", icon: Zap, labelEn: "Matches", labelAr: "المطابقات" },
        { id: "analytics", icon: BarChart3, labelEn: "Analytics", labelAr: "التحليلات" },
        { id: "documents", icon: FileText, labelEn: "Documents", labelAr: "المستندات" },
        ...common.slice(1),
      ];
    }
    if (platformRole === "mentor") {
      return [
        common[0],
        { id: "opportunities", icon: GraduationCap, labelEn: "Ventures to Mentor", labelAr: "مشاريع للإرشاد" },
        { id: "matches", icon: Zap, labelEn: "Matches", labelAr: "المطابقات" },
        ...common.slice(1),
      ];
    }
    if (platformRole === "diaspora") {
      return [
        common[0],
        { id: "opportunities", icon: Globe, labelEn: "Opportunities", labelAr: "الفرص" },
        { id: "engagements", icon: Star, labelEn: "My Engagements", labelAr: "مشاركاتي" },
        ...common.slice(1),
      ];
    }
    if (user?.role === "admin") {
      return [
        common[0],
        { id: "moderation", icon: Shield, labelEn: "Moderation", labelAr: "الإشراف", badge: moderationQueue?.length },
        { id: "users", icon: Users, labelEn: "Users", labelAr: "المستخدمون" },
        { id: "analytics", icon: BarChart3, labelEn: "Analytics", labelAr: "التحليلات" },
        ...common.slice(1),
      ];
    }
    return common;
  };

  const sidebarItems = getSidebarItems();

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      founder: "bg-blue-100 text-blue-700",
      investor: "bg-green-100 text-green-700",
      mentor: "bg-purple-100 text-purple-700",
      diaspora: "bg-teal-100 text-teal-700",
      admin: "bg-red-100 text-red-700",
    };
    return colors[role] ?? "bg-gray-100 text-gray-700";
  };

  const handleSidebarClick = (item: SidebarItem) => {
    if (item.id === "messages") navigate("/messages");
    else if (item.id === "profile") navigate("/profile");
    else if (item.id === "ventures" || item.id === "opportunities") {
      if (platformRole === "founder") navigate("/ventures/submit");
      else navigate("/ventures");
    } else if (item.id === "documents") {
      navigate("/documents");
    } else setActiveSection(item.id);
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-e border-border flex flex-col fixed top-0 bottom-0 z-40 hidden md:flex">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-foreground text-sm leading-tight">Sudan Invest</div>
              <div className="text-primary text-xs font-semibold">Ecosystem</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-sm">{user?.name?.charAt(0)?.toUpperCase() ?? "U"}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-foreground truncate">{user?.name ?? "User"}</div>
              <Badge className={`text-xs capitalize mt-0.5 ${getRoleBadgeColor(user?.role === "admin" ? "admin" : platformRole)}`}>
                {user?.role === "admin" ? "Admin" : (language === "en" ? platformRole : ({ founder: "مؤسس", investor: "مستثمر", mentor: "مرشد", diaspora: "مغترب" } as Record<string, string>)[platformRole] ?? platformRole)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarClick(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-start">{language === "en" ? item.labelEn : item.labelAr}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Languages className="w-4 h-4" />
            <span>{language === "en" ? "العربية" : "English"}</span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>{language === "en" ? "Home Page" : "الصفحة الرئيسية"}</span>
          </button>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === "en" ? "Sign Out" : "تسجيل الخروج"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ms-64 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="font-bold text-foreground">
              {language === "en"
                ? `Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`
                : `مرحباً بعودتك، ${user?.name?.split(" ")[0] ?? ""}`}
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              {new Date().toLocaleDateString(language === "en" ? "en-US" : "ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection("notifications")}
              className="relative p-2 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {platformRole === "founder" && (
              <Button size="sm" onClick={() => navigate("/ventures/submit")}>
                <Plus className="w-4 h-4 mr-1" />
                {language === "en" ? "New Venture" : "مشروع جديد"}
              </Button>
            )}
            {user?.role === "admin" && (
              <Button size="sm" variant="outline" onClick={() => navigate("/admin")}>
                <Shield className="w-4 h-4 mr-1" />
                Admin
              </Button>
            )}
          </div>
        </header>

        <div className="p-6">
          {/* OVERVIEW SECTION */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {platformRole === "founder" && [
                  { icon: Building2, color: "text-blue-600 bg-blue-50", value: myVentures?.length ?? 0, labelEn: "My Ventures", labelAr: "مشاريعي" },
                  { icon: Zap, color: "text-yellow-600 bg-yellow-50", value: matches?.length ?? 0, labelEn: "AI Matches", labelAr: "مطابقات ذكية" },
                  { icon: MessageSquare, color: "text-purple-600 bg-purple-50", value: unreadMessages, labelEn: "Unread Messages", labelAr: "رسائل غير مقروءة" },
                  { icon: Bell, color: "text-red-600 bg-red-50", value: unreadNotifications, labelEn: "Notifications", labelAr: "الإشعارات" },
                ].map((stat, i) => (
                  <Card key={i} className="border border-border hover:shadow-sm transition-shadow">
                    <CardContent className="p-5">
                      <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{language === "en" ? stat.labelEn : stat.labelAr}</div>
                    </CardContent>
                  </Card>
                ))}

                {(platformRole === "investor" || platformRole === "mentor") && [
                  { icon: Building2, color: "text-blue-600 bg-blue-50", value: platformStats?.ventures ?? 0, labelEn: "Published Ventures", labelAr: "المشاريع المنشورة" },
                  { icon: Zap, color: "text-yellow-600 bg-yellow-50", value: matches?.length ?? 0, labelEn: "AI Matches", labelAr: "مطابقات ذكية" },
                  { icon: Users, color: "text-green-600 bg-green-50", value: platformStats?.users ?? 0, labelEn: "Ecosystem Members", labelAr: "أعضاء النظام" },
                  { icon: MessageSquare, color: "text-purple-600 bg-purple-50", value: unreadMessages, labelEn: "Unread Messages", labelAr: "رسائل غير مقروءة" },
                ].map((stat, i) => (
                  <Card key={i} className="border border-border hover:shadow-sm transition-shadow">
                    <CardContent className="p-5">
                      <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{language === "en" ? stat.labelEn : stat.labelAr}</div>
                    </CardContent>
                  </Card>
                ))}

                {platformRole === "diaspora" && [
                  { icon: Globe, color: "text-teal-600 bg-teal-50", value: myEngagements?.length ?? 0, labelEn: "My Engagements", labelAr: "مشاركاتي" },
                  { icon: Building2, color: "text-blue-600 bg-blue-50", value: platformStats?.ventures ?? 0, labelEn: "Active Ventures", labelAr: "المشاريع النشطة" },
                  { icon: Zap, color: "text-yellow-600 bg-yellow-50", value: matches?.length ?? 0, labelEn: "Matches", labelAr: "المطابقات" },
                  { icon: MessageSquare, color: "text-purple-600 bg-purple-50", value: unreadMessages, labelEn: "Messages", labelAr: "الرسائل" },
                ].map((stat, i) => (
                  <Card key={i} className="border border-border hover:shadow-sm transition-shadow">
                    <CardContent className="p-5">
                      <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{language === "en" ? stat.labelEn : stat.labelAr}</div>
                    </CardContent>
                  </Card>
                ))}

                {user?.role === "admin" && [
                  { icon: Users, color: "text-blue-600 bg-blue-50", value: platformStats?.users ?? 0, labelEn: "Total Users", labelAr: "إجمالي المستخدمين" },
                  { icon: Building2, color: "text-green-600 bg-green-50", value: platformStats?.ventures ?? 0, labelEn: "Published Ventures", labelAr: "المشاريع المنشورة" },
                  { icon: AlertCircle, color: "text-orange-600 bg-orange-50", value: moderationQueue?.length ?? 0, labelEn: "Pending Review", labelAr: "بانتظار المراجعة" },
                  { icon: Clock, color: "text-purple-600 bg-purple-50", value: platformStats?.waitlist ?? 0, labelEn: "Waitlist", labelAr: "قائمة الانتظار" },
                ].map((stat, i) => (
                  <Card key={i} className="border border-border hover:shadow-sm transition-shadow">
                    <CardContent className="p-5">
                      <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{language === "en" ? stat.labelEn : stat.labelAr}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Role-specific main content */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main panel */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Founder: My Ventures */}
                  {platformRole === "founder" && (
                    <Card className="border border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            {language === "en" ? "My Ventures" : "مشاريعي"}
                          </CardTitle>
                          <Button size="sm" onClick={() => navigate("/ventures/submit")}>
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            {language === "en" ? "New" : "جديد"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {!myVentures || myVentures.length === 0 ? (
                          <div className="text-center py-8">
                            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm mb-3">{language === "en" ? "No ventures yet. Submit your first one!" : "لا توجد مشاريع بعد. قدم مشروعك الأول!"}</p>
                            <Button size="sm" onClick={() => navigate("/ventures/submit")}>
                              {language === "en" ? "Submit Venture" : "تقديم مشروع"}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {myVentures.slice(0, 3).map((v: any) => (
                              <div key={v.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/ventures/${v.id}`)}>
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Building2 className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-foreground truncate">{v.title}</div>
                                  <div className="text-xs text-muted-foreground capitalize">{v.stage?.replace("_", " ")}</div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {v.aiReadinessScore !== null && (
                                    <div className={`text-sm font-bold ${v.aiReadinessScore >= 70 ? "text-green-600" : v.aiReadinessScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                                      {v.aiReadinessScore}
                                    </div>
                                  )}
                                  <Badge className={`text-xs ${v.moderationStatus === "published" ? "bg-green-100 text-green-700" : v.moderationStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                                    {v.moderationStatus}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Investor/Mentor: Opportunities */}
                  {(platformRole === "investor" || platformRole === "mentor" || platformRole === "diaspora") && (
                    <Card className="border border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            {language === "en" ? "Latest Opportunities" : "أحدث الفرص"}
                          </CardTitle>
                          <Button size="sm" variant="outline" onClick={() => navigate("/ventures")}>
                            {language === "en" ? "View All" : "عرض الكل"}
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {!publishedVentures || publishedVentures.length === 0 ? (
                          <div className="text-center py-8">
                            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">{language === "en" ? "No ventures published yet." : "لا توجد مشاريع منشورة بعد."}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {publishedVentures.slice(0, 4).map((v: any) => (
                              <div key={v.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/ventures/${v.id}`)}>
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Building2 className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-foreground truncate">{v.title}</div>
                                  <div className="text-xs text-muted-foreground">{v.country} · {v.stage?.replace("_", " ")}</div>
                                </div>
                                {v.aiReadinessScore !== null && (
                                  <div className="text-center flex-shrink-0">
                                    <div className={`text-sm font-bold ${v.aiReadinessScore >= 70 ? "text-green-600" : "text-yellow-600"}`}>{v.aiReadinessScore}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />AI</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Admin: Moderation Queue */}
                  {user?.role === "admin" && (
                    <Card className="border border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            {language === "en" ? "Moderation Queue" : "قائمة الإشراف"}
                          </CardTitle>
                          <Button size="sm" variant="outline" onClick={() => navigate("/admin")}>
                            {language === "en" ? "Admin Panel" : "لوحة الإدارة"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {!moderationQueue || moderationQueue.length === 0 ? (
                          <div className="text-center py-6">
                            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                            <p className="text-muted-foreground text-sm">{language === "en" ? "Queue is clear" : "القائمة فارغة"}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {moderationQueue.slice(0, 3).map((v: any) => (
                              <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-foreground truncate">{v.title}</div>
                                  <div className="text-xs text-muted-foreground">{v.stage} · AI: {v.aiReadinessScore ?? "—"}</div>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => navigate("/admin")} className="flex-shrink-0 text-xs h-7">
                                  {language === "en" ? "Review" : "مراجعة"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Matches */}
                  {matches && matches.length > 0 && (
                    <Card className="border border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          {language === "en" ? "AI Match Recommendations" : "توصيات المطابقة الذكية"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {matches.slice(0, 3).map((match: any) => (
                            <div key={match.id} className="flex items-center gap-4 p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                              <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-4 h-4 text-yellow-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-foreground">{language === "en" ? "Match Score" : "درجة المطابقة"}: {match.score}%</div>
                                <div className="text-xs text-muted-foreground">{match.reason}</div>
                              </div>
                              <Button size="sm" variant="outline" className="flex-shrink-0 text-xs h-7" onClick={() => navigate(`/ventures/${match.ventureId}`)}>
                                {language === "en" ? "View" : "عرض"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Panel */}
                <div className="space-y-5">
                  {/* Quick Actions */}
                  <Card className="border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">{language === "en" ? "Quick Actions" : "إجراءات سريعة"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {platformRole === "founder" && (
                        <>
                          <Button className="w-full justify-start gap-2 h-9 text-sm" onClick={() => navigate("/ventures/submit")}>
                            <Plus className="w-4 h-4" />{language === "en" ? "Submit Venture" : "تقديم مشروع"}
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm" onClick={() => navigate("/ventures")}>
                            <Layers className="w-4 h-4" />{language === "en" ? "Browse Ecosystem" : "تصفح النظام البيئي"}
                          </Button>
                        </>
                      )}
                      {(platformRole === "investor" || platformRole === "mentor") && (
                        <>
                          <Button className="w-full justify-start gap-2 h-9 text-sm" onClick={() => navigate("/ventures")}>
                            <TrendingUp className="w-4 h-4" />{language === "en" ? "Browse Ventures" : "تصفح المشاريع"}
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm" onClick={() => navigate("/messages")}>
                            <MessageSquare className="w-4 h-4" />{language === "en" ? "Messages" : "الرسائل"}
                          </Button>
                        </>
                      )}
                      {platformRole === "diaspora" && (
                        <>
                          <Button className="w-full justify-start gap-2 h-9 text-sm" onClick={() => navigate("/diaspora")}>
                            <Globe className="w-4 h-4" />{language === "en" ? "Diaspora Hub" : "مركز المغتربين"}
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm" onClick={() => navigate("/ventures")}>
                            <TrendingUp className="w-4 h-4" />{language === "en" ? "Browse Ventures" : "تصفح المشاريع"}
                          </Button>
                        </>
                      )}
                      {user?.role === "admin" && (
                        <Button className="w-full justify-start gap-2 h-9 text-sm" onClick={() => navigate("/admin")}>
                          <Shield className="w-4 h-4" />{language === "en" ? "Admin Panel" : "لوحة الإدارة"}
                        </Button>
                      )}
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm" onClick={() => navigate("/profile")}>
                        <Settings className="w-4 h-4" />{language === "en" ? "Edit Profile" : "تعديل الملف الشخصي"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Sectors */}
                  <Card className="border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">{language === "en" ? "Active Sectors" : "القطاعات النشطة"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {sectors?.slice(0, 6).map((sector: any) => {
                          const Icon = SECTOR_ICONS[sector.name] ?? Building2;
                          return (
                            <button
                              key={sector.id}
                              onClick={() => navigate("/ventures")}
                              className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors text-left"
                            >
                              <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span className="text-xs text-foreground truncate">{language === "en" ? sector.name : (sector.nameAr ?? sector.name)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Notifications */}
                  {notifications && notifications.length > 0 && (
                    <Card className="border border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">{language === "en" ? "Recent Alerts" : "التنبيهات الأخيرة"}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {notifications.slice(0, 3).map((n: any) => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl text-xs cursor-pointer transition-colors ${n.isRead ? "bg-muted/30" : "bg-primary/5 border border-primary/10"}`}
                            onClick={() => markNotificationRead.mutate({ id: n.id })}
                          >
                            <div className="font-medium text-foreground mb-0.5">{n.title}</div>
                            <div className="text-muted-foreground">{n.message}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeSection === "notifications" && (
            <div className="max-w-2xl space-y-3">
              <h2 className="font-bold text-foreground mb-4">{language === "en" ? "All Notifications" : "جميع الإشعارات"}</h2>
              {!notifications || notifications.length === 0 ? (
                <Card className="border-dashed border-2 border-border">
                  <CardContent className="p-12 text-center">
                    <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">{language === "en" ? "No notifications yet" : "لا توجد إشعارات بعد"}</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((n: any) => (
                  <Card
                    key={n.id}
                    className={`border cursor-pointer transition-all ${n.isRead ? "border-border" : "border-primary/30 bg-primary/5"}`}
                    onClick={() => markNotificationRead.mutate({ id: n.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isRead ? "bg-muted-foreground/30" : "bg-primary"}`} />
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-foreground">{n.title}</div>
                          <div className="text-sm text-muted-foreground mt-0.5">{n.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ANALYTICS SECTION */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <h2 className="font-bold text-foreground">{language === "en" ? "Platform Analytics" : "تحليلات المنصة"}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: language === "en" ? "Total Users" : "إجمالي المستخدمين", value: platformStats?.users ?? 0, icon: Users, color: "text-blue-600 bg-blue-50" },
                  { label: language === "en" ? "Published Ventures" : "المشاريع المنشورة", value: platformStats?.ventures ?? 0, icon: Building2, color: "text-green-600 bg-green-50" },
                  { label: language === "en" ? "Connections Made" : "الاتصالات المُنشأة", value: platformStats?.matches ?? 0, icon: Users, color: "text-purple-600 bg-purple-50" },
                  { label: language === "en" ? "Waitlist Members" : "أعضاء قائمة الانتظار", value: platformStats?.waitlist ?? 0, icon: Clock, color: "text-orange-600 bg-orange-50" },
                ].map((stat, i) => (
                  <Card key={i} className="border border-border">
                    <CardContent className="p-5">
                      <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="border border-border">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{language === "en" ? "Detailed analytics charts coming in the next release." : "مخططات التحليلات التفصيلية ستأتي في الإصدار القادم."}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* MATCHES SECTION */}
          {activeSection === "matches" && (
            <div className="max-w-3xl space-y-4">
              <h2 className="font-bold text-foreground">{language === "en" ? "AI Match Recommendations" : "توصيات المطابقة الذكية"}</h2>
              {!matches || matches.length === 0 ? (
                <Card className="border-dashed border-2 border-border">
                  <CardContent className="p-12 text-center">
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">{language === "en" ? "No matches yet. Complete your profile to get AI recommendations." : "لا توجد مطابقات بعد. أكمل ملفك الشخصي للحصول على توصيات ذكية."}</p>
                    <Button className="mt-4" onClick={() => navigate("/profile")}>{language === "en" ? "Complete Profile" : "إكمال الملف الشخصي"}</Button>
                  </CardContent>
                </Card>
              ) : (
                matches.map((match: any) => (
                  <Card key={match.id} className="border border-border hover:shadow-sm transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                          <Zap className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-foreground">{match.score}% {language === "en" ? "Match" : "مطابقة"}</span>
                            <Badge className="bg-yellow-100 text-yellow-700 text-xs">{language === "en" ? "AI Recommended" : "موصى به ذكياً"}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{match.reason}</p>
                        </div>
                        <Button size="sm" onClick={() => navigate(`/ventures/${match.ventureId}`)}>
                          {language === "en" ? "View" : "عرض"}
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ENGAGEMENTS SECTION (Diaspora) */}
          {activeSection === "engagements" && (
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-foreground">{language === "en" ? "My Diaspora Engagements" : "مشاركاتي كمغترب"}</h2>
                <Button size="sm" onClick={() => navigate("/diaspora")}>
                  <Plus className="w-4 h-4 mr-1" />{language === "en" ? "New Engagement" : "مشاركة جديدة"}
                </Button>
              </div>
              {!myEngagements || myEngagements.length === 0 ? (
                <Card className="border-dashed border-2 border-border">
                  <CardContent className="p-12 text-center">
                    <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">{language === "en" ? "No engagements yet." : "لا توجد مشاركات بعد."}</p>
                    <Button onClick={() => navigate("/diaspora")}>{language === "en" ? "Explore Diaspora Hub" : "استكشف مركز المغتربين"}</Button>
                  </CardContent>
                </Card>
              ) : (
                myEngagements.map((eng: any) => (
                  <Card key={eng.id} className="border border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm capitalize">{eng.type}</div>
                        {eng.amount && <div className="text-xs text-muted-foreground">{eng.currency} {Number(eng.amount).toLocaleString()}</div>}
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-xs">{language === "en" ? "Active" : "نشط"}</Badge>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
