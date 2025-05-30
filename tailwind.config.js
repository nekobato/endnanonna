/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        nonnon: {
          pink: "#dd188b",
          orange: "#f57315",
          green: "#5ac02e",
          blue: "#12a7c5"
        }
      },
      fontFamily: {
        rounded: ['"Natsuzemi Maru Gothic"', "sans-serif"]
      },
      animation: {
        "gradient-shift": "gradientShift 15s ease infinite",
        "bounce-in": "bounceIn 0.6s ease-out",
        "fade-in": "fadeIn 0.5s ease-in-out"
      },
      keyframes: {
        gradientShift: {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" }
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};
