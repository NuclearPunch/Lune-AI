import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import BottomNavigation from "./bottom-navigation";
import FloatingElements from "../ui/floating-elements";
import { Menu, User, Moon } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const isOnboarding = location === "/onboarding";

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating moonlight background effects */}
      <FloatingElements />

      {/* Navigation Header */}
      {!isOnboarding && (
        <header className="fixed top-0 left-0 right-0 z-50 glass-effect safe-top">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 text-white hover:text-lavender transition-colors"
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-lavender to-rose rounded-full flex items-center justify-center">
                <Moon className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-semibold text-lg">LUNE</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 text-white hover:text-lavender transition-colors"
              data-testid="button-profile"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>
      )}

      {/* Main Content Container */}
      <main className={`max-w-md mx-auto ${!isOnboarding ? 'pt-16 pb-20' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!isOnboarding && <BottomNavigation />}
    </div>
  );
}
