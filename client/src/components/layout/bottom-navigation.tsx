import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Heart, MessageCircle, User } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "홈", testId: "nav-home" },
    { path: "/matches", icon: Heart, label: "매칭", testId: "nav-matches" },
    { path: "/chat", icon: MessageCircle, label: "메시지", testId: "nav-messages" },
    { path: "/profile", icon: User, label: "프로필", testId: "nav-profile" },
  ];

  const unreadCount = 3; // This would come from actual state

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-white/20 safe-bottom">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center space-y-1 relative ${
                  isActive ? "text-lavender" : "text-white/60 hover:text-lavender"
                } transition-colors`}
                data-testid={item.testId}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
                
                {/* Unread badge for messages */}
                {item.path === "/chat" && unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold" data-testid="text-unread-count">
                      {unreadCount}
                    </span>
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
