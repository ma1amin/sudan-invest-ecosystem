import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, FileText, Upload, Trash2, Download, Shield,
  Lock, Eye, Users, Globe, File, FilePieChart, FileBarChart,
  FileCheck, AlertCircle
} from "lucide-react";
import { getLoginUrl } from "@/const";

const DOC_TYPES = [
  { value: "pitch_deck", icon: FilePieChart, en: "Pitch Deck", ar: "عرض تقديمي" },
  { value: "business_plan", icon: FileText, en: "Business Plan", ar: "خطة العمل" },
  { value: "financial_projection", icon: FileBarChart, en: "Financial Projection", ar: "التوقعات المالية" },
  { value: "legal_document", icon: FileCheck, en: "Legal Document", ar: "وثيقة قانونية" },
  { value: "due_diligence", icon: Shield, en: "Due Diligence", ar: "العناية الواجبة" },
  { value: "other", icon: File, en: "Other", ar: "أخرى" },
];

const ACCESS_LEVELS = [
  { value: "private", icon: Lock, en: "Private", ar: "خاص", color: "bg-gray-100 text-gray-700" },
  { value: "connected_only", icon: Users, en: "Connected Only", ar: "المتصلون فقط", color: "bg-blue-100 text-blue-700" },
  { value: "verified_investors", icon: Shield, en: "Verified Investors", ar: "المستثمرون الموثقون", color: "bg-purple-100 text-purple-700" },
  { value: "public", icon: Globe, en: "Public", ar: "عام", color: "bg-green-100 text-green-700" },
];

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

export default function Documents() {
  const { user, isAuthenticated, loading } = useAuth();
  const { language, isRTL } = useLanguage();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "pitch_deck" as const,
    accessLevel: "private" as const,
  });

  const { data: myDocuments, refetch } = trpc.documents.myDocuments.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const deleteDocument = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Document deleted" : "تم حذف المستند");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const uploadDocument = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Document uploaded successfully" : "تم رفع المستند بنجاح");
      setForm({ name: "", type: "pitch_deck", accessLevel: "private" });
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(language === "en" ? "File size exceeds 16MB limit" : "حجم الملف يتجاوز الحد الأقصى 16 ميجابايت");
      return;
    }

    if (!form.name) {
      toast.error(language === "en" ? "Please enter a document name" : "يرجى إدخال اسم المستند");
      return;
    }

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);
      await uploadDocument.mutateAsync({
        name: form.name || file.name,
        type: form.type,
        accessLevel: form.accessLevel,
        fileBase64: base64,
        mimeType: file.type,
        fileSize: file.size,
      });
    } catch (err) {
      // error handled by mutation
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getDocTypeInfo = (type: string) => DOC_TYPES.find((d) => d.value === type);
  const getAccessInfo = (level: string) => ACCESS_LEVELS.find((a) => a.value === level);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{language === "en" ? "Sign in Required" : "يجب تسجيل الدخول"}</h2>
            <a href={getLoginUrl()}><Button className="w-full mt-4">{language === "en" ? "Sign In" : "تسجيل الدخول"}</Button></a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      <div className="bg-white border-b border-border px-6 py-4">
        <h1 className="font-bold text-foreground">{language === "en" ? "Document Vault" : "خزينة المستندات"}</h1>
        <p className="text-muted-foreground text-sm">
          {language === "en" ? "Secure cloud storage for your venture documents" : "تخزين سحابي آمن لمستندات مشروعك"}
        </p>
      </div>

      <div className="container py-8 max-w-5xl space-y-6">
        {/* Security Notice */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm">
            {language === "en"
              ? "All documents are encrypted and stored securely. Access is controlled by the permission level you set for each document."
              : "جميع المستندات مشفرة ومخزنة بأمان. يتم التحكم في الوصول بواسطة مستوى الإذن الذي تحدده لكل مستند."}
          </p>
        </div>

        {/* Upload Section */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              {language === "en" ? "Upload Document" : "رفع مستند"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{language === "en" ? "Document Name *" : "اسم المستند *"}</Label>
                <Input
                  placeholder={language === "en" ? "e.g. Q1 2025 Pitch Deck" : "مثال: عرض تقديمي الربع الأول 2025"}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "en" ? "Document Type" : "نوع المستند"}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {language === "en" ? d.en : d.ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === "en" ? "Access Level" : "مستوى الوصول"}</Label>
                <Select value={form.accessLevel} onValueChange={(v) => setForm({ ...form, accessLevel: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCESS_LEVELS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {language === "en" ? a.en : a.ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !form.name}
                className="w-full sm:w-auto"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    {language === "en" ? "Uploading..." : "جاري الرفع..."}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {language === "en" ? "Choose File & Upload" : "اختر ملفاً وارفعه"}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {language === "en"
                  ? "Supported: PDF, Word, Excel, PowerPoint, Images. Max 16MB."
                  : "المدعوم: PDF، Word، Excel، PowerPoint، الصور. الحد الأقصى 16 ميجابايت."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">
              {language === "en" ? "My Documents" : "مستنداتي"}
              {myDocuments && (
                <span className="text-muted-foreground font-normal text-sm ml-2">({myDocuments.length})</span>
              )}
            </h2>
          </div>

          {!myDocuments || myDocuments.length === 0 ? (
            <Card className="border-dashed border-2 border-border">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  {language === "en" ? "No documents yet" : "لا توجد مستندات بعد"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {language === "en"
                    ? "Upload your pitch deck, business plan, or other venture documents to share with investors."
                    : "ارفع عرضك التقديمي أو خطة عملك أو مستندات مشروعك الأخرى لمشاركتها مع المستثمرين."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myDocuments.map((doc: any) => {
                const typeInfo = getDocTypeInfo(doc.type);
                const accessInfo = getAccessInfo(doc.accessLevel);
                const TypeIcon = typeInfo?.icon ?? FileText;
                const AccessIcon = accessInfo?.icon ?? Lock;

                return (
                  <Card key={doc.id} className="border border-border hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <TypeIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">{doc.name}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {language === "en" ? typeInfo?.en : typeInfo?.ar}
                            </span>
                            {doc.fileSize && (
                              <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={`text-xs flex items-center gap-1 ${accessInfo?.color ?? "bg-gray-100 text-gray-700"}`}>
                            <AccessIcon className="w-3 h-3" />
                            {language === "en" ? accessInfo?.en : accessInfo?.ar}
                          </Badge>
                          {doc.fileUrl && (
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => deleteDocument.mutate({ id: doc.id })}
                            disabled={deleteDocument.isPending}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Access Level Guide */}
        <Card className="border border-border bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              {language === "en" ? "Access Level Guide" : "دليل مستويات الوصول"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {ACCESS_LEVELS.map((level) => {
                const Icon = level.icon;
                return (
                  <div key={level.value} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg ${level.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-medium text-xs text-foreground">{language === "en" ? level.en : level.ar}</div>
                      <div className="text-xs text-muted-foreground">
                        {language === "en" ? (
                          level.value === "private" ? "Only you can see this document" :
                          level.value === "connected_only" ? "Visible to users you are connected with" :
                          level.value === "verified_investors" ? "Visible to verified investors on the platform" :
                          "Visible to all platform members"
                        ) : (
                          level.value === "private" ? "أنت فقط يمكنك رؤية هذا المستند" :
                          level.value === "connected_only" ? "مرئي للمستخدمين المتصلين بك" :
                          level.value === "verified_investors" ? "مرئي للمستثمرين الموثقين على المنصة" :
                          "مرئي لجميع أعضاء المنصة"
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
