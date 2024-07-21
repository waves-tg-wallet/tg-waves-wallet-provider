import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            entry: "src/provider.ts",
            name: "TelegramProvider",
            fileName: (format) => `telegram-provider.${format}.js`,
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

// import { defineConfig } from 'vite';
// import vue from '@vitejs/plugin-vue';

// export default defineConfig({
//   plugins: [vue()],
//   build: {
//     lib: {
//       entry: 'src/providers/CustomProvider.js',
//       name: 'CustomProvider',
//       fileName: (format) => `custom-provider.${format}.js`
//     },
//     rollupOptions: {
//       external: ['vue', '@waves/signer'],
//       output: {
//         globals: {
//           vue: 'Vue',
//           '@waves/signer': 'Signer'
//         }
//       }
//     }
//   }
// });
