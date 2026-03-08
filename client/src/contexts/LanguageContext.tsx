import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "ar";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.ventures": "Ventures",
    "nav.investors": "Investors",
    "nav.diaspora": "Diaspora",
    "nav.login": "Sign In",
    "nav.register": "Join the Ecosystem",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Sign Out",

    // Landing Hero
    "hero.badge": "Sudan's Innovation & Investment Ecosystem",
    "hero.title": "Where Sudanese Ventures Meet Global Capital",
    "hero.subtitle":
      "A trusted AI-powered platform connecting Sudanese founders, investors, mentors, and diaspora to accelerate Sudan's economic transformation and rebuilding.",
    "hero.cta.primary": "Join the Waitlist",
    "hero.cta.secondary": "Explore the Platform",
    "hero.stat.founders": "Founders",
    "hero.stat.investors": "Investors",
    "hero.stat.sectors": "Sectors",
    "hero.stat.countries": "Countries",

    // Waitlist
    "waitlist.title": "Be Among the First",
    "waitlist.subtitle":
      "Join our founding community and get early access to the platform.",
    "waitlist.name": "Full Name",
    "waitlist.email": "Email Address",
    "waitlist.role": "I am a",
    "waitlist.role.founder": "Founder",
    "waitlist.role.investor": "Investor",
    "waitlist.role.mentor": "Mentor",
    "waitlist.role.diaspora": "Diaspora Member",
    "waitlist.role.other": "Other",
    "waitlist.country": "Country",
    "waitlist.message": "Tell us about yourself (optional)",
    "waitlist.submit": "Join Waitlist",
    "waitlist.success": "You're on the list! We'll be in touch soon.",
    "waitlist.error": "Something went wrong. Please try again.",

    // Value Props
    "value.title": "Built for Every Stakeholder",
    "value.founders.title": "For Founders",
    "value.founders.desc":
      "Access funding, mentorship, and AI-powered readiness guidance to take your venture to the next level.",
    "value.investors.title": "For Investors",
    "value.investors.desc":
      "Discover verified opportunities with AI risk insights and intelligent matching tailored to your investment thesis.",
    "value.mentors.title": "For Mentors",
    "value.mentors.desc":
      "Share your expertise with the next generation of Sudanese entrepreneurs and track your impact.",
    "value.diaspora.title": "For Diaspora",
    "value.diaspora.desc":
      "Invest, mentor, partner, or sponsor initiatives that drive meaningful change in your home country.",

    // Sectors
    "sectors.title": "Priority Sectors",
    "sectors.subtitle": "Focused on industries with the highest impact potential",
    "sector.agritech": "AgriTech",
    "sector.fintech": "FinTech",
    "sector.renewable": "Renewable Energy",
    "sector.healthcare": "Healthcare",
    "sector.edtech": "EdTech",
    "sector.logistics": "Logistics",
    "sector.ecommerce": "E-Commerce",
    "sector.climate": "Climate Tech",

    // Dashboard
    "dashboard.welcome": "Welcome back",
    "dashboard.overview": "Overview",
    "dashboard.ventures": "My Ventures",
    "dashboard.matches": "Matches",
    "dashboard.messages": "Messages",
    "dashboard.notifications": "Notifications",
    "dashboard.analytics": "Analytics",
    "dashboard.documents": "Documents",
    "dashboard.settings": "Settings",

    // Venture
    "venture.submit": "Submit Venture",
    "venture.title": "Venture Title",
    "venture.tagline": "Tagline",
    "venture.description": "Description",
    "venture.sector": "Sector",
    "venture.stage": "Stage",
    "venture.funding": "Funding Target",
    "venture.country": "Country",
    "venture.team": "Team Size",
    "venture.website": "Website",
    "venture.stage.idea": "Idea",
    "venture.stage.prototype": "Prototype",
    "venture.stage.mvp": "MVP",
    "venture.stage.early_traction": "Early Traction",
    "venture.stage.growth": "Growth",
    "venture.stage.scaling": "Scaling",
    "venture.score": "AI Readiness Score",
    "venture.status.draft": "Draft",
    "venture.status.submitted": "Submitted",
    "venture.status.under_review": "Under Review",
    "venture.status.published": "Published",
    "venture.status.rejected": "Rejected",
    "venture.status.incubation": "In Incubation",

    // Matching
    "match.title": "Your Matches",
    "match.score": "Compatibility",
    "match.connect": "Request Connection",
    "match.view": "View Details",

    // Messages
    "message.send": "Send Message",
    "message.placeholder": "Type your message...",
    "message.empty": "No messages yet. Start a conversation.",

    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.submit": "Submit",
    "common.back": "Back",
    "common.next": "Next",
    "common.view_all": "View All",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.verified": "Verified",
    "common.pending": "Pending",
    "common.active": "Active",
    "common.published": "Published",
  },

  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.about": "عن المنصة",
    "nav.ventures": "المشاريع",
    "nav.investors": "المستثمرون",
    "nav.diaspora": "المغتربون",
    "nav.login": "تسجيل الدخول",
    "nav.register": "انضم للمنظومة",
    "nav.dashboard": "لوحة التحكم",
    "nav.logout": "تسجيل الخروج",

    // Landing Hero
    "hero.badge": "منظومة الابتكار والاستثمار السودانية",
    "hero.title": "حيث تلتقي المشاريع السودانية برأس المال العالمي",
    "hero.subtitle":
      "منصة موثوقة مدعومة بالذكاء الاصطناعي تربط المؤسسين السودانيين والمستثمرين والمرشدين والمغتربين لتسريع التحول الاقتصادي وإعادة بناء السودان.",
    "hero.cta.primary": "انضم لقائمة الانتظار",
    "hero.cta.secondary": "استكشف المنصة",
    "hero.stat.founders": "مؤسس",
    "hero.stat.investors": "مستثمر",
    "hero.stat.sectors": "قطاع",
    "hero.stat.countries": "دولة",

    // Waitlist
    "waitlist.title": "كن من الأوائل",
    "waitlist.subtitle": "انضم لمجتمعنا التأسيسي واحصل على وصول مبكر للمنصة.",
    "waitlist.name": "الاسم الكامل",
    "waitlist.email": "البريد الإلكتروني",
    "waitlist.role": "أنا",
    "waitlist.role.founder": "مؤسس",
    "waitlist.role.investor": "مستثمر",
    "waitlist.role.mentor": "مرشد",
    "waitlist.role.diaspora": "مغترب",
    "waitlist.role.other": "أخرى",
    "waitlist.country": "الدولة",
    "waitlist.message": "أخبرنا عن نفسك (اختياري)",
    "waitlist.submit": "انضم لقائمة الانتظار",
    "waitlist.success": "تم تسجيلك! سنتواصل معك قريباً.",
    "waitlist.error": "حدث خطأ. يرجى المحاولة مرة أخرى.",

    // Value Props
    "value.title": "مبني لكل الأطراف",
    "value.founders.title": "للمؤسسين",
    "value.founders.desc":
      "احصل على التمويل والإرشاد وتوجيهات الذكاء الاصطناعي لأخذ مشروعك للمستوى التالي.",
    "value.investors.title": "للمستثمرين",
    "value.investors.desc":
      "اكتشف فرصاً موثقة مع رؤى المخاطر الذكية والمطابقة الذكية المصممة لفلسفتك الاستثمارية.",
    "value.mentors.title": "للمرشدين",
    "value.mentors.desc":
      "شارك خبرتك مع الجيل القادم من رواد الأعمال السودانيين وتابع تأثيرك.",
    "value.diaspora.title": "للمغتربين",
    "value.diaspora.desc":
      "استثمر أو أرشد أو شارك أو ادعم مبادرات تحدث تغييراً حقيقياً في وطنك.",

    // Sectors
    "sectors.title": "القطاعات الأولوية",
    "sectors.subtitle": "تركيز على الصناعات ذات أعلى إمكانات التأثير",
    "sector.agritech": "التكنولوجيا الزراعية",
    "sector.fintech": "التكنولوجيا المالية",
    "sector.renewable": "الطاقة المتجددة",
    "sector.healthcare": "الرعاية الصحية",
    "sector.edtech": "تكنولوجيا التعليم",
    "sector.logistics": "اللوجستيات",
    "sector.ecommerce": "التجارة الإلكترونية",
    "sector.climate": "تقنيات المناخ",

    // Dashboard
    "dashboard.welcome": "مرحباً بعودتك",
    "dashboard.overview": "نظرة عامة",
    "dashboard.ventures": "مشاريعي",
    "dashboard.matches": "المطابقات",
    "dashboard.messages": "الرسائل",
    "dashboard.notifications": "الإشعارات",
    "dashboard.analytics": "التحليلات",
    "dashboard.documents": "المستندات",
    "dashboard.settings": "الإعدادات",

    // Venture
    "venture.submit": "تقديم مشروع",
    "venture.title": "اسم المشروع",
    "venture.tagline": "الشعار",
    "venture.description": "الوصف",
    "venture.sector": "القطاع",
    "venture.stage": "المرحلة",
    "venture.funding": "هدف التمويل",
    "venture.country": "الدولة",
    "venture.team": "حجم الفريق",
    "venture.website": "الموقع الإلكتروني",
    "venture.stage.idea": "فكرة",
    "venture.stage.prototype": "نموذج أولي",
    "venture.stage.mvp": "منتج أدنى",
    "venture.stage.early_traction": "جذب مبكر",
    "venture.stage.growth": "نمو",
    "venture.stage.scaling": "توسع",
    "venture.score": "درجة الجاهزية الذكية",
    "venture.status.draft": "مسودة",
    "venture.status.submitted": "مقدم",
    "venture.status.under_review": "قيد المراجعة",
    "venture.status.published": "منشور",
    "venture.status.rejected": "مرفوض",
    "venture.status.incubation": "في الحضانة",

    // Matching
    "match.title": "مطابقاتك",
    "match.score": "التوافق",
    "match.connect": "طلب تواصل",
    "match.view": "عرض التفاصيل",

    // Messages
    "message.send": "إرسال رسالة",
    "message.placeholder": "اكتب رسالتك...",
    "message.empty": "لا توجد رسائل بعد. ابدأ محادثة.",

    // Common
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.submit": "إرسال",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.view_all": "عرض الكل",
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.verified": "موثق",
    "common.pending": "معلق",
    "common.active": "نشط",
    "common.published": "منشور",
  },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("ecosystem_lang");
    return (stored as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("ecosystem_lang", lang);
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", dir);
  }, [language, dir]);

  const t = (key: string): string => {
    return translations[language][key] ?? translations["en"][key] ?? key;
  };

  const toggleLanguage = () => setLanguage(language === "en" ? "ar" : "en");

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t, dir, isRTL: language === "ar" }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
