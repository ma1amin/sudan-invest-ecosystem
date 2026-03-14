import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, TrendingUp } from "lucide-react";

export default function VentureEdit() {
  const { language, isRTL } = useLanguage();
  const [, navigate] = useLocation();
  const [ventureId, setVentureId] = useState<number | null>(null);
  
  // Parse venture ID from URL
  useEffect(() => {
    const path = window.location.pathname;
    const id = parseInt(path.split("/")[2]);
    if (!isNaN(id)) setVentureId(id);
  }, []);

  const { data: venture, isLoading: ventureLoading } = trpc.ventures.getById.useQuery(
    { id: ventureId! },
    { enabled: !!ventureId }
  );

  const { data: sectors } = trpc.sectors.list.useQuery();
  const updateVenture = trpc.ventures.update.useMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sectorId: "",
    stage: "idea",
    fundingTarget: "",
    teamSize: "",
    website: "",
    country: "",
    sudanRegion: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Populate form when venture loads
  useEffect(() => {
    if (venture) {
      setFormData({
        title: venture.title || "",
        description: venture.description || "",
        sectorId: String(venture.sectorId || ""),
        stage: (venture.stage as any) || "idea",
        fundingTarget: String(venture.fundingTarget || ""),
        teamSize: String(venture.teamSize || ""),
        website: venture.website || "",
        country: venture.country || "",
        sudanRegion: (venture as any).sudanRegion || "",
      });

    }
  }, [venture]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const handleSave = async () => {
    if (!ventureId) return;
    setIsSaving(true);
    try {
      await updateVenture.mutateAsync({
        id: ventureId,
        title: formData.title,
        description: formData.description,
        sectorId: parseInt(formData.sectorId),
        stage: formData.stage as any,
        fundingTarget: formData.fundingTarget,
        teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined,
        website: formData.website,
        country: formData.country,
        sudanRegion: formData.sudanRegion,
      });
      toast.success(language === "en" ? "Venture updated successfully" : "تم تحديث المشروع بنجاح");
      navigate(`/ventures/${ventureId}`);
    } catch (error) {
      toast.error(language === "en" ? "Failed to update venture" : "فشل تحديث المشروع");
    } finally {
      setIsSaving(false);
    }
  };

  if (ventureLoading) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-4">
            {language === "en" ? "Venture not found" : "المشروع غير موجود"}
          </p>
          <Button onClick={() => navigate("/ventures")} variant="outline">
            {language === "en" ? "Back to Ventures" : "العودة للمشاريع"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      <div className="container max-w-2xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/ventures/${ventureId}`)}
          className="mb-6"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
          {language === "en" ? "Back" : "رجوع"}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {language === "en" ? "Edit Venture" : "تعديل المشروع"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <Label>{language === "en" ? "Venture Title" : "اسم المشروع"}</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder={language === "en" ? "e.g., TechStart Sudan" : "مثال: TechStart Sudan"}
              />
            </div>

            {/* Description */}
            <div>
              <Label>{language === "en" ? "Description" : "الوصف"}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder={language === "en" ? "Describe your venture..." : "صف مشروعك..."}
                rows={4}
              />
            </div>

            {/* Sector */}
            <div>
              <Label>{language === "en" ? "Sector" : "القطاع"}</Label>
              <Select value={formData.sectorId} onValueChange={(v) => handleChange("sectorId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder={language === "en" ? "Select sector" : "اختر القطاع"} />
                </SelectTrigger>
                <SelectContent>
                  {sectors?.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {language === "en" ? s.name : (s.nameAr ?? s.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stage */}
            <div>
              <Label>{language === "en" ? "Stage" : "المرحلة"}</Label>
              <Select value={formData.stage} onValueChange={(v) => handleChange("stage", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">{language === "en" ? "Idea" : "فكرة"}</SelectItem>
                  <SelectItem value="prototype">{language === "en" ? "Prototype" : "نموذج أولي"}</SelectItem>
                  <SelectItem value="mvp">{language === "en" ? "MVP" : "MVP"}</SelectItem>
                  <SelectItem value="early_traction">{language === "en" ? "Early Traction" : "جذب أولي"}</SelectItem>
                  <SelectItem value="growth">{language === "en" ? "Growth" : "نمو"}</SelectItem>
                  <SelectItem value="scaling">{language === "en" ? "Scaling" : "توسع"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Funding Target */}
            <div>
              <Label>{language === "en" ? "Funding Target (USD)" : "هدف التمويل (دولار)"}</Label>
              <Input
                type="number"
                value={formData.fundingTarget}
                onChange={(e) => handleChange("fundingTarget", e.target.value)}
                placeholder="100000"
              />
            </div>

            {/* Team Size */}
            <div>
              <Label>{language === "en" ? "Team Size" : "حجم الفريق"}</Label>
              <Input
                type="number"
                value={formData.teamSize}
                onChange={(e) => handleChange("teamSize", e.target.value)}
                placeholder="5"
              />
            </div>

            {/* Sudan Region */}
            <div>
              <Label>{language === "en" ? "Sudan Region" : "منطقة السودان"}</Label>
              <Select value={formData.sudanRegion} onValueChange={(v) => handleChange("sudanRegion", v)}>
                <SelectTrigger>
                  <SelectValue placeholder={language === "en" ? "Select region" : "اختر المنطقة"} />
                </SelectTrigger>
                <SelectContent>
                  {["Khartoum", "Omdurman", "North Khartoum", "Gezira", "Kassala", "Red Sea", "River Nile", "Northern"].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Website */}
            <div>
              <Label>{language === "en" ? "Website (optional)" : "الموقع الإلكتروني (اختياري)"}</Label>
              <Input
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://example.com"
              />
            </div>



            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {language === "en" ? "Saving..." : "جاري الحفظ..."}
                  </>
                ) : (
                  language === "en" ? "Save Changes" : "حفظ التغييرات"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
