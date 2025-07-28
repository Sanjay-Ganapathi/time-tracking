import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main-Process entry file.
        entry: 'electron/main.ts',
      },
      {
        // Preload-Scripts entry file.
        entry: 'electron/preload.ts',
        onstart(options) {
          // Notify the Renderer-Process to reload the page
          // when the Preload-Scripts build is complete.
          options.reload()
        },
      },
    ]),
    renderer(),
  ],
})