import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  CheckCheck,
  MessageSquare,
  Rocket,
  Shield,
  Star,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface Notification {
  id: number;
  type: string;
  title: string;
  titleAr?: string | null;
  body?: string | null;
  isRead: boolean;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "message": return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case "match": return <Star className="w-4 h-4 text-amber-500" />;
    case "moderation_update": return <Shield className="w-4 h-4 text-emerald-500" />;
    case "connection_request": return <Rocket className="w-4 h-4 text-purple-500" />;
    default: return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
}

function timeAgo(date: Date, isRTL: boolean): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return isRTL ? "الآن" : "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return isRTL ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export function NotificationsPanel() {
  const { isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: notifications, refetch } = trpc.notifications.getNotifications.useQuery(undefined, {
    refetchInterval: 30000, // Poll every 30s
  });

  const markAsRead = trpc.notifications.markAsRead.useMutation({ onSuccess: () => refetch() });

  const unreadCount = (notifications ?? []).filter((n: any) => n.status !== "read").length;

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className={`absolute top-full mt-2 w-80 bg-card border rounded-xl shadow-xl z-50 overflow-hidden ${isRTL ? "left-0" : "right-0"}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">
              {isRTL ? "الإشعارات" : "Notifications"}
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-100 text-red-700 text-xs">{unreadCount}</Badge>
              )}
            </h3>
            <div className="flex items-center gap-1">

              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {(!notifications || notifications.length === 0) && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                {isRTL ? "لا توجد إشعارات" : "No notifications yet"}
              </div>
            )}
             {notifications?.map((n: any) => (
              <button
                key={n.id}
                onClick={() => n.status !== "read" && markAsRead.mutate({ id: n.id })}
                className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${n.status !== "read" ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <NotificationIcon type={n.notificationType} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.status !== "read" ? "font-semibold" : "font-normal"} truncate`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.body}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {timeAgo(n.createdAt, isRTL)}
                    </p>
                  </div>
                  {n.status !== "read" && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
