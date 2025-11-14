import { test, expect, _electron } from '@playwright/test';

let electronApp: Awaited<ReturnType<typeof _electron.launch>>;
let mainPage: Awaited<ReturnType<typeof electronApp.firstWindow>>;

// avoids race condition with preload script
// race condition is that the preload script may not be loaded before the test tries to use it
async function waitForPreloadScript() {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
     const electronBridge = await mainPage.evaluate(() => {
        // Playwright does not use the tsconfig so we need to cast window
        // we get the electron object created in the preload script in main.ts preload
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (window as Window & { electron?: any }).electron;
      });
      if (electronBridge) {
        // stop polling and resolve the promise
        clearInterval(interval);
        resolve(true);
      }
    }, 100);
  });
}

test.beforeEach(async () => {
  electronApp = await _electron.launch({
    args: ['.'],
    env: { NODE_ENV: 'development' },
  });
  mainPage = await electronApp.firstWindow();
  await waitForPreloadScript();
});

test.afterEach(async () => {
  await electronApp.close();
});

test('Custom frame should minimize the mainWindow', async () => {
  await mainPage.click('#minimize')
  const isMinimized = await electronApp.evaluate((electron) => {
    // Test that the app is still running after minimize
    return electron.BrowserWindow.getAllWindows()[0].isMinimized();
  });
  expect(isMinimized).toBeTruthy();
})

test('should create a custom menu', async () => {
  // Test that the app creates a custom menu
  const menu = await electronApp.evaluate((electron) => {
    return electron.Menu.getApplicationMenu();
  });
  expect(menu).not.toBeNull();
  expect(menu).toBeDefined();
  expect(menu?.items).toHaveLength(2);
  expect(menu?.items[0].submenu?.items).toHaveLength(2);
  expect(menu?.items[1].submenu?.items).toHaveLength(3);
  expect(menu?.items[1].label).toBe('View');
})