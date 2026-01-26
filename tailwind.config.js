/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505', // Deep Black
        surface: '#0f172a', // Dark Slate
        primary: '#06b6d4', // Cyan 500
        secondary: '#3b82f6', // Blue 500
        accent: '#8b5cf6', // Purple 500
        success: '#10b981', // Emerald 500
        warning: '#f59e0b', // Amber 500
        error: '#ef4444', // Red 500
        dark: '#ffffff', // In dark mode, 'text-dark' should actually be light
      },
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
