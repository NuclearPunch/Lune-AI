import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, ArrowLeft } from "lucide-react";
import { useWebSocket } from "../hooks/use-websocket";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  senderId: string;
  messageType: "user" | "ai_suggestion" | "system";
  tone?: string;
  createdAt: string;
  isRead: boolean;
}

interface AISuggestion {
  message: string;
  rationale: string;
}

export default function Chat() {
  const [match, params] = useRoute("/chat/:conversationId?");
  const conversationId = params?.conversationId;
  const [inputMessage, setInputMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock current user ID
  const currentUserId = "temp-user-id";

  // WebSocket connection for real-time messaging
  const { sendMessage: sendWsMessage } = useWebSocket("/ws", {
    onMessage: (data: any) => {
      if (data.type === "new_message") {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", conversationId] });
      }
    }
  });

  // Fetch conversations if no specific conversation
  const { data: conversationsData } = useQuery({
    queryKey: ["/api/conversations", currentUserId],
    enabled: !conversationId,
    select: (data: any) => data.conversations
  });

  // Fetch messages for current conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/messages", conversationId],
    enabled: !!conversationId,
    select: (data: any) => data.messages as Message[]
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        conversationId,
        senderId: currentUserId,
        content,
        messageType: "user"
      });
      return response.json();
    },
    onSuccess: (data) => {
      setInputMessage("");
      setShowSuggestions(data.aiSuggestions?.length > 0);
      queryClient.invalidateQueries({ queryKey: ["/api/messages", conversationId] });
      
      // Send via WebSocket
      sendWsMessage({
        type: "send_message",
        conversationId,
        senderId: currentUserId,
        data: data.message
      });
    },
    onError: () => {
      toast({
        title: "메시지 전송 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  // Get AI suggestions mutation
  const getAISuggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/conversation-coach", {
        conversationId,
        userIntent: "continue conversation naturally"
      });
      return response.json();
    }
  });

  const messages = messagesData || [];
  const aiSuggestions = getAISuggestionsMutation.data?.suggestions || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      sendWsMessage({
        type: "join_conversation",
        conversationId,
        userId: currentUserId
      });
    }
  }, [conversationId, sendWsMessage]);

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !conversationId) return;
    sendMessageMutation.mutate(content);
  };

  const handleUseSuggestion = (suggestion: AISuggestion) => {
    setInputMessage(suggestion.message);
    setShowSuggestions(false);
  };

  // Mock data for demo
  const mockMessages: Message[] = [
    {
      id: "1",
      content: "안녕하세요! 프로필을 보니 사진에 관심이 많으시네요. 저도 취미로 사진을 찍고 있어요 ☺️",
      senderId: "other-user",
      messageType: "user",
      createdAt: "2024-01-01T14:34:00Z",
      isRead: true
    },
    {
      id: "2", 
      content: "안녕하세요! 네, 사진이 취미에요. 어떤 장르를 주로 찍으시나요?",
      senderId: currentUserId,
      messageType: "user",
      createdAt: "2024-01-01T14:36:00Z",
      isRead: true
    }
  ];

  const mockSuggestions: AISuggestion[] = [
    {
      message: "어떤 장르의 사진을 주로 찍으시나요? 저는 요즘 거리 사진에 빠져있어요!",
      rationale: "공통 관심사를 바탕으로 구체적인 질문을 통해 대화를 이어갈 수 있습니다."
    },
    {
      message: "최근에 찍은 작품 중 가장 마음에 드는 건 어떤 건가요?",
      rationale: "개인적인 경험을 공유하도록 유도하여 더 깊은 대화를 이끌어낼 수 있습니다."
    }
  ];

  // Show conversation list if no specific conversation
  if (!conversationId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">메시지</h1>
        
        <div className="space-y-3">
          {conversationsData?.map((conversation: any) => (
            <Card key={conversation.id} className="card-glass p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-lavender to-rose rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">지</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">지훈</h3>
                  <p className="text-moonlight/60 text-sm">안녕하세요! 프로필을 보니...</p>
                </div>
                <div className="text-moonlight/60 text-xs">오후 2:34</div>
              </div>
            </Card>
          )) || (
            <Card className="card-glass p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-lavender to-rose rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">지</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">지훈</h3>
                  <p className="text-moonlight/60 text-sm">안녕하세요! 프로필을 보니...</p>
                </div>
                <div className="text-moonlight/60 text-xs">오후 2:34</div>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="glass-effect border-b border-white/20 p-4 safe-top">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
          
          <div className="w-10 h-10 bg-gradient-to-r from-lavender to-rose rounded-full flex items-center justify-center">
            <span className="text-white font-bold">지</span>
          </div>
          
          <div>
            <h2 className="text-white font-semibold" data-testid="text-chat-partner">지훈</h2>
            <p className="text-moonlight/60 text-sm">온라인</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {(messages.length > 0 ? messages : mockMessages).map((message) => {
            const isOwnMessage = message.senderId === currentUserId;
            
            return (
              <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                {!isOwnMessage && (
                  <div className="w-8 h-8 bg-gradient-to-r from-lavender to-rose rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                    <span className="text-white font-bold text-sm">지</span>
                  </div>
                )}
                
                <div className={isOwnMessage ? "message-sent" : "message-received"}>
                  <p className="text-sm" data-testid={`message-${message.id}`}>
                    {message.content}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-60">
                      {new Date(message.createdAt).toLocaleTimeString("ko-KR", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI Coaching Suggestion */}
          {(showSuggestions || mockSuggestions.length > 0) && (
            <div className="message-ai-suggestion">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-lavender to-rose rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="text-white" size={12} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium mb-2">💡 AI 제안</p>
                  <p className="text-moonlight/80 text-sm mb-3">
                    공통 관심사를 발견했네요! 구체적인 사진 장르나 최근 찍은 작품에 대해 물어보시면 좋을 것 같아요.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-lavender text-sm font-medium">추천 메시지:</p>
                    {(aiSuggestions.length > 0 ? aiSuggestions : mockSuggestions).map((suggestion: AISuggestion, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleUseSuggestion(suggestion)}
                        className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 hover:border-lavender/50 transition-all duration-300 text-white text-sm"
                        data-testid={`suggestion-${index}`}
                      >
                        "{suggestion.message}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="glass-effect border-t border-white/20 p-4 safe-bottom">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
            placeholder="메시지를 입력하세요..."
            className="input-glass flex-1"
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
          />
          
          <Button
            onClick={() => handleSendMessage(inputMessage)}
            disabled={!inputMessage.trim() || sendMessageMutation.isPending}
            className="bg-gradient-to-r from-rose to-lavender p-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            data-testid="button-send"
          >
            <Send className="text-white" size={20} />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => getAISuggestionsMutation.mutate()}
            className="btn-secondary text-xs"
            disabled={getAISuggestionsMutation.isPending}
            data-testid="button-ai-help"
          >
            <Sparkles className="mr-1" size={12} />
            AI 도움
          </Button>
        </div>
      </div>
    </div>
  );
}
