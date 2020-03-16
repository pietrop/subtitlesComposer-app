// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
"use strict";

//TODO: see if can move this code in main.js and if it still works when packaged.
const fixPath = require('fix-path');
//=> '/usr/bin'
fixPath();

const fs = require('fs');
const path = require('path');
const electron = require('electron');
const {shell} = require('electron')
const {dialog} = require('electron').remote;
const  remote = require('electron').remote;


/** 
* https://www.npmjs.com/package/electron-in-page-search 
* setup electro/chrome search plugin
*/
const searchInPage = require('electron-in-page-search').default;
const inPageSearch = searchInPage(remote.getCurrentWebContents());
document.getElementById('searchBtn').addEventListener('click', () => {
    inPageSearch.openSearchWindow();
});

const ffmpegFormats = require('./lib/ffmpeg_formats/index.js');
const convertTimeCodeToSeconds = require('./lib/convert_timecode_to_seconds');

const  subtitlescomposer = require('subtitlescomposer');
const  subtitlescomposerPrepText = require('subtitlescomposer').prepText;
const  subtitlescomposerRunAeneasComand = require('subtitlescomposer').runAeneasComand;

var currentWindow = electron.remote.getCurrentWindow();
var electronShell = require("electron").shell;
var dataPath = currentWindow.dataPath.replace(/ /g,"\\ "); 
var desktopPath = currentWindow.desktopPath;
var appPath = currentWindow.appPath;
var homePath = electron.remote.app.getPath('home');



console.info("dataPath",dataPath);
console.info("desktopPath",desktopPath);
console.info("appPath",appPath);
console.info("homePath",homePath);

var selectFileBtnEl = document.getElementById('selectFileBtn');
var selectTextFileBtnEl = document.getElementById('selectTextFileBtn');
var createSubtitlesEl = document.getElementById('createSubtitles');
const segmentTextEl = document.getElementById('segmentText');
var videoPreviewEl = document.getElementById('videoPreview');
var textBoxEl = document.getElementById('textBox');
var checkboxInputEl = document.getElementById('checkboxInput');

var inputHeadTailEl = document.getElementById('inputHeadTail');
var inputEndTailEl = document.getElementById('inputEndTail');

var charPerLineInputEl = document.getElementById('charPerLineInput');

var displayInputFileNameEl = document.getElementById('displayInputFileName');

var selectCaptionFormatEl = document.getElementById('selectCaptionFormat');
var selectLanguageForAlignementEl = document.getElementById('selectLanguageForAlignement');

var noticeBoxEl = document.querySelector('.noticeBox');

var resetEl = document.querySelector('#reset');

var aeneasSetupDivEl = document.querySelector('#aeneasSetupDiv');

const displayDestPathEl = document.getElementById('displayDestPath');


var timeout = null;
var resumeTiypingTimeInterval = 600;
var startStopPlayingVideoOntyping = false;
var sourceVideoPath ="";
global.optionalPathToAeneasBinary = "";


let defaultCaptionName = path.join(desktopPath,`default.${getCaptionsFileFormat()}`);

// setDestPath(defaultCaptionName);
setOutputFileDest(defaultCaptionName);

function setDestPathDisplay(dest){
	displayDestPathEl.innerText = dest;
}

function getOutputFileName(){
	return defaultCaptionName;
}

function setOutputFileName(dest){
	const destWithExt = `${dest}.${getCaptionsFileFormat()}`
	setDestPathDisplay(destWithExt)
	defaultCaptionName = destWithExt;
}

function setOutputFileDest(dest){
	const destWithExt = `${dest}`
	setDestPathDisplay(destWithExt)
	defaultCaptionName = destWithExt;
}

function setNewExtensionOnOutputFileName(ext){
	const outPutFileName = getOutputFileName();
	const parsedPath = path.parse(outPutFileName);
	console.log(parsedPath);
	const dir = parsedPath.dir;
	const name = parsedPath.name;
	const newPath = path.join(dir,`${name}.${ext}`)
	setOutputFileDest(newPath)
}

function formatOutputFileName(fileName){
	// var tmpInputBaseFileName =  path.basename(sourceVideoPath.replace(/(\s+)/g, '\\$1'));
	return fileName+"."+getCaptionsFileFormat();
}


setAeneasSetupInstructions();

resetEl.onclick=function(e){
	var confirmation = confirm("This action will reset the app, removing video and text form the app, are you sure you want to continue?");

	if (confirmation) {
	    resetVideoPreviewEl("");
		setTextBoxContent("");
		populateNoticeBox("");
		setDisplayInputFileNameEl("");
	}else{
		alert("Relax, all is good.")
	}
	
};

