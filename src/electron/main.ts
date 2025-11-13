import { app, BrowserWindow } from 'electron';
import { ipcHandle, isDev, LOCALHOST_PORT } from './util.js';
import { getStaticData, pollResources } from './resourceManager.js';
import { getPreloadPath, getUiPath } from './pathResolver.js';

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
  });
  if (isDev()) {
    mainWindow.loadURL('http://' + LOCALHOST_PORT);
  } else {
    mainWindow.loadFile(getUiPath());
  }

  pollResources(mainWindow);

  ipcHandle('getStaticData', () => getStaticData());
});
