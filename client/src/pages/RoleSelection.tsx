import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Rocket, TrendingUp, GraduationCap, Globe, CheckCircle
} from "lucide-react";

const ROLES = [
  {
    value: "founder",
    icon: Rocket,
    color: "border-blue-200 hover:border-blue-400 hover:bg-blue-50",
    selectedColor: "border-blue-500 bg-blue-50",
    iconColor: "text-blue-600",
    en: {
      title: "Founder",
      subtitle: "I have a venture or startup",
      desc: "Submit your venture, get AI readiness scoring, connect with investors and mentors, and access the Sudanese startup ecosystem.",
      points: ["AI-powered venture scoring", "Investor matching", "Mentor connections", "Funding opportunities"]
    },
    ar: {
      title: "مؤسس",
      subtitle: "لدي مشروع أو شركة ناشئة",
      desc: "قدّم مشروعك، احصل على تقييم الجاهزية بالذكاء الاصطناعي، وتواصل مع المستثمرين والمرشدين.",
      points: ["تقييم المشروع بالذكاء الاصطناعي", "مطابقة المستثمرين", "التواصل مع المرشدين", "فرص التمويل"]
    }
  },
  {
    value: "investor",
    icon: TrendingUp,
    color: "border-green-200 hover:border-green-400 hover:bg-green-50",
    selectedColor: "border-green-500 bg-green-50",
    iconColor: "text-green-600",
    en: {
      title: "Investor",
      subtitle: "I want to invest in Sudanese ventures",
      desc: "Discover verified Sudanese ventures, get AI-powered deal insights, and connect with founders aligned with your investment thesis.",
      points: ["Verified deal flow", "AI investment insights", "Sector-based matching", "Due diligence support"]
    },
    ar: {
      title: "مستثمر",
      subtitle: "أريد الاستثمار في المشاريع السودانية",
      desc: "اكتشف المشاريع السودانية الموثقة، واحصل على رؤى استثمارية بالذكاء الاصطناعي.",
      points: ["تدفق صفقات موثق", "رؤى استثمارية ذكية", "مطابقة قطاعية", "دعم العناية الواجبة"]
    }
  },
  {
    value: "mentor",
    icon: GraduationCap,
    color: "border-purple-200 hover:border-purple-400 hover:bg-purple-50",
    selectedColor: "border-purple-500 bg-purple-50",
    iconColor: "text-purple-600",
    en: {
      title: "Mentor",
      subtitle: "I want to guide Sudanese founders",
      desc: "Share your expertise with promising Sudanese entrepreneurs. Get matched with founders who need your specific skills and sector knowledge.",
      points: ["Founder matching by expertise", "Structured mentorship", "Impact tracking", "Community recognition"]
    },
    ar: {
      title: "مرشد",
      subtitle: "أريد توجيه المؤسسين السودانيين",
      desc: "شارك خبرتك مع رواد الأعمال السودانيين الواعدين.",
      points: ["مطابقة المؤسسين بالخبرة", "إرشاد منظم", "تتبع الأثر", "تقدير المجتمع"]
    }
  },
  {
    value: "diaspora",
    icon: Globe,
    color: "border-orange-200 hover:border-orange-400 hover:bg-orange-50",
    selectedColor: "border-orange-500 bg-orange-50",
    iconColor: "text-orange-600",
    en: {
      title: "Diaspora",
      subtitle: "I'm Sudanese abroad, want to contribute",
      desc: "Invest, mentor, partner, or sponsor Sudanese ventures from anywhere in the world. Be part of Sudan's economic transformation.",
      points: ["Investment opportunities", "Mentorship programs", "Partnership channels", "Sponsorship & donations"]
    },
    ar: {
      title: "مغترب",
      subtitle: "أنا سوداني في الخارج وأريد المساهمة",
      desc: "استثمر أو أرشد أو شارك في المشاريع السودانية من أي مكان في العالم.",
      points: ["فرص استثمارية", "برامج إرشادية", "قنوات شراكة", "رعاية وتبرعات"]
    }
  }
];

export default function RoleSelection() {
  const { user, isAuthenticated, loading } = useAuth();
  const { language, isRTL } = useLanguage();
  const [, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Role selected! Welcome to the platform." : "تم اختيار الدور! مرحباً بك في المنصة.");
      if (selectedRole === "investor") {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    },
    onError: (e: any) => {
      toast.error(e.message);
      setSaving(false);
    }
  });

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setSaving(true);
    await updateProfile.mutateAsync({ platformRole: selectedRole as any });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-4">
            {language === "en" ? "Welcome to Sudan Invest Ecosystem" : "مرحباً بك في منظومة الاستثمار السوداني"}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            {language === "en" ? "How will you participate?" : "كيف ستشارك؟"}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {language === "en"
              ? "Select your primary role. You can always update this later in your profile settings."
              : "اختر دورك الأساسي. يمكنك دائماً تحديث هذا لاحقاً في إعدادات ملفك الشخصي."}
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const content = language === "en" ? role.en : role.ar;
            const isSelected = selectedRole === role.value;

            return (
              <Card
                key={role.value}
                className={`border-2 cursor-pointer transition-all ${isSelected ? role.selectedColor : role.color}`}
                onClick={() => setSelectedRole(role.value)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-white shadow-sm flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${role.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-foreground">{content.title}</h3>
                        {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{content.subtitle}</p>
                      <p className="text-sm text-foreground/80 mb-3">{content.desc}</p>
                      <ul className="space-y-1">
                        {content.points.map((point, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={!selectedRole || saving}
            className="px-12"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {language === "en" ? "Saving..." : "جاري الحفظ..."}
              </span>
            ) : (
              language === "en" ? "Continue →" : "متابعة →"
            )}
          </Button>
          {selectedRole === "investor" && (
            <p className="text-xs text-muted-foreground mt-3">
              {language === "en"
                ? "You'll set up your investment preferences in the next step."
                : "ستقوم بإعداد تفضيلاتك الاستثمارية في الخطوة التالية."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
