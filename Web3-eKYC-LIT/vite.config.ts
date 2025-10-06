import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
//@ts-ignore
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({

  define: {
    global: {},
  },
  build: {
    target: 'es2020',
  },
  plugins: [react(), tailwindcss(),],
});


