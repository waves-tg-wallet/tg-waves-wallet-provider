import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            entry: "src/provider/index.ts",
            name: "ProviderTelegram",
            formats: ['es', 'cjs'],
            fileName: (format) => `provider-telegram.${format}.js`,
        },
        rollupOptions: {
            external: ["vue", "@waves/signer"],
            output: {
                globals: {
                    vue: "Vue",
                    "@waves/signer": "Signer",
                },
            },
        },
    },
});

