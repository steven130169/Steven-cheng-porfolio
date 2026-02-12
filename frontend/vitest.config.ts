import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@payload-config': path.resolve(__dirname, 'payload.config.ts'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        // 同理，路徑要簡化
        setupFiles: [path.resolve(__dirname, 'src/setupTests.ts')],
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
});
