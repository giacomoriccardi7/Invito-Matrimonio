/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          300: '#A5B6A3',
          light: '#BFCFBB',
          DEFAULT: '#8EA58C',
          dark: '#6A7A68',
        },
        cream: '#DBD0C4',
        mint: '#BFCFBB',
        neutral: {
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        script: ['Great Vibes', 'cursive'],
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
