import path from "path"
import fs from "fs"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "copy-staticwebapp-config",
      closeBundle() {
        const src = path.resolve(__dirname, "staticwebapp.config.json")
        const dest = path.resolve(__dirname, "dist", "staticwebapp.config.json")
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest)
        } else {
          console.warn("⚠️ staticwebapp.config.json not found at project root.")
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://easylink-d7a9evefevgqcmh0.eastasia-01.azurewebsites.net",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
      },
    },
  },
})
