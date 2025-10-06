/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#27ae60", dark: "#1e8750" }
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(0,0,0,0.25)"
      }
    }
  },
  plugins: []
};


