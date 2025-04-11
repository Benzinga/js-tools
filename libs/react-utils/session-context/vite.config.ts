/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { readFileSync } from 'fs';

export default defineConfig(() => {
  // Read the package.json to automatically get the dependencies
  const pkgPath = path.resolve(__dirname, 'package.json');
  let external: string[] = [];
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    external = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ];
  } catch (e) {
    console.warn('Could not read package.json, external dependencies might not be correctly identified');
  }

  // Define regex patterns to detect Benzinga workspace packages
  const workspacePackageRegex = /from\s+['"][^'"]*\/([^/]+)\/src\/.*['"]/g;

  return {
    root: __dirname,
    cacheDir: '../../../node_modules/.vite/libs/react-utils/session-context',
    plugins: [
      react(),
      nxViteTsPaths(),
      nxCopyAssetsPlugin(['*.md']),
      dts({
        entryRoot: path.join(__dirname, "src"),
        tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
        // Preserve the import paths for external modules
        staticImport: true,
        beforeWriteFile: (filePath, content) => {
          // Generic replace function for workspace packages (converts relative paths to @benzinga/package format)
          const updatedContent = content.replace(workspacePackageRegex, (match, packageName) => {
            return `from '@benzinga/${packageName}'`;
          });
          return { filePath, content: updatedContent };
        }
      }),
    ],
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },
    // Configuration for building your library.
    // See: https://vitejs.dev/guide/build.html#library-mode
    build: {
      outDir: '../../../dist/libs/react-utils/session-context',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        // Could also be a dictionary or array of multiple entry points.
        entry: 'src/index.ts',
        name: 'session-context',
        fileName: 'index',
        // Change this to the formats you want to support.
        // Don't forget to update your package.json as well.
        formats: ['es' as const],
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external,
      },
    },
  }
});
