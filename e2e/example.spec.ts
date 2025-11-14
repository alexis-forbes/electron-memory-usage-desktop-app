import { test, expect, _electron } from '@playwright/test';

let electronApp: Awaited<ReturnType<typeof _electron.launch>> | null = null;
let mainPage: Awaited<ReturnType<Awaited<ReturnType<typeof _electron.launch>>['firstWindow']>> | null = null;

// avoids race condition with preload script
// race condition is that the preload script may not be loaded before the test tries to use it
async function waitForPreloadScript() {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
     const electronBridge = await mainPage?.evaluate(() => {
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

/**
 * Cleans up after each test by closing all Electron windows and the application.
 * This ensures a clean state for subsequent tests and prevents resource leaks.
 * 
 * The cleanup process:
 * 1. Checks if there's an active Electron app instance
 * 2. Closes all open windows in parallel
 * 3. Closes the main Electron application
 * 4. Handles any errors during cleanup
 * 5. Ensures all references are cleaned up in the finally block
 * 
 * @async
 * @function
 * @throws {Error} If there's an error during the cleanup process
 * @returns {Promise<void>} A promise that resolves when cleanup is complete
 */
test.afterEach(async () => {
  try {
    if (electronApp) {
      try {
        // Close all windows first simultaneously
        // windows.map(w => w.close()) creates an array of promises for closing each window.
        // Promise.all() waits for all close operations to complete in parallel.
        const windows = await electronApp.windows();
        await Promise.all(windows.map(w => w.close()));
        
        // Then close the app
        await electronApp.close();
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    }
  } catch (error) {
    console.error('Error in afterEach cleanup:', error);
  } finally {
    // Setting these references to null allows the garbage collector to reclaim the memory.
    // This prevents memory leaks and ensures proper cleanup between tests.
    electronApp = null;
    mainPage = null;
  }
});

test('Custom frame should minimize the mainWindow', async () => {
  await mainPage?.click('#minimize')
  const isMinimized = await electronApp?.evaluate((electron) => {
    // Test that the app is still running after minimize
    return electron.BrowserWindow.getAllWindows()[0].isMinimized();
  });
  expect(isMinimized).toBeTruthy();
})

test('should create a menu', async () => {
  // Test that the app creates a custom menu
  const menu = await electronApp?.evaluate((electron) => {
    return electron.Menu.getApplicationMenu();
  });
  expect(menu).not.toBeNull();
  expect(menu).toBeDefined();
  const menuTitles = menu?.items.map(item => item.label) || [];
  expect(menuTitles).toContain('View');
})

