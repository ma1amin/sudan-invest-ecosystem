import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Flame, Zap, TrendingUp } from "lucide-react";

interface EngagementScoreBadgeProps {
  score: number;
  className?: string;
}

export function EngagementScoreBadge({ score, className }: EngagementScoreBadgeProps) {
  const { language } = useLanguage();

  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { label: language === "en" ? "Highly Active" : "نشط جداً", color: "bg-red-100 text-red-800", icon: <Flame className="w-3 h-3" /> };
    if (score >= 60) return { label: language === "en" ? "Active" : "نشط", color: "bg-orange-100 text-orange-800", icon: <Zap className="w-3 h-3" /> };
    if (score >= 40) return { label: language === "en" ? "Moderate" : "متوسط", color: "bg-yellow-100 text-yellow-800", icon: <TrendingUp className="w-3 h-3" /> };
    return { label: language === "en" ? "Low Activity" : "نشاط منخفض", color: "bg-gray-100 text-gray-800", icon: null };
  };

  const level = getEngagementLevel(score);

  return (
    <Badge className={`${level.color} flex items-center gap-1 ${className}`}>
      {level.icon}
      <span>{level.label}</span>
      <span className="font-semibold">{score}/100</span>
    </Badge>
  );
}
