/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import MenuBuilder from './menu';
import processWindows from 'node-process-windows';
import cmd from 'node-cmd';

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 750,
    height: 600,
    minWidth: 750,
    minHeight: 600,
    frame: false,
    resizable: true,
    transparent: true
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  ipcMain.on('app:close', function(e) {
    mainWindow.close();
  });
  ipcMain.on('app:minimize', function(e) {
    mainWindow.minimize();
  });
  ipcMain.on('app:maximize', function(e) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  //WoTLauncher.exe
  //WorldOfTanks.exe

  var seekTimeId = null;
  var updated = false;
  var laucherWasLaunched = false;
  var gameWasLaunched = false;
  var tempLauncherFlag = false;
  var tempGameFlag = false;
  var gameId = null;

  function seek() {
    //search for apps
    var activeProcesses = processWindows.getProcesses(function(err, processes) {
      tempGameFlag = false;

      processes.forEach(function(p) {
        //console.log(p);
        // if(p.processName == "WoTLauncher"){
        //   console.log('laucher found');
        //   tempLauncherFlag = true;
        // }
        if (p.processName == 'WorldOfTanks') {
          console.log('game found');
          tempGameFlag = true;
          gameId = p.pid;
        }
      });

      if (tempGameFlag) {
        console.log('initialize app');
        //update
        cmd.get('TASKKILL /PID ' + gameId + ' /F', function(
          err,
          stdin,
          stdout
        ) {
          console.log(err, stdin, stdout);
          mainWindow.show();
          mainWindow.focus();
        });
        // process.kill(gameId);
      } else if (!tempGameFlag && !tempLauncherFlag) {
        console.log('game is exit');
        //reset updater
      } else {
        console.log('accord not found');
      }

      laucherWasLaunched = tempLauncherFlag;
      gameWasLaunched = tempGameFlag;
      gameId = null;
      seekTimeId = setTimeout(seek, 100);
    });
  }

  mainWindow.on('restore', function(e) {
    console.log('game was restored');
    clearInterval(seekTimeId);
    laucherWasLaunched = false;
    gameWasLaunched = false;
  });

  mainWindow.on('minimize', function(e) {
    console.log('game was minimized');
    seek();
  });
  // processWindows.getProcesses(function(err, processes) {
  //   processes.forEach(function (p) {
  //     console.log(p);
  //   });
  // });
});
