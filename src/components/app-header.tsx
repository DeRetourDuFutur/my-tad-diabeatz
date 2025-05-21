"use client";

import { Leaf } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="py-4 px-6 border-b shadow-sm">
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-90 transition-opacity">
        <Leaf className="h-8 w-8" />
        <span>DiabEatz</span>
      </Link>
    </header>
  );
}
