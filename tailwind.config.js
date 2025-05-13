/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['**/*.html', '**/**.vue', '**/**/**.vue', '**/**/**/**.vue', '**/**/**/**/**.vue'],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundColor: {
        'dark-primary': '#0f172a', // Bleu foncé riche
        'dark-secondary': '#1e293b', // Bleu slate plus clair
        'dark-card': '#334155', // Slate encore plus clair pour les cartes
      },
      textColor: {
        'dark-primary': '#f1f5f9', // Texte presque blanc avec une touche de bleu
        'dark-secondary': '#cbd5e1', // Texte gris clair avec touche de bleu
        'dark-accent': '#38bdf8', // Bleu clair pour les accents
      },
      borderColor: {
        'dark-border': '#475569', // Bordures plus visibles
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
      },
      gradientColorStops: {
        'dark-start': '#0f172a',
        'dark-end': '#1e3a8a',
      },
    },
  },
  plugins: [],
};