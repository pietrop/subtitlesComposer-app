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



const ffmpegFormats = require('./lib/ffmpeg_formats/index.js');
const convertTimeCodeToSeconds = require('./lib/convert_timecode_to_seconds');

var  subtitlescomposer = require('subtitlescomposer');

var currentWindow = electron.remote.getCurrentWindow();
var electronShell = require("electron").shell;
var dataPath = currentWindow.dataPath.replace(/ /g,"\\ "); 
var desktopPath = currentWindow.desktopPath;
var appPath = currentWindow.appPath;


console.info("dataPath",dataPath);
console.info("desktopPath",desktopPath);
console.info("appPath",appPath);


var selectFileBtnEl = document.getElementById('selectFileBtn');
var selectTextFileBtnEl = document.getElementById('selectTextFileBtn');
var createSubtitlesEl = document.getElementById('createSubtitles');
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

var timeout = null;
var resumeTiypingTimeInterval = 600;
var startStopPlayingVideoOntyping = false;
var sourceVideoPath ="";
global.optionalPathToAeneasBinary = "";

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
	var tmpOutputFileName = tmpInputBaseFileName+"."+getCaptionsFileFormat();
	// var  subtitlesComposer = require('../node_modules/subtitlescomposer');
	var tmpOutputFilePath =  path.join(desktopPath, tmpOutputFileName);

	subtitlescomposer({
		punctuationTextContent: getContentFromTextEditor(),
		// the number of character per srt subtitle file line.
		// TODO: add param to specify with default 
		numberOfCharPerLine: getCharPerLineInput(),
		// where to save intermediate segmented text file needed for aeneas module 
		segmentedTextInput: appPath+"/src/tmp/segmentedtext.tmp.txt",
		//audio or video file to use for aeneas alignement as original source 
		mediaFile: sourceVideoPath,
		outputCaptionFile: tmpOutputFilePath,
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

			var tmpInputBaseFileNameEnd =  path.basename(sourceVideoPath);
			var tmpOutputFileNameEnd 	= tmpInputBaseFileNameEnd+"."+getCaptionsFileFormat();
			var tmpOutputFilePathEnd 	=  path.join(desktopPath, tmpOutputFileNameEnd);
			var result = fs.readFileSync(tmpOutputFilePathEnd).toString();
			console.log(result);


			successMessage(desktopPath+"/",tmpOutputFileNameEnd, getCaptionsFileFormat());
			// shell.openItem(desktopPath);
			// shell.openItem(filePath);
			disableCreateSubtitlesBtn(false);
			

			
	});


	// var fileName = path.basename(sourceVideoPath);
	// //prompt user on where to save. add srt extension if possible. 
	// var newFilePath = desktopPath +"/"+ fileName+"."+getCaptionsFileFormat();
	// fs.writeFileSync(newFilePath, getContentFromTextEditor(), 'utf8');
	// // or just save to desktop. 
	// alert("your file has been saved on the desktop "+newFilePath);

};


function successMessage(path,fileName, fileType){

	var message = `<strong>Success!</strong> a ${fileType} has been saved <br>
	<strong id="openPath">${path}</strong><br>
	<strong id="openFile">${fileName}</strong>`

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

function getLanguageForAlignement(){
	return selectLanguageForAlignementEl.value;
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
	textBoxEl.innerHTML = text;
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

// global.setOptionalPathToAeneasBinary = function setOptionalPathToAeneasBinary(aeneasBinNewPath){
// 	 optionalPathToAeneasBinary = aeneasBinNewPath;
// }



function populateAeneasSetupDivEl(html){
	aeneasSetupDivEl.innerHTML=html;
}