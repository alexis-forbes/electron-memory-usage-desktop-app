// we will have TS compile it down to cjs later on using the TS compiler
const electron = require('electron');

// append whatever we have here to the Window object
electron.contextBridge.exposeInMainWorld('electron', {
  // define content of the object
  // method to subscribe to statistics, our BE will send us data every 0.5s
  // we subscribe to that using a callback, whenever the callback is called it will send the data to the UI
  // then we call the callback with IPC Event Bus stuff
  subscribeStatistics: (callback) =>
    // ipc renderer is the UI part of the IPC protocol
    // we add a listener to the statistics event
    // when receiving the event we want to call the function
    // to get our data we have 2 prameters: event and statistics
    // event: get info of who publishes the event, in our case is always the main process
    // stats: the data we want to send to the UI
    ipcSend('statistics', (stats) => {
      callback(stats);
    }),
  // method to get static data
  // static data is data that doesn't change
  getStaticData: () => ipcInvoke('getStaticData'),
} satisfies Window['electron']);

// invoke is async so that is why we return a promise
const ipcInvoke = <Key extends keyof EventPayloadMapping>(
  key: Key,
): Promise<EventPayloadMapping[Key]> => {
  return electron.ipcRenderer.invoke(key);
};
// we don't need the event here
const ipcSend = <Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void,
) => {
  // create a single callback function to use for both on and off
  const cb = (_: Electron.IpcRenderer, payload: any) => callback(payload);
  electron.ipcRenderer.on(key, cb);
  // turn this into a function that we can call to unsubscribe
  return () => electron.ipcRenderer.off(key, cb);
};
