/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffe',
          300: '#7cc5fd',
          400: '#36a7fa',
          500: '#0c8cee',
          600: '#006ecb',
          700: '#0157a4',
          800: '#064b86',
          900: '#0b3f6f',
          950: '#07284a',
        },
      },
    },
  },
  plugins: [],
}
