/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#e4d3cd',
          300: '#d2b4ab',
          400: '#b98c7e',
          500: '#9c6858',
          600: '#7e4d3e',
          700: '#633b2f',
          800: '#4c2e26',
          900: '#38221c',
          950: '#231410',
        },
        kossor: {
          50: '#fef2f2',
          100: '#ffe1e1',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        mad: {
          50: '#f0fdf4',
          100: '#dcfce7',
          600: '#16a34a',
          700: '#15803d',
        }
      },
    },
  },
  plugins: [],
}
