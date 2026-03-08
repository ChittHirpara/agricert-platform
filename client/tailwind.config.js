/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New sage green palette — #84B179 / #A2CB8B / #C7EABB / #E8F5BD
        sage: {
          900: '#3a5c35',
          800: '#4f7848',
          700: '#64935b',
          600: '#84B179',  // primary / branded green
          500: '#A2CB8B',  // medium sage
          400: '#b8d9a4',
          300: '#C7EABB',  // light sage
          200: '#d8f0cb',
          100: '#E8F5BD',  // pale yellow-green accent
          50: '#f4fae6',
        },
        // Override built-in green scale to map to sage palette
        green: {
          950: '#1e3b1a',
          900: '#3a5c35',
          800: '#4f7848',
          700: '#64935b',
          600: '#84B179',
          500: '#A2CB8B',
          400: '#b8d9a4',
          300: '#C7EABB',
          200: '#d8f0cb',
          100: '#E8F5BD',
          50: '#f4fae6',
        },
        emerald: {
          950: '#1e3b1a',
          900: '#3a5c35',
          800: '#4f7848',
          700: '#64935b',
          600: '#84B179',
          500: '#A2CB8B',
          400: '#b8d9a4',
          300: '#C7EABB',
          200: '#d8f0cb',
          100: '#E8F5BD',
          50: '#f4fae6',
        },
        teal: {
          950: '#1e3b1a',
          900: '#2d4f2a',
          800: '#3d6338',
          700: '#537a4d',
          600: '#6d9466',
          500: '#84B179',
          400: '#A2CB8B',
          300: '#C7EABB',
          200: '#d8f0cb',
          100: '#E8F5BD',
          50: '#f4fae6',
        },
      },
    },
  },
  plugins: [],
}
