import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PlatformHeader } from "./components/PlatformHeader";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import VentureSubmit from "./pages/VentureSubmit";
import VentureDetail from "./pages/VentureDetail";
import Ventures from "./pages/Ventures";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import Diaspora from "./pages/Diaspora";
import Documents from "./pages/Documents";
import FounderProgress from "./pages/FounderProgress";
import KYCVerification from "./pages/KYCVerification";
import VentureCompare from "./pages/VentureCompare";
import DiasporaDealRoom from "./pages/DiasporaDealRoom";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import RoleSelection from "./pages/RoleSelection";
import Onboarding from "./pages/Onboarding";
import PublicProfile from "./pages/PublicProfile";
import InvestorPortfolio from "./pages/InvestorPortfolio";
import EngagementNotificationSettings from "./pages/EngagementNotificationSettings";
import InvestorReports from "./pages/InvestorReports";
import DealRoom from "./pages/DealRoom";
import PerformanceBenchmarking from "./pages/PerformanceBenchmarking";
import LPPortfolio from "./pages/LPPortfolio";
import NotificationCenter from "./pages/NotificationCenter";
import AdvancedSearch from "./pages/AdvancedSearch";

/**
 * Routes that use their own full-page layout (sidebar dashboards, etc.)
 * These do NOT get the global PlatformHeader to avoid double headers.
 */
const STANDALONE_ROUTES = ["/dashboard", "/admin"];

/**
 * Global layout wrapper — PlatformHeader is rendered on all routes
 * EXCEPT those listed in STANDALONE_ROUTES (which have their own layouts).
 */
function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isStandalone = STANDALONE_ROUTES.some((r) => location === r || location.startsWith(r + "/"));

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PlatformHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/ventures" component={Ventures} />
        <Route path="/ventures/submit" component={VentureSubmit} />
        <Route path="/ventures/compare" component={VentureCompare} />
        <Route path="/ventures/:id" component={VentureDetail} />
        <Route path="/messages" component={Messages} />
        <Route path="/messages/:userId" component={Messages} />
        <Route path="/profile" component={Profile} />
        <Route path="/profile/:userId" component={PublicProfile} />
        <Route path="/investor/portfolio" component={InvestorPortfolio} />
        <Route path="/lp/portfolio" component={LPPortfolio} />
        <Route path="/notifications" component={NotificationCenter} />
        <Route path="/search" component={AdvancedSearch} />
        <Route path="/notifications/settings" component={EngagementNotificationSettings} />
        <Route path="/reports" component={InvestorReports} />
        <Route path="/deal-room/:id" component={DealRoom} />
        <Route path="/benchmarking" component={PerformanceBenchmarking} />
        <Route path="/diaspora" component={Diaspora} />
        <Route path="/diaspora/deals" component={DiasporaDealRoom} />
        <Route path="/documents" component={Documents} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/progress" component={FounderProgress} />
        <Route path="/kyc" component={KYCVerification} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/role-selection" component={RoleSelection} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
