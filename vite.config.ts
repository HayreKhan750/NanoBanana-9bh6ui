import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env from /vercel/share/.env.project for GROQ_API_KEY
  const projectEnv = loadEnv(mode, '/vercel/share', 'GROQ');
  
  return {
  server: {
    host: "::",
    port: 3000,
    strictPort: true,
    allowedHosts: [
      "sb-4pi4a6iznsg9.vercel.run",
      ".vercel.run",
      "localhost",
    ],
  },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    envDir: '/vercel/share',
    envPrefix: ['VITE_', 'GROQ_'],
  };
});
