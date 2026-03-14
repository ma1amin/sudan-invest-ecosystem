import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";

interface FundingRoundCardProps {
  round: {
    id: number;
    roundType: string;
    amountRaised: string | number;
    currency: string;
    postMoneyValuation?: string | number;
    leadInvestor?: string;
    investorCount?: number;
    status: string;
    announcementDate?: Date | string;
    closureDate?: Date | string;
    notes?: string;
  };
  className?: string;
}

export function FundingRoundCard({ round, className }: FundingRoundCardProps) {
  const { language, isRTL } = useLanguage();

  const getRoundTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      seed: { en: "Seed", ar: "بذرة" },
      series_a: { en: "Series A", ar: "السلسلة أ" },
      series_b: { en: "Series B", ar: "السلسلة ب" },
      series_c: { en: "Series C", ar: "السلسلة ج" },
      series_d: { en: "Series D", ar: "السلسلة د" },
      series_e: { en: "Series E", ar: "السلسلة هـ" },
      growth: { en: "Growth", ar: "النمو" },
      bridge: { en: "Bridge", ar: "جسر" },
      ipo: { en: "IPO", ar: "الاكتتاب العام" },
    };
    return labels[type.toLowerCase()]?.[language as keyof typeof labels[string]] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, Record<string, string>> = {
      planned: { en: "Planned", ar: "مخطط" },
      active: { en: "Active", ar: "نشط" },
      closed: { en: "Closed", ar: "مغلق" },
      cancelled: { en: "Cancelled", ar: "ملغى" },
    };
    return labels[status]?.[language as keyof typeof labels[string]] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planned: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      closed: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className={`border border-border ${className}`} dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{getRoundTypeLabel(round.roundType)}</CardTitle>
            <Badge className={`mt-2 ${getStatusColor(round.status)}`}>
              {getStatusLabel(round.status)}
            </Badge>
          </div>
          <TrendingUp className="w-8 h-8 text-primary opacity-20" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount Raised */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span>{language === "en" ? "Amount Raised" : "المبلغ المجمع"}</span>
          </div>
          <span className="font-semibold text-foreground">
            {round.currency} ${Number(round.amountRaised).toLocaleString()}
          </span>
        </div>

        {/* Post-Money Valuation */}
        {round.postMoneyValuation && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>{language === "en" ? "Post-Money Valuation" : "التقييم بعد الاستثمار"}</span>
            </div>
            <span className="font-semibold text-foreground">
              {round.currency} ${Number(round.postMoneyValuation).toLocaleString()}
            </span>
          </div>
        )}

        {/* Lead Investor */}
        {round.leadInvestor && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {language === "en" ? "Lead Investor" : "المستثمر الرئيسي"}
            </span>
            <span className="font-semibold text-foreground">{round.leadInvestor}</span>
          </div>
        )}

        {/* Investor Count */}
        {round.investorCount && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{language === "en" ? "Investors" : "المستثمرون"}</span>
            </div>
            <span className="font-semibold text-foreground">{round.investorCount}</span>
          </div>
        )}

        {/* Announcement Date */}
        {round.announcementDate && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{language === "en" ? "Announced" : "معلن"}</span>
            <span>{format(new Date(round.announcementDate), "MMM d, yyyy")}</span>
          </div>
        )}

        {/* Notes */}
        {round.notes && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">{round.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
