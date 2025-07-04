import { defineConfig } from "vite";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'append-js-extension',
          resolveId(source:any) {
            // This is a simplified example and might require more robust logic
            // to handle various import scenarios and relative paths correctly.
            if (source.startsWith('./') || source.startsWith('../')) {
              if (!source.endsWith('.js') && !source.endsWith('.ts') && !source.includes('.')) {
                return `${source}.js`;
              }
            }
            return null; // Let other plugins or Rollup handle it
          },
        },
      ],
    },
  },
}));
