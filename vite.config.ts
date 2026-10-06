import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 5173 is used by the CRM app; keep the landing site on its own port in dev
  server: { port: 5174, strictPort: true },
})
