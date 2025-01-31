import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
server: {
    host:'0.0.0.0', //  reseau
    port: 3000,  // Indiquer le port que tu veux utiliser
    allowedHosts: ['maxime-p1.klicat.com']
  },
})
