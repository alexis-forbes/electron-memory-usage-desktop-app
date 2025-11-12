import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getStaticData, pollResources } from "./resourceManager.js";
import { getPreloadPath } from "./pathResolver.js";

// interact with the app
// waiting for an event in the app
// once it is ready, let's create a window
app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        title: "Memory Usage",
        width: 800,
        height: 600,
        webPreferences: {
            preload: getPreloadPath()
        },
    });
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5123");
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
    }

    pollResources(mainWindow);

    ipcMain.handle("getStaticData", () => {
        return getStaticData();
    });
});