import { ipcMain, WebContents, WebFrameMain } from 'electron';
import { getUiPath } from './pathResolver.js';
import { pathToFileURL } from 'url';

export const isDev = () => process.env.NODE_ENV === 'development';
export const LOCALHOST_PORT = 'localhost:5123';

// we will only know the return type of this function once we know what key we have
// we will always need generics for this
// Key is just any type of string but we want to say Key can only be one of the strings in the key of EventPayloadMapping
// the return of the handler will be the value of the key in EventPayloadMapping which is its corresponding object
export const ipcMainHandle = <Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: () => EventPayloadMapping[Key],
) => {
  ipcMain.handle(key, (event) => {
    if (!event.senderFrame) {
      throw new Error('There is no sender frame');
    }
    // before handling the event we validate it
    validateEventFrame(event.senderFrame);
    return handler();
  });
};
// Type safety guaranteed:
// Argument of type {} is not assignable to parameter of type '() => StaticData'.
// ipcHandle("getStaticData", () => {});
// Argument of type 'x' is not assignable to parameter of type 'keyof EventPayloadMapping'.
// ipcHandle("x", () => {})

export const ipcMainOn = <Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: (payload: EventPayloadMapping[Key]) => void,
) => {
  ipcMain.on(key, (event, payload) => {
    if (!event.senderFrame) {
      throw new Error('There is no sender frame');
    }
    // before handling the event we validate it
    validateEventFrame(event.senderFrame);
    return handler(payload);
  });
};

// when we want to send something to the browser we use webContents of the BrowserWindow to send the data
// we use generics to make sure the key is one of the keys in EventPayloadMapping
// we define which BrowserWindow we want to send the data to
// we define the payload we want to send
export const ipcWebContentsSend = <Key extends keyof EventPayloadMapping>(
  key: Key,
  webContents: WebContents,
  payload: EventPayloadMapping[Key],
) => {
  webContents.send(key, payload);
};

export const validateEventFrame = (frame: WebFrameMain) => {
  // if the url is from dev we check if the url request domain is localhost:5123 do nothing
  // if we set a different port in main.ts we will have to change it here otherwise we will get an error
  if (isDev() && new URL(frame.url).host === LOCALHOST_PORT) {
    return;
  }
  // we check if the url from the request is not our file url index.html path that gets generated when building,
  // if it is not the same we throw an error and do not let the event through
  if (frame.url !== pathToFileURL(getUiPath()).toString()) {
    throw new Error('Invalid frame, malicious event!');
  }
};
