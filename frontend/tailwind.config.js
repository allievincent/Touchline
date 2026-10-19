/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Barlow', 'sans-serif'],
        display: ['"Barlow Condensed"', 'sans-serif'], // headings, scoreboard feel
      },
      colors: {
        // grass green
        pitch: {
          50: '#effaf3', 100: '#d8f3e1', 200: '#b3e6c6', 300: '#80d2a3', 400: '#4bb67c',
          500: '#289a5f', 600: '#1a7c4b', 700: '#16633e', 800: '#144f33', 900: '#11412b', 950: '#0a1f16',
        },
        // training bib yellow
        volt: '#d7f24a',
        chalk: '#f6f5f0',
      },
    },
  },
  plugins: [],
}
