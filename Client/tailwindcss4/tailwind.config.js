module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xxs: "320px",
        xs: "480px",
      },
      spacing: {
        ...Array.from({ length: 1000 }, (_, i) => i + 1).reduce(
          (acc, val) => ({
            ...acc,
            [val]: `${val}px`,
          }),
          {}
        ),
      },
    },
  },
  plugins: [],
};
