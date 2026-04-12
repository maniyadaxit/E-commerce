/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B1B1B",
        accent: "#C8A96E",
        cream: "#F5F0EA",
        copy: "#3D3D3D",
        sale: "#D0021B",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 60px rgba(27, 27, 27, 0.08)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top right, rgba(200,169,110,0.25), transparent 35%), radial-gradient(circle at bottom left, rgba(27,27,27,0.12), transparent 25%)",
      },
    },
  },
  plugins: [],
};
