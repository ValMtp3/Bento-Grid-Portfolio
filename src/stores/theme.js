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
      this.applyTheme(newTheme);
    },
    applyTheme(newTheme) {
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
        console.log('Applying stored theme');
        this.setTheme(storedTheme);
      } else {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        console.log('Using system theme:', systemTheme);
        this.theme = systemTheme;
        this.applyTheme(systemTheme);
      }

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        console.log('System theme changed, localStorage theme:', localStorage.getItem('theme'));
        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light';
          console.log('Applying system change to:', newTheme);
          this.theme = newTheme;
          this.applyTheme(newTheme);
        }
      });
    },
  },
});
