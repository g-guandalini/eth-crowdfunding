/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Isso diz ao Tailwind para procurar classes em todos os arquivos Vue, JS, TS, JSX e TSX dentro da pasta 'src'.
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}

