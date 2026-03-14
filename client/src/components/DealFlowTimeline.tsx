import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface DealFlowEvent {
  id: number;
  previousStatus?: string;
  newStatus: string;
  reason?: string;
  changedBy?: number;
  changedAt: Date;
}

interface DealFlowTimelineProps {
  events: DealFlowEvent[];
  className?: string;
}

export function DealFlowTimeline({ events, className }: DealFlowTimelineProps) {
  const { language, isRTL } = useLanguage();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, Record<string, string>> = {
      draft: { en: "Draft", ar: "مسودة" },
      submitted: { en: "Submitted", ar: "مرسل" },
      ai_reviewed: { en: "AI Reviewed", ar: "تم فحصه بالذكاء الاصطناعي" },
      under_review: { en: "Under Review", ar: "قيد المراجعة" },
      published: { en: "Published", ar: "منشور" },
      rejected: { en: "Rejected", ar: "مرفوض" },
      incubation: { en: "Incubation", ar: "حاضنة" },
    };
    return labels[status]?.[language as keyof typeof labels[string]] || status;
  };

  const getStatusIcon = (status: string) => {
    if (status === "published") return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === "rejected") return <AlertCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-blue-600" />;
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {language === "en" ? "No status changes yet" : "لا توجد تغييرات في الحالة حتى الآن"}
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`space-y-4 ${className}`}>
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center">{getStatusIcon(event.newStatus)}</div>
            {index < events.length - 1 && <div className="w-1 h-12 bg-border mt-2" />}
          </div>

          {/* Event content */}
          <div className="flex-1 pb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-semibold text-foreground">{getStatusLabel(event.newStatus)}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(event.changedAt), "MMM d, yyyy HH:mm")}
              </span>
            </div>
            {event.reason && <p className="text-sm text-muted-foreground mt-1">{event.reason}</p>}
            {event.previousStatus && (
              <p className="text-xs text-muted-foreground mt-1">
                {language === "en" ? "From:" : "من:"} {getStatusLabel(event.previousStatus)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
