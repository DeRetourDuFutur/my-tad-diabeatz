"use client";

import { Leaf } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="py-4 px-6 border-b border-border/50 shadow-lg shadow-primary/20">
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-90 transition-opacity hover:text-primary/80">
        <Leaf className="h-8 w-8 text-primary" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          DiabEatz
        </span>
      </Link>
    </header>
  );
}
