/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#FF6B6B',    // Soft Red
          secondary: '#4ECDC4',  // Teal
          accent: '#FFE66D',     // Yellow
          background: '#F7FFF7', // Off White
          dark: '#292F36',       // Dark Grey
        },
        fontFamily: {
          sans: ['"Comic Neue"', 'cursive', 'sans-serif'],
        },
        borderRadius: {
          'xl': '1.5rem',
          '2xl': '2rem',
          '3xl': '3rem',
        }
      },
    },
    plugins: [],
  }
