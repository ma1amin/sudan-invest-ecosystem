import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

type NotificationFilter = "all" | "unread" | "read";

export default function NotificationCenter() {
  const { isAuthenticated } = useAuth();
  const { language, isRTL } = useLanguage();
  const isEn = language === "en";
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const { data: notifications, isLoading } = trpc.notifications.getNotifications.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const markAsRead = trpc.notifications.markAsRead.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{isEn ? "Sign In Required" : "تسجيل الدخول مطلوب"}</h2>
          <p className="text-muted-foreground">{isEn ? "Please sign in to view notifications" : "يرجى تسجيل الدخول لعرض الإشعارات"}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const allNotifications = notifications || [];
  const filteredNotifications = allNotifications.filter((n: any) => {
    if (filter === "unread") return n.status !== "read";
    if (filter === "read") return n.status === "read";
    return true;
  });

  const unreadCount = allNotifications.filter((n: any) => n.status !== "read").length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "venture_update":
        return "🚀";
      case "investor_message":
        return "💬";
      case "match_found":
        return "🎯";
      case "funding_milestone":
        return "🎉";
      case "engagement_alert":
        return "⚠️";
      default:
        return "📬";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "venture_update":
        return "bg-blue-500/10 text-blue-600";
      case "investor_message":
        return "bg-purple-500/10 text-purple-600";
      case "match_found":
        return "bg-green-500/10 text-green-600";
      case "funding_milestone":
        return "bg-yellow-500/10 text-yellow-600";
      case "engagement_alert":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Bell className="w-8 h-8" />
            {isEn ? "Notification Center" : "مركز الإشعارات"}
          </h1>
          <p className={`text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}>
            {isEn ? "Manage and view all your notifications" : "إدارة وعرض جميع إشعاراتك"}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {isEn ? "All" : "الكل"} ({allNotifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            {isEn ? "Unread" : "غير مقروء"} ({unreadCount})
          </Button>
          <Button
            variant={filter === "read" ? "default" : "outline"}
            onClick={() => setFilter("read")}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {isEn ? "Read" : "مقروء"} ({allNotifications.length - unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-12 pb-12 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground text-lg">
                  {filter === "unread"
                    ? isEn
                      ? "No unread notifications"
                      : "لا توجد إشعارات غير مقروءة"
                    : filter === "read"
                      ? isEn
                        ? "No read notifications"
                        : "لا توجد إشعارات مقروءة"
                      : isEn
                        ? "No notifications yet"
                        : "لا توجد إشعارات حتى الآن"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification: any) => (
              <Card
                key={notification.id}
                className={`hover:shadow-lg transition-all ${notification.status !== "read" ? "border-primary/50 bg-primary/5" : ""}`}
              >
                <CardContent className="pt-6">
                  <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                    {/* Icon */}
                    <div className={`text-3xl flex-shrink-0 ${getNotificationColor(notification.notificationType)}`}>
                      {getNotificationIcon(notification.notificationType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-start justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg ${notification.status !== "read" ? "font-bold" : ""}`}>
                            {notification.title}
                          </h3>
                          {notification.body && (
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{notification.body}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.createdAt).toLocaleDateString(isEn ? "en-US" : "ar-SA", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <Badge variant={notification.status === "read" ? "secondary" : "default"}>
                          {notification.status === "read" ? (isEn ? "Read" : "مقروء") : (isEn ? "Unread" : "غير مقروء")}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className={`flex gap-2 mt-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                        {notification.status !== "read" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead.mutate({ id: notification.id })}
                            className="flex items-center gap-2"
                            disabled={markAsRead.isPending}
                          >
                            <Check className="w-4 h-4" />
                            {isEn ? "Mark as Read" : "وضع علامة كمقروء"}
                          </Button>
                        )}

                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
