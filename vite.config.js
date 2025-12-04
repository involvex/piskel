const path = require("path");
const vite = require("vite");

module.exports = vite.defineConfig({
  // Base path for production
  base: "./",

  // Build configuration
  build: {
    outDir: "dist/web",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src/index.html"),
      },
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks (avoiding spectrum due to fs dependency)
          vendor: ["jquery", "jszip", "canvas-toBlob"],
          // Split large libraries to avoid conflicts
          gif: ["gif.js"],
        },
        // Preserve entry file names
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    // Increase chunk size limit for better splitting
    chunkSizeWarningLimit: 1000,
    // Minify output
    minify: "terser",
    // Enable source maps for debugging
    sourcemap: true,
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
    allowExternalHost: true,
    host: "0.0.0.0",
    // Enable HMR (Hot Module Replacement)
    hmr: {
      overlay: true,
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ["jquery", "gif.js", "jszip", "canvas-toBlob"],
    exclude: ["spectrum", "src/js/lib/*"],
  },

  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@js": path.resolve(__dirname, "src/js"),
      "@css": path.resolve(__dirname, "src/css"),
      "@img": path.resolve(__dirname, "src/img"),
    },
    extensions: [".js", ".json", ".css", ".html"],
  },

  // CSS processing
  css: {
    preprocessorOptions: {
      css: {
        // Add global CSS variables
        additionalData: '@import "variables.css";',
      },
    },
  },

  // Environment variables and Node.js configuration
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    "process.env.PISKEL_VERSION": JSON.stringify(
      require("./package.json").version
    ),
    global: "globalThis",
  },

  // Build target configuration
  esbuild: {
    target: "es2018",
    supported: {
      "top-level-await": true,
    },
  },

  // Asset handling
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.gif", "**/*.svg", "**/*.ico"],

  // Custom logger for build process
  logLevel: "info",

  // Clear screen on build
  clearScreen: false,
});
