const plugin = require("tailwindcss/plugin");

const gradientDegree = plugin(
  function ({ matchUtilities, theme }) {
    matchUtilities(
      {
        "gradient-degree": (value) => {
          return {
            gradientDegree: value,
          };
        },
      },
      {
        values: theme("gradientDegree"),
      }
    );
  },
  {
    theme: {
      gradientDegree: {
        10: "10deg",
        45: "45deg",
        60: "60deg",
        90: "90deg",
        120: "120deg",
        135: "135deg",
      },
    },
  }
);

module.exports = gradientDegree;
