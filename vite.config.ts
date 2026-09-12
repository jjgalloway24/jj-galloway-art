import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // raw Blender/source-asset folders live alongside the app but
      // shouldn't be watched — they're often open/locked in other programs
      // and can crash the dev server's file watcher. Scoped to these two
      // specific folders rather than by extension: an extension-based glob
      // (e.g. "**/*.glb") also matches files under public/, which silently
      // breaks Vite's static serving for any of them added after the dev
      // server has started (returns its SPA-fallback HTML instead) — cost
      // us real debugging time twice, once for images and once for models.
      ignored: ["**/3D/**", "**/3d filing test/**"],
    },
  },
});
