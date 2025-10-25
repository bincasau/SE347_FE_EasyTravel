/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#007AFF", // Xanh EasyTravel
        secondary: "#FFC107", // Vàng điểm nhấn
      },
    },
  },
  plugins: [],
};
