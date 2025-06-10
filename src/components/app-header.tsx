"use client";

import { Leaf, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

export function AppHeader() {
  const { currentUser, userProfile } = useAuth(); 
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès."
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-4 border-b border-border/50 shadow-lg shadow-primary/20">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-90 transition-opacity hover:text-primary/80"
        >
          <Leaf className="h-8 w-8 text-primary" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent neon-logo text-xl">
            Ma Santé+
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {currentUser && userProfile ? (
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Accueil
              </Link>
              <Link href="/profile" className="flex items-center gap-2">
                <div 
                  className={`
                    w-8 h-8 rounded-full bg-blue-950 flex items-center justify-center text-sm font-semibold text-white border border-cyan-500/50 shadow-[0_0_8px_0_rgba(0,255,255,0.5)]
                    ${userProfile.role === 'Admin' ? 'neon-cyan-initials' : ''}
                  `}
                >
                  {userProfile.firstName && userProfile.lastName 
                    ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}` 
                    : currentUser.email?.charAt(0).toUpperCase()}
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          ) : currentUser ? (
            // Fallback si userProfile n'est pas encore chargé mais currentUser existe
            <div className="flex items-center gap-4">
               <span className="text-sm text-muted-foreground">
                {currentUser.email} 
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
