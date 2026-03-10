import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Globe, TrendingUp, Users, Building2, GraduationCap, CheckCircle } from "lucide-react";

const ENGAGEMENT_TYPES = [
  { value: "investment", icon: TrendingUp, color: "bg-green-100 text-green-700", en: "Investment", ar: "استثمار" },
  { value: "mentorship", icon: GraduationCap, color: "bg-purple-100 text-purple-700", en: "Mentorship", ar: "إرشاد" },
  { value: "partnership", icon: Users, color: "bg-blue-100 text-blue-700", en: "Partnership", ar: "شراكة" },
  { value: "sponsorship", icon: Building2, color: "bg-orange-100 text-orange-700", en: "Sponsorship", ar: "رعاية" },
  { value: "donation", icon: Globe, color: "bg-teal-100 text-teal-700", en: "Donation", ar: "تبرع" },
];

export default function Diaspora() {
  const { user, isAuthenticated } = useAuth();
  const { language, isRTL } = useLanguage();
  const [, navigate] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ type: "investment" as const, amount: "", currency: "USD", notes: "" });

  const { data: myEngagements } = trpc.diaspora.myEngagements.useQuery(undefined, { enabled: isAuthenticated });

  const engage = trpc.diaspora.engage.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success(language === "en" ? "Engagement registered!" : "تم تسجيل المشاركة!");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      <div className="bg-white border-b border-border px-6 py-4">
        <h1 className="font-bold text-foreground">{language === "en" ? "Diaspora Engagement" : "مشاركة المغتربين"}</h1>
        <p className="text-muted-foreground text-sm">{language === "en" ? "Connect your global presence with local impact" : "اربط حضورك العالمي بالتأثير المحلي"}</p>
      </div>

      <div className="container py-8 max-w-4xl space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
          <Globe className="w-12 h-12 mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">
            {language === "en" ? "Your Roots, Your Impact" : "جذورك، تأثيرك"}
          </h2>
          <p className="text-primary-foreground/80 max-w-xl">
            {language === "en"
              ? "The Sudanese diaspora holds immense potential. Whether you invest, mentor, partner, or sponsor — this platform gives you a trusted channel to contribute to Sudan's economic transformation."
              : "يمتلك المغتربون السودانيون إمكانات هائلة. سواء استثمرت أو أرشدت أو شاركت أو رعيت — توفر لك هذه المنصة قناة موثوقة للمساهمة في التحول الاقتصادي للسودان."}
          </p>
        </div>

        {/* Engagement Types */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENGAGEMENT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setForm({ ...form, type: type.value as any })}
              className={`p-5 rounded-xl border-2 text-left transition-all ${form.type === type.value ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/50"}`}
            >
              <div className={`w-10 h-10 rounded-xl ${type.color} flex items-center justify-center mb-3`}>
                <type.icon className="w-5 h-5" />
              </div>
              <div className="font-semibold text-foreground">{language === "en" ? type.en : type.ar}</div>
            </button>
          ))}
        </div>

        {/* Form */}
        {isAuthenticated && !submitted && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">
                {language === "en" ? "Register Your Interest" : "سجل اهتمامك"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Amount (Optional)" : "المبلغ (اختياري)"}</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 10000"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Currency" : "العملة"}</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="SAR">SAR</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === "en" ? "Notes / Message" : "ملاحظات / رسالة"}</Label>
                <Textarea
                  placeholder={language === "en" ? "Tell us more about your goals and how you'd like to contribute..." : "أخبرنا المزيد عن أهدافك وكيف تريد المساهمة..."}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={() => engage.mutate(form)} disabled={engage.isPending} className="w-full">
                {engage.isPending ? (language === "en" ? "Submitting..." : "جاري الإرسال...") : (language === "en" ? "Register Engagement" : "تسجيل المشاركة")}
              </Button>
            </CardContent>
          </Card>
        )}

        {submitted && (
          <Card className="border border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-green-800">{language === "en" ? "Thank you for your interest!" : "شكراً لاهتمامك!"}</h3>
              <p className="text-green-700 text-sm mt-1">{language === "en" ? "Our team will reach out with tailored opportunities." : "سيتواصل فريقنا معك بفرص مخصصة."}</p>
            </CardContent>
          </Card>
        )}

        {/* My Engagements */}
        {myEngagements && myEngagements.length > 0 && (
          <div>
            <h3 className="font-bold text-foreground mb-4">{language === "en" ? "My Engagements" : "مشاركاتي"}</h3>
            <div className="space-y-3">
              {myEngagements.map((eng: any) => {
                const type = ENGAGEMENT_TYPES.find((t) => t.value === eng.type);
                return (
                  <Card key={eng.id} className="border border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                      {type && (
                        <div className={`w-9 h-9 rounded-xl ${type.color} flex items-center justify-center flex-shrink-0`}>
                          <type.icon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{language === "en" ? type?.en : type?.ar}</div>
                        {eng.amount && <div className="text-xs text-muted-foreground">{eng.currency} {Number(eng.amount).toLocaleString()}</div>}
                      </div>
                      <Badge className="text-xs bg-green-100 text-green-700">{language === "en" ? "Registered" : "مسجل"}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
