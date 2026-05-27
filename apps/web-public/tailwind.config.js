/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // DTI Brand Palette — from DTI Corporate Identity Manual
        // Primary brand colors: Blue (Pantone 2746C), Red (Pantone 185C), Yellow (Pantone 106C)
        dti: {
          // Primary blue: R23 G33 B135
          blue:         '#172187',
          // Main palette — shades of blue/navy
          navy:         '#29296E',  // R41 G41 B110
          'blue-mid':   '#1E4387',  // R30 G67 B143
          'blue-sky':   '#73C0E2',  // R115 G192 B226 (light accent)
          // Back-compat aliases → now point to DTI navy/accent blues
          'blue-dark':  '#151B42',  // R21 G27 B66 (very dark navy)
          'blue-light': '#354396',  // R53 G67 B150 (accent medium blue)
          // DTI red as accent (replaces non-brand orange)
          red:          '#FA0F0D',  // R250 G15 B13 — primary red (Pantone 185C)
          'red-light':  '#DF1E25',  // R223 G30 B37
          'red-dark':   '#7E1321',  // R126 G19 B33
          // Back-compat aliases → now point to DTI reds
          orange:       '#DF1E25',
          'orange-dark':  '#7E1321',
          'orange-light': '#FA0F0D',
          // Yellow: R255 G229 B0 (Pantone 106C)
          yellow:       '#FFE500',
          // Grays from main palette
          gray:         '#41434E',  // R65 G67 B78
          'gray-light': '#CACACA',  // R202 G202 B202
          'gray-pale':  '#E8E8E8',  // R230 G232 B232
        },
        // Semantic aliases
        primary:  '#172187',
        accent:   '#DF1E25',
      },
      fontFamily: {
        // DTI primary typeface: Arial (simple, clear, precise — per CIM section 05)
        sans: ['Arial', 'Helvetica Neue', 'Helvetica', 'ui-sans-serif', 'sans-serif'],
        // Logo/heading typeface: Franklin Gothic family
        heading: ['Franklin Gothic Medium', 'Franklin Gothic Demi', 'Arial Black', 'Impact', 'sans-serif'],
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
        'card-hover': '0 4px 12px 0 rgba(23,33,135,.15)',
        'modal': '0 20px 60px -10px rgba(0,0,0,.3)',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
};
