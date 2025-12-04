const contextBridge = require("electron").contextBridge;
const ipcRenderer = require("electron").ipcRenderer;

// Expose a limited API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Version info
  app: {
    getVersion: function () {
      return ipcRenderer.invoke("app:getVersion");
    },
    getName: function () {
      return ipcRenderer.invoke("app:getName");
    },
  },

  // File operations
  dialog: {
    showOpenDialog: function (options) {
      return ipcRenderer.invoke("dialog:showOpenDialog", options);
    },
    showSaveDialog: function (options) {
      return ipcRenderer.invoke("dialog:showSaveDialog", options);
    },
    showMessageBox: function (options) {
      return ipcRenderer.invoke("dialog:showMessageBox", options);
    },
  },

  // Window controls
  window: {
    minimize: function () {
      return ipcRenderer.invoke("window:minimize");
    },
    maximize: function () {
      return ipcRenderer.invoke("window:maximize");
    },
    close: function () {
      return ipcRenderer.invoke("window:close");
    },
    isDevMode: function () {
      return process.env.NODE_ENV === "development";
    },
  },

  // Platform info
  platform: {
    isMac: process.platform === "darwin",
    isWindows: process.platform === "win32",
    isLinux: process.platform === "linux",
  },

  // File system access (with restrictions)
  fs: {
    readFile: function (filePath, encoding) {
      encoding = encoding || "utf8";
      return ipcRenderer.invoke("fs:readFile", filePath, encoding);
    },
    writeFile: function (filePath, data) {
      return ipcRenderer.invoke("fs:writeFile", filePath, data);
    },
    exists: function (filePath) {
      return ipcRenderer.invoke("fs:exists", filePath);
    },
  },

  // Clipboard operations
  clipboard: {
    writeText: function (text) {
      return ipcRenderer.invoke("clipboard:writeText", text);
    },
    readText: function () {
      return ipcRenderer.invoke("clipboard:readText");
    },
  },
});

// Error handling
window.addEventListener("error", (event) => {
  console.error("Global error in renderer:", event.error);
  // You might want to send this to a logging service or main process
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection in renderer:", event.reason);
  // You might want to send this to a logging service or main process
});
