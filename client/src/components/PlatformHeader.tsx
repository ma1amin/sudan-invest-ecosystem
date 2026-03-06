import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLoginUrl } from "@/const";
import {
  BarChart3,
  BookOpen,
  FileText,
  Globe,
  HandHeart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Rocket,
  Shield,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { NotificationsPanel } from "./NotificationsPanel";

// ─────────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  labelAr: string;
  icon: React.ReactNode;
  authRequired?: boolean;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", labelAr: "الرئيسية", icon: <Home className="w-4 h-4" /> },
  { href: "/ventures", label: "Ventures", labelAr: "المشاريع", icon: <Rocket className="w-4 h-4" /> },
  { href: "/dashboard", label: "Dashboard", labelAr: "لوحة التحكم", icon: <LayoutDashboard className="w-4 h-4" />, authRequired: true },
  { href: "/diaspora", label: "Diaspora", labelAr: "المغتربون", icon: <Globe className="w-4 h-4" /> },
  { href: "/documents", label: "Documents", labelAr: "الوثائق", icon: <FileText className="w-4 h-4" />, authRequired: true },
];

const USER_MENU_ITEMS: NavItem[] = [
  { href: "/profile", label: "Profile", labelAr: "الملف الشخصي", icon: <User className="w-4 h-4" /> },
  { href: "/progress", label: "Progress Tracker", labelAr: "مسار التقدم", icon: <TrendingUp className="w-4 h-4" /> },
  { href: "/kyc", label: "Verification", labelAr: "التحقق من الهوية", icon: <Shield className="w-4 h-4" /> },
  { href: "/ventures/compare", label: "Compare Ventures", labelAr: "مقارنة المشاريع", icon: <BarChart3 className="w-4 h-4" /> },
  { href: "/diaspora/deals", label: "Deal Room", labelAr: "غرفة الصفقات", icon: <HandHeart className="w-4 h-4" /> },
];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export function PlatformHeader() {
  const { isRTL, language, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Rocket className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm hidden sm:block">
            {isRTL ? "منصة الاستثمار" : "InvestEcosystem"}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.filter((item) => !item.authRequired || isAuthenticated).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.icon}
              {isRTL ? item.labelAr : item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border hover:bg-muted transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {language === "en" ? "عربي" : "EN"}
          </button>

          {/* Notifications (auth only) */}
          {isAuthenticated && <NotificationsPanel />}

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium hidden sm:block max-w-24 truncate">
                  {user?.name ?? (isRTL ? "المستخدم" : "User")}
                </span>
              </button>

              {userMenuOpen && (
                <div className={`absolute top-full mt-2 w-52 bg-card border rounded-xl shadow-xl z-50 overflow-hidden ${isRTL ? "left-0" : "right-0"}`}>
                  <div className="px-3 py-2 border-b">
                    <p className="text-xs font-semibold truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  {USER_MENU_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <span className="text-muted-foreground">{item.icon}</span>
                      {isRTL ? item.labelAr : item.label}
                    </Link>
                  ))}
                  <div className="border-t">
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {isRTL ? "تسجيل الخروج" : "Sign Out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button size="sm" asChild>
              <a href={getLoginUrl()}>{isRTL ? "تسجيل الدخول" : "Sign In"}</a>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {NAV_ITEMS.filter((item) => !item.authRequired || isAuthenticated).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.icon}
                {isRTL ? item.labelAr : item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <div className="border-t my-2" />
                {USER_MENU_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {item.icon}
                    {isRTL ? item.labelAr : item.label}
                  </Link>
                ))}
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {isRTL ? "تسجيل الخروج" : "Sign Out"}
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
