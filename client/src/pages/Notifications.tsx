import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import {
  Bell, Zap, MessageSquare, Building2, Shield,
  CheckCheck, Filter, Inbox
} from "lucide-react";

type NotifType = "all" | "match" | "message" | "venture" | "system";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  match: <Zap className="w-4 h-4 text-purple-600" />,
  message: <MessageSquare className="w-4 h-4 text-blue-600" />,
  venture: <Building2 className="w-4 h-4 text-green-600" />,
  system: <Shield className="w-4 h-4 text-gray-500" />,
};

const TYPE_COLORS: Record<string, string> = {
  match: "bg-purple-50 border-purple-100",
  message: "bg-blue-50 border-blue-100",
  venture: "bg-green-50 border-green-100",
  system: "bg-gray-50 border-gray-100",
};

export default function Notifications() {
  const { isAuthenticated, loading } = useAuth();
  const { language, isRTL } = useLanguage();
  const [filter, setFilter] = useState<NotifType>("all");
  const isEn = language === "en";

  const { data: notifications, refetch } = trpc.notifications.getNotifications.useQuery(undefined, { enabled: isAuthenticated });
  const markAsRead = trpc.notifications.markAsRead.useMutation({ onSuccess: () => refetch() });

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
            <Bell className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{isEn ? "Sign in to view notifications" : "سجل الدخول لعرض الإشعارات"}</h2>
            <a href={getLoginUrl()}><Button className="w-full mt-4">{isEn ? "Sign In" : "تسجيل الدخول"}</Button></a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allNotifs = notifications ?? [];
  const filtered = filter === "all" ? allNotifs : allNotifs.filter((n: any) => n.type === filter);
  const unreadCount = allNotifs.filter((n: any) => !n.isRead).length;

  const FILTER_TABS: { id: NotifType; labelEn: string; labelAr: string }[] = [
    { id: "all", labelEn: "All", labelAr: "الكل" },
    { id: "match", labelEn: "Matches", labelAr: "المطابقات" },
    { id: "message", labelEn: "Messages", labelAr: "الرسائل" },
    { id: "venture", labelEn: "Ventures", labelAr: "المشاريع" },
    { id: "system", labelEn: "System", labelAr: "النظام" },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {isEn ? "Notifications" : "الإشعارات"}
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {isEn ? `${unreadCount} unread` : `${unreadCount} غير مقروء`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {isEn ? tab.labelEn : tab.labelAr}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-1">
              {isEn ? "No notifications" : "لا توجد إشعارات"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isEn ? "You're all caught up!" : "أنت على اطلاع كامل!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notif: any) => (
              <div
                key={notif.id}
                onClick={() => notif.status !== "read" && markAsRead.mutate({ id: notif.id })}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                  notif.isRead
                    ? "bg-card border-border opacity-70"
                    : `${TYPE_COLORS[notif.type] ?? "bg-card border-border"} shadow-sm`
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  notif.isRead ? "bg-muted" : "bg-white shadow-sm"
                }`}>
                  {TYPE_ICONS[notif.type] ?? <Bell className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${notif.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {notif.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString(isEn ? "en-US" : "ar-SD", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
