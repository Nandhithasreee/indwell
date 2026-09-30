/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        deep: "#16151C",
        surface: "#1E1C24",
        "surface-2": "#262330",
        "surface-light": "#FBF9F5",
        "surface-light-2": "#F1ECE3",
        brass: {
          DEFAULT: "#C9A468",
          soft: "#E3C892",
          deep: "#9C7C46",
        },
        sage: {
          DEFAULT: "#7C9473",
          soft: "#A7BC9E",
        },
        linen: "#F3F1EC",
        muted: "#9A96A3",
        "muted-light": "#6B6660",
        hairline: "#37333F",
        "hairline-light": "#E4DED2",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)",
        "blueprint": "linear-gradient(rgba(201,164,104,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(201,164,104,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        grain: "18px 18px",
        blueprint: "40px 40px",
      },
      boxShadow: {
        glow: "0 0 40px rgba(201,164,104,0.25)",
        card: "0 20px 60px -20px rgba(0,0,0,0.5)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "draw-line": {
          from: { strokeDashoffset: "1" },
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant("light", ".light &");
    },
  ],
};
