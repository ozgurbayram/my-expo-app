/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#F9FAFB',
        text: '#111827',
        border: '#D1D5DB',
        error: '#EF4444',
        primary: '#6366f1',
      },
    },
  },
  plugins: [],
};
