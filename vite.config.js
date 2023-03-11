import { defineConfig } from 'vite';

export default defineConfig(({ command, mode, ssrBuild }) => {
  return {
    server: {
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin"
      }
    }
  };
});
