const { app, BrowserWindow, shell, Menu } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

const PORT = process.env.OPENCLAW_PORT || 3000;
const URL = `http://localhost:${PORT}`;
const ROOT = path.join(__dirname, "..");

let win = null;
let serverProc = null;

// ─── Start Next.js server ────────────────────────────────────────────────────
function startServer() {
  console.log("[openclaw] Starting Next.js server…");
  serverProc = spawn("node_modules/.bin/next", ["start", "--port", String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  serverProc.stdout.on("data", (d) => process.stdout.write(d));
  serverProc.stderr.on("data", (d) => process.stderr.write(d));
  serverProc.on("error", (err) => console.error("[server error]", err));
}

// ─── Wait for server to be ready ─────────────────────────────────────────────
function waitForServer(attempts = 0) {
  return new Promise((resolve, reject) => {
    const check = () => {
      http
        .get(`${URL}/api/stream`, (res) => {
          res.destroy();
          resolve();
        })
        .on("error", () => {
          if (attempts > 30) return reject(new Error("Server never became ready"));
          setTimeout(() => waitForServer(attempts + 1).then(resolve).catch(reject), 1000);
        });
    };
    check();
  });
}

// ─── Create window ───────────────────────────────────────────────────────────
function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "OpenClaw — Mission Control",
    backgroundColor: "#080a12",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "icon.png"),
    show: false,
  });

  win.loadURL(URL);
  win.once("ready-to-show", () => win.show());

  // Open external links in the default browser, not Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.on("closed", () => { win = null; });
}

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Build minimal menu
  const menu = Menu.buildFromTemplate([
    {
      label: "OpenClaw",
      submenu: [
        { label: "Reload", accelerator: "CmdOrCtrl+R", click: () => win?.webContents.reload() },
        { label: "DevTools", accelerator: "F12", click: () => win?.webContents.toggleDevTools() },
        { type: "separator" },
        { label: "Quit", accelerator: "CmdOrCtrl+Q", click: () => app.quit() },
      ],
    },
    {
      label: "Navigate",
      submenu: [
        { label: "Tasks", accelerator: "CmdOrCtrl+1", click: () => win?.loadURL(`${URL}/tasks`) },
        { label: "Visual", accelerator: "CmdOrCtrl+2", click: () => win?.loadURL(`${URL}/visual`) },
        { label: "Memory", accelerator: "CmdOrCtrl+3", click: () => win?.loadURL(`${URL}/memory`) },
        { label: "Projects", accelerator: "CmdOrCtrl+4", click: () => win?.loadURL(`${URL}/projects`) },
        { label: "Calendar", accelerator: "CmdOrCtrl+5", click: () => win?.loadURL(`${URL}/calendar`) },
        { label: "Docs", accelerator: "CmdOrCtrl+6", click: () => win?.loadURL(`${URL}/docs`) },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  startServer();

  try {
    await waitForServer();
  } catch {
    console.error("[openclaw] Server failed to start.");
  }

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (!win) createWindow();
});

app.on("will-quit", () => {
  if (serverProc) serverProc.kill();
});
