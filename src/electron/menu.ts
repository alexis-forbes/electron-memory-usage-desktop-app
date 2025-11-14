import { Menu, app, BrowserWindow } from "electron";
import { ipcWebContentsSend, isDev } from "./util.js";

export const createMenu = (mainWindow: BrowserWindow) => {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: process.platform === "darwin" ? undefined : "App",
      type: "submenu",
      submenu: [
        {
          label: "Quit",
          click: () => app.quit()
        },
        {
          label: "DevTools",
          click: () => mainWindow.webContents.openDevTools(),
          visible: isDev()
        }
      ]
    }, 
    {
      label: "View",
      type: "submenu",
      submenu: [
        {
          label: "Cpu",
          click: () => ipcWebContentsSend("changeView", mainWindow.webContents, "CPU")
        },
        {
          label: "Ram",
          click: () => ipcWebContentsSend("changeView", mainWindow.webContents, "RAM")
        }, 
        {
          label: "Storage",
          click: () => ipcWebContentsSend("changeView", mainWindow.webContents, "STORAGE")
        }
      ]
    }
  ]))
}