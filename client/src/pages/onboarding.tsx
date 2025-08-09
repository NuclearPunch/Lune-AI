import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Heart, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OnboardingQuestion {
  id: string;
  question: string;
  options: string[];
  type: "single" | "multiple";
}

const questions: OnboardingQuestion[] = [
  {
    id: "happiness",
    question: "어떤 순간에 가장 행복함을 느끼시나요?",
    options: [
      "새로운 사람과 깊은 대화를 나눌 때",
      "혼자만의 시간을 보낼 때", 
      "새로운 경험에 도전할 때",
      "가족이나 친구들과 함께할 때"
    ],
    type: "single"
  },
  {
    id: "communication",
    question: "당신의 대화 스타일은?",
    options: [
      "진솔하고 깊이 있는 대화를 선호",
      "유머러스하고 재미있는 대화를 선호",
      "논리적이고 체계적인 대화를 선호",
      "감정적이고 공감적인 대화를 선호"
    ],
    type: "single"
  },
  {
    id: "interests", 
    question: "관심 있는 활동들을 선택해주세요",
    options: [
      "사진/예술",
      "여행/탐험",
      "운동/헬스",
      "독서/학습",
      "음악/영화",
      "요리/맛집",
      "게임/기술",
      "자연/하이킹"
    ],
    type: "multiple"
  },
  {
    id: "values",
    question: "중요하게 생각하는 가치관은?",
    options: [
      "정직함과 신뢰",
      "열정과 모험",
      "안정과 평화",
      "성장과 발전",
      "자유와 독립",
      "가족과 전통"
    ],
    type: "multiple"
  },
  {
    id: "relationship",
    question: "어떤 관계를 원하시나요?",
    options: [
      "진정한 사랑과 평생 파트너",
      "즐거운 만남과 좋은 친구",
      "서로 성장하는 동반자",
      "자유롭고 편안한 관계"
    ],
    type: "single"
  }
];

export default function Onboarding() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    const questionId = currentQ.id;
    
    if (currentQ.type === "single") {
      setAnswers(prev => ({ ...prev, [questionId]: [answer] }));
    } else {
      setAnswers(prev => {
        const existing = prev[questionId] || [];
        const updated = existing.includes(answer)
          ? existing.filter(a => a !== answer)
          : [...existing, answer];
        return { ...prev, [questionId]: updated };
      });
    }
  };

  const handleNext = () => {
    const questionId = currentQ.id;
    const currentAnswers = answers[questionId] || [];
    
    if (currentAnswers.length === 0) {
      toast({
        title: "답변을 선택해주세요",
        description: "계속하려면 최소 하나의 답변을 선택해야 합니다.",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitOnboarding();
    }
  };

  const submitOnboarding = async () => {
    setIsSubmitting(true);
    
    try {
      const onboardingData = {
        happinessTriggers: answers.happiness || [],
        communicationStyle: answers.communication?.[0] || "",
        relationshipGoals: answers.relationship?.[0] || "",
        interests: answers.interests || [],
        values: answers.values || [],
        lookingFor: `${answers.relationship?.[0] || ""} - ${answers.communication?.[0] || ""}`
      };

      const userId = "82d41cc4-626d-469a-8098-40326681948e"; // Using existing user for demo
      await apiRequest("POST", `/api/onboarding/${userId}`, onboardingData);
      
      localStorage.setItem("onboarding_complete", "true");
      toast({
        title: "온보딩 완료!",
        description: "프로필이 성공적으로 생성되었습니다."
      });
      
      setLocation("/");
    } catch (error: any) {
      console.error("Onboarding submission error:", error);
      toast({
        title: "오류가 발생했습니다",
        description: error.response?.data?.message || "다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 text-center">
        <div className="w-24 h-24 mx-auto mb-4">
          <div className="w-full h-full bg-gradient-to-br from-lavender to-rose rounded-full animate-glow flex items-center justify-center">
            <Sparkles className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">프로필 생성</h1>
        <p className="text-moonlight/80">당신에 대해 알려주세요</p>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-lavender font-medium">
            질문 {currentQuestion + 1}/{questions.length}
          </span>
          <span className="text-sm text-moonlight/60">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <div className="flex-1 px-6">
        <Card className="card-glass">
          <div className="py-4">
            <h2 className="text-xl text-white font-semibold mb-6">
              {currentQ.question}
            </h2>
            
            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                const isSelected = (answers[currentQ.id] || []).includes(option);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 text-white group ${
                      isSelected 
                        ? "bg-gradient-to-r from-lavender/30 to-rose/30 border-lavender/50" 
                        : "bg-white/10 hover:bg-white/20 border-white/20 hover:border-lavender/50"
                    }`}
                    data-testid={`option-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      <ChevronRight 
                        className={`text-lavender transition-opacity ${
                          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`} 
                        size={20}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="p-6">
        <div className="flex space-x-3">
          {currentQuestion > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="btn-secondary"
              data-testid="button-previous"
            >
              이전
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="btn-primary flex-1"
            data-testid="button-next"
          >
            {isSubmitting ? (
              "처리 중..."
            ) : currentQuestion === questions.length - 1 ? (
              <>
                <Heart className="mr-2" size={16} />
                완료
              </>
            ) : (
              "다음"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
