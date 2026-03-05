import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/ventures" component={Ventures} />
      <Route path="/ventures/submit" component={VentureSubmit} />
      <Route path="/ventures/:id" component={VentureDetail} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:userId" component={Messages} />
      <Route path="/profile" component={Profile} />
      <Route path="/diaspora" component={Diaspora} />
      <Route path="/documents" component={Documents} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
