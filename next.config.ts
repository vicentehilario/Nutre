import type { NextConfig } from "next";
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  customWorkerSrc: "src/worker",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      // Supabase: sempre network — dados sensíveis/autenticados não podem ser cacheados
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
        handler: "NetworkOnly",
      },
      // APIs internas: StaleWhileRevalidate — mostra dado anterior offline, atualiza quando online
      {
        urlPattern: /^\/api\/(refeicoes|ranking|peso|insight-diario|receita-diferente)/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "nutre-api",
          expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
      // Imagens externas (Unsplash e foto de perfil): CacheFirst — não mudam
      {
        urlPattern: /^https:\/\/images\.unsplash\.com\/.*/,
        handler: "CacheFirst",
        options: {
          cacheName: "nutre-images",
          expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12"],
  turbopack: {},
};

module.exports = withPWA(nextConfig);
