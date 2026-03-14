import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle, Clock, AlertCircle, XCircle, Zap } from "lucide-react";

interface VentureStatusBadgeProps {
  status: string;
  className?: string;
}

export function VentureStatusBadge({ status, className }: VentureStatusBadgeProps) {
  const { language } = useLanguage();

  const statusConfig: Record<string, { label: Record<string, string>; color: string; icon: React.ReactNode }> = {
    draft: {
      label: { en: "Draft", ar: "مسودة" },
      color: "bg-gray-100 text-gray-800",
      icon: <Clock className="w-3 h-3" />,
    },
    submitted: {
      label: { en: "Submitted", ar: "مرسل" },
      color: "bg-blue-100 text-blue-800",
      icon: <Clock className="w-3 h-3" />,
    },
    ai_reviewed: {
      label: { en: "AI Reviewed", ar: "تم فحصه بالذكاء الاصطناعي" },
      color: "bg-purple-100 text-purple-800",
      icon: <Zap className="w-3 h-3" />,
    },
    under_review: {
      label: { en: "Under Review", ar: "قيد المراجعة" },
      color: "bg-yellow-100 text-yellow-800",
      icon: <AlertCircle className="w-3 h-3" />,
    },
    published: {
      label: { en: "Published", ar: "منشور" },
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    rejected: {
      label: { en: "Rejected", ar: "مرفوض" },
      color: "bg-red-100 text-red-800",
      icon: <XCircle className="w-3 h-3" />,
    },
    incubation: {
      label: { en: "Incubation", ar: "حاضنة" },
      color: "bg-indigo-100 text-indigo-800",
      icon: <Zap className="w-3 h-3" />,
    },
  };

  const config = statusConfig[status] || statusConfig.draft;
  const label = config.label[language as keyof typeof config.label] || config.label.en;

  return (
    <Badge className={`${config.color} flex items-center gap-1 ${className}`}>
      {config.icon}
      <span>{label}</span>
    </Badge>
  );
}
