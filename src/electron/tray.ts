import { BrowserWindow, Menu, Tray, app } from "electron";
import path from "path";
import { getAssetPath } from "./pathResolver.js";

export const createTray = (mainWindow: BrowserWindow) => {
  const platformIcon = process.platform === 'darwin' ? 'trayIconTemplate.png' : 'trayIcon.png';
  const tray = new Tray(path.join(getAssetPath(), platformIcon));
  // we are setting the context menu that pops up when clicking right on the tray icon
  tray.setContextMenu(Menu.buildFromTemplate([ 
    {
      label: 'Show App',
      click: () => {
        mainWindow.show(); // Windows and Linux
        if (app.dock) {
          app.dock.show(); // macOS
        }
      }
    },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ]))
};