'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

import http from "http";
import * as WebSocket from "ws";
import * as fs from "fs";
import TailFile from "@logdna/tail-file";
import * as os from "os";
import {WsEvent} from "@/entity/wsevent";
import IpcMainEvent = Electron.IpcMainEvent;
const { shell } = require('electron')
const Store = require('electron-store');

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])



let win: BrowserWindow|null = null


async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: isDevelopment,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  const schema = {
    bar: {
      type: 'string',
      format: 'url'
    }
  };
  const store = new Store({schema});


  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  initWebSocket(win)
  handleNewWindowLinks(win)
  initMock(win)
}

function handleNewWindowLinks(win: BrowserWindow) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('grammarly')) {
      // Grammarly's SDK works properly when the links open in the default browser
      // instead of the Electron app

      shell.openExternal(url); // open link in electron system's default browser
      return { action: "deny" }; // don't open link in electron window
    } else {
      // you can allow the app to open all other links within the electron app
      // if required
      return { action: "allow" }
    }
  });
}

app.setAsDefaultProtocolClient("example");

app.on("open-url", (event, url) => {
  // If the link matches a Grammarly redirect URI, send the link to the renderer process
  if (url.includes("grammarly-auth")) {
    event.preventDefault();
    if (win) {
      win.webContents.send("grammarly:handleOAuthCallback", url);
    }

    // Add your messaging code here to send the link to your renderer process
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e)
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


ipcMain.on("save-meet", function (event : IpcMainEvent, events: WsEvent[]) {
  // const path = `/home/daniel/go/src/github.com/danielsussa/tmeet/demo/meets/${documentTitle}.log`
  // console.log(event.returnValue, events)
  // if (!fs.existsSync(path)) {
  //   fs.writeFileSync(path, '', null);
  // }
  // fs.appendFileSync(path, `${eventStr}`+os.EOL, null);
})


function initWebSocket(win: BrowserWindow) {
  const server = http.createServer();
  const wss = new WebSocket.Server({ server });


  wss.on("connection", (ws: WebSocket) => {

    ws.on("message", (eventStr: string) => {
      const event = JSON.parse(eventStr) as WsEvent
      event.date = Date.now()
      if (event.document && event.document.length === 0) {
        console.log("empty document")
      }

      if (win) {
        win.webContents.send("new-meet-event", event)
      }

    });

  });

//start our server
  server.listen(7143, () => {
    console.log(`Data stream server started on port `);
  });
}

function initMock(win: BrowserWindow) {


// only dev here
  const mockEvents: WsEvent[] = [
    {
      kind: "speaker",
      old: "",
      name: "John Doe",
      new: "",
      document: "abc",
      date: 100,
    },
    {
      kind: "text",
      old: "",
      name: "",
      new: "Mispellings and grammatical errors can effect your credibility. ",
      document: "abc",
      date: 100,
    },
    {
      kind: "text",
      old: "",
      name: "",
      new: "The same goes for misused commas, and other types of punctuation . ",
      document: "abc",
      date: 100,
    },
    {
      kind: "text",
      old: "",
      name: "",
      new: "Not only will Grammarly underline these issues in red, it will also showed you how to correctly write the sentence.",
      document: "abc",
      date: 100,
    },
    {
      kind: "speaker",
      old: "",
      name: "Jane Doe",
      new: "",
      document: "abc",
      date: 100,
    },
    {
      kind: "text",
      old: "",
      name: "",
      new: "Underlines that are blue indicate that Grammarly has spotted a sentence that is unnecessarily wordy. You'll find suggestions that can possibly help you revise a wordy sentence in an effortless manner",
      document: "abc",
      date: 100,
    }
  ]

  setInterval(() => {
    if (win) {
      if (mockEvents[0] === undefined) {
        return
      }
      const event = mockEvents[0] as WsEvent
      win.webContents.send("new-meet-event", mockEvents[0])
      mockEvents.splice(0, 1)
    }

  }, 2000)
}