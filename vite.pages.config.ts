import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function pagesBase(command: 'build' | 'serve') {
  // configure-pages supplies this in Actions. Set a repository variable to override it.
  const override = process.env.PAGES_BASE_PATH?.trim();
  if (override) {
    if (override === './') return './';
    return `/${override.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
  }
  const [owner, repository] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
  if (repository) {
    return repository.toLowerCase() === `${owner}.github.io`.toLowerCase()
      ? '/'
      : `/${repository}/`;
  }
  // A downloaded/local build can be placed under any directory without rebuilding.
  return command === 'build' ? './' : '/';
}

export default defineConfig(({ command }) => ({
  base: pagesBase(command),
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
    dedupe: ['react', 'react-dom', 'three'],
  },
  server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  preview: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  build: {
    outDir: 'dist-pages',
    emptyOutDir: true,
    manifest: true,
    // This output has no Worker, server rendering, or runtime authentication.
  },
}));
