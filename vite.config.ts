import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Fixed port so it matches ADMIN_URL in the server's CORS allow-list (client UI uses 5173).
  server: { port: 5174, strictPort: true },
})
