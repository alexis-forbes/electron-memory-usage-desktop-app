import osUtils from 'os-utils';
import fs from 'fs';
import os from 'os';
import { BrowserWindow } from 'electron';
import { ipcWebContentsSend } from './util.js';

const POLLING_INTERVAL = 500;

// The callback below is marked as `async` so we can `await` a Promise.
// `getCpuUsage()` returns a Promise that resolves when os-utils finishes
// measuring CPU usage (this measurement is inherently asynchronous).
// Using async/await keeps the event loop non-blocking and the code readable.
export const pollResources = (mainWindow: BrowserWindow) => {
  setInterval(async () => {
    const cpuUsage = await getCpuUsage();
    const ramUsage = getRamUsage();
    const storageData = getStorageData();
    ipcWebContentsSend('statistics', mainWindow.webContents, {
      cpuUsage,
      ramUsage,
      storageUsage: storageData.usage,
    });
  }, POLLING_INTERVAL);
};

// get static data to display in the UI
export const getStaticData = () => {
  const totalStorage = getStorageData().totalSpace;
  const cpuModel = os.cpus()[0].model;
  const totalMemoryGB = Math.floor(osUtils.totalmem() / 1024);
  console.log(totalStorage, cpuModel, totalMemoryGB);
  return {
    totalStorage,
    cpuModel,
    totalMemoryGB,
  };
};

const getCpuUsage = (): Promise<number> => {
  // osUtils.cpuUsage expects a callback: cpu => { ... } that is invoked later
  // when the library completes its sampling. We wrap that callback-based API
  // into a Promise so higher-level code can `await` it.
  // `resolve` is the function provided by the Promise constructor to mark the
  // Promise as fulfilled with a value. Here, we pass `resolve` directly to
  // osUtils.cpuUsage, so when osUtils computes the CPU percentage, it calls
  // our `resolve(percentage)`, which settles the Promise. This allows callers
  // (like pollResources) to write `const cpu = await getCpuUsage();` instead of
  // nesting callbacks, keeping the main thread unblocked and the flow linear.
  // Note: os-utils does not provide an error for this call, so we don't use
  // `reject` here.
  return new Promise((resolve) => osUtils.cpuUsage(resolve));
};

// osUtils.freememPercentage() is a value from 0 to 1, so we return 1 - it to get a value from 0 to 1
const getRamUsage = () => {
  return 1 - osUtils.freememPercentage();
};

const getStorageData = () => {
  // we want the whole disk space in the machine
  const stats = fs.statfsSync(process.platform === 'win32' ? 'C://' : '/');
  // on a disk everything is stored in block of bites
  const total = stats.bsize * stats.blocks;
  // how big each block is and how many free blocks there are
  const free = stats.bsize * stats.bfree;
  return {
    // in GB because 1_000_000 bytes = 1 GB
    // floor to remove decimals
    totalSpace: Math.floor(total / 1_000_000),
    usage: 1 - free / total, // how much of a % is free on my disk and 1 - to get the space used currently
    freeSpace: Math.floor(free / 1_000_000),
  };
};
