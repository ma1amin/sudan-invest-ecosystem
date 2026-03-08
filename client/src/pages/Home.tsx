import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Globe, Zap, Shield, Users, TrendingUp, Building2, ArrowRight,
  CheckCircle, Star, Languages, BarChart3, MessageSquare, GraduationCap,
  ChevronRight, Leaf, Sun, Banknote, Heart, BookOpen, Truck
} from "lucide-react";

const SECTORS = [
  { icon: Leaf, label: "AgriTech", labelAr: "التكنولوجيا الزراعية", color: "text-green-600 bg-green-50" },
  { icon: Sun, label: "Renewable Energy", labelAr: "الطاقة المتجددة", color: "text-yellow-600 bg-yellow-50" },
  { icon: Banknote, label: "FinTech", labelAr: "التكنولوجيا المالية", color: "text-blue-600 bg-blue-50" },
  { icon: Heart, label: "Healthcare", labelAr: "الرعاية الصحية", color: "text-red-600 bg-red-50" },
  { icon: BookOpen, label: "EdTech", labelAr: "تكنولوجيا التعليم", color: "text-purple-600 bg-purple-50" },
  { icon: Truck, label: "Logistics", labelAr: "اللوجستيات", color: "text-orange-600 bg-orange-50" },
];

const STATS = [
  { value: "47M+", labelEn: "Target Market", labelAr: "السوق المستهدف" },
  { value: "6", labelEn: "Priority Sectors", labelAr: "القطاعات ذات الأولوية" },
  { value: "3", labelEn: "Continents Connected", labelAr: "قارات متصلة" },
  { value: "AI", labelEn: "Powered Matching", labelAr: "مطابقة ذكية" },
];

const FEATURES = [
  {
    icon: Zap,
    color: "text-yellow-600 bg-yellow-50",
    titleEn: "AI Readiness Scoring",
    titleAr: "تقييم الجاهزية بالذكاء الاصطناعي",
    descEn: "Every venture receives a multi-dimensional AI analysis covering market clarity, team readiness, business model strength, and scalability — with actionable recommendations.",
    descAr: "يحصل كل مشروع على تحليل ذكاء اصطناعي متعدد الأبعاد يغطي وضوح السوق وجاهزية الفريق وقوة نموذج العمل وقابلية التوسع — مع توصيات قابلة للتنفيذ.",
  },
  {
    icon: Users,
    color: "text-blue-600 bg-blue-50",
    titleEn: "Intelligent Matching Engine",
    titleAr: "محرك المطابقة الذكي",
    descEn: "Founders are matched with investors and mentors based on sector alignment, funding stage, geography, and behavioral signals — not just keywords.",
    descAr: "يتم مطابقة المؤسسين مع المستثمرين والمرشدين بناءً على توافق القطاع ومرحلة التمويل والجغرافيا والإشارات السلوكية — وليس مجرد كلمات مفتاحية.",
  },
  {
    icon: Shield,
    color: "text-green-600 bg-green-50",
    titleEn: "Verified Ecosystem",
    titleAr: "نظام بيئي موثق",
    descEn: "Multi-layer identity verification, human moderation, and AI governance ensure every participant and venture meets the platform's trust standards.",
    descAr: "التحقق متعدد الطبقات من الهوية والإشراف البشري وحوكمة الذكاء الاصطناعي تضمن أن كل مشارك ومشروع يلتزم بمعايير الثقة في المنصة.",
  },
  {
    icon: Globe,
    color: "text-teal-600 bg-teal-50",
    titleEn: "Diaspora Engagement",
    titleAr: "مشاركة المغتربين",
    descEn: "A dedicated channel for the global Sudanese diaspora to invest, mentor, partner, and sponsor ventures — bridging global capital with local opportunity.",
    descAr: "قناة مخصصة للمغتربين السودانيين العالميين للاستثمار والإرشاد والشراكة ورعاية المشاريع — تربط رأس المال العالمي بالفرص السودانية.",
  },
  {
    icon: BarChart3,
    color: "text-purple-600 bg-purple-50",
    titleEn: "Real-time Analytics",
    titleAr: "تحليلات فورية",
    descEn: "Track ecosystem growth, investment flow, match success rates, and sector trends through comprehensive dashboards tailored to each user role.",
    descAr: "تتبع نمو النظام البيئي وتدفق الاستثمار ومعدلات نجاح المطابقة واتجاهات القطاع من خلال لوحات معلومات شاملة مصممة لكل دور مستخدم.",
  },
  {
    icon: MessageSquare,
    color: "text-rose-600 bg-rose-50",
    titleEn: "Secure Communication",
    titleAr: "تواصل آمن",
    descEn: "End-to-end encrypted messaging between founders, investors, and mentors — with connection request workflows that respect everyone's time.",
    descAr: "رسائل مشفرة بين المؤسسين والمستثمرين والمرشدين — مع سير عمل طلبات التواصل التي تحترم وقت الجميع.",
  },
];

