import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import fs from "fs";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 4100,
    fs: {
      allow: [".."],
    },
    https: {
      cert: fs.readFileSync(path.resolve(__dirname, "crt/localhost.crt")),
      key: fs.readFileSync(path.resolve(__dirname, "crt/localhost.key")),
    },
    allowedHosts: [
      "172.21.21.18",
      "pms.bamanagementsolutions.com",
      "www.pms.bamanagementsolutions.com",
      "180.191.246.179"
    ],
    proxy: {
      "/graphql": {
        target: "http://localhost:5000/graphql",
        changeOrigin: true,
        ws:true,
      },
    },
    hmr: {
      protocol: "wss",
      overlay: false,
    }
  },
})