const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

const { loginTikTok } = require('./services/login');
const { getVideosByChannelInRange } = require('./services/tiktok-scraper');
const { resolveNoWatermarkFromPage } = require('./services/tiktok-resolver');
const { downloadMp4, guessFilePath } = require('./services/downloader');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile('./renderer/index.html');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// IPC routes
ipcMain.handle('login', async () => loginTikTok());
ipcMain.handle('scan', async (e, { url, startDate, endDate }) => {
  const { scanProfile } = require('./services/tiktok-scraper');
  const send = (data) => e.sender.send('scan:progress', data);
  // from/to vẫn truyền như renderer gửi lên (đã hỗ trợ DD/MM/YYYY & YYYY-MM-DD)
  return scanProfile({ profile: url, from: startDate, to: endDate }, send);
});
ipcMain.handle('resolve', async (_e, videoUrl) => resolveNoWatermarkFromPage(videoUrl));
ipcMain.handle('download', async (_e, { url, id }) => downloadMp4(url, id));
ipcMain.handle('pick-file', async (_e, id) => {
  const p = guessFilePath(id);
  if (p) shell.showItemInFolder(p);
  return p;
});
ipcMain.handle('upload', async (_e, { filePath, caption }) => {
  const { uploadToTikTok } = require('./services/uploader');
  return uploadToTikTok(filePath, { caption });
});