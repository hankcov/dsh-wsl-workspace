import { defineConfig } from 'tsdown'
import { builtinModules } from 'node:module'

/**
 * Standalone build for the dsh-wsl-workspace third-party plugin.
 *
 * Node half: three ESM entries (\lib/index.js\ host plugin, \lib/shell.js\ and
 * \lib/fs.js\ service providers) with every \@deepseek-ai/*\ and node builtin
 * external — at runtime they resolve from the harness's own dependency tree.
 * The preset installer references \lib/shell.js\/\lib/fs.js\ by absolute path,
 * so those entry file names are load-bearing.
 *
 * Browser half: the closure-factory bundle the client registry serves
 * (\window.__ModuleLoader__.load\), externals restricted to the platform
 * module table exactly as the in-repo \clientBundle\ preset does.
 *
 * --- DSH Desktop 2.x compatibility ---
 * DSH Desktop 2.x uses a custom module resolution hook that intercepts all
 * @deepseek-ai/* imports and tries to resolve them from the app.asar bundle.
 * Plugins installed in the profile's node_modules cannot resolve those
 * imports at runtime. The fix: only externalize the core framework packages
 * (cordis, schemastery) that DSH Desktop itself provides; the seam packages
 * (dsh-shell, dsh-fs, dsh-fs-local, dsh-subprocess, dsh-timeout) are
 * bundled inline so they never trigger the custom resolver.
 */

// Packages that MUST stay external (resolved from DSH Desktop's own runtime).
const CORE_EXTERNALS: (string | RegExp)[] = [
  /^node:/,
  ...builtinModules,
  // Core framework — DSH Desktop provides these at runtime.
  '@deepseek-ai/cordis',
  '@deepseek-ai/schemastery',
  // Client plugin framework — DSH Desktop provides these in the renderer.
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
  '@deepseek-ai/dsh-client-runtime/client',
]

export default defineConfig([
  {
    name: 'dsh-wsl-workspace',
    entry: {
      index: 'src/index.ts',
      shell: 'src/shell.ts',
      fs: 'src/fs.ts',
    },
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
    sourcemap: true,
    // Only externalize core framework; seam packages are bundled inline.
    deps: { neverBundle: CORE_EXTERNALS },
  },
  {
    name: 'dsh-wsl-workspace/client',
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    target: 'es2024',
    dts: false,
    clean: false,
    sourcemap: true,
    deps: { neverBundle: CORE_EXTERNALS, alwaysBundle: true },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
    },
    outputOptions: {
      entryFileNames: 'client.js',
      banner: 'window.__ModuleLoader__.load({ id: "dsh-wsl-workspace", factory: (require) => {',
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
])
