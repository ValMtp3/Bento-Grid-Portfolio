import { defineStore } from 'pinia'
// Suppression de l'import inutilisé 'watch'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'light',
  }),
  actions: {
    setTheme(newTheme) {
      this.theme = newTheme
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    },
    init() {
      // Check for system preference
      if (localStorage.getItem('theme') === null) {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        this.setTheme(systemTheme)
      } else {
        // Apply stored theme
        this.setTheme(this.theme)
      }

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === null) {
          this.setTheme(e.matches ? 'dark' : 'light')
        }
      })
    }
  }
})
