import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Star, X, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Match {
  id: string;
  user: {
    id: string;
    name: string;
    age: number;
    location: string;
    profilePicture?: string;
  };
  compatibilityScore: number;
  matchReasons: Array<{
    reason: string;
    score: number;
  }>;
  isLiked: boolean;
  isMatched: boolean;
}

export default function Matches() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  const { data: matchesData, isLoading } = useQuery({
    queryKey: ["/api/matches/temp-user-id"],
    select: (data: any) => data.matches as Match[]
  });

  const matches = matchesData || [];
  const currentMatch = matches[currentIndex];

  const handleLike = async () => {
    if (!currentMatch) return;

    try {
      // API call would go here
      toast({
        title: "관심 표현 완료!",
        description: "상대방도 관심을 표현하면 매칭됩니다."
      });
      
      setCurrentIndex(prev => Math.min(prev + 1, matches.length - 1));
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  const handlePass = () => {
    setCurrentIndex(prev => Math.min(prev + 1, matches.length - 1));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="card-glass animate-pulse">
          <div className="h-80 bg-white/10 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="p-6 text-center">
        <div className="card-glass">
          <div className="py-12">
            <Heart className="w-16 h-16 text-lavender mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              모든 추천을 확인했습니다
            </h2>
            <p className="text-moonlight/80">
              새로운 추천이 곧 업데이트됩니다!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">오늘의 추천</h1>
        <p className="text-moonlight/80">
          {currentIndex + 1} / {matches.length}
        </p>
      </div>

      {/* Match Card */}
      <Card className="card-glass">
        <div className="relative">
          {/* Profile Image */}
          <div className="aspect-square rounded-2xl overflow-hidden mb-4">
            <img
              src={currentMatch.user.profilePicture || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop`}
              alt={`${currentMatch.user.name}의 프로필`}
              className="w-full h-full object-cover"
              data-testid="img-match-profile"
            />
          </div>

          {/* Compatibility Score Badge */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-rose to-lavender px-4 py-2 rounded-full">
            <span className="text-white font-bold" data-testid="text-score">
              {currentMatch.compatibilityScore}%
            </span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white" data-testid="text-match-name">
              {currentMatch.user.name}
            </h2>
            <p className="text-moonlight/80" data-testid="text-match-info">
              {currentMatch.user.age}세, {currentMatch.user.location}
            </p>
          </div>

          {/* Compatibility Reasons */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Star className="text-lavender mr-2" size={20} />
              왜 추천하는가?
            </h3>
            
            <div className="space-y-2">
              {currentMatch.matchReasons?.map((reason, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-rose rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-moonlight/80 text-sm" data-testid={`text-reason-${index}`}>
                    {reason.reason}
                  </p>
                </div>
              )) || (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-rose rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-moonlight/80 text-sm">
                      깊은 대화를 좋아하는 성향이 비슷해요
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-lavender rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-moonlight/80 text-sm">
                      새로운 경험에 대한 열정이 잘 맞아요
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePass}
            className="w-16 h-16 rounded-full bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300"
            data-testid="button-pass"
          >
            <X className="text-white" size={24} />
          </Button>
          
          <Button
            onClick={handleLike}
            className="btn-primary flex-1 text-lg"
            data-testid="button-like"
          >
            <Heart className="mr-2" size={20} />
            관심 표현
          </Button>
          
          {currentMatch.isMatched && (
            <Button
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full bg-lavender/20 border-lavender/50 hover:bg-lavender/30 transition-all duration-300"
              data-testid="button-message"
            >
              <MessageCircle className="text-lavender" size={24} />
            </Button>
          )}
        </div>
      </Card>

      {/* Navigation Dots */}
      <div className="flex justify-center space-x-2">
        {matches.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-lavender w-6" : "bg-white/30"
            }`}
            data-testid={`dot-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
