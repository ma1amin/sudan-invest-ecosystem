import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Shield, Users, Building2, CheckCircle, XCircle,
  Eye, BarChart3, Clock, Zap, AlertCircle
} from "lucide-react";

type Tab = "overview" | "moderation" | "users" | "waitlist";

export default function AdminPanel() {
  const { user, isAuthenticated, loading } = useAuth();
  const { language, isRTL } = useLanguage();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [moderationNotes, setModerationNotes] = useState<Record<number, string>>({});

  const { data: platformStats } = trpc.analytics.platformStats.useQuery();
  const { data: moderationQueue, refetch: refetchQueue } = trpc.ventures.moderationQueue.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const { data: allUsers } = trpc.user.adminList.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const { data: waitlist } = trpc.waitlist.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const moderateVenture = trpc.ventures.moderate.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Venture moderated successfully" : "تم الإشراف على المشروع بنجاح");
      refetchQueue();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateUserRole = trpc.user.updateRole.useMutation({
    onSuccess: () => toast.success(language === "en" ? "User role updated" : "تم تحديث دور المستخدم"),
    onError: (e) => toast.error(e.message),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">{language === "en" ? "Access Denied" : "تم رفض الوصول"}</h2>
            <p className="text-muted-foreground text-sm mb-4">{language === "en" ? "Admin access required." : "مطلوب صلاحية المدير."}</p>
            <Button onClick={() => navigate("/dashboard")} variant="outline">{language === "en" ? "Back to Dashboard" : "العودة إلى لوحة التحكم"}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; labelAr: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "overview", label: "Overview", labelAr: "نظرة عامة", icon: BarChart3 },
    { key: "moderation", label: "Moderation Queue", labelAr: "قائمة الإشراف", icon: Eye },
    { key: "users", label: "Users", labelAr: "المستخدمون", icon: Users },
    { key: "waitlist", label: "Waitlist", labelAr: "قائمة الانتظار", icon: Clock },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-600",
      submitted: "bg-blue-100 text-blue-700",
      ai_reviewed: "bg-purple-100 text-purple-700",
      under_review: "bg-yellow-100 text-yellow-700",
      published: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status] ?? "bg-gray-100 text-gray-600";
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      <header className="bg-white border-b border-border px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-foreground">{language === "en" ? "Admin Panel" : "لوحة الإدارة"}</h1>
        </div>
        <Badge className="bg-red-100 text-red-700 ml-2">Admin</Badge>
      </header>

      <div className="container py-6 max-w-6xl">
        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {language === "en" ? tab.label : tab.labelAr}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: language === "en" ? "Total Users" : "إجمالي المستخدمين", value: platformStats?.users ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: language === "en" ? "Published Ventures" : "المشاريع المنشورة", value: platformStats?.ventures ?? 0, icon: Building2, color: "text-green-600", bg: "bg-green-50" },
              { label: language === "en" ? "Pending Review" : "بانتظار المراجعة", value: moderationQueue?.length ?? 0, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
              { label: language === "en" ? "Waitlist" : "قائمة الانتظار", value: platformStats?.waitlist ?? 0, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((stat, i) => (
              <Card key={i} className="border border-border">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Moderation Queue */}
        {activeTab === "moderation" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">{language === "en" ? "Moderation Queue" : "قائمة الإشراف"}</h2>
              <Badge className="bg-orange-100 text-orange-700">{moderationQueue?.length ?? 0} {language === "en" ? "pending" : "معلق"}</Badge>
            </div>

            {!moderationQueue || moderationQueue.length === 0 ? (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">{language === "en" ? "No ventures pending review" : "لا توجد مشاريع بانتظار المراجعة"}</p>
                </CardContent>
              </Card>
            ) : (
              moderationQueue.map((venture: any) => (
                <Card key={venture.id} className="border border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-foreground">{venture.title}</h3>
                          <Badge className={`text-xs ${getStatusColor(venture.moderationStatus)}`}>
                            {venture.moderationStatus}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{venture.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="capitalize">{venture.stage?.replace("_", " ")}</span>
                          {venture.country && <span>{venture.country}</span>}
                          {venture.teamSize && <span>{venture.teamSize} team</span>}
                        </div>
                      </div>
                      {venture.aiReadinessScore !== null && (
                        <div className="text-center flex-shrink-0 bg-muted/50 rounded-xl p-3">
                          <div className={`text-2xl font-bold ${(venture.aiReadinessScore ?? 0) >= 70 ? "text-green-600" : "text-yellow-600"}`}>{venture.aiReadinessScore}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3" />AI</div>
                        </div>
                      )}
                    </div>

                    {/* AI Analysis Summary */}
                    {venture.aiAnalysis && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-blue-800 text-xs">{(venture.aiAnalysis as any)?.summary}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Textarea
                        placeholder={language === "en" ? "Add moderation notes (optional)..." : "أضف ملاحظات الإشراف (اختياري)..."}
                        value={moderationNotes[venture.id] ?? ""}
                        onChange={(e) => setModerationNotes({ ...moderationNotes, [venture.id]: e.target.value })}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => moderateVenture.mutate({ id: venture.id, status: "published", notes: moderationNotes[venture.id] })}
                          disabled={moderateVenture.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {language === "en" ? "Publish" : "نشر"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-700"
                          onClick={() => moderateVenture.mutate({ id: venture.id, status: "incubation", notes: moderationNotes[venture.id] })}
                          disabled={moderateVenture.isPending}
                        >
                          {language === "en" ? "Send to Incubation" : "إرسال للحضانة"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700"
                          onClick={() => moderateVenture.mutate({ id: venture.id, status: "rejected", notes: moderationNotes[venture.id] })}
                          disabled={moderateVenture.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          {language === "en" ? "Reject" : "رفض"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <h2 className="font-bold text-foreground">{language === "en" ? "Platform Users" : "مستخدمو المنصة"}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{language === "en" ? "Name" : "الاسم"}</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{language === "en" ? "Email" : "البريد"}</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{language === "en" ? "Role" : "الدور"}</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{language === "en" ? "Status" : "الحالة"}</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{language === "en" ? "Actions" : "الإجراءات"}</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers?.map((u: any) => (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{u.name ?? "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{u.email ?? "—"}</td>
                      <td className="py-3 px-4">
                        <Badge className="text-xs capitalize">{u.platformRole ?? u.role}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`text-xs ${u.verificationStatus === "verified" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {u.verificationStatus ?? "pending"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUserRole.mutate({ userId: u.id, platformRole: u.platformRole ?? "founder", verificationStatus: "verified" })}
                          disabled={updateUserRole.isPending}
                        >
                          {language === "en" ? "Verify" : "توثيق"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Waitlist */}
        {activeTab === "waitlist" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">{language === "en" ? "Waitlist Members" : "أعضاء قائمة الانتظار"}</h2>
              <Badge className="bg-blue-100 text-blue-700">{waitlist?.length ?? 0} {language === "en" ? "registered" : "مسجل"}</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{language === "en" ? "Name" : "الاسم"}</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{language === "en" ? "Email" : "البريد"}</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{language === "en" ? "Role" : "الدور"}</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{language === "en" ? "Country" : "الدولة"}</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{language === "en" ? "Date" : "التاريخ"}</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist?.map((w: any) => (
                    <tr key={w.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{w.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{w.email}</td>
                      <td className="py-3 px-4"><Badge className="text-xs capitalize">{w.role}</Badge></td>
                      <td className="py-3 px-4 text-muted-foreground">{w.country ?? "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(w.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
