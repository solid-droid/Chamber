import { defineConfig } from "vite";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          // Copy from the actual source
          src: 'node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm',
          // This puts it in the root of your 'dist' (and serves it at /HavokPhysics.wasm)
          dest: './' 
        }
      ]
    })
  ],

  // 1. FIX: Prevent Vite from trying to bundle Havok into .vite/deps
  optimizeDeps: {
    exclude: ['@babylonjs/havok']
  },

  clearScreen: false,
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
      ignored: ["**/src-tauri/**"],
    },
    // 2. FIX: In Vite, the 'mimeTypes' key is plural (though usually not needed if optimizeDeps is set)
    mimeTypes: {
      'application/wasm': ['wasm']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}));