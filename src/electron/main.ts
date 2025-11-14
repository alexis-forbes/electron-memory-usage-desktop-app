import { app, BrowserWindow } from 'electron';
import { ipcMainHandle, ipcMainOn, isDev, LOCALHOST_PORT } from './util.js';
import { getStaticData, pollResources } from './resourceManager.js';
import { getPreloadPath, getUiPath } from './pathResolver.js';
import { createTray } from './tray.js';
import { createMenu } from './menu.js';

// interact with the app
// waiting for an event in the app
// once it is ready, let's create a window
app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    title: 'Memory Usage',
    width: 800,
    height: 600,
    webPreferences: {
      preload: getPreloadPath(),
    },
    frame: false
  });
  if (isDev()) {
    mainWindow.loadURL('http://' + LOCALHOST_PORT);
  } else {
    mainWindow.loadFile(getUiPath());
  }

  pollResources(mainWindow);

  ipcMainHandle('getStaticData', () => getStaticData());
  ipcMainOn('sendFrameAction', (payload) => {
    switch(payload) {
      case 'CLOSE': 
        mainWindow.close();
        break;
      case 'MINIMIZE': 
        mainWindow.minimize(); 
        break;
      case 'MAXIMIZE': 
        mainWindow.maximize();
        break;
    }
  });

  createTray(mainWindow);

  handleCloseEvent(mainWindow);

  createMenu(mainWindow);
});


const handleCloseEvent = (mainWindow: BrowserWindow) => {
  let willClose = false;
 // by default we don't want to close the app
  mainWindow.on("close", (e) => {
    // if we want Electron to close the app don't prevent the default behavior
    if (willClose) {
      return;
    }
    e.preventDefault();
    // mainWindow.hide() will do everything we need in Windows and Linux but not in macOS
    // in macOS we will have the task bar icon still visible
    mainWindow.hide();
    if (app.dock) {
      app.dock.hide();
    }
    // when before-quit is run it means that close happened first and quit happened after that
    // we set willClose to true to prevent the default behavior
    // this quit happens when we click on quit the app not when closing the window
    app.on("before-quit", () => {
      willClose = true;
    });
    // we need to reset the value when a window is shown again, for example when we click on the tray icon
    mainWindow.on("show", () => {
      willClose = false;
    });
  });
};
  