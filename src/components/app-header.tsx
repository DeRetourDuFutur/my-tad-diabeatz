"use client";

import { Leaf, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

export function AppHeader() {
  const { currentUser } = useAuth();
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
    <header className="py-4 px-6 border-b border-border/50 shadow-lg shadow-primary/20">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
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
          {currentUser ? (
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
