import {defineConfig} from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({root:'cloudflare',publicDir:'../public',plugins:[tailwindcss()],esbuild:{jsx:'automatic'},build:{outDir:'../dist',emptyOutDir:true}})
