import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import yaml from '@modyfi/vite-plugin-yaml'

export default defineConfig({
  base: '/PhysioMeter/',
  plugins: [react(), yaml()],
  test: {
    environment: 'node',
  },
})