const ROLES = [
  { value: "founder", icon: Building2, color: "bg-blue-50 border-blue-200 text-blue-700", titleEn: "Founder", titleAr: "مؤسس", descEn: "Submit your venture, get AI scoring, and connect with investors and mentors.", descAr: "قدم مشروعك واحصل على تقييم ذكي وتواصل مع المستثمرين والمرشدين." },
  { value: "investor", icon: TrendingUp, color: "bg-green-50 border-green-200 text-green-700", titleEn: "Investor", titleAr: "مستثمر", descEn: "Discover verified ventures, access AI decision support, and build your portfolio.", descAr: "اكتشف المشاريع الموثقة والوصول إلى دعم القرار الذكي وبناء محفظتك." },
  { value: "mentor", icon: GraduationCap, color: "bg-purple-50 border-purple-200 text-purple-700", titleEn: "Mentor", titleAr: "مرشد", descEn: "Share your expertise with high-potential founders and track your mentorship impact.", descAr: "شارك خبرتك مع المؤسسين ذوي الإمكانات العالية وتتبع تأثير إرشادك." },
  { value: "diaspora", icon: Globe, color: "bg-teal-50 border-teal-200 text-teal-700", titleEn: "Diaspora", titleAr: "مغترب", descEn: "Invest, mentor, partner, or sponsor ventures from anywhere in the world.", descAr: "استثمر أو أرشد أو شارك أو ارعَ المشاريع من أي مكان في العالم." },
];

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const { language, isRTL, toggleLanguage, t } = useLanguage();
  const [, navigate] = useLocation();
  const [waitlistForm, setWaitlistForm] = useState({ name: "", email: "", role: "founder" as const, country: "" });
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const joinWaitlist = trpc.waitlist.join.useMutation({
    onSuccess: () => {
      setWaitlistSubmitted(true);
      toast.success(language === "en" ? "You're on the waitlist! We'll be in touch soon." : "أنت في قائمة الانتظار! سنتواصل معك قريباً.");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistForm.name || !waitlistForm.email) return;
    joinWaitlist.mutate(waitlistForm);
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground text-sm">Sudan Invest</span>
              <span className="text-primary font-bold text-sm"> Ecosystem</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              <Languages className="w-4 h-4" />
              <span>{language === "en" ? "العربية" : "English"}</span>
            </button>

            {!loading && (
              isAuthenticated ? (
                <Button size="sm" onClick={() => navigate("/dashboard")}>
                  {language === "en" ? "Dashboard" : "لوحة التحكم"}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180 mr-1" : "ml-1"}`} />
                </Button>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="sm">{t("nav.login")}</Button>
                </a>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-teal-500/5 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container max-w-6xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-6 text-xs font-medium px-3 py-1">
                {language === "en" ? "Now Accepting Early Members" : "نقبل الأعضاء المبكرين الآن"}
              </Badge>

              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
                {language === "en" ? (
                  <>
                    Sudan's Trusted<br />
                    <span className="text-primary">Investment</span> &<br />
                    Innovation Platform
                  </>
                ) : (
                  <>
                    منصة الاستثمار<br />
                    <span className="text-primary">والابتكار</span><br />
                    الموثوقة في أفريقيا
                  </>
                )}
              </h1>

              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
                {language === "en"
                  ? "Connecting Sudanese founders with global investors, mentors, and diaspora supporters through AI-powered matching, verified profiles, and transparent evaluation."
                  : "ربط المؤسسين السودانيين بالمستثمرين العالميين والمرشدين والمغتربين من خلال المطابقة الذكية والملفات الموثقة والتقييم الشفاف."}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <a href="#waitlist">
                  <Button size="lg" className="h-12 px-8 text-base font-semibold">
                    {language === "en" ? "Join the Waitlist" : "انضم إلى قائمة الانتظار"}
                    <ArrowRight className={`w-5 h-5 ${isRTL ? "rotate-180 mr-2" : "ml-2"}`} />
                  </Button>
                </a>
                {!isAuthenticated && (
                  <a href={getLoginUrl()}>
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                      {language === "en" ? "Sign In" : "تسجيل الدخول"}
                    </Button>
                  </a>
                )}
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" />{language === "en" ? "Verified profiles" : "ملفات موثقة"}</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" />{language === "en" ? "AI-powered" : "مدعوم بالذكاء الاصطناعي"}</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" />{language === "en" ? "Bilingual" : "ثنائي اللغة"}</span>
              </div>
            </div>

            {/* Right: Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat, i) => (
                <Card key={i} className="border border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{language === "en" ? stat.labelEn : stat.labelAr}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {language === "en" ? "Priority Sectors" : "القطاعات ذات الأولوية"}
            </h2>
            <p className="text-muted-foreground">
              {language === "en" ? "Focused on the sectors driving Sudan's economic transformation and rebuilding" : "مركزون على القطاعات التي تقود التحول الاقتصادي وإعادة بناء السودان"}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SECTORS.map((sector, i) => (
              <div key={i} className="text-center p-4 bg-white rounded-xl border border-border hover:shadow-sm transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${sector.color} flex items-center justify-center mx-auto mb-3`}>
                  <sector.icon className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-foreground">{language === "en" ? sector.label : sector.labelAr}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              {language === "en" ? "Built for the Ecosystem" : "مبني للنظام البيئي"}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {language === "en"
                ? "Every feature is designed to build trust, accelerate connections, and drive measurable impact."
                : "كل ميزة مصممة لبناء الثقة وتسريع الاتصالات وتحقيق تأثير قابل للقياس."}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <Card key={i} className="border border-border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-11 h-11 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{language === "en" ? feature.titleEn : feature.titleAr}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{language === "en" ? feature.descEn : feature.descAr}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              {language === "en" ? "Who Is This For?" : "لمن هذه المنصة؟"}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map((role, i) => (
              <Card key={i} className={`border-2 ${role.color} hover:shadow-md transition-shadow`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center mb-4">
                    <role.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{language === "en" ? role.titleEn : role.titleAr}</h3>
                  <p className="text-sm opacity-80 leading-relaxed">{language === "en" ? role.descEn : role.descAr}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              {language === "en" ? "How It Works" : "كيف تعمل المنصة"}
            </h2>
          </div>
          <div className="space-y-6">
            {[
              { step: "01", titleEn: "Register & Verify", titleAr: "سجل وتحقق", descEn: "Create your profile and complete multi-layer identity verification to join the trusted ecosystem.", descAr: "أنشئ ملفك الشخصي وأكمل التحقق متعدد الطبقات من الهوية للانضمام إلى النظام البيئي الموثوق." },
              { step: "02", titleEn: "Submit or Discover", titleAr: "قدم أو اكتشف", descEn: "Founders submit ventures for AI analysis. Investors and mentors browse verified opportunities.", descAr: "يقدم المؤسسون المشاريع للتحليل الذكي. يتصفح المستثمرون والمرشدون الفرص الموثقة." },
              { step: "03", titleEn: "AI Matching", titleAr: "المطابقة الذكية", descEn: "Our AI engine matches founders with the right investors and mentors based on deep compatibility signals.", descAr: "يطابق محركنا الذكي المؤسسين مع المستثمرين والمرشدين المناسبين بناءً على إشارات التوافق العميقة." },
              { step: "04", titleEn: "Connect & Grow", titleAr: "تواصل وانمو", descEn: "Send connection requests, exchange messages, and build relationships that drive real investment outcomes.", descAr: "أرسل طلبات التواصل وتبادل الرسائل وبناء علاقات تحقق نتائج استثمارية حقيقية." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-bold text-foreground mb-1">{language === "en" ? item.titleEn : item.titleAr}</h3>
                  <p className="text-muted-foreground text-sm">{language === "en" ? item.descEn : item.descAr}</p>
                </div>
                {i < 3 && <ChevronRight className="w-5 h-5 text-muted-foreground mt-3 flex-shrink-0 hidden lg:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Vision */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <Star className="w-10 h-10 mx-auto mb-6 opacity-70" />
          <blockquote className="text-2xl font-semibold leading-relaxed mb-6 max-w-3xl mx-auto">
            {language === "en"
              ? "\"Sudan's next generation of entrepreneurs deserves a platform that matches their ambition — verified, intelligent, and built for trust.\""
              : "\"يستحق رواد الأعمال السودانيون من الجيل القادم منصة ترقى إلى مستوى طموحهم — موثقة وذكية ومبنية على الثقة.\""}
          </blockquote>
          <p className="text-primary-foreground/70 text-sm">
            {language === "en" ? "— Sudan Innovation & Investment Ecosystem Platform" : "— منصة الابتكار والاستثمار في السودان"}
          </p>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20">
        <div className="container max-w-2xl">
          <div className="text-center mb-10">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              {language === "en" ? "Early Access" : "وصول مبكر"}
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              {language === "en" ? "Join the Waitlist" : "انضم إلى قائمة الانتظار"}
            </h2>
            <p className="text-muted-foreground">
              {language === "en"
                ? "Be among the first to access the platform when we launch. Early members receive priority onboarding and exclusive benefits."
                : "كن من أوائل من يصلون إلى المنصة عند إطلاقها. يحصل الأعضاء المبكرون على الأولوية في الإعداد والمزايا الحصرية."}
            </p>
          </div>

          {waitlistSubmitted ? (
            <Card className="border border-green-200 bg-green-50">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h3 className="font-bold text-green-800 text-xl mb-2">
                  {language === "en" ? "You're on the list!" : "أنت في القائمة!"}
                </h3>
                <p className="text-green-700">
                  {language === "en"
                    ? "Thank you for your interest. We'll notify you as soon as early access opens."
                    : "شكراً لاهتمامك. سنخطرك بمجرد فتح الوصول المبكر."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border shadow-lg">
              <CardContent className="p-8">
                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === "en" ? "Full Name *" : "الاسم الكامل *"}</Label>
                      <Input
                        placeholder={language === "en" ? "Your name" : "اسمك"}
                        value={waitlistForm.name}
                        onChange={(e) => setWaitlistForm({ ...waitlistForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === "en" ? "Email Address *" : "البريد الإلكتروني *"}</Label>
                      <Input
                        type="email"
                        placeholder={language === "en" ? "your@email.com" : "بريدك@الإلكتروني.com"}
                        value={waitlistForm.email}
                        onChange={(e) => setWaitlistForm({ ...waitlistForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === "en" ? "I am a..." : "أنا..."}</Label>
                      <Select value={waitlistForm.role} onValueChange={(v) => setWaitlistForm({ ...waitlistForm, role: v as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="founder">{language === "en" ? "Founder" : "مؤسس"}</SelectItem>
                          <SelectItem value="investor">{language === "en" ? "Investor" : "مستثمر"}</SelectItem>
                          <SelectItem value="mentor">{language === "en" ? "Mentor" : "مرشد"}</SelectItem>
                          <SelectItem value="diaspora">{language === "en" ? "Diaspora Member" : "مغترب"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === "en" ? "Country" : "الدولة"}</Label>
                      <Input
                        placeholder={language === "en" ? "e.g. Sudan, UAE, UK..." : "مثال: السودان، الإمارات، المملكة المتحدة..."}
                        value={waitlistForm.country}
                        onChange={(e) => setWaitlistForm({ ...waitlistForm, country: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={joinWaitlist.isPending}
                  >
                    {joinWaitlist.isPending
                      ? (language === "en" ? "Joining..." : "جاري الانضمام...")
                      : (language === "en" ? "Join Waitlist — Free" : "انضم إلى قائمة الانتظار — مجاناً")}
                    <ArrowRight className={`w-5 h-5 ${isRTL ? "rotate-180 mr-2" : "ml-2"}`} />
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {language === "en"
                      ? "No spam. We'll only contact you about platform access and important updates."
                      : "لا رسائل مزعجة. سنتواصل معك فقط بشأن الوصول إلى المنصة والتحديثات المهمة."}
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-10">
        <div className="container max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground text-sm">Sudan Invest Ecosystem</span>
            </div>
            <p className="text-muted-foreground text-sm text-center">
              {language === "en"
                ? "Building Sudan's most trusted investment and innovation platform."
                : "بناء منصة الاستثمار والابتكار الأكثر موثوقية في السودان."}
            </p>
            <button onClick={toggleLanguage} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
              <Languages className="w-4 h-4" />
              {language === "en" ? "العربية" : "English"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
