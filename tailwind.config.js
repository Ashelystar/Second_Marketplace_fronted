/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xianyuText: '#FF6E27',
        xianyuHover: '#E55C15',
        xianyuBg: '#FFF5E6',
        accentBlue: '#00BBD4',
        pageBg: '#F5F5F5',
      },
    },
  },
  plugins: [],
}
