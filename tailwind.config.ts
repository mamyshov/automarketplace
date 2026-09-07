import type { Config } from "tailwindcss";
import tokens from "./design-tokens.json";

// Tailwind theme is generated from design-tokens.json so the design system
// has one source of truth shared with the future mobile app. Never add raw
// hex codes / px values in components — extend tokens here instead.

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: tokens.color.brand,
        accent: tokens.color.accent,
        neutral: tokens.color.neutral,
        status: tokens.color.status,
        success: tokens.color.semantic.success,
        warning: tokens.color.semantic.warning,
        danger: tokens.color.semantic.danger,
        info: tokens.color.semantic.info,
      },
      fontFamily: {
        sans: tokens.font.family.sans,
      },
      fontSize: tokens.font.size,
      spacing: tokens.space,
      borderRadius: tokens.radius,
      boxShadow: tokens.shadow,
      screens: {
        xs: tokens.breakpoint.xs,
        sm: tokens.breakpoint.sm,
        md: tokens.breakpoint.md,
        lg: tokens.breakpoint.lg,
        xl: tokens.breakpoint.xl,
      },
      minHeight: {
        touch: tokens.touchTarget.min,
      },
      minWidth: {
        touch: tokens.touchTarget.min,
      },
      height: {
        "bottom-nav": tokens.bottomNav.height,
      },
    },
  },
  plugins: [],
};

export default config;
