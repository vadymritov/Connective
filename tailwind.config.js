const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      "1bp": { min: "2074px" },
      "2bp": { max: "1241px" },
      "3bp": { min: "2300px" },
      "4bp": { max: "1905px" },
      "5bp": { min: "1516px" },
      "2xl": { min: "1536px" },
      xl: { min: "1280px" },
      lg: { min: "1024px" },
      md: { min: "768px" },
      sm: { min: "640px" },
    },
    extend: {
      colors: {
        white: "#FFFF",
        "desaturated-cyan": "#5FB4A2",
        "bright-red": "#F43030",
      },
      bgGradientDeg: {
        75: "75deg",
      },
    },
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "bg-gradient": (angle) => ({
            "background-image": `linear-gradient(${angle}, var(--tw-gradient-stops))`,
          }),
        },
        {
          values: Object.assign(theme("bgGradientDeg", {}), {
            10: "10deg",
            15: "15deg",
            20: "20deg",
            25: "25deg",
            30: "30deg",
            45: "45deg",
            60: "60deg",
            90: "90deg",
            120: "120deg",
            135: "135deg",
          }),
        }
      );
    }),
  ],
  plugins: [require("@tailwindcss/line-clamp")],
};
