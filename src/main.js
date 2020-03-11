const electron = require('electron');
// Module to control application life.
const app = electron.app;
const Menu = electron.Menu;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200, 
    height: 900,
    minWidth: 900
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

   mainWindow.dataPath = app.getPath("desktop");
   console.log("app.getPath(appData)",app.getPath("appData"));
   mainWindow.app = app;

    mainWindow.desktopPath = app.getPath("desktop");
    mainWindow.appPath = app.getAppPath();
    // mainWindow.desktopPath = desktopPath;


 // MENU
 // Create the Application's main menu
    var template = [{
        label: "Application",
        submenu: [
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            {role: 'pasteandmatchstyle'},
            {role: 'delete'},
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
            {type: 'separator'},
            {label: 'Speech',
              submenu: [
                {role: 'startspeaking'}, //perhaps add keyboard shortcut?
                {role: 'stopspeaking'} //perhaps add keyboard shortcut?
              ]}
        ]},{
        label: 'View',
        submenu: [
          {role: 'reload'},
          {role: 'forcereload'},
          {role: 'toggledevtools', accelerator: "CmdOrCtrl+Alt+I"},
          {type: 'separator'},
          {role: 'resetzoom'},
          {role: 'zoomin'},
          {role: 'zoomout'},
          {type: 'separator'},
          {role: 'togglefullscreen'}
        ]},{
        role: 'window',
        submenu: [
          {role: 'minimize'},
          {role: 'close'},
          { type: 'separator' },
          {
              label: 'New main window',
              click() {
                  createWindow();
              },
              accelerator: 'CmdOrCtrl+N'
          }
        ]},{
        role: 'help',
        submenu: [
          {
            label: 'Project Page',
            click () { require('electron').shell.openExternal('https://github.com/pietrop/Caption_Maker') }
          },
          {
            label: 'User Manual',
            click () { require('electron').shell.openExternal('https://github.com/pietrop/Caption_Maker') }
          }
        ]}
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));


   //to open external url with default browser by default. 
   mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// 
// 
function runAeneasComand(config,cb){
  var mediaFile = config.mediaFile;
  var textFile = config.textFile;
  var language = config.language;
  var captionFileFormat = config.captionFileFormat;
  var audio_file_head_length = config.audio_file_head_length;//eg 12.000
  var audio_file_tail_length = config.audio_file_tail_length; //16.000
  // var tmpTextFileName = dataPath +"/"+ fileName;
  var fileName = path.basename(mediaFile);
  var outputCaptionFile = dataPath+"/"+fileName+"."+captionFileFormat;
  // console.log(JSON.stringify(config,null,2));
  var outPutSegmentedFile = config.outPutSegmentedFile;
  console.log("Aeneas outPutSegmentedFile",outPutSegmentedFile);
  ///usr/local/bin/aeneas_execute_task
  var aeneasComandString = `/usr/local/bin/aeneas_execute_task "${mediaFile}" "${outPutSegmentedFile}" "task_language=${language}|os_task_file_format=${captionFileFormat}|is_text_type=subtitles|is_audio_file_head_length=${audio_file_head_length}|is_audio_file_tail_length=${audio_file_tail_length}|task_adjust_boundary_nonspeech_min=1.000|task_adjust_boundary_nonspeech_string=REMOVE|task_adjust_boundary_algorithm=percent|task_adjust_boundary_percent_value=75|is_text_file_ignore_regex=[*]" ${outputCaptionFile}`;
  // var productionEnv = Object.create(process.env);
  var aeneasPath = "/usr/local/bin/aeneas_execute_task";
  var ffmpegPath = "/usr/local/bin/ffmpeg";
  var ffprobePath = "/usr/local/bin/ffprobe";
  var espeakPath = "/usr/local/bin/espeak";
  var envVar =   {'ffmpeg': ffmpegPath , 'ffprobe': ffprobePath, 'espeak':espeakPath, 'aeneas_execute_task': aeneasPath};
  var options ={env: envVar, cwd: appPath}
  exec(aeneasComandString, function(error, stdout, stderr) {
      console.log('stdout runAeneasComand: ' + stdout);
      console.log('stderr runAeneasComand: ' + stderr);
      if(cb){cb(outputCaptionFile)};
      if (error !== null) {
          console.log('exec error: ' + error);
      }
  });

  //
  // var executablePath = "/usr/local/bin/aeneas_execute_task";
  // var parameters = [mediaFile,outPutSegmentedFile,"task_language",language,"--skip-validator", "os_task_file_format",captionFileFormat,"is_text_type","subtitles", "is_audio_file_head_length",audio_file_head_length,"is_audio_file_tail_length",audio_file_tail_length,"task_adjust_boundary_nonspeech_min",1.000,"task_adjust_boundary_nonspeech_string","REMOVE","task_adjust_boundary_algorithm","percent","task_adjust_boundary_percent_value",75,"is_text_file_ignore_regex","[*]",outputCaptionFile ];
  // const aeneasProcess = spawn(executablePath, parameters);

  // aeneasProcess.stdout.on('data', (data) => {
  //   console.log(`Result from aeneasProcess:  ${data}`);
  // });
  
  // var executablePath = "/usr/local/bin/aeneas_execute_task";
  // var aneneasComand = `${mediaFile} ${outPutSegmentedFile} "task_language=${language}|os_task_file_format=${captionFileFormat}|is_text_type=subtitles|is_audio_file_head_length=${audio_file_head_length}|is_audio_file_tail_length=${audio_file_tail_length}|task_adjust_boundary_nonspeech_min=1.000|task_adjust_boundary_nonspeech_string=REMOVE|task_adjust_boundary_algorithm=percent|task_adjust_boundary_percent_value=75|is_text_file_ignore_regex=[*]" ${outputCaptionFile}`
  // // var parameters = [mediaFile,outPutSegmentedFile,"task_language",language,"--skip-validator", "os_task_file_format",captionFileFormat,"is_text_type","subtitles", "is_audio_file_head_length",audio_file_head_length,"is_audio_file_tail_length",audio_file_tail_length,"task_adjust_boundary_nonspeech_min",1.000,"task_adjust_boundary_nonspeech_string","REMOVE","task_adjust_boundary_algorithm","percent","task_adjust_boundary_percent_value",75,"is_text_file_ignore_regex","[*]",outputCaptionFile ];
  // var parameters = []
  // parameters.push(aneneasComand);
  // child(executablePath, parameters, function(err, data) {
  //      console.log(err)
  //      console.log("data.toString()",data.toString());
  //      // fs.writeFileSync(outputCaptionFile,data.toString() ,"utf8");
  //      if(cb){cb(outputCaptionFile)};
  // });

}
