/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'var(--font-sans)', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        slate: {
          950: '#030712',
        },
      },
    },
  },
  plugins: [],
};
