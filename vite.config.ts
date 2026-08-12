import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // non-web assets (Blender files, source textures) live alongside the
      // app but shouldn't be watched — they're often open/locked in other
      // programs and can crash the dev server's file watcher
      ignored: [
        "**/3D/**",
        "**/3d filing test/**",
        "**/*.blend",
        "**/*.exr",
        "**/*.hdr",
        "**/*.glb",
        "**/*.gltf",
        "**/*.fbx",
        "**/*.obj",
      ],
    },
  },
});
