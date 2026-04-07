/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Adding a custom green glow for the ATS score bar
      boxShadow: {
        'glow': '0 0 15px rgba(34, 197, 94, 0.2)',
      }
    },
  },
  plugins: [],
}