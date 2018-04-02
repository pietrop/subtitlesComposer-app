# Captioning App 

Inspired by [oTranscribe](http://otranscribe.com) and on the back of [textAV](http://textAV.tech) event unconference group. Electron, osx desktop app, see [release section](https://github.com/pietrop/captioning-app/releases/tag/1.0.0) for os x `dmg` packaged version.


##  Usage

Go to release section and download latest version. 

See user manual for more details. 

## Dev setup 

git clone, cd into folder, `npm install`, `npm start`.

## Stack 

The app uses electron, bootstrap with bootswatch paper theme, and purpously does not make use of any front end framework to keep things simple a this stage, where the UI/UX and functionality are being defined.

For the alignement it uses the Aeneas open source project, see user manual for more details on how to get setup with that locally.


### UI to correct captions alignement 
At present the tool does not provide a user interface to correc the alignement of the captions. But for now there are plenty of tools that can be used instead [such as this one](http://www.closedcaptioncreator.com/)

## Todo 

- [ ] Char per line option, add to UI.
- [ ] Add head and end tail to aeneas comand from UI.
- [ ] escape odd chat in file name, and spaces, for unix (`?`) eg
	- https://www.npmjs.com/package/string-escape
	- or https://www.npmjs.com/package/sanitize-filename


## Roadmap

TBC

## Issues
feel free to get in touch if you have any issues, thoughts, questions, or ideas.

## Active Contributors 

- [Pietro](http://twitter.com/pietropassarell)




<!-- Initial requirements gathering and specification while at textAV with Joseph Polizzotto, Gideo, Marshal, and Jane -->


