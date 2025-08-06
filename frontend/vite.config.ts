import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import {defineConfig, loadEnv} from 'vite'

// https://vite.dev/config/
export default defineConfig(({mode})=>{
    const env = loadEnv(mode, 'env');

    return {
        plugins: [react(), tailwindcss()],
        envDir: './env',
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        build: {
            outDir: "./dist",
        },
        server: {
            host: "0.0.0.0",
            // Use loadEnv to access environment variables inside Vite config
            port: parseInt(env.VITE_PORT) || 3000,
        },
    }
})