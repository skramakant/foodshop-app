/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.html', './src/**/*.js'],
  safelist: [
    { pattern: /^grid-cols-/ },
    { pattern: /^grid-cols-/, variants: ['sm', 'md', 'lg'] },
    { pattern: /^col-span-/ },
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        wa: '#25d366',   // WhatsApp green
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
