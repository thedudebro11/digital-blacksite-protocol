const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let blockedFilePath = "";  // Store the blocked file path here
let blockedRuleName = "";  // Store the rule name for unblocking

// Create the window
function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Preload script for renderer
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  console.log('Loading:', path.join(__dirname, 'build', 'index.html'));
  console.log('✅ Attempting to load GUI from build/index.html...');
  win.loadFile(path.join(__dirname, 'build', 'index.html'));
}

// Listen for command events from the renderer
ipcMain.on('run-command', async (event, commandLabel) => {
  let command = '';
  console.log(`Command received: ${commandLabel}`);

  // First check to make sure the file path is set for Block/Unblock Cracked EXEs
  if (commandLabel === 'Block Cracked EXEs' || commandLabel === 'Unblock Cracked EXEs') {
    if (!blockedFilePath) {
      console.log("❌ No file selected for blocking/unblocking.");
      event.reply('command-response', `❌ No file selected.`);
      return; // Exit if no file is selected
    }
  }

  switch (commandLabel) {
    // ✅ Create/Remove BlacksiteUser
    case 'Create BlacksiteUser':
      command = `
        powershell -Command "
        if (-not (Get-LocalUser -Name 'BlacksiteUser')) {
          net user BlacksiteUser Blacksite2025! /add;
        } else {
          Write-Host 'User already exists';
        }"
      `;
      break;

    case 'Remove BlacksiteUser':
      command = `
        powershell -Command "
        if (Get-LocalUser -Name 'BlacksiteUser') {
          net user BlacksiteUser /delete;
        } else {
          Write-Host 'User does not exist';
        }"
      `;
      break;

    // ✅ Block/Unblock All Outbound Traffic
    case 'Block All Outbound Traffic':
      command = `powershell -Command "Set-NetFirewallProfile -All -DefaultOutboundAction Block;
                  New-NetFirewallRule -DisplayName 'Allow svchost' -Direction Outbound -Program 'C:\\Windows\\System32\\svchost.exe' -Action Allow -Profile Any;
                  New-NetFirewallRule -DisplayName 'Allow DNS' -Direction Outbound -Protocol UDP -RemotePort 53 -Action Allow -Profile Any;
                  New-NetFirewallRule -DisplayName 'Allow Windows Update' -Direction Outbound -Service wuauserv -Action Allow -Profile Any"`;
      break;

    case 'Reverse Lockdown':
      command = `powershell -Command "Set-NetFirewallProfile -All -DefaultOutboundAction Allow"`;
      break;

    // ✅ Whitelist/Unwhitelist Essential Programs
    case 'Whitelist Essential Programs':
      command = `powershell -Command "New-NetFirewallRule -DisplayName 'Allow svchost' -Direction Outbound -Program 'C:\\Windows\\System32\\svchost.exe' -Action Allow -Profile Any"`;
      break;

    case 'Unwhitelist Essential Programs':
      command = `powershell -Command "Get-NetFirewallRule -DisplayName 'Allow svchost' | Remove-NetFirewallRule"`;
      break;

      case 'Block Cracked EXEs':
        console.log("Dialog opening...");
      
        // Test the dialog functionality here
        dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [{ name: 'Executables', extensions: ['exe'] }]
        }).then(result => {
          console.log("Dialog result:", result.canceled, result.filePaths);  // Log the result of the file dialog
      
          // Ensure the file path is selected
          if (!result.canceled && result.filePaths.length > 0) {
            blockedFilePath = result.filePaths[0];  // Set the blockedFilePath
            blockedRuleName = `Block ${path.basename(blockedFilePath)}`;  // Use the file's name as part of the rule name
            console.log(`Blocking: ${blockedFilePath}, Rule name: ${blockedRuleName}`);
      
            // Ensure the file path is quoted correctly
            const quotedFilePath = `"${blockedFilePath}"`;
            console.log(`Quoted file path for blocking: ${quotedFilePath}`);
      
            // Check if the rule already exists before creating a new one
            const checkCommand = `powershell -Command "Get-NetFirewallRule | Where-Object { $_.DisplayName -eq '${blockedRuleName}' }"`;
      
            console.log(`Running check command for rule existence: ${checkCommand}`);
            exec(checkCommand, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
              if (error) {
                console.error(`Error during rule check: ${stderr}`);
                event.reply('command-response', `❌ Failed: ${stderr || error.message}`);
                return;
              }
      
              console.log(`Check command output: ${stdout}`);
      
              if (stdout && stdout.trim()) {
                console.log(`Rule already exists for: ${blockedFilePath}`);
                event.reply('command-response', `✅ Rule already exists for: ${blockedFilePath}`);
                return; // Exit without creating a new rule
              }
      
              // If rule does not exist, create it
              const createCommand = `powershell -Command "New-NetFirewallRule -DisplayName '${blockedRuleName}' -Program ${quotedFilePath} -Action Block -Direction Outbound -Profile Any"`;
      
              console.log(`Running create command for blocking the file: ${createCommand}`);
              exec(createCommand, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
                if (error) {
                  console.error(`Error during rule creation: ${stderr}`);
                  event.reply('command-response', `❌ Failed: ${stderr || error.message}`);
                  return;
                }
      
                console.log(`Successfully blocked: ${blockedFilePath}`);
                event.reply('command-response', `✅ Successfully blocked: ${blockedFilePath}`);
              });
            });
      
          } else {
            console.log("No file selected or the dialog was canceled.");
            event.reply('command-response', `❌ No file selected.`);
          }
        }).catch(err => {
          console.error('Dialog failed:', err);
          event.reply('command-response', `❌ Failed to open dialog.`);
        });
        break;
      

    case 'Unblock Cracked EXEs':
      const quotedFilePathForUnblock = `"${blockedFilePath}"`;
      const removeCommand = `powershell -Command "Get-NetFirewallRule | Where-Object { $_.DisplayName -eq '${blockedRuleName}' } | Remove-NetFirewallRule"`;
      exec(removeCommand, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
        if (error) {
          event.reply('command-response', `❌ Failed: ${stderr || error.message}`);
          return;
        }
        event.reply('command-response', `✅ Successfully unblocked: ${blockedFilePath}`);
      });
      break;

    default:
      event.reply('command-response', '❌ Unknown command');
      break;

    // ✅ Inject/Remove Sinkhole from HOSTS File
    case 'Inject Sinkhole into HOSTS File':
      command = `powershell -Command "Add-Content -Path '$env:SystemRoot\\System32\\drivers\\etc\\hosts' -Value '0.0.0.0 adobe.com' + '\n' + '0.0.0.0 activate.adobe.com'"`;
      break;

    case 'Remove Sinkhole from HOSTS File':
      command = `powershell -Command "(Get-Content '$env:SystemRoot\\System32\\drivers\\etc\\hosts') | Where-Object {$_ -notmatch 'adobe.com'} | Set-Content '$env:SystemRoot\\System32\\drivers\\etc\\hosts'"`;
      break;

    // ✅ Enable/Disable Controlled Folder Access
    case 'Enable Controlled Folder Access':
      command = `powershell -Command "Set-MpPreference -EnableControlledFolderAccess Enabled"`;
      break;

    case 'Disable Controlled Folder Access':
      command = `powershell -Command "Set-MpPreference -EnableControlledFolderAccess Disabled"`;
      break;

    // ✅ Disable/Enable All Network Interfaces
    case 'Disable All Network Interfaces':
      command = `powershell -Command "Get-NetAdapter | Disable-NetAdapter -Confirm:$false"`;
      break;

    case 'Enable All Network Interfaces':
      command = `powershell -Command "Get-NetAdapter | Enable-NetAdapter -Confirm:$false"`;
      break;

    // ✅ One-way action
    case 'Run BleachBit Cleanup':
      command = `powershell -Command "& 'C:\\Program Files\\BleachBit\\bleachbit_console.exe' --clean system.tmp system.cache system.clipboard"`;
      break;
  }

  console.log('Running command:', command);
  event.reply('command-response', `🧪 Command to be run: ${command}`);

  exec(command, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
    if (error) {
      console.error(`ERROR: ${stderr}`);
      event.reply('command-response', `❌ Failed: ${stderr || error.message}`);
      return;
    }
    event.reply('command-response', `✅ ${commandLabel} complete.`);
  });
});

