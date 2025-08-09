import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Heart, Star } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  // Check if user needs onboarding
  useEffect(() => {
    const isOnboardingComplete = localStorage.getItem("onboarding_complete");
    if (!isOnboardingComplete) {
      setLocation("/onboarding");
    }
  }, [setLocation]);

  const mockUser = {
    name: "지훈",
    age: 28,
    location: "서울",
    compatibilityScore: 92,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&h=150&fit=crop"
  };

  return (
    <div className="p-6 space-y-6">
      {/* AI Persona Introduction */}
      <section className="text-center">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="w-full h-full bg-gradient-to-br from-lavender to-rose rounded-full animate-glow flex items-center justify-center">
              <Sparkles className="text-white text-4xl" size={48} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-cream rounded-full flex items-center justify-center">
              <Heart className="text-rose text-sm" size={16} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">LUNE과 함께하세요</h1>
          <p className="text-moonlight/80 text-lg leading-relaxed mb-6">
            당신의 마음 속 새로운 감정을 밝혀주는<br />
            AI 연애 가이드입니다
          </p>
        </div>
      </section>

      {/* Today's Recommendation */}
      <section>
        <Card className="card-glass">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Sparkles className="text-lavender mr-3" size={24} />
            오늘의 추천
          </h2>
          
          {/* Match Card */}
          <div className="bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-1 mb-4">
            <div className="bg-gradient-to-br from-white/10 to-transparent rounded-2xl p-5">
              <div className="flex items-start space-x-4">
                <img 
                  src={mockUser.profileImage}
                  alt="Profile photo" 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30"
                  data-testid="img-profile"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white" data-testid="text-name">
                      {mockUser.name}
                    </h3>
                    <div className="bg-gradient-to-r from-rose to-lavender px-3 py-1 rounded-full">
                      <span className="text-white font-bold text-sm" data-testid="text-compatibility">
                        {mockUser.compatibilityScore}%
                      </span>
                    </div>
                  </div>
                  <p className="text-moonlight/80 text-sm mb-3" data-testid="text-age-location">
                    {mockUser.age}세, {mockUser.location}
                  </p>
                  
                  {/* Compatibility Reasons */}
                  <div className="space-y-2">
                    <div className="flex items-center text-lavender text-sm">
                      <Heart className="mr-2" size={16} />
                      <span>깊은 대화를 좋아하는 성향이 비슷해요</span>
                    </div>
                    <div className="flex items-center text-lavender text-sm">
                      <Star className="mr-2" size={16} />
                      <span>새로운 경험에 대한 열정이 잘 맞아요</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 mt-4">
                <Button 
                  className="btn-primary flex-1"
                  data-testid="button-like"
                  onClick={() => setLocation("/matches")}
                >
                  <Heart className="mr-2" size={16} />
                  관심 표현
                </Button>
                <Button 
                  variant="ghost"
                  className="px-4 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-300"
                  data-testid="button-pass"
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Emotional Growth Tracking Preview */}
      <section>
        <Card className="card-glass">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Sparkles className="text-lavender mr-3" size={24} />
            감정 성장 추적
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-br from-rose/20 to-rose/10 rounded-2xl p-4 text-center">
              <div className="text-rose text-2xl mb-2">😊</div>
              <p className="text-white font-bold text-xl" data-testid="text-happiness">87%</p>
              <p className="text-moonlight/80 text-sm">행복 지수</p>
            </div>
            <div className="bg-gradient-to-br from-lavender/20 to-lavender/10 rounded-2xl p-4 text-center">
              <div className="text-lavender text-2xl mb-2">💜</div>
              <p className="text-white font-bold text-xl" data-testid="text-connection">72%</p>
              <p className="text-moonlight/80 text-sm">연결 깊이</p>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full btn-secondary"
            data-testid="button-view-insights"
          >
            더 자세한 인사이트 보기
          </Button>
        </Card>
      </section>
    </div>
  );
}
