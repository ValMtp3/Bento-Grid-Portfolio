import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'system',
    userPreference: localStorage.getItem('theme') || null,
  }),
  actions: {
    setTheme(newTheme) {
      console.log('setTheme called with:', newTheme);
      this.theme = newTheme;
      this.userPreference = newTheme;
      localStorage.setItem('theme', newTheme);

      // Forcer la suppression et l'ajout de la classe
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        console.log('Added dark class');
      } else {
        document.documentElement.classList.remove('dark');
        console.log('Removed dark class');
      }
      console.log('Current classes on html:', document.documentElement.classList.toString());
    },
    init() {
      console.log('Init theme store');
      const storedTheme = localStorage.getItem('theme');
      console.log('Stored theme:', storedTheme);

      if (storedTheme) {
        // Apply stored theme (user has clicked the toggle before)
        console.log('Applying stored theme');
        this.setTheme(storedTheme);
      } else {
        // Use system preference
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        console.log('Using system theme:', systemTheme);
        this.theme = systemTheme;

        // Apply the class without saving to localStorage
        if (systemTheme === 'dark') {
          document.documentElement.classList.add('dark');
          console.log('Added dark class for system');
        } else {
          document.documentElement.classList.remove('dark');
          console.log('Removed dark class for system');
        }
      }

      // Listen for system theme changes (only if user hasn't set a preference)
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        console.log('System theme changed, localStorage theme:', localStorage.getItem('theme'));
        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light';
          console.log('Applying system change to:', newTheme);
          this.theme = newTheme;
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      });
    },
  },
});
