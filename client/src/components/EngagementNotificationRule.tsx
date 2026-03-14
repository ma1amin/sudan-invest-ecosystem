import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertCircle, Bell, Trash2 } from "lucide-react";

interface EngagementNotificationRuleProps {
  rule: {
    id: number;
    ventureId: number;
    engagementThreshold: number;
    inactivityDays: number;
    isActive: boolean;
    lastNotificationAt?: Date | string;
  };
  onDelete?: (id: number) => void;
  onToggle?: (id: number, isActive: boolean) => void;
  className?: string;
}

export function EngagementNotificationRule({
  rule,
  onDelete,
  onToggle,
  className,
}: EngagementNotificationRuleProps) {
  const { language, isRTL } = useLanguage();

  return (
    <Card className={`border border-border ${className}`} dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              {language === "en" ? "Venture" : "المشروع"} #{rule.ventureId}
            </CardTitle>
            <Badge className={`mt-2 ${rule.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
              {rule.isActive ? (language === "en" ? "Active" : "نشط") : language === "en" ? "Inactive" : "غير نشط"}
            </Badge>
          </div>
          <AlertCircle className="w-8 h-8 text-orange-500 opacity-20" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Engagement Threshold */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {language === "en" ? "Engagement Threshold" : "حد الانخراط"}
          </span>
          <span className="font-semibold text-foreground">{rule.engagementThreshold}/100</span>
        </div>

        {/* Inactivity Days */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {language === "en" ? "Inactivity Alert After" : "تنبيه عدم النشاط بعد"}
          </span>
          <span className="font-semibold text-foreground">
            {rule.inactivityDays} {language === "en" ? "days" : "أيام"}
          </span>
        </div>

        {/* Last Notification */}
        {rule.lastNotificationAt && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{language === "en" ? "Last Notification" : "آخر إشعار"}</span>
            <span>{new Date(rule.lastNotificationAt).toLocaleDateString()}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          {onToggle && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onToggle(rule.id, !rule.isActive)}
            >
              {rule.isActive ? (language === "en" ? "Disable" : "تعطيل") : language === "en" ? "Enable" : "تفعيل"}
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => onDelete(rule.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
