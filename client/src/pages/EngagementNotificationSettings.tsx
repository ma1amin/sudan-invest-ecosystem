import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { EngagementNotificationRule } from "@/components/EngagementNotificationRule";
import { ArrowLeft, Bell, Plus } from "lucide-react";
import { useState } from "react";

export default function EngagementNotificationSettings() {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation() as any;
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({
    ventureId: "",
    engagementThreshold: 30,
    inactivityDays: 14,
  });

  // Redirect non-investors/mentors
  if (user?.platformRole !== "investor" && user?.platformRole !== "mentor") {
    navigate("/dashboard");
    return null;
  }

  const { data: rules, refetch: refetchRules } = trpc.engagementNotifications.getRules.useQuery();
  const { data: ventures } = trpc.ventures.published.useQuery({ limit: 100, offset: 0 });

  const createRule = trpc.engagementNotifications.createRule.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Rule created successfully" : "تم إنشاء القاعدة بنجاح");
      setShowAddRule(false);
      setNewRule({ ventureId: "", engagementThreshold: 30, inactivityDays: 14 });
      refetchRules();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateRule = trpc.engagementNotifications.updateRule.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Rule updated successfully" : "تم تحديث القاعدة بنجاح");
      refetchRules();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleCreateRule = () => {
    if (!newRule.ventureId) {
      toast.error(language === "en" ? "Please select a venture" : "يرجى اختيار مشروع");
      return;
    }
    createRule.mutate({
      ventureId: Number(newRule.ventureId),
      engagementThreshold: newRule.engagementThreshold,
      inactivityDays: newRule.inactivityDays,
    });
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className={isRTL ? "ml-auto" : ""}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === "en" ? "Engagement Notifications" : "إشعارات الانخراط"}
            </h1>
            <p className="text-muted-foreground">
              {language === "en"
                ? "Monitor founder engagement and receive alerts when activity drops"
                : "راقب انخراط المؤسسين واستقبل تنبيهات عند انخفاض النشاط"}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-4xl space-y-6">
        {/* Add Rule Card */}
        {!showAddRule ? (
          <Button onClick={() => setShowAddRule(true)} className="w-full" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            {language === "en" ? "Create New Rule" : "إنشاء قاعدة جديدة"}
          </Button>
        ) : (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>{language === "en" ? "Create Notification Rule" : "إنشاء قاعدة إشعار"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Venture Selection */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  {language === "en" ? "Select Venture" : "اختر المشروع"}
                </label>
                <select
                  value={newRule.ventureId}
                  onChange={(e) => setNewRule({ ...newRule, ventureId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">{language === "en" ? "-- Select a venture --" : "-- اختر مشروعاً --"}</option>
                  {ventures?.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {language === "en" ? v.title : v.titleAr || v.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Engagement Threshold */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  {language === "en" ? "Engagement Threshold (0-100)" : "حد الانخراط (0-100)"}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newRule.engagementThreshold}
                  onChange={(e) => setNewRule({ ...newRule, engagementThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "en"
                    ? "Alert when founder's engagement score drops below this threshold"
                    : "تنبيه عندما ينخفض نقاط انخراط المؤسس عن هذا الحد"}
                </p>
              </div>

              {/* Inactivity Days */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  {language === "en" ? "Inactivity Alert After (days)" : "تنبيه عدم النشاط بعد (أيام)"}
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={newRule.inactivityDays}
                  onChange={(e) => setNewRule({ ...newRule, inactivityDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "en"
                    ? "Alert if founder has no activity for this many days"
                    : "تنبيه إذا لم يكن هناك نشاط من المؤسس لهذا العدد من الأيام"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  onClick={handleCreateRule}
                  disabled={createRule.isPending || !newRule.ventureId}
                  className="flex-1"
                >
                  {language === "en" ? "Create Rule" : "إنشاء القاعدة"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddRule(false)} className="flex-1">
                  {language === "en" ? "Cancel" : "إلغاء"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rules List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            {language === "en" ? "Your Notification Rules" : "قواعد الإشعارات الخاصة بك"}
          </h2>

          {rules && rules.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {rules.map((rule: any) => (
                <EngagementNotificationRule
                  key={rule.id}
                  rule={rule}
                  onToggle={(id, isActive) => {
                    updateRule.mutate({ id, isActive });
                  }}
                  onDelete={(id) => {
                    updateRule.mutate({ id, isActive: false });
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="border border-border p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === "en"
                  ? "No notification rules yet. Create one to start monitoring founder engagement."
                  : "لا توجد قواعد إشعارات حتى الآن. أنشئ واحدة لبدء مراقبة انخراط المؤسس."}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
