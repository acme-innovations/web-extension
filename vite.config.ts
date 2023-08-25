import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import makeManifest from './.webext-config/plugins/make-manifest';
import customDynamicImport from './.webext-config/plugins/custom-dynamic-import';
import addHmr from './.webext-config/plugins/add-hmr';
import manifest from './manifest';

const root = path.resolve(__dirname, 'src');
const outDir = path.resolve(__dirname, 'dist');
const publicDir = path.resolve(__dirname, 'public');

// ENABLE HMR IN BACKGROUND SCRIPT
const enableHmrInBackgroundScript = process.env.ENABLE_HMR_IN_BACKGROUND_SCRIPT === 'true';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    makeManifest(manifest, {
      isDev: mode === 'development',
      contentScriptCssKey: regenerateCacheInvalidationKey(),
    }),
    customDynamicImport(),
    addHmr({ background: enableHmrInBackgroundScript, view: true }),
  ],
  publicDir,
  resolve: {
    alias: {
      '@/': `${root}/`,
    },
  },
  build: {
    outDir,
    /** Can slowDown build speed. */
    sourcemap: mode === 'development',
    minify: mode === 'production',
    reportCompressedSize: mode === 'production',
    rollupOptions: {
      input: {
        devtools: path.resolve(root, 'devtools', 'index.html'),
        panel: path.resolve(root, 'panel', 'index.html'),
        content: path.resolve(root, 'content', 'index.ts'),
        background: path.resolve(root, 'background', 'index.ts'),
        contentStyle: path.resolve(root, 'content', 'style.scss'),
        popup: path.resolve(root, 'popup', 'index.html'),
        newtab: path.resolve(root, 'newtab', 'index.html'),
        options: path.resolve(root, 'options', 'index.html'),
      },
      watch: {
        include: ['src/**', 'vite.config.ts'],
        exclude: ['node_modules/**', 'src/**/*.spec.ts'],
      },
      output: {
        entryFileNames: 'src/[name]/index.js',
        chunkFileNames: mode === 'development' ? 'assets/js/[name].js' : 'assets/js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const { dir, name: _name } = path.parse(assetInfo.name || '');
          const assetFolder = dir.split('/').at(-1);
          const name = assetFolder + firstUpperCase(_name);
          if (name === 'contentStyle') {
            return `assets/css/contentStyle${cacheInvalidationKey}.chunk.css`;
          }
          return `assets/[ext]/${name}.chunk.[ext]`;
        },
      },
    },
  },
}));

function firstUpperCase(str: string) {
  const firstAlphabet = new RegExp(/( |^)[a-z]/, 'g');
  return str.toLowerCase().replace(firstAlphabet, (L) => L.toUpperCase());
}

let cacheInvalidationKey: string = generateKey();
function regenerateCacheInvalidationKey() {
  cacheInvalidationKey = generateKey();
  return cacheInvalidationKey;
}

function generateKey(): string {
  return `${Date.now()}`;
}
