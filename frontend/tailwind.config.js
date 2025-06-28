/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const typography = require('@tailwindcss/typography')
const prodeko_tailwind = require('@prodeko/tailwind-theme')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.tsx"
  ],
  theme: {
    extend: {
      keyframes: {
        'bg-fade': {
          '0%, 100%': { backgroundColor: '#eff6ff' }, // bg-blue-50
          '50%': { backgroundColor: '#dbeafe' },      // bg-blue-100
        },
      },
      animation: {
        'bg-fade': 'bg-fade 0.5s ease-in-out 2', // 1s duration, runs twice
      },
    },
  },
  plugins: [
    typography,
    prodeko_tailwind(),
  ],
}

