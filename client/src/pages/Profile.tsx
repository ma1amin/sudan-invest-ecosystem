import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, User, Shield } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const { language, isRTL } = useLanguage();
  const [, navigate] = useLocation();
  const [platformRole, setPlatformRole] = useState((user as any)?.platformRole ?? "founder");
  const [preferredLanguage, setPreferredLanguage] = useState((user as any)?.preferredLanguage ?? "en");

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => toast.success(language === "en" ? "Profile updated!" : "تم تحديث الملف الشخصي!"),
    onError: (e) => toast.error(e.message),
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <a href={getLoginUrl()}><Button className="w-full">{language === "en" ? "Sign In" : "تسجيل الدخول"}</Button></a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      <div className="bg-white border-b border-border px-6 py-4">
        <h1 className="font-bold text-foreground">{language === "en" ? "My Profile" : "ملفي الشخصي"}</h1>
      </div>

      <div className="container py-8 max-w-2xl space-y-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-5 h-5 text-primary" />
              {language === "en" ? "Profile Settings" : "إعدادات الملف الشخصي"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{language === "en" ? "Name" : "الاسم"}</Label>
              <Input value={user?.name ?? ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>{language === "en" ? "Email" : "البريد الإلكتروني"}</Label>
              <Input value={user?.email ?? ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>{language === "en" ? "Platform Role" : "دور المنصة"}</Label>
              <Select value={platformRole} onValueChange={setPlatformRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="founder">{language === "en" ? "Founder" : "مؤسس"}</SelectItem>
                  <SelectItem value="investor">{language === "en" ? "Investor" : "مستثمر"}</SelectItem>
                  <SelectItem value="mentor">{language === "en" ? "Mentor" : "مرشد"}</SelectItem>
                  <SelectItem value="diaspora">{language === "en" ? "Diaspora" : "مغترب"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === "en" ? "Preferred Language" : "اللغة المفضلة"}</Label>
              <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => updateProfile.mutate({ platformRole: platformRole as any, preferredLanguage: preferredLanguage as any, isProfileComplete: true })}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (language === "en" ? "Saving..." : "جاري الحفظ...") : (language === "en" ? "Save Changes" : "حفظ التغييرات")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
