import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
		vue(),
		cssInjectedByJsPlugin()
	],
    build: {
        lib: {
            entry: "src/index.ts",
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

