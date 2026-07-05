/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6eeff',
          100: '#c0d4ff',
          200: '#8fb0ff',
          300: '#5e8cff',
          400: '#2d68ff',
          500: '#024fe0',
          600: '#0242bc',
          700: '#013598',
          800: '#012874',
          900: '#011850',
        },
        gray: {
          50:  '#f7f7f7',
          100: '#ebebeb',
          200: '#ddd',
          300: '#c2c2c2',
          400: '#a0a0a0',
          500: '#717171',
          600: '#4a4a4a',
          700: '#3d3d3d',
          800: '#222',
          900: '#111',
        },
      },
      fontFamily: {
        sans: ['Circular', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card:    '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
        hover:   '0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12)',
        modal:   '0 8px 28px rgba(0,0,0,0.28)',
        input:   '0 0 0 2px #222',
      },
    },
  },
  plugins: [],
};
