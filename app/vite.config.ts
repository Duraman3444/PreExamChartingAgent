import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
// We need to load the env file that lives **one directory above** `app/`
// so that variables like VITE_FIREBASE_API_KEY are available when Vite
// replaces `import.meta.env.*` in the front-end bundle.

export default defineConfig(({ mode }) => {
  // Load env vars from the monorepo root (../)
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');

  // Merge loaded env into process.env so the rest of this file and plugins can access them
  for (const k of Object.keys(env)) {
    process.env[k] = env[k];
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/pages': path.resolve(__dirname, './src/pages'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/services': path.resolve(__dirname, './src/services'),
        '@/stores': path.resolve(__dirname, './src/stores'),
        '@/types': path.resolve(__dirname, './src/types'),
        '@/utils': path.resolve(__dirname, './src/utils'),
        '@/constants': path.resolve(__dirname, './src/constants'),
      },
    },
    server: {
      port: 3000,
    },
  };
}); 