import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Improve chunking strategy
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-core': ['three'],
          'three-fiber': ['@react-three/fiber', '@react-three/drei'],
          'ui-components': ['lucide-react'],
        },
      },
    },
    // Enable compression
    assetsInlineLimit: 4096, // Only inline files smaller than ~4kb
    chunkSizeWarningLimit: 1000, // Reduce from the default of 500kb
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true, // Remove debugger statements
      },
    },
    // Source maps in production (can be removed for smaller bundle size)
    sourcemap: true,
  },
  // Optimize dev server performance
  server: {
    hmr: {
      overlay: true, // Show errors as overlay
    },
  },
  // Enable assets optimization
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'three', 
      '@react-three/fiber', 
      '@react-three/drei'
    ],
    // Exclude large libraries that don't need preprocessing
    exclude: [],
  },
})
