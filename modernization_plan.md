# Piskel Build System Modernization Plan

## Current State Analysis

### Current Build System:

- **Framework**: NW.js v0.48.0 (released ~2020, very outdated)
- **Build Tool**: Grunt (legacy build system)
- **Dependencies**: Outdated JavaScript libraries
- **Cross-Platform Support**: Limited to older OS versions

### Issues with Current Approach:

1. **Security Risks**: NW.js 0.48.0 has known vulnerabilities
2. **Compatibility Issues**: Doesn't support modern OS features
3. **Performance Limitations**: Older Chromium engine
4. **Maintenance Burden**: Difficult to update dependencies
5. **Build Complexity**: Grunt-based build is slow and complex

## Modernization Strategy

### Phase 1: Immediate Improvements (Quick Wins)

1. **Update NW.js to latest stable version** (v0.8x.x or migrate to Electron)
2. **Add modern platform targets**:
   - Windows 10/11 (x64, ARM64)
   - macOS Ventura+ (Intel, Apple Silicon)
   - Linux (modern distros: Ubuntu 22.04+, Fedora 36+)
3. **Enhance build scripts** for better error handling and logging

### Phase 2: Build System Migration

1. **Replace Grunt with modern alternatives**:
   - **Vite** for fast development builds
   - **esbuild** for production optimization
   - **Webpack** for complex bundling (if needed)
2. **Add TypeScript support** for better code maintainability
3. **Implement code splitting** for faster load times

### Phase 3: Dependency Modernization

1. **Update core libraries**:
   - jQuery 1.8.0 → jQuery 3.x or remove jQuery
   - Spectrum color picker → modern alternative
   - GIF.js → updated version
2. **Add ESM support** for modern JavaScript modules
3. **Implement automated dependency updates**

## Implementation Plan

### 1. Package.json Updates

```json
{
  "dependencies": {
    "electron": "^28.0.0", // or keep NW.js updated
    "nw": "^0.80.0" // if staying with NW.js
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "esbuild": "^0.19.0",
    "typescript": "^5.0.0"
  }
}
```

### 2. Build Configuration Updates

```javascript
// Modern Gruntfile.js or new build config
module.exports = {
  // Modern platform targets
  platforms: {
    windows: {
      targets: ["x64", "arm64"],
      minVersion: "10.0.19041", // Windows 10 20H1+
    },
    macos: {
      targets: ["x64", "arm64"],
      minVersion: "12.0.0", // macOS Monterey+
    },
    linux: {
      targets: ["x64", "arm64"],
      distros: ["ubuntu:22.04", "fedora:36"],
    },
  },
};
```

### 3. Cross-Platform Build Scripts

```bash
# Example modern build scripts
npm run build:windows
npm run build:macos
npm run build:linux
npm run build:all
```

### 4. Platform-Specific Configurations

- **Windows**: Proper signing, installer generation
- **macOS**: Notarization support, modern app bundle
- **Linux**: AppImage and Snap package support

## Migration Steps

### Step 1: Update NW.js Configuration

```javascript
// Updated nwjs task configuration
nwjs: {
  modern: {
    options: {
      downloadUrl: "https://dl.nwjs.io/",
      version: "0.80.0",  // Latest stable
      build_dir: "./dist/",
      platforms: [
        {os: 'win', arch: 'x64'},
        {os: 'win', arch: 'arm64'},
        {os: 'osx', arch: 'x64'},
        {os: 'osx', arch: 'arm64'},
        {os: 'linux', arch: 'x64'},
        {os: 'linux', arch: 'arm64'}
      ],
      flavor: "normal",
      cacheDir: "./cache",
      shaSum: true,
      macIcns: "misc/desktop/logo.icns",
      winIco: "misc/desktop/logo.ico"
    },
    src: ["./dest/prod/**/*", "./package.json"]
  }
}
```

### Step 2: Add Modern Build Tools

```javascript
// Add Vite configuration
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src/index.html"),
      },
      output: {
        manualChunks: {
          vendor: ["jquery", "spectrum"],
        },
      },
    },
  },
});
```

### Step 3: Update Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:desktop": "npm run build && npm run package:desktop",
    "package:desktop": "nwbuild --platforms win64,win-arm64,osx64,osx-arm64,linux64,linux-arm64",
    "package:windows": "nwbuild --platforms win64,win-arm64",
    "package:macos": "nwbuild --platforms osx64,osx-arm64",
    "package:linux": "nwbuild --platforms linux64,linux-arm64"
  }
}
```

## Testing Strategy

1. **Platform Compatibility Testing**:
   - Windows 10/11 on x64 and ARM64
   - macOS Ventura+ on Intel and Apple Silicon
   - Ubuntu 22.04+, Fedora 36+ on x64 and ARM64
2. **Performance Benchmarking**:
   - Startup time comparison
   - Memory usage analysis
   - Rendering performance
3. **Regression Testing**:
   - Ensure all existing features work
   - Test import/export functionality
   - Verify tool behavior

## Risk Mitigation

1. **Incremental Migration**: Keep old build system as fallback
2. **Feature Parity**: Ensure all features work in new build
3. **Performance Monitoring**: Track performance metrics
4. **User Testing**: Get feedback from community

## Timeline

1. **Week 1**: Research and planning
2. **Week 2**: Build system setup and basic functionality
3. **Week 3**: Platform-specific testing and fixes
4. **Week 4**: Performance optimization and final testing