checkboxInputEl.onclick = function(e){
	// e.preventDefault();
	if(startStopPlayingVideoOntyping == false){
		startStopPlayingVideoOntyping = true;
	}else{
		startStopPlayingVideoOntyping = false;
	}
};



selectFileBtnEl.onclick = function(){
	// e.preventDefault()

	dialog.showOpenDialog({filters: [
		{ name: 'All Files', extensions: ffmpegFormats }
		],
		properties: ['openFile']}, function(file){
		console.info('opening file: ', file[0]);
		sourceVideoPath = file[0];
		loadHtml5Video(sourceVideoPath);
		//reset 
		populateNoticeBox("");
		setDisplayInputFileNameEl(sourceVideoPath);
		// loadEditorWithDummyText();
		// createSubtitlesEl.disabled = false;
	});
};



selectTextFileBtnEl.onclick = function(){
	// e.preventDefault()

	dialog.showOpenDialog({filters: [
    		{ name: 'All Files', extensions: ['txt'] }
		], properties: ['openFile']}, function(file){
		console.info('opening file: ', file[0]);
		var tmpTextFilePath = file[0];
		var tmpTextFile = fs.readFileSync(tmpTextFilePath).toString('utf-8');
		setTextBoxContent(tmpTextFile)
		//reset 
		populateNoticeBox("");
		// loadEditorWithDummyText();

	});
};

selectDestPathBtn.onclick = function(){
	
	dialog.showSaveDialog(
	 function(file){
		console.info('saving file:', file);
	// var tmpTextFilePath = file[0];
	// var tmpTextFile = fs.readFileSync(tmpTextFilePath).toString('utf-8');
	// setTextBoxContent(tmpTextFile)
	//reset 
	// populateNoticeBox("");
	// loadEditorWithDummyText();
	
		setOutputFileName(file)
	});
}

function disableCreateSubtitlesBtn(bool){
	if(bool){
		createSubtitlesEl.innerText = "Processing ...";
		createSubtitlesEl.disabled = bool;
	}else{
		createSubtitlesEl.innerText = "Create Subtitle";
		createSubtitlesEl.disabled = bool;
	}	
}


createSubtitlesEl.onclick = function(){
	console.info("Creating subtitles");
	disableCreateSubtitlesBtn(true);
	//reset notice box.
	populateNoticeBox("");
	//assumes allignment has been run, perhaps add a boolean flag to check that it is the case. 

	var tmpInputBaseFileName =  path.basename(sourceVideoPath.replace(/(\s+)/g, '\\$1'));
	// var tmpOutputFileName = tmpInputBaseFileName+"."+getCaptionsFileFormat();
	// var  subtitlesComposer = require('../node_modules/subtitlescomposer');
	// var tmpOutputFilePath =  path.join(desktopPath, tmpOutputFileName);
	const tmpOutputFilePath = getOutputFileName().replace(/(\s+)/g, '\\$1');

	fs.mkdir(homePath+"/tmp",function(err){
	    if (!err) {
			console.log("tmp directory created successfully!");
		}
	});

	fs.writeFileSync(homePath+"/tmp/segmentedtext.tmp.txt", getContentFromTextEditor());

	subtitlescomposerRunAeneasComand({
		// punctuationTextContent: getContentFromTextEditor(),
		// the number of character per srt subtitle file line.
		// TODO: add param to specify with default 
		numberOfCharPerLine: getCharPerLineInput(),
		// where to save intermediate segmented text file needed for aeneas module 
		segmentedTextInput: path.join(homePath,'tmp','segmentedtext.tmp.txt'),
		//audio or video file to use for aeneas alignement as original source 
		mediaFile: sourceVideoPath,
		outputCaptionFile: tmpOutputFilePath,
		// outputCaptionFile: getOutputFileName(),
		//TODO Add as possibility for costumize in UI
		//ignore this many seconds at end of audio
		audio_file_tail_length: getInputEndTail(),
		//ignore this many seconds at begin of audio
		audio_file_head_length : getInputHeadTail(),
		captionFileFormat : getCaptionsFileFormat(),
		language: getLanguageForAlignement(),
		optionalPathToAeneasBinary: getOptionalPathToAeneasBinary()
		}, 
		function(filePath){
			console.log('filePath', filePath);

			// var tmpInputBaseFileNameEnd =  path.basename(sourceVideoPath);
			// var tmpOutputFileNameEnd 	= tmpInputBaseFileNameEnd+"."+getCaptionsFileFormat();
			// var tmpOutputFilePathEnd 	=  path.join(desktopPath, tmpOutputFileNameEnd);
			// var result = fs.readFileSync(tmpOutputFilePathEnd).toString();
			// console.log(result);

			successMessage(path.parse(tmpOutputFilePath).dir,path.parse(tmpOutputFilePath).name, getCaptionsFileFormat());
			// successMessage(tmpOutputFilePath);
			// shell.openItem(desktopPath);
			// shell.openItem(filePath);
			disableCreateSubtitlesBtn(false);			
	});

};


