/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // DTI Brand Palette (from WDML design system)
        dti: {
          blue:     '#003087',
          'blue-dark':  '#001f5c',
          'blue-light': '#004db3',
          orange:   '#F58220',
          'orange-dark':  '#c96a1a',
          'orange-light': '#f9a054',
          gold:     '#FFD700',
        },
        // Semantic aliases
        primary:  '#003087',
        accent:   '#F58220',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'card': '0.75rem',
        'input': '0.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,.10), 0 1px 2px -1px rgba(0,0,0,.06)',
        'card-hover': '0 4px 12px 0 rgba(0,48,135,.15)',
        'modal': '0 20px 60px -10px rgba(0,0,0,.3)',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
};
