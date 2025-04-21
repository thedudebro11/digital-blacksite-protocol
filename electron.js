const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { exec } = require('child_process')

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 👈 this line
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  

  console.log('Loading:', path.join(__dirname, 'build', 'index.html'))

  
  console.log('✅ Attempting to load GUI from build/index.html...')
  win.loadFile(path.join(__dirname, 'build', 'index.html'))




 
}
app.whenReady().then(createWindow)

// 🔥 Example: Listen for command events



ipcMain.on('run-command', (event, commandLabel) => {
  let command = ''

  switch (commandLabel) {
    case 'Create BlacksiteUser':
      command = `powershell -Command "net user BlacksiteUser Blacksite2025! /add"`;
      break;
  
      
    case 'Block All Outbound Traffic':
      command = `powershell -Command "Set-NetFirewallProfile -All -DefaultOutboundAction Block; New-NetFirewallRule -DisplayName 'Allow svchost' -Direction Outbound -Program 'C:\\Windows\\System32\\svchost.exe' -Action Allow -Profile Any; New-NetFirewallRule -DisplayName 'Allow DNS' -Direction Outbound -Protocol UDP -RemotePort 53 -Action Allow -Profile Any; New-NetFirewallRule -DisplayName 'Allow Windows Update' -Direction Outbound -Service wuauserv -Action Allow -Profile Any"`;
      break;      

    case 'Whitelist Essential Programs':
      command = `powershell -Command "New-NetFirewallRule -DisplayName 'Allow svchost' -Direction Outbound -Program 'C:\\Windows\\System32\\svchost.exe' -Action Allow -Profile Any"`;
      break;
  
    case 'Block Cracked EXEs':
      command = `powershell -Command "New-NetFirewallRule -DisplayName 'Block keygen.exe' -Program '*keygen.exe' -Action Block -Direction Outbound -Profile Any"`;
      break;
  
    case 'Inject Sinkhole into HOSTS File':
      command = `powershell -Command "Add-Content -Path '$env:SystemRoot\\System32\\drivers\\etc\\hosts' -Value '0.0.0.0 adobe.com` + "\n" + `0.0.0.0 activate.adobe.com'"`;
      break;
  
    case 'Enable Controlled Folder Access':
      command = `powershell -Command "Set-MpPreference -EnableControlledFolderAccess Enabled"`;
      break;
  
    case 'Disable All Network Interfaces':
      command = `powershell -Command "Get-NetAdapter | Disable-NetAdapter -Confirm:$false"`;
      break;
  
    case 'Run BleachBit Cleanup':
      command = `powershell -Command "& 'C:\\Program Files\\BleachBit\\bleachbit_console.exe' --clean system.tmp system.cache system.clipboard"`;
      break;
  
    default:
      event.reply('command-response', '❌ Unknown command');
      return;
  }
  
  
  
  
  console.log('Running command:', command);
  event.reply('command-response', `🧪 Command to be run: ${command}`);
  
  exec(command, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
    if (error) {
      console.error(`ERROR: ${stderr}`)
      event.reply('command-response', `❌ Failed: ${stderr || error.message}`)
      return
    }
    event.reply('command-response', `✅ ${commandLabel} complete.`)
  })
})
