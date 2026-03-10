import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation, useParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Send, MessageSquare, Shield, Search, Inbox } from "lucide-react";

export default function Messages() {
  const { user, isAuthenticated, loading } = useAuth();
  const { language, isRTL } = useLanguage();
  const [, navigate] = useLocation();
  const params = useParams<{ userId?: string }>();
  const otherUserId = params.userId ? Number(params.userId) : null;
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = trpc.messages.conversations.useQuery(undefined, { enabled: isAuthenticated });
  const { data: conversation, refetch: refetchConversation } = trpc.messages.conversation.useQuery(
    { otherUserId: otherUserId! },
    { enabled: isAuthenticated && !!otherUserId, refetchInterval: 5000 }
  );
  const { data: otherUser } = trpc.user.getById.useQuery(
    { id: otherUserId! },
    { enabled: !!otherUserId }
  );

  const sendMessage = trpc.messages.send.useMutation({
    onSuccess: () => {
      setNewMessage("");
      refetchConversation();
    },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <a href={getLoginUrl()}><Button className="w-full">{language === "en" ? "Sign In" : "تسجيل الدخول"}</Button></a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUserId) return;
    sendMessage.mutate({ receiverId: otherUserId, content: newMessage.trim() });
  };

  // Get unique conversations
  const uniqueConversations = conversations?.reduce((acc: any[], msg: any) => {
    const otherId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
    if (!acc.find((c) => c.otherId === otherId)) {
      acc.push({ ...msg, otherId });
    }
    return acc;
  }, []) ?? [];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-[calc(100vh-3.5rem)] bg-muted/30">
      <div className="container py-6 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-4 h-[600px]">
          {/* Conversations List */}
          <div className="bg-white rounded-xl border border-border overflow-y-auto">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-sm text-foreground">{language === "en" ? "Conversations" : "المحادثات"}</h2>
            </div>
            {uniqueConversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">{language === "en" ? "No conversations yet" : "لا توجد محادثات بعد"}</p>
              </div>
            ) : (
              uniqueConversations.map((conv: any) => (
                <button
                  key={conv.otherId}
                  onClick={() => navigate(`/messages/${conv.otherId}`)}
                  className={`w-full p-4 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${otherUserId === conv.otherId ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-sm">U</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-foreground">User #{conv.otherId}</div>
                      <div className="text-xs text-muted-foreground truncate">{conv.content}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 bg-white rounded-xl border border-border flex flex-col">
            {!otherUserId ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{language === "en" ? "Select a conversation" : "اختر محادثة"}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">{otherUser?.name?.charAt(0)?.toUpperCase() ?? "U"}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{otherUser?.name ?? `User #${otherUserId}`}</div>
                      <div className="text-xs text-muted-foreground capitalize">{(otherUser as any)?.platformRole ?? ""}</div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {conversation?.map((msg: any) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? (isRTL ? "justify-start" : "justify-end") : (isRTL ? "justify-end" : "justify-start")}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                          {msg.content}
                          <div className={`text-xs mt-1 opacity-70`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-3">
                  <Input
                    placeholder={language === "en" ? "Type a message..." : "اكتب رسالة..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim() || sendMessage.isPending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
