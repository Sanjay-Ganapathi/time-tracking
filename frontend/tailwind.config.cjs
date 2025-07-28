/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // This path is now correct for your structure
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
