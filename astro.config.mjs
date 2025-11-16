// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';


const isBuild = process.env.NODE_ENV === 'production';

// https://astro.build/config
export default defineConfig({
  base: isBuild ? "/findpath/" : "", // GitHub Pages에서 사용하는 서브 디렉토리 경로
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [alpinejs()]
});