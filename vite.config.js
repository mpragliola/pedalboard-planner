import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const basePath = process.env.VITE_BASE_PATH || '/pedalboard-planner/'

export default defineConfig({
  plugins: [react({
    include: /\.(jsx|tsx)$/,
  })],
  base: basePath,
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
  },
  // @TODO: Remove this once the new SCSS compiler is stable and 
  // supports all features we use. Might need upgrading Vite
  // (>=5.4, >=6.0). This removes all the annoying deprecation
  // warnings about the old compile during the build.
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler", // or "modern"
      },
    },
  },
})
