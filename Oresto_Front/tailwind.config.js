/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Ajouter cette ligne pour activer le mode sombre basé sur une classe
  theme: {
    extend: {
      // Vous pouvez étendre votre thème ici
      colors: {
        dark: {
          900: '#1a202c',
          800: '#2d3748',
          700: '#4a5568',
          600: '#718096',
          500: '#a0aec0',
        },
      },
    },
  },
  plugins: [],
}
