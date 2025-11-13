import { Menu, app, BrowserWindow } from "electron";
import { isDev } from "./util.js";

export const createMenu = (mainWindow: BrowserWindow) => {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: process.platform === "darwin" ? undefined : "App",
      type: "submenu",
      submenu: [
        {
          label: "Quit",
          click: () => app.quit()
        }
      ]
    }, 
    {
      label: "View",
      type: "submenu",
      submenu: [
        {
          label: "CPU"
        },
        {
          label: "RAM"
        }, 
        {
          label: "STORAGE"
        }
      ]
    }, 
    {
      label: "DevTools",
      click: () => mainWindow.webContents.openDevTools(),
      visible: isDev()
    }
  ]))
}