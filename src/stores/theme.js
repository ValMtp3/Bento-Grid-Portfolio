import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'system',
    userPreference: localStorage.getItem('theme') || null,
  }),
  actions: {
    setTheme(newTheme) {

      this.theme = newTheme;
      this.userPreference = newTheme;
      localStorage.setItem('theme', newTheme);
      this.applyTheme(newTheme);
    },
    applyTheme(newTheme) {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');

      } else {
        document.documentElement.classList.remove('dark');

      }

    },
    init() {

      const storedTheme = localStorage.getItem('theme');


      if (storedTheme) {

        this.setTheme(storedTheme);
      } else {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';

        this.theme = systemTheme;
        this.applyTheme(systemTheme);
      }

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {

        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light';

          this.theme = newTheme;
          this.applyTheme(newTheme);
        }
      });
    },
  },
});
