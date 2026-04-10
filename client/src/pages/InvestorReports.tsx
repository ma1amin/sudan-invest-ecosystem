import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { ArrowLeft, FileText, Download, Plus, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function InvestorReports() {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation() as any;
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Redirect non-investors
  if (user?.platformRole !== "investor") {
    navigate("/dashboard");
    return null;
  }

  const { data: reports } = trpc.reporting.getReports.useQuery();
  const createReport = trpc.reporting.createReport.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Report created" : "تم إنشاء التقرير");
      setShowCreateForm(false);
    },
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, Record<string, string>> = {
      draft: { en: "Draft", ar: "مسودة" },
      generated: { en: "Generated", ar: "تم إنشاؤه" },
      sent: { en: "Sent", ar: "تم الإرسال" },
    };
    return labels[status]?.[language as keyof typeof labels[string]] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      generated: "bg-blue-100 text-blue-800",
      sent: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4">
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
                {language === "en" ? "Investor Reports" : "تقارير المستثمرين"}
              </h1>
              <p className="text-muted-foreground">
                {language === "en"
                  ? "Generate and manage quarterly/annual reports"
                  : "إنشاء وإدارة التقارير الفصلية/السنوية"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {language === "en" ? "New Report" : "تقرير جديد"}
          </Button>
        </div>
      </div>

      <div className="container py-8 max-w-6xl space-y-6">
        {/* Create Report Form */}
        {showCreateForm && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>
                {language === "en" ? "Create New Report" : "إنشاء تقرير جديد"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createReport.mutate({
                    reportType: formData.get("reportType") as string,
                    reportingPeriod: formData.get("reportingPeriod") as string,
                    reportData: {
                      summary: formData.get("summary") as string,
                    },
                    totalPortfolioValue: formData.get("totalPortfolioValue") as string,
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      {language === "en" ? "Report Type" : "نوع التقرير"}
                    </label>
                    <select
                      name="reportType"
                      required
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md text-foreground bg-background"
                    >
                      <option value="quarterly">
                        {language === "en" ? "Quarterly" : "فصلي"}
                      </option>
                      <option value="annual">
                        {language === "en" ? "Annual" : "سنوي"}
                      </option>
                      <option value="custom">
                        {language === "en" ? "Custom" : "مخصص"}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      {language === "en" ? "Reporting Period" : "فترة التقرير"}
                    </label>
                    <input
                      type="text"
                      name="reportingPeriod"
                      placeholder="Q1 2024"
                      required
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md text-foreground bg-background"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    {language === "en" ? "Total Portfolio Value" : "إجمالي قيمة المحفظة"}
                  </label>
                  <input
                    type="number"
                    name="totalPortfolioValue"
                    step="0.01"
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md text-foreground bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    {language === "en" ? "Summary" : "الملخص"}
                  </label>
                  <textarea
                    name="summary"
                    rows={4}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md text-foreground bg-background"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    {language === "en" ? "Cancel" : "إلغاء"}
                  </Button>
                  <Button type="submit" disabled={createReport.isPending}>
                    {createReport.isPending
                      ? language === "en"
                        ? "Creating..."
                        : "جاري الإنشاء..."
                      : language === "en"
                      ? "Create Report"
                      : "إنشاء التقرير"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {language === "en" ? "Your Reports" : "تقاريرك"}
          </h2>

          {reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {reports.map((report: any) => (
                <Card key={report.id} className="border border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-5 h-5 text-primary" />
                          <p className="font-semibold text-foreground">
                            {report.reportingPeriod}
                          </p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                            {getStatusLabel(report.status)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {language === "en" ? "Type" : "النوع"}: {report.reportType}
                        </p>
                        {report.totalPortfolioValue && (
                          <p className="text-sm text-muted-foreground">
                            {language === "en" ? "Portfolio Value" : "قيمة المحفظة"}: $
                            {Number(report.totalPortfolioValue).toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(report.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {report.pdfUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(report.pdfUrl, "_blank")}
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            {language === "en" ? "Download" : "تحميل"}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/reports/${report.id}`)}
                        >
                          {language === "en" ? "View" : "عرض"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-border p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === "en"
                  ? "No reports yet. Create your first report to get started."
                  : "لا توجد تقارير حتى الآن. أنشئ تقريرك الأول للبدء."}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
