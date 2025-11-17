/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, vi, expect, describe, Mock } from 'vitest';
import { createTray } from './tray.js';
import { BrowserWindow, Menu, app } from 'electron';

vi.mock("electron", () => {
  // Create a mock Tray class
  class MockTray {
    setContextMenu = vi.fn();
  }

  return {
      Tray: MockTray,
      app: {
        quit: vi.fn(),
        dock: {
          show: vi.fn()
        },
        getAppPath: vi.fn().mockReturnValue('/')
      },
      Menu: {
        buildFromTemplate: vi.fn().mockReturnValue({}),
        setApplicationMenu: vi.fn()
      }
    };
});

/**
 * Creates a type-safe mock of a BrowserWindow with the minimal required methods
 * for the tray functionality being tested.
 * 
 * Using `satisfies` ensures we get proper type checking for the mock implementation
 * while maintaining type safety. The `as BrowserWindow` cast is necessary because
 * the actual BrowserWindow has many more methods than we're mocking here.
 */
const mainWindow = {
    show: vi.fn(),   
} satisfies Partial<BrowserWindow> as any as BrowserWindow;

describe('Tray', () => {
  test('show Tray', () => {
    createTray(mainWindow);
    // check what params where given and functions pass, do this functions do what we expect
    // get all the calls happended to the buildFromTemplate function
    const calls = (Menu.buildFromTemplate as any as Mock).mock.calls;
    const args = calls[0] as Parameters<typeof Menu.buildFromTemplate>;
    const template = args[0];
    expect(template).toHaveLength(2);
    expect(template[0].label).toBe('Show App');
    expect(template[1].label).toBe('Quit');

    template[0]?.click?.(null as any, null as any, null as any);
    expect(mainWindow.show).toHaveBeenCalled();
    expect(app.dock?.show).toHaveBeenCalled();

    template[1]?.click?.(null as any, null as any, null as any);
    expect(app.quit).toHaveBeenCalled();
  })
});
