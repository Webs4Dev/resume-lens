import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the FastAPI backend, so the browser sees one
    // origin: the session cookie just works and no CORS setup is needed.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