app.whenReady().then(() => {
  createWindow();

  // Ensure dialog only triggers after window is ready and loaded
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Executables', extensions: ['exe'] }]
  }).then(result => {
    console.log("Dialog result:", result.canceled, result.filePaths); // Check if dialog worked
    if (!result.canceled && result.filePaths.length > 0) {
      blockedFilePath = result.filePaths[0];
      blockedRuleName = `Block ${path.basename(blockedFilePath)}`;
      console.log(`Blocking: ${blockedFilePath}`);
      
      // Ensure the file path is quoted correctly for powershell command
      const quotedFilePath = `"${blockedFilePath}"`;

      const checkCommand = `powershell -Command "Get-NetFirewallRule | Where-Object { $_.DisplayName -eq '${blockedRuleName}' }"`;

      exec(checkCommand, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error during rule check: ${stderr}`);
        }

        if (stdout && stdout.trim()) {
          console.log(`Rule already exists for: ${blockedFilePath}`);
        } else {
          // Create a rule if not already present
          const createCommand = `powershell -Command "New-NetFirewallRule -DisplayName '${blockedRuleName}' -Program ${quotedFilePath} -Action Block -Direction Outbound -Profile Any"`;
          exec(createCommand, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error during rule creation: ${stderr}`);
            }
            console.log(`Successfully blocked: ${blockedFilePath}`);
          });
        }
      });
    } else {
      console.log("No file selected or the dialog was canceled.");
    }
  }).catch(err => {
    console.error('Dialog failed:', err);
  });
});

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
