import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Adds the Umami analytics script to production builds only, so local
 * development never records page views. `data-exclude-hash` keeps share-link
 * song data (which lives in the URL hash) out of analytics.
 */
function umamiAnalytics(): Plugin {
  return {
    name: "umami-analytics",
    apply: "build",
    transformIndexHtml() {
      return [
        {
          tag: "script",
          attrs: {
            defer: true,
            src: "https://cloud.umami.is/script.js",
            "data-website-id": "b094268e-77c0-4fca-bb14-3b25cb6bb87e",
            "data-exclude-hash": "true",
            // Ignore page views anywhere else, e.g. `vite preview` locally
            "data-domains": "chiptunes.studio",
          },
          injectTo: "head",
        },
      ];
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: ["jotai/babel/preset"],
      },
    }),
    tailwindcss(),
    umamiAnalytics(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