function successMessage(path,fileName, fileType){

	var message = `<strong>Success!</strong> a ${fileType} has been saved <br>
	<strong id="openPath">${path}/</strong><br>
	<strong id="openFile">${fileName}.${fileType}</strong>`

	populateNoticeBox(makeNotice(message))
}


function populateNoticeBox(message){
	noticeBoxEl.innerHTML= message;
}


function makeNotice(message){
	return`<div class="alert alert-success alert-dismissible" role="alert">
  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
  ${message}</div>`

}

function getCaptionsFileFormat(){
	return selectCaptionFormatEl.value ;
}

selectCaptionFormatEl.onchange = (e)=>{
	const ext = e.target.value;
	setNewExtensionOnOutputFileName(ext);
}

function getLanguageForAlignement(){
	return selectLanguageForAlignementEl.value;
	setNewExtensionOnOutputFileName(ext)
}


function getContentFromTextEditor(){
	//TODO: add sanitise step.
	return textBoxEl.innerText;

}

function resetVideoPreviewEl(){
	videoPreviewEl.innerHTML ="";
}

function loadHtml5Video(path){
	videoPreviewEl.innerHTML = `<video width="100%" controls>
  <source src="${path}" type="video/mp4">`;
  initializeVideoPlayPuaseTypingPreferences();
}

// TODO: you can't seem to be able to change this preference after having loaded the video. Needs fixing.
// Use case, you are reviewing the text without emphasis on a speicific part.
function initializeVideoPlayPuaseTypingPreferences(){

	textBoxEl.onkeyup = function () {
		if(startStopPlayingVideoOntyping){
			clearTimeout(timeout);
			pauseVideo();
			//add timer logic to start playing after set interval.
			timeout = setTimeout(function () {
		        // console.log('Input Value:', textInput.value);
		        playVideo();
	  		 }, resumeTiypingTimeInterval);
		}
	};
};


function setDisplayInputFileNameEl(text){
	displayInputFileNameEl.innerText = text;
}


function openFile(path){
	return fs.readFileSync(path,'utf8').toString('utf-8');
}

function setTextBoxContent(text){
	//todo: sanitise `text`
	textBoxEl.innerText = text;
}

function getInputHeadTail(){
	//TODO: convert
	return convertTimeCodeToSeconds(inputHeadTailEl.value);
}

function getInputEndTail(){
	//TODO: convert
	return convertTimeCodeToSeconds(inputEndTailEl.value);
}

function getCharPerLineInput(){
	return charPerLineInputEl.value;
}


function getTextBoxContent(){
	// convert from html
	return textBoxEl.innerHTML;
}

function playVideo(){
	var video = document.querySelector('video');
	video.play();	
}

function pauseVideo(){
	var video = document.querySelector('video');
	video.pause();
}



function setAeneasSetupInstructions() {
	if(process.platform ==='darwin'){
		document.querySelector('#installAeneasLinux').style.display = "none";
		document.querySelector('#installAeneasMac').style.display = "";
	}
	else if(process.platform ==='linux'){
		document.querySelector('#installAeneasMac').style.display = "none";
		document.querySelector('#installAeneasLinux').style.display = "";
	}
}

function getOptionalPathToAeneasBinary(){
	// return optionalPathToAeneasBinary
	return global.optionalPathToAeneasBinary;
}


function populateAeneasSetupDivEl(html){
	aeneasSetupDivEl.innerHTML=html;
}

const charCountDisplayEl = document.querySelector('#charCountDisplay');
window.addEventListener('mouseup', e => {
	const text = document.getSelection().toString();
	const length = document.getSelection().toString().length;
	charCountDisplayEl.value = length;
	console.log(length)
})
  

segmentTextEl.onclick = ()=>{
	populateNoticeBox("Segmenting text...");
	// disableCreateSubtitlesBtn(true);

	subtitlescomposerPrepText({
		punctuationTextContent: getContentFromTextEditor(),
		numberOfCharPerLine: getCharPerLineInput()
		}, 
		(text)=>{
			populateNoticeBox("Segmented text, review and click create subtitles to continue");
			console.log(text)
			// disableCreateSubtitlesBtn(false);
			setTextBoxContent(text)
			createSubtitlesEl.disabled = false;
		})
}
