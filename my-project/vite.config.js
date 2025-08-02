import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // Use only this one for React

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})