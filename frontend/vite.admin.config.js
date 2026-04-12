import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function ownerPanelFallback() {
  return {
    name: "owner-panel-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url || "/";
        const pathname = url.split("?")[0];
        const accept = req.headers.accept || "";
        const isHtmlRequest = req.method === "GET" && accept.includes("text/html");
        const isInternalRequest =
          pathname.startsWith("/api") ||
          pathname.startsWith("/@") ||
          pathname.startsWith("/src") ||
          pathname.startsWith("/node_modules") ||
          pathname.startsWith("/__vite");
        const isAssetRequest = /\.[a-zA-Z0-9]+$/.test(pathname);

        if (isHtmlRequest && !isInternalRequest && !isAssetRequest) {
          req.url = "/admin.html";
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ownerPanelFallback()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist-admin",
    rollupOptions: {
      input: "admin.html",
    },
  },
});
