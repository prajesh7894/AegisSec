/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aegis: {
          ink: "#17202a",
          panel: "#f6f8fb",
          accent: "#0f766e",
          warning: "#b45309",
          danger: "#b91c1c"
        }
      }
    }
  },
  plugins: []
};

