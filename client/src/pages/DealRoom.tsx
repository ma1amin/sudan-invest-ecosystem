import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, FileText, MessageSquare, Upload, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DealRoom() {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const params = useParams();
  const [, navigate] = useLocation() as any;
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);

  const roomId = params.id ? parseInt(params.id) : null;

  const { data: room } = trpc.dealRoom.getRoom.useQuery(
    { id: roomId! },
    { enabled: !!roomId }
  );

  const { data: documents } = trpc.dealRoom.getDocuments.useQuery(
    { dealRoomId: roomId! },
    { enabled: !!roomId }
  );

  const { data: discussions } = trpc.dealRoom.getDiscussions.useQuery(
    { dealRoomId: roomId!, limit: 50 },
    { enabled: !!roomId }
  );

  const createDiscussion = trpc.dealRoom.createDiscussion.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Discussion created" : "تم إنشاء النقاش");
      setShowNewDiscussion(false);
    },
  });

  if (!room) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">
          {language === "en" ? "Loading..." : "جاري التحميل..."}
        </p>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-foreground">{room.title}</h1>
            <p className="text-muted-foreground">{room.description}</p>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-6xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Discussions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  {language === "en" ? "Discussions" : "النقاشات"}
                </h2>
                <Button
                  onClick={() => setShowNewDiscussion(!showNewDiscussion)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {language === "en" ? "New" : "جديد"}
                </Button>
              </div>

              {showNewDiscussion && (
                <Card className="border border-border">
                  <CardContent className="pt-6">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        createDiscussion.mutate({
                          dealRoomId: roomId!,
                          title: formData.get("title") as string,
                          content: formData.get("content") as string,
                        });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <input
                          type="text"
                          name="title"
                          placeholder={language === "en" ? "Discussion title" : "عنوان النقاش"}
                          required
                          className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background"
                        />
                      </div>
                      <div>
                        <textarea
                          name="content"
                          placeholder={language === "en" ? "Your message..." : "رسالتك..."}
                          rows={4}
                          required
                          className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewDiscussion(false)}
                        >
                          {language === "en" ? "Cancel" : "إلغاء"}
                        </Button>
                        <Button type="submit" disabled={createDiscussion.isPending}>
                          {createDiscussion.isPending
                            ? language === "en"
                              ? "Posting..."
                              : "جاري الإرسال..."
                            : language === "en"
                            ? "Post"
                            : "إرسال"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {discussions && discussions.length > 0 ? (
                <div className="space-y-4">
                  {discussions.map((discussion: any) => (
                    <Card key={discussion.id} className="border border-border">
                      <CardContent className="pt-6">
                        <p className="font-semibold text-foreground mb-2">
                          {discussion.title}
                        </p>
                        <p className="text-sm text-foreground mb-3">
                          {discussion.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {language === "en" ? "Replies" : "الردود"}: {discussion.replyCount || 0}
                          </span>
                          <span>
                            {format(new Date(discussion.createdAt), "MMM d, yyyy HH:mm")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border border-border p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === "en"
                      ? "No discussions yet. Start the conversation!"
                      : "لا توجد نقاشات حتى الآن. ابدأ المحادثة!"}
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {language === "en" ? "Documents" : "المستندات"}
              </h3>

              {documents && documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc: any) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border border-border rounded-md hover:bg-muted transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.documentType}
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <Card className="border border-border p-4 text-center">
                  <FileText className="w-8 h-8 text-muted-foreground opacity-50 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {language === "en"
                      ? "No documents yet"
                      : "لا توجد مستندات حتى الآن"}
                  </p>
                </Card>
              )}
            </div>

            {/* Room Info */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-base">
                  {language === "en" ? "Room Info" : "معلومات الغرفة"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    {language === "en" ? "Status" : "الحالة"}
                  </p>
                  <p className="font-medium text-foreground">{room.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {language === "en" ? "Access Level" : "مستوى الوصول"}
                  </p>
                  <p className="font-medium text-foreground">{room.accessLevel}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
