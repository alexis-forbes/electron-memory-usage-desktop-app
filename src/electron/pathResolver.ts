import { isDev } from './util.js';
import path from 'path';
import { app } from 'electron';

// we are joining the path of the Electron app in a cross platform way
// In dev we go to the current directory and in prod we go up 2 directories to our dist-electron folder
// Electron builder will bundle our preload file in the dist-electron folder in cjs format
// as we have to load this preload using file system so we need a new extension to write in common JS
// in prod build we will go up one directory and tell Electron Builder to handle this file separately
// causing it to be placed in a separate directory
export const getPreloadPath = () => {
  return path.join(app.getAppPath(), isDev() ? '.' : '..', '/dist-electron/preload.cjs');
};

// we are joining the path of the React app in a cross platform way
export const getUiPath = () => {
  return path.join(app.getAppPath(), '/dist-react/index.html');
};
