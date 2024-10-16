/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Raleway', 'sans-serif'],
      },
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
    // eslint-disable-next-line no-undef
    require('@tailwindcss/typography'),
  ],
}

