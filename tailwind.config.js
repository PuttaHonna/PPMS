/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        greenade: {
          primary: '#43A047', // Vibrant Green
          secondary: '#2E7D32', // Dark Green
          background: '#1B5E20', // Deep Green
          text: '#FFFFFF', // White
          accent: '#C8E6C9', // Light Green Accent
        },
        cyan: {
          500: '#43A047', // Override for compatibility
        }
      },
      fontFamily: {
        display: ['"Anton"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
