const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const dialog = electron.dialog;
const path = require("path");
const fs = require("fs");
const isDev = process.env.NODE_ENV === "development";

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../dest/prod/logo.png"),
    show: false,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
  });

  // Load the app
  const startUrl = isDev
    ? "http://localhost:3000"
    : "file://" + path.join(__dirname, "../dest/prod/index.html");

  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    if (isDev) {
      // Open DevTools in development
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Create application menu
function createMenu() {
  const fileMenu = {
    label: "File",
    submenu: [
      {
        label: "New",
        accelerator: "CmdOrCtrl+N",
        click: function () {
          // Implement new project logic
          console.log("New project");
        },
      },
      {
        label: "Open",
        accelerator: "CmdOrCtrl+O",
        click: function () {
          dialog
            .showOpenDialog(mainWindow, {
              properties: ["openFile"],
              filters: [
                { name: "Piskel Files", extensions: ["piskel"] },
                { name: "All Files", extensions: ["*"] },
              ],
            })
            .then((result) => {
              if (!result.canceled) {
                // Implement open logic
                console.log("Open file:", result.filePaths[0]);
              }
            })
            .catch((err) => {
              console.error("Error opening file:", err);
            });
        },
      },
      { type: "separator" },
      {
        label: "Exit",
        accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
        click: function () {
          app.quit();
        },
      },
    ],
  };

  const editMenu = {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
    ],
  };

  const viewMenu = {
    label: "View",
    submenu: [
      { label: "Reload", accelerator: "CmdOrCtrl+R", role: "reload" },
      {
        label: "Force Reload",
        accelerator: "CmdOrCtrl+Shift+R",
        role: "forceReload",
      },
      {
        label: "Toggle Developer Tools",
        accelerator: "F12",
        role: "toggleDevTools",
      },
      { type: "separator" },
      { label: "Actual Size", accelerator: "CmdOrCtrl+0", role: "resetZoom" },
      { label: "Zoom In", accelerator: "CmdOrCtrl+Plus", role: "zoomIn" },
      { label: "Zoom Out", accelerator: "CmdOrCtrl+-", role: "zoomOut" },
      { type: "separator" },
      {
        label: "Toggle Fullscreen",
        accelerator: "F11",
        role: "togglefullscreen",
      },
    ],
  };

  const helpMenu = {
    label: "Help",
    submenu: [
      {
        label: "About Piskel",
        click: function () {
          dialog.showMessageBox(mainWindow, {
            type: "info",
            title: "About Piskel",
            message: "Piskel",
            detail: "Version " + app.getVersion() + "\nPixel art editor",
          });
        },
      },
    ],
  };

  const template = [fileMenu, editMenu, viewMenu, helpMenu];

  // macOS menu adjustments
  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: "About " + app.getName(), role: "about" },
        { type: "separator" },
        { label: "Services", role: "services", submenu: [] },
        { type: "separator" },
        {
          label: "Hide " + app.getName(),
          accelerator: "Command+H",
          role: "hide",
        },
        {
          label: "Hide Others",
          accelerator: "Command+Shift+H",
          role: "hideothers",
        },
        { label: "Show All", role: "unhide" },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: function () {
            app.quit();
          },
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on("activate", () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
    require("electron").shell.openExternal(navigationUrl);
  });
});
