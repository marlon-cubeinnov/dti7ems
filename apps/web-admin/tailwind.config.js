/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // DTI Brand Palette — from DTI Corporate Identity Manual
        dti: {
          blue:         '#172187',  // Primary blue (Pantone 2746C)
          navy:         '#29296E',
          'blue-mid':   '#1E4387',
          'blue-sky':   '#73C0E2',
          'blue-dark':  '#151B42',  // back-compat → very dark navy
          'blue-light': '#354396',  // back-compat → accent medium blue
          red:          '#FA0F0D',  // Primary red (Pantone 185C)
          'red-light':  '#DF1E25',
          'red-dark':   '#7E1321',
          orange:       '#DF1E25',  // back-compat → DTI red-light
          'orange-dark':  '#7E1321',
          'orange-light': '#FA0F0D',
          yellow:       '#FFE500',  // Primary yellow (Pantone 106C)
          gray:         '#41434E',
          'gray-light': '#CACACA',
          'gray-pale':  '#E8E8E8',
        },
        primary: '#172187',
        accent:  '#DF1E25',
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica Neue', 'Helvetica', 'ui-sans-serif', 'sans-serif'],
        heading: ['Franklin Gothic Medium', 'Franklin Gothic Demi', 'Arial Black', 'Impact', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        input: '0.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.10), 0 1px 2px -1px rgba(0,0,0,.06)',
        'card-hover': '0 4px 12px 0 rgba(23,33,135,.15)',
      },
    },
  },
  plugins: [],
};
