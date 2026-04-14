import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // SPA alkönyvtáras hosztoláshoz: buildelésnél (Production) ez /calendar/ lesz.
  base: command === 'build' ? '/calendar/' : '/',
}))
