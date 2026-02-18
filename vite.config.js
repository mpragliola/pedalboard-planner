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
})
