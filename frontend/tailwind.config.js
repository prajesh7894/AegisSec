/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        aegis: {
          ink: "#0f172a", // slate-900 for text
          panel: "rgba(255, 255, 255, 0.7)", // glassmorphism bg
          accent: "#0ea5e9", // vibrant sky blue (more modern than teal)
          accentLight: "#bae6fd", // sky-200
          warning: "#f59e0b", // amber-500
          danger: "#ef4444", // red-500
          success: "#10b981", // emerald-500
        }
      },
      backgroundImage: {
        'mesh-light': 'radial-gradient(at 40% 20%, hsla(210,100%,93%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,96%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(210,100%,96%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(189,100%,93%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(210,100%,96%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(189,100%,96%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(210,100%,96%,1) 0px, transparent 50%)',
      }
    }
  },
  plugins: []
};
