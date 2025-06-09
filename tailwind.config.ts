import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
        },
      },
      boxShadow: {
        "neon-primary":
          "0 0 15px 2px hsla(var(--primary), 0.5), 0 0 5px 0px hsla(var(--primary), 0.7)",
        "neon-primary-hover":
          "0 0 10px 1px hsla(var(--primary), 0.7), 0 0 3px 0px hsl(var(--primary))",
        "neon-destructive":
          "0 0 10px 1px hsla(var(--destructive), 0.7), 0 0 3px 0px hsl(var(--destructive))",
      },
    },
  },
  plugins: [],
} satisfies Config;
