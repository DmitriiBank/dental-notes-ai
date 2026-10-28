import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17252a",
        teal: { 50: "#effaf8", 100: "#d8f3ee", 500: "#1b9c8c", 600: "#127b70", 700: "#0e625a" },
        coral: "#ef725d",
        sand: "#f5f2eb"
      },
      boxShadow: { soft: "0 10px 30px rgba(23,37,42,.08)" }
    }
  },
  plugins: []
} satisfies Config;
