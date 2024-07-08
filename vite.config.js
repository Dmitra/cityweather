import path from 'path'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import reactPlugin from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 8000
  },
  resolve: {
    alias: {
      'boot': path.resolve(__dirname, './boot'),
      'feature': path.resolve(__dirname, './feature'),
      'service': path.resolve(__dirname, './service'),
    }
  },
  plugins: [
    reactPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/d3/d3.js',
          dest: 'node_modules/d3'
        }
      ]
    })
  ],
})