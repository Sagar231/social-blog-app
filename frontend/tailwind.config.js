/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Driven by CSS variables so the same classes work in both themes.
        bg: {
          primary: "var(--bg-primary)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
        },
        border: { DEFAULT: "var(--border)" },
        text: {
          primary: "var(--text-primary)",
          muted: "var(--text-muted)",
        },
        accent: {
          pink: "#FF2E97",
          "pink-2": "#FF6FB5",
          blue: "#2E9BFF",
          green: "#1FD66B",
          red: "#FF4D5E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.12)",
        glow: "0 0 0 1px rgba(255,46,151,0.4), 0 8px 30px rgba(255,46,151,0.15)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #FF2E97, #2E9BFF)",
      },
      keyframes: {
        "pop": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        pop: "pop 0.3s ease",
        "fade-in": "fade-in 0.3s ease",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
