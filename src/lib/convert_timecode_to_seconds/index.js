/*
 * converts timecode from this format `00:00:00,000` to seconds.
 */
"use strict";
function convertTimeCodeToSeconds(timeString){

  var timeArray = timeString.split(":");

  var hours   = parseFloat(timeArray[0]) * 60 * 60;
  var minutes = parseFloat(timeArray[1]) * 60;
  var seconds = parseFloat(timeArray[2].replace(",","."));
  // var frames  = parseInt(timeArray[3].split(",")[1])*(1/framerate);
  // var str = "h:" + hours + "\nm:" + minutes + "\ns:" + seconds + "\nf:" + frames;
  // console.log(str);
  var totalTime = hours + minutes + seconds;// + frames;

  //alert(timeString + " = " + totalTime)
  return totalTime;
}

module.exports = convertTimeCodeToSeconds;