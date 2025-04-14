//add functionality to the app window***
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
});

ipcMain.on('close-window', () => {
    mainWindow.close();
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 384,
        height: 600,
        frame: false, // This removes the default window controls
        transparent: true, // for custom window shapes (might consider this in the future)
        resizable: false, // fixed window size
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false, // Only needed if you get CORS errors with local images
        }
    });

    mainWindow.loadFile('index.html');

    const menuTemplate = [
        {
            label: 'Egg Timer',
            submenu: [
                {
                    label: 'Start Cooking',
                    click: () => mainWindow.webContents.send('show-selection')
                },
                {
                    label: 'Snooze/Pause',
                    click: () => mainWindow.webContents.send('toggle-pause')
                },
                {
                    label: 'Stop Timer',
                    click: () => mainWindow.webContents.send('stop-timer')
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    role: 'quit'
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // Clear cache after window is loaded
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.session.clearCache().then(() => {
            console.log('Cache cleared');
        });
    });

    ipcMain.on('exit-app', () => {
        app.quit();
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});