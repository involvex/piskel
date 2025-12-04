# Piskel Build System Modernization Plan

## Current State Analysis

### Current Build System Issues

1. **Failed Build Scripts**:

   - `build:windows` and `build:desktop` fail to produce working outputs
   - `start:modern` and `start:electron` launch inaccessible dev servers
   - `package:windows` fails with `TypeError [ERR_INVALID_ARG_TYPE]: The "paths[1]" argument must be of type string. Received undefined` in the NW.js builder

2. **Vite Build Issue**:

   - `fs` module being externalized from `node_modules/spectrum/lib/spectrum.js`

3. **Electron Setup Issues**:
   - No proper Electron configuration files
   - Missing Electron main process and preload scripts
   - Incomplete Electron builder configuration

### Current Build System Components

- **Framework**: NW.js v0.80.0 (modern) + legacy NW.js v0.48.0
- **Build Tools**: Grunt (legacy) + Vite (modern)
- **Dependencies**: Mix of modern and outdated JavaScript libraries
- **Cross-Platform Support**: Windows, macOS, Linux targets

## Modernization Strategy

### Phase 1: Immediate Fixes (Quick Wins)

1. **Fix Vite Build Configuration**:

   - Resolve fs module externalization issue
   - Update Vite config for proper Electron support
   - Add proper external dependencies handling

2. **Create Basic Electron Setup**:

   - Add Electron main process file
   - Create Electron preload script
   - Configure Electron builder properly

3. **Fix NW.js Build Issues**:
   - Update NW.js builder configuration
   - Fix path handling in package scripts
   - Ensure proper platform targeting

### Phase 2: Build System Enhancement

1. **Simplify Build Scripts**:

   - Create unified `electron:dev`, `electron:build`, `electron:start` scripts
   - Maintain legacy build compatibility
   - Add proper error handling and logging

2. **Add Concurrent Dev Servers**:

   - Implement Vite + Electron concurrent development
   - Add proper HMR (Hot Module Replacement) support
   - Configure dev server proxy setup

3. **Enhance Cross-Platform Support**:
   - Update platform-specific configurations
   - Add proper signing and notarization
   - Improve build output organization

### Phase 3: Codebase Cleanup

1. **Remove Deprecated Patterns**:

   - Clean up old Grunt configurations
   - Remove unused build artifacts
   - Update outdated dependencies

2. **Add TypeScript Support**:

   - Create TypeScript configuration
   - Add type definitions for legacy code
   - Gradually migrate critical files

3. **Implement Code Quality Improvements**:
   - Add ESLint configuration for modern JS
   - Implement Prettier formatting
   - Add comprehensive type checking

## Implementation Plan

### 1. Fix Vite Configuration

```javascript
// Updated vite.config.js with proper Electron support
export default defineConfig({
  build: {
    outDir: "dist/electron",
    rollupOptions: {
      external: ["electron", "fs"], // Properly handle Node.js modules
      output: {
        manualChunks: {
          vendor: ["jquery", "spectrum", "gif.js", "jszip", "canvas-toBlob"],
        },
      },
    },
  },
  plugins: [
    // Add Electron plugin if needed
  ],
});
```

### 2. Create Electron Configuration

**Main Process File** (`electron/main.js`):

```javascript
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load Vite dev server in development
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  } else {
    // Load production build
    win.loadFile(path.join(__dirname, "../dist/web/index.html"));
  }
}

app.whenReady().then(createWindow);
```

**Preload Script** (`electron/preload.js`):

```javascript
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Expose necessary APIs to renderer
});
```

### 3. Update Package.json Scripts

```json
{
  "scripts": {
    "electron:dev": "vite & npx electron .",
    "electron:build": "vite build && electron-builder",
    "electron:start": "npm run electron:build && npx electron dist/electron",
    "build:windows": "npm run build:modern && npm run package:windows",
    "build:desktop": "npm run build:modern && npm run package:desktop",
    "package:windows": "grunt build-nwjs-windows --fix-paths",
    "package:desktop": "grunt build-nwjs-modern --fix-paths"
  }
}
```

### 4. Fix NW.js Builder Issues

Update `Gruntfile.js` to handle path issues:

```javascript
nwjs: {
  windows: {
    options: {
      // Ensure proper path handling
      build_dir: "./dist/windows/",
      platforms: [
        { os: "win", arch: "x64" },
        { os: "win", arch: "arm64" }
      ],
      // Add proper error handling
      onError: function(error) {
        console.error("NW.js build failed:", error);
        process.exit(1);
      }
    }
  }
}
```

### 5. Add TypeScript Support

**tsconfig.json**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowJs": true,
    "checkoutJs": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "electron/**/*"],
  "exclude": ["node_modules", "dist", "cache"]
}
```

## Migration Steps

### Step 1: Fix Immediate Build Issues

1. **Fix Vite fs module issue**:

   - Update Vite config to properly handle Node.js core modules
   - Add proper external dependencies configuration

2. **Create basic Electron files**:

   - Add `electron/main.js` and `electron/preload.js`
   - Configure Electron builder in package.json

3. **Fix NW.js path handling**:
   - Update Gruntfile.js with proper path validation
   - Add error handling for build processes

### Step 2: Implement Concurrent Dev Servers

1. **Update Vite configuration**:

   - Add proper HMR support for Electron
   - Configure dev server proxy

2. **Create dev script**:
   - Implement `electron:dev` with concurrent Vite + Electron
   - Add proper process management

### Step 3: Cleanup and Type Safety

1. **Add TypeScript**:

   - Create tsconfig.json
   - Add type definitions for legacy code
   - Gradually migrate critical files

2. **Code quality improvements**:
   - Update ESLint configuration
   - Add Prettier formatting
   - Implement comprehensive testing

## Testing Strategy

1. **Unit Tests**:

   - Verify individual build components
   - Test Electron main process
   - Validate Vite configuration

2. **Integration Tests**:

   - Test complete build pipelines
   - Verify cross-platform compatibility
   - Validate Electron + Vite integration

3. **E2E Tests**:
   - Test application launch
   - Verify all features work
   - Validate build outputs

## Risk Mitigation

1. **Incremental Migration**:

   - Keep old build system as fallback
   - Gradual transition to new system

2. **Feature Parity**:

   - Ensure all existing features work
   - Maintain backward compatibility

3. **Performance Monitoring**:
   - Track build times
   - Monitor memory usage
   - Optimize where needed

## Timeline

1. **Week 1**: Research and immediate fixes
2. **Week 2**: Electron setup and build system enhancement
3. **Week 3**: Code cleanup and TypeScript integration
4. **Week 4**: Testing and finalization

## Expected Outcomes

1. **Working Build Scripts**:

   - `electron:dev` - Concurrent Vite + Electron development
   - `electron:build` - Production build with Electron builder
   - `electron:start` - Launch built Electron application

2. **Fixed Issues**:

   - Resolved Vite fs module externalization
   - Working NW.js builds with proper path handling
   - Functional Electron setup with proper configuration

3. **Improved Codebase**:

   - Cleaner, more maintainable build system
   - Type-safe code with TypeScript
   - Modern development workflow

4. **Maintained Compatibility**:
   - Legacy builds still functional
   - Browser build unchanged
   - All existing features preserved
