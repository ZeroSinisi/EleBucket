const {app, dialog, BrowserWindow, Menu, ipcMain} = require('electron');
const Repository = require('./src/js/repository.js');

let mainWin;
let menu;
let addWin;
let repoWindows = [];

function addRepo() {
    dialog.showOpenDialog(mainWin, {
        properties: ['openDirectory']
    }, filePaths => {
        let path = filePaths[0].replace("\\\\", "\\");
        let splitPath = path.split("\\");
        let name = splitPath[splitPath.length - 1];
        let repo = new Repository(name, path);
        repo.init().then(repo => {
            mainWin.webContents.send('repo:add', repo);
        })
    });
}

function createMainWindow() {
    mainWin = new BrowserWindow({
        width: 1200,
        height: 800
    });
    mainWin.loadFile('index.html');
    // mainWin.webContents.openDevTools();

    menu = Menu.buildFromTemplate([
        {
            label: "File",
            submenu: [
                {
                    label: "Add Repo",
                    click: (menuItem, browserWindow, e) => {
                        addRepo();
                    }
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);

    mainWin.on('closed', () => {
        mainWin = null;
        menu = null;
    });
}

function createRepoWindow(repo) {
    let repoWin = new BrowserWindow({
        width: 800,
        height: 600
    });
    repoWin.loadFile('src/elements/repoView.html');
    // mainWin.webContents.openDevTools();

    repoWin.setMenu(null);

    repoWin.on('closed', () => {
        repoWin = null;
    });

    repoWin.on('show', () => {
        console.log("showing repo window");
        repoWin.webContents.send('repo:select', repo);
    });

    repoWindows.push(repoWin);
}

ipcMain.on('repo:select', (e, repo) => {
    createRepoWindow(repo);
});

app.on('ready', createMainWindow);

app.on('windows-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    createWindow();
});
