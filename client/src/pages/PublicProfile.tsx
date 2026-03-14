import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, CheckCircle, AlertCircle, Globe, MessageSquare, MapPin, Users, TrendingUp, Shield, Award } from "lucide-react";

export default function PublicProfile() {
  const { language, isRTL } = useLanguage();
  const { user: currentUser } = useAuth();
  const [, navigate] = useLocation() as any;
  const params = useParams<{ userId: string }>();
  const userId = Number(params.userId);

  const { data: user, isLoading: userLoading } = trpc.user.getById.useQuery(
    { id: userId },
    { enabled: !!userId }
  );

  // Fetch ventures for this founder using myVentures (requires auth context)
  // For public profile, we'll show published ventures only
  const { data: ventures } = trpc.ventures.published.useQuery(
    { limit: 100, offset: 0 },
    { enabled: !!userId }
  );

  const { data: sectors } = trpc.sectors.list.useQuery();

  const requestConnection = trpc.connections.request.useMutation({
    onSuccess: () => toast.success(language === "en" ? "Connection request sent!" : "تم إرسال طلب التواصل!"),
    onError: (e) => toast.error(e.message),
  });

  const getSectorName = (id: number | null) => {
    if (!id) return null;
    const sector = sectors?.find((s) => s.id === id);
    return sector ? (language === "en" ? sector.name : (sector.nameAr ?? sector.name)) : null;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      founder: "bg-blue-100 text-blue-800",
      investor: "bg-green-100 text-green-800",
      mentor: "bg-purple-100 text-purple-800",
      diaspora: "bg-orange-100 text-orange-800",
      admin: "bg-red-100 text-red-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getVerificationBadge = (status: string) => {
    if (status === "verified") {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-medium">{language === "en" ? "Verified" : "موثق"}</span>
        </div>
      );
    }
    if (status === "pending") {
      return (
        <div className="flex items-center gap-1 text-yellow-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-medium">{language === "en" ? "Pending" : "قيد الانتظار"}</span>
        </div>
      );
    }
    return null;
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-bold text-foreground mb-2">{language === "en" ? "User not found" : "المستخدم غير موجود"}</h2>
          <Button onClick={() => navigate("/ventures")}>{language === "en" ? "Back to Ventures" : "العودة إلى المشاريع"}</Button>
        </div>
      </div>
    );
  }

  const profileData = user.profileData as any || {};
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className={isRTL ? "ml-auto" : ""}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-bold text-foreground">{user.name || "User"}</h1>
            <p className="text-muted-foreground text-sm">{profileData.bio || ""}</p>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-4xl space-y-6">
        {/* Profile Card */}
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Role & Verification */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={`capitalize ${getRoleBadgeColor(user.platformRole)}`}>
                  {user.platformRole}
                </Badge>
                {getVerificationBadge(user.verificationStatus)}
                {user.platformRole === "investor" && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {language === "en" ? "Investor" : "مستثمر"}
                  </Badge>
                )}
                {user.platformRole === "mentor" && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {language === "en" ? "Mentor" : "مرشد"}
                  </Badge>
                )}
              </div>

              {/* Bio */}
              {profileData.bio && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{language === "en" ? "About" : "حول"}</h3>
                  <p className="text-foreground leading-relaxed">{profileData.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2">
                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{language === "en" ? "Email:" : "البريد الإلكتروني:"}</span>
                    <a href={`mailto:${user.email}`} className="text-primary hover:underline">
                      {user.email}
                    </a>
                  </div>
                )}
                {profileData.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {profileData.location}
                  </div>
                )}
                {profileData.linkedIn && (
                  <div className="flex items-center gap-2 text-sm">
                    <a
                      href={profileData.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-4 h-4" />
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && currentUser && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => requestConnection.mutate({ receiverId: user.id })}
                    disabled={requestConnection.isPending}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {language === "en" ? "Connect" : "تواصل"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Ventures (for Founders) */}
        {user.platformRole === "founder" && ventures && ventures.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {language === "en" ? "Ventures" : "المشاريع"}
            </h2>
            <div className="grid gap-4">
              {ventures?.filter((v: any) => v.founderId === userId).map((venture: any) => (
                <Card
                  key={venture.id}
                  className="border border-border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/ventures/${venture.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{venture.title}</h3>
                        {venture.tagline && (
                          <p className="text-muted-foreground text-sm">{venture.tagline}</p>
                        )}
                      </div>

                      <p className="text-foreground text-sm line-clamp-2">{venture.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {venture.stage && (
                          <Badge variant="outline" className="capitalize">
                            {venture.stage.replace("_", " ")}
                          </Badge>
                        )}
                        {getSectorName(venture.sectorId) && (
                          <Badge variant="outline">{getSectorName(venture.sectorId)}</Badge>
                        )}
                        {venture.aiReadinessScore && (
                          <Badge className="bg-blue-100 text-blue-800">
                            {language === "en" ? "Score:" : "النقاط:"} {venture.aiReadinessScore}/100
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
                        {venture.country && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {venture.country}
                          </span>
                        )}
                        {venture.teamSize && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {venture.teamSize} {language === "en" ? "team" : "فريق"}
                          </span>
                        )}
                        {venture.fundingTarget && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            ${Number(venture.fundingTarget).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Ventures Message */}
        {user.platformRole === "founder" && (!ventures || ventures.length === 0) && (
          <Card className="border border-dashed border-border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {language === "en" ? "No ventures published yet" : "لم يتم نشر أي مشاريع حتى الآن"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Investor Focus Areas */}
        {user.platformRole === "investor" && profileData.sectorFocus && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>{language === "en" ? "Investment Focus" : "نطاق الاستثمار"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(profileData.sectorFocus) &&
                  profileData.sectorFocus.map((sectorId: number) => {
                    const sectorName = getSectorName(sectorId);
                    return sectorName ? (
                      <Badge key={sectorId} variant="outline">
                        {sectorName}
                      </Badge>
                    ) : null;
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mentor Expertise */}
        {user.platformRole === "mentor" && profileData.expertise && (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>{language === "en" ? "Expertise" : "الخبرة"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(profileData.expertise) &&
                  profileData.expertise.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {skill}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
