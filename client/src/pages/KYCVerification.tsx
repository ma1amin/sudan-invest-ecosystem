import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Lock,
  Shield,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

interface VerificationStep {
  id: string;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
  required: boolean;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function StatusBadge({ status, isRTL }: { status: VerificationStatus; isRTL: boolean }) {
  const config = {
    unverified: { label: isRTL ? "غير موثق" : "Unverified", labelClass: "bg-gray-100 text-gray-700", icon: <User className="w-3 h-3" /> },
    pending: { label: isRTL ? "قيد المراجعة" : "Pending Review", labelClass: "bg-amber-100 text-amber-700", icon: <Clock className="w-3 h-3" /> },
    verified: { label: isRTL ? "موثق" : "Verified", labelClass: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-3 h-3" /> },
    rejected: { label: isRTL ? "مرفوض" : "Rejected", labelClass: "bg-red-100 text-red-700", icon: <XCircle className="w-3 h-3" /> },
  };
  const c = config[status];
  return (
    <Badge className={`${c.labelClass} flex items-center gap-1 w-fit`}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

const VERIFICATION_STEPS: VerificationStep[] = [
  {
    id: "identity",
    label: "Identity Document",
    labelAr: "وثيقة الهوية",
    description: "Upload a government-issued ID: passport, national ID, or driver's license.",
    descriptionAr: "ارفع وثيقة هوية صادرة عن الحكومة: جواز سفر، أو بطاقة هوية وطنية، أو رخصة قيادة.",
    icon: <User className="w-5 h-5" />,
    required: true,
  },
  {
    id: "address",
    label: "Proof of Address",
    labelAr: "إثبات العنوان",
    description: "Upload a utility bill, bank statement, or official letter dated within the last 3 months.",
    descriptionAr: "ارفع فاتورة خدمات، أو كشف حساب بنكي، أو خطاب رسمي مؤرخ خلال الأشهر الثلاثة الماضية.",
    icon: <FileText className="w-5 h-5" />,
    required: true,
  },
  {
    id: "professional",
    label: "Professional Credentials",
    labelAr: "المؤهلات المهنية",
    description: "Upload certificates, licenses, or professional memberships relevant to your platform role.",
    descriptionAr: "ارفع الشهادات أو التراخيص أو العضويات المهنية ذات الصلة بدورك في المنصة.",
    icon: <Shield className="w-5 h-5" />,
    required: false,
  },
  {
    id: "business",
    label: "Business Registration",
    labelAr: "تسجيل الأعمال",
    description: "For founders: upload your business registration certificate or incorporation documents.",
    descriptionAr: "للمؤسسين: ارفع شهادة تسجيل الأعمال أو وثائق التأسيس.",
    icon: <FileText className="w-5 h-5" />,
    required: false,
  },
];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function KYCVerification() {
  const { language, isRTL } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: profile } = trpc.user.getProfile.useQuery(undefined, { enabled: isAuthenticated });
  const updateProfile = trpc.user.updateProfile.useMutation();
  const uploadDocument = trpc.documents.upload.useMutation();

  const verificationStatus: VerificationStatus = (profile?.verificationStatus as VerificationStatus) ?? "unverified";

  const handleFileChange = (stepId: string, file: File | null) => {
    setUploadedFiles((prev) => ({ ...prev, [stepId]: file }));
  };

  const handleSubmit = async () => {
    const requiredSteps = VERIFICATION_STEPS.filter((s) => s.required);
    const missingRequired = requiredSteps.filter((s) => !uploadedFiles[s.id]);
    if (missingRequired.length > 0) {
      toast.error(isRTL ? "يرجى رفع جميع الوثائق المطلوبة" : "Please upload all required documents");
      return;
    }

    setSubmitting(true);
    try {
      // Upload each document
      for (const [stepId, file] of Object.entries(uploadedFiles)) {
        if (!file) continue;
        const base64 = await fileToBase64(file);
        await uploadDocument.mutateAsync({
          name: `KYC_${stepId}_${file.name}`,
          type: "legal_document",
          accessLevel: "private",
          fileBase64: base64,
          mimeType: file.type,
          fileSize: file.size,
        });
      }

      // Update verification status to pending
      await updateProfile.mutateAsync({
        verificationStatus: "pending",
      } as any);

      setSubmitted(true);
      toast.success(isRTL ? "تم تقديم طلب التحقق بنجاح" : "Verification request submitted successfully");
    } catch (e) {
      toast.error(isRTL ? "فشل تقديم الطلب. يرجى المحاولة مرة أخرى" : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const t = {
    title: isRTL ? "التحقق من الهوية (KYC)" : "Identity Verification (KYC)",
    subtitle: isRTL
      ? "أكمل عملية التحقق لفتح الميزات الكاملة للمنصة والحصول على شارة الثقة"
      : "Complete verification to unlock full platform features and earn your trust badge",
    back: isRTL ? "رجوع" : "Back",
    currentStatus: isRTL ? "الحالة الحالية" : "Current Status",
    trustLevels: isRTL ? "مستويات الثقة" : "Trust Levels",
    required: isRTL ? "مطلوب" : "Required",
    optional: isRTL ? "اختياري" : "Optional",
    uploadFile: isRTL ? "رفع ملف" : "Upload File",
    fileSelected: isRTL ? "تم اختيار الملف" : "File Selected",
    submit: isRTL ? "تقديم للمراجعة" : "Submit for Review",
    submitting: isRTL ? "جارٍ التقديم..." : "Submitting...",
    pendingMessage: isRTL
      ? "طلبك قيد المراجعة. سيتم إخطارك بالنتيجة خلال 2-3 أيام عمل."
      : "Your request is under review. You will be notified within 2-3 business days.",
    verifiedMessage: isRTL
      ? "تم التحقق من هويتك بنجاح. يمكنك الآن الوصول إلى جميع ميزات المنصة."
      : "Your identity has been successfully verified. You now have full access to all platform features.",
    rejectedMessage: isRTL
      ? "تم رفض طلبك. يرجى مراجعة الأسباب وإعادة التقديم بوثائق صحيحة."
      : "Your request was rejected. Please review the reasons and resubmit with correct documents.",
    whyVerify: isRTL ? "لماذا التحقق؟" : "Why Verify?",
    benefits: isRTL
      ? ["الوصول إلى المستثمرين الموثقين", "شارة الثقة على ملفك الشخصي", "أولوية في نتائج المطابقة", "الوصول إلى غرفة الصفقات الخاصة"]
      : ["Access to verified investors", "Trust badge on your profile", "Priority in matching results", "Access to private deal room"],
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center p-8">
          <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{isRTL ? "تسجيل الدخول مطلوب" : "Login Required"}</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Current Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">{t.currentStatus}</div>
              <StatusBadge status={verificationStatus} isRTL={isRTL} />
            </div>
            <div className="flex gap-3 items-center">
              {["unverified", "pending", "verified"].map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${verificationStatus === s ? "bg-primary" : i < ["unverified", "pending", "verified"].indexOf(verificationStatus) ? "bg-emerald-500" : "bg-muted"}`} />
                  {i < 2 && <div className="w-8 h-0.5 bg-muted" />}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Status-specific messages */}
        {verificationStatus === "pending" || submitted ? (
          <Card className="p-6 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">{t.pendingMessage}</p>
            </div>
          </Card>
        ) : verificationStatus === "verified" ? (
          <Card className="p-6 border-emerald-200 bg-emerald-50">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-800">{t.verifiedMessage}</p>
            </div>
          </Card>
        ) : verificationStatus === "rejected" ? (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800">{t.rejectedMessage}</p>
            </div>
          </Card>
        ) : null}

        {/* Why Verify */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            {t.whyVerify}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {t.benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </Card>

        {/* Trust Level Explanation */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">{t.trustLevels}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { level: isRTL ? "غير موثق" : "Unverified", icon: <User className="w-5 h-5" />, color: "gray", desc: isRTL ? "وصول أساسي للمنصة" : "Basic platform access" },
              { level: isRTL ? "قيد المراجعة" : "Pending", icon: <Clock className="w-5 h-5" />, color: "amber", desc: isRTL ? "الوثائق قيد المراجعة" : "Documents under review" },
              { level: isRTL ? "موثق" : "Verified", icon: <Shield className="w-5 h-5" />, color: "emerald", desc: isRTL ? "وصول كامل + شارة الثقة" : "Full access + trust badge" },
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-lg border-2 ${verificationStatus === ["unverified", "pending", "verified"][i] ? "border-primary bg-primary/5" : "border-muted"}`}>
                <div className={`text-${item.color}-600 mb-2`}>{item.icon}</div>
                <div className="font-semibold text-sm">{item.level}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Document Upload Steps */}
        {(verificationStatus === "unverified" || verificationStatus === "rejected") && !submitted && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">{isRTL ? "رفع الوثائق" : "Upload Documents"}</h2>
            {VERIFICATION_STEPS.map((step) => (
              <Card key={step.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{isRTL ? step.labelAr : step.label}</span>
                      <Badge variant="outline" className={step.required ? "text-red-600 border-red-300" : "text-muted-foreground"}>
                        {step.required ? t.required : t.optional}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{isRTL ? step.descriptionAr : step.description}</p>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => handleFileChange(step.id, e.target.files?.[0] ?? null)}
                      />
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed text-sm transition-colors w-fit ${uploadedFiles[step.id] ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-muted-foreground/30 hover:border-primary text-muted-foreground"}`}>
                        {uploadedFiles[step.id] ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            {uploadedFiles[step.id]!.name}
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {t.uploadFile}
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </Card>
            ))}

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? t.submitting : t.submit}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
