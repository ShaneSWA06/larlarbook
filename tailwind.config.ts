import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-nunito)",
          "var(--font-noto-myanmar)",
          "system-ui",
          "sans-serif",
        ],
        myanmar: ["var(--font-noto-myanmar)", "system-ui", "sans-serif"],
      },
      colors: {
        // Design system colors
        "logo-purple": "#8B5CF6",
        "light-purple": "#A78BFA",
        "purplish-white": "#F3F4F6",
        brown: "#221f20",
        "tag-color-1": "#8B5CF6",
        "tag-color-2": "#7C3AED",
        "error-color": "#EF4444",
        "approval-color": "#84CC16",
        color: "#FFFFFF",
        "color-2": "#A78BFA",
        "color-3": "#7C3AED",
        p1: "#6D28D9",
        p2: "#8B5CF6",
        p3: "#9d6db8",
        w1: "#FFFFFF",
        w2: "#F9FAFB",
        "grey-lines": "#6B7280",
        "black-box": "#111827",
      },
    },
  },
  plugins: [],
} satisfies Config;
