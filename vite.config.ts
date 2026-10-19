import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, createReadStream, readdirSync, copyFileSync, mkdirSync } from 'fs';
import type { Plugin } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UI_DX_DIR = resolve(__dirname, '../../packages/ui/src/theme/dx');

function dxThemePlugin(): Plugin {
  return {
    name: 'dx-theme-static',
    // Dev: intercept /dx.*.css requests and serve from @repo/ui
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (/^\/dx\.[^.]+\.css(\?.*)?$/.test(req.url ?? '')) {
          const filename = req.url!.split('?')[0].slice(1); // strip leading /
          const filePath = resolve(UI_DX_DIR, filename);
          if (existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/css');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    },
    // Build: copy DX CSS files to dist/
    closeBundle() {
      const outDir = resolve(__dirname, 'dist');
      mkdirSync(outDir, { recursive: true });
      const cssFiles = readdirSync(UI_DX_DIR).filter(f => f.endsWith('.css'));
      for (const file of cssFiles) {
        copyFileSync(resolve(UI_DX_DIR, file), resolve(outDir, file));
      }
      console.log(`[dx-theme] Copied ${cssFiles.length} DX CSS files to dist/`);
    }
  };
}

//import { PROXY_URL } from './src/utils/constants/url.constants'
// https://vite.dev/config/
export default defineConfig({
  plugins:
    [
      react(),
      tailwindcss(),
      svgr(),
      dxThemePlugin(),
    ],
  define: {
    'process.env.THEME_SHEET': JSON.stringify(process.env.THEME_SHEET || ''),
    'process.env.APP_BRAND': JSON.stringify(process.env.APP_BRAND || process.env.BRAND || ''),
    'process.env': {},
  },
  server: {
    cors: {
      origin: false
    },
    watch: {
      ignored: [
        '!**/packages/map-core/**',
        '!**/packages/firebase-services/**',
        '!**/packages/api-contracts/**',
      ],
    },
  },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) {
              return 'leaflet';
            }
            if (id.includes('devextreme') || id.includes('devextreme-react')) {
              return 'devextreme';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('@reduxjs') || id.includes('react-redux')) {
              return 'vendor';
            }
          }
        }
      }
    }
  }
});
