/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0f1624',
          mid: '#1a2540',
          light: '#243050',
        },
        accent: '#4f8ef7',
        accent2: '#7c5cfc',
        accent3: '#1ecb8a',
      }
    },
  },
  plugins: [],
}
