import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Camera, 
  Pen, 
  Shield, 
  TrendingUp, 
  Heart, 
  Star,
  ChartLine,
  Settings,
  Ban,
  AlertTriangle,
  UserX,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProfileData {
  user: {
    id: string;
    name: string;
    age: number;
    location: string;
    bio?: string;
    profilePicture?: string;
    profileCompletion: number;
  };
  profile: {
    photos: string[];
    interests: string[];
    values: string[];
    lookingFor?: string;
    aiSummary?: string;
  };
}

interface EmotionalMetrics {
  happiness: number;
  connection: number;
  communication: number;
  chemistry: number;
}

interface FeedbackData {
  id: string;
  dateExperience: EmotionalMetrics;
  feedback: string;
  growthRecommendations: string[];
  createdAt: string;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock current user ID
  const currentUserId = "temp-user-id";

  // Fetch user profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/user", currentUserId],
    select: (data: any) => data as ProfileData
  });

  // Fetch emotional feedback
  const { data: feedbackData } = useQuery({
    queryKey: ["/api/feedback", currentUserId],
    select: (data: any) => data.feedback as FeedbackData[]
  });

  // Get AI profile suggestions
  const getProfileSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/profile-suggestions", {
        userId: currentUserId
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "프로필 개선 제안 업데이트",
        description: "AI가 새로운 개선 사항을 분석했습니다."
      });
    }
  });

  // Report user mutation
  const reportUserMutation = useMutation({
    mutationFn: async (reportData: { reportedUserId: string; reportType: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/reports", {
        reporterId: currentUserId,
        ...reportData
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "신고가 접수되었습니다",
        description: "검토 후 적절한 조치를 취하겠습니다."
      });
    }
  });

  // Mock data for demo
  const mockProfile: ProfileData = {
    user: {
      id: currentUserId,
      name: "김서현",
      age: 26,
      location: "서울",
      bio: "새로운 경험과 깊은 대화를 좋아하는 사람입니다. 함께 성장할 수 있는 관계를 찾고 있어요.",
      profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=300&h=300&fit=crop",
      profileCompletion: 85
    },
    profile: {
      photos: [
        "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=300&h=300&fit=crop",
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop"
      ],
      interests: ["사진", "여행", "독서", "요리", "하이킹"],
      values: ["정직함과 신뢰", "성장과 발전", "자유와 독립"],
      lookingFor: "서로를 존중하고 함께 성장할 수 있는 진정한 파트너",
      aiSummary: "깊은 대화와 새로운 경험을 추구하는 열정적인 사람"
    }
  };

  const mockFeedback: FeedbackData[] = [
    {
      id: "1",
      dateExperience: {
        happiness: 87,
        connection: 72,
        communication: 85,
        chemistry: 68
      },
      feedback: "자연스럽고 편안한 대화를 나누셨네요. 상대방도 긍정적인 반응을 보였습니다.",
      growthRecommendations: [
        "다음에는 더 개인적인 이야기를 나누어 보세요",
        "상대방의 감정을 더 깊이 이해하는 연습을 해보세요"
      ],
      createdAt: "2024-01-01T10:00:00Z"
    }
  ];

  const profile = profileData || mockProfile;
  const feedback = feedbackData || mockFeedback;
  const suggestions = getProfileSuggestionsMutation.data?.suggestions || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="card-glass animate-shimmer h-32"></div>
          <div className="card-glass animate-shimmer h-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <Card className="card-glass">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={profile.user.profilePicture}
              alt="프로필 사진"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30"
              data-testid="img-profile-picture"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-lavender rounded-full hover:bg-lavender/80"
              data-testid="button-edit-photo"
            >
              <Camera className="w-4 h-4 text-white" />
            </Button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-white" data-testid="text-profile-name">
                {profile.user.name}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                className="text-lavender hover:text-white"
                data-testid="button-edit-profile"
              >
                <Pen className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-moonlight/80 text-sm mb-3" data-testid="text-profile-info">
              {profile.user.age}세, {profile.user.location}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-white font-medium text-sm">프로필 완성도</span>
              <span className="text-lavender font-bold" data-testid="text-completion-score">
                {profile.user.profileCompletion}%
              </span>
            </div>
            <Progress value={profile.user.profileCompletion} className="h-2 mt-2" />
          </div>
        </div>

        {profile.user.bio && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-moonlight/80 text-sm" data-testid="text-profile-bio">
              {profile.user.bio}
            </p>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-lavender">
            개요
          </TabsTrigger>
          <TabsTrigger value="growth" className="text-white data-[state=active]:bg-lavender">
            성장
          </TabsTrigger>
          <TabsTrigger value="optimize" className="text-white data-[state=active]:bg-lavender">
            최적화
          </TabsTrigger>
          <TabsTrigger value="safety" className="text-white data-[state=active]:bg-lavender">
            안전
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="card-glass">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="text-lavender mr-2" size={20} />
              프로필 정보
            </h3>
            
            <div className="space-y-4">
              {/* Interests */}
              <div>
                <p className="text-white font-medium mb-2">관심사</p>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.interests.map((interest, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-lavender/20 text-lavender border-lavender/30"
                      data-testid={`badge-interest-${index}`}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Values */}
              <div>
                <p className="text-white font-medium mb-2">가치관</p>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.values.map((value, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="border-rose/50 text-rose"
                      data-testid={`badge-value-${index}`}
                    >
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Looking For */}
              {profile.profile.lookingFor && (
                <div>
                  <p className="text-white font-medium mb-2">원하는 관계</p>
                  <p className="text-moonlight/80 text-sm" data-testid="text-looking-for">
                    {profile.profile.lookingFor}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Growth Tab */}
        <TabsContent value="growth" className="space-y-4">
          <Card className="card-glass">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ChartLine className="text-lavender mr-2" size={20} />
              감정 성장 추적
            </h3>
            
            {/* Current Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-rose/20 to-rose/10 rounded-2xl p-4 text-center">
                <div className="text-rose text-2xl mb-2">😊</div>
                <p className="text-white font-bold text-xl" data-testid="text-happiness-score">
                  {feedback[0]?.dateExperience.happiness || 87}%
                </p>
                <p className="text-moonlight/80 text-sm">행복 지수</p>
              </div>
              <div className="bg-gradient-to-br from-lavender/20 to-lavender/10 rounded-2xl p-4 text-center">
                <div className="text-lavender text-2xl mb-2">💜</div>
                <p className="text-white font-bold text-xl" data-testid="text-connection-score">
                  {feedback[0]?.dateExperience.connection || 72}%
                </p>
                <p className="text-moonlight/80 text-sm">연결 깊이</p>
              </div>
            </div>

            {/* Recent Feedback */}
            {feedback.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-white font-semibold flex items-center">
                  <TrendingUp className="text-lavender mr-2" size={16} />
                  최근 피드백
                </h4>
                
                {feedback.map((item, index) => (
                  <div key={item.id} className="bg-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lavender font-medium text-sm">
                        만남 {index + 1}
                      </span>
                      <span className="text-moonlight/60 text-xs">
                        {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    
                    <p className="text-moonlight/80 text-sm mb-3" data-testid={`text-feedback-${index}`}>
                      {item.feedback}
                    </p>
                    
                    {item.growthRecommendations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-white font-medium text-sm">성장 제안:</p>
                        {item.growthRecommendations.map((recommendation, recIndex) => (
                          <div key={recIndex} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-moonlight/80 text-sm" data-testid={`text-recommendation-${index}-${recIndex}`}>
                              {recommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Optimize Tab */}
        <TabsContent value="optimize" className="space-y-4">
          <Card className="card-glass">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Settings className="text-lavender mr-2" size={20} />
                프로필 최적화
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => getProfileSuggestionsMutation.mutate()}
                disabled={getProfileSuggestionsMutation.isPending}
                className="btn-secondary text-xs"
                data-testid="button-refresh-suggestions"
              >
                새로고침
              </Button>
            </div>

            {/* AI Suggestions */}
            <div className="space-y-3">
              {suggestions.length > 0 ? suggestions.map((suggestion: string, index: number) => (
                <div key={index} className="bg-white/10 rounded-2xl p-4 border-l-4 border-rose">
                  <div className="flex items-start space-x-3">
                    <Camera className="text-rose mt-1" size={16} />
                    <div>
                      <p className="text-white font-medium text-sm mb-1">AI 제안</p>
                      <p className="text-moonlight/80 text-sm" data-testid={`text-suggestion-${index}`}>
                        {suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <>
                  <div className="bg-white/10 rounded-2xl p-4 border-l-4 border-rose">
                    <div className="flex items-start space-x-3">
                      <Camera className="text-rose mt-1" size={16} />
                      <div>
                        <p className="text-white font-medium text-sm mb-1">사진 추가 제안</p>
                        <p className="text-moonlight/80 text-sm">
                          취미 활동 중인 모습이나 자연스러운 미소를 담은 사진을 추가해보세요.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-2xl p-4 border-l-4 border-lavender">
                    <div className="flex items-start space-x-3">
                      <Pen className="text-lavender mt-1" size={16} />
                      <div>
                        <p className="text-white font-medium text-sm mb-1">자기소개 개선</p>
                        <p className="text-moonlight/80 text-sm">
                          구체적인 관심사와 어떤 사람과 만나고 싶은지 추가하면 더 좋을 것 같아요.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button className="btn-primary w-full mt-4" data-testid="button-apply-suggestions">
              제안 적용하기
            </Button>
          </Card>
        </TabsContent>

        {/* Safety Tab */}
        <TabsContent value="safety" className="space-y-4">
          <Card className="card-glass">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="text-rose mr-2" size={20} />
              안전 및 신고
            </h3>
            
            {/* Safety Tips */}
            <div className="bg-gradient-to-r from-rose/20 to-lavender/20 rounded-2xl p-4 mb-6">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <Info className="text-lavender mr-2" size={16} />
                안전 수칙
              </h4>
              <ul className="text-moonlight/80 text-sm space-y-1">
                <li>• 첫 만남은 공공장소에서 진행하세요</li>
                <li>• 개인정보는 충분히 알고 난 후 공유하세요</li>
                <li>• 불편하다면 언제든 대화를 중단할 수 있어요</li>
              </ul>
            </div>
            
            {/* Report Options */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">문제 신고</h4>
              
              <Button
                variant="outline"
                className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 hover:border-rose/50 transition-all duration-300 text-white"
                onClick={() => reportUserMutation.mutate({
                  reportedUserId: "example-user",
                  reportType: "spam",
                  description: "스팸 메시지 신고"
                })}
                data-testid="button-report-spam"
              >
                <Ban className="text-rose mr-3" size={16} />
                스팸 신고
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 hover:border-rose/50 transition-all duration-300 text-white"
                onClick={() => reportUserMutation.mutate({
                  reportedUserId: "example-user",
                  reportType: "inappropriate",
                  description: "부적절한 행동 신고"
                })}
                data-testid="button-report-inappropriate"
              >
                <AlertTriangle className="text-rose mr-3" size={16} />
                부적절한 행동 신고
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start bg-white/10 hover:bg-white/20 border-white/20 hover:border-rose/50 transition-all duration-300 text-white"
                data-testid="button-block-user"
              >
                <UserX className="text-rose mr-3" size={16} />
                사용자 차단
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
