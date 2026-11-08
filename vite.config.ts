import fs from "fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Demo song id -> URL slug, read from the demo files in src/data */
function demoSlugs(): Record<string, string> {
  const dir = path.resolve(__dirname, "src/data");
  return Object.fromEntries(
    fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const { id, name } = JSON.parse(
          fs.readFileSync(path.join(dir, file), "utf8"),
        );
        const slug = String(name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        return [id, slug];
      }),
  );
}

/**
 * Song pages are /editor/<uuid>, one per song in every visitor's browser,
 * which would splinter the Pages report into one row per song. Before Umami
 * sends anything, rewrite them: demos become /editor/demo/<name> (worth
 * comparing), everyone's own songs become plain /editor.
 * Must be defined before the Umami script runs its first page view.
 */
function beforeSendScript(): string {
  return `window.umamiBeforeSend = function (type, payload) {
  var demos = ${JSON.stringify(demoSlugs())};
  function clean(url) {
    return typeof url === "string"
      ? url.replace(/\\/editor\\/([0-9a-f-]{36})/i, function (_, id) {
          return demos[id] ? "/editor/demo/" + demos[id] : "/editor";
        })
      : url;
  }
  payload.url = clean(payload.url);
  payload.referrer = clean(payload.referrer);
  return payload;
};`;
}

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
          children: beforeSendScript(),
          injectTo: "head",
        },
        {
          tag: "script",
          attrs: {
            defer: true,
            src: "https://cloud.umami.is/script.js",
            "data-website-id": "b094268e-77c0-4fca-bb14-3b25cb6bb87e",
            "data-exclude-hash": "true",
            // Ignore page views anywhere else, e.g. `vite preview` locally
            "data-domains": "chiptunes.studio",
            "data-before-send": "umamiBeforeSend",
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
