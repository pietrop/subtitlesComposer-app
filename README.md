# `subtitleComposer` App 

[![Build Status](https://travis-ci.org/pietrop/subtitlesComposer-app.svg?branch=master)](https://travis-ci.org/pietrop/subtitlesComposer-app)

A simple os x desktop app built in electron, using [Aeneas][aeneas] under the hood to generate captions files from media(audio or video) and plain text transcriptions without time-codes.

##  Usage

1. --> [See user manual for more details](https://autoedit.gitbook.io/subtitles-composer-app/) <--

2. [Go to release section and download, packaged version, ready to use version](https://github.com/pietrop/subtitlesComposer-app/releases). 
 
<!-- Linux users can download a [continuos build here](https://github.com/pietrop/subtitlesComposer-app/releases/tag/continuous) -->


![Video + text screenshot](screenshots/video+text+.png)

## Dev setup 

git clone, cd into folder, `npm install`, `npm start`.

## Build

After having done step fo dev setup, do 

```
npm run build:mac
```

To package dmg for mac, when done, check the [`./dist`](`./dist`) folder in the repo. 

There's also a travis CI continuos integration build that is triggered on very commit for the Linux version, [some notes on this setup here](http://pietropassarelli.com/electron-github-travis-ci.html)

## Stack 

The app uses electron, bootstrap with bootswatch paper theme, and purpously does not make use of any front end framework to keep things simple a this stage, where the UI/UX and functionality are being defined.

For the alignement it uses the [Aeneas][aeneas] open source project, see user manual for more details on how to get setup with that locally.


<!-- ### UI to correct captions alignement 
At present the tool does not provide a user interface to correc the alignement of the captions. But for now there are plenty of tools that can be used instead [such as this one](http://www.closedcaptioncreator.com/) -->

<!-- ## Todo 

- [X] Char per line option, add to UI.
- [X] Add head and end tail to aeneas comand from UI.
- [ ] escape odd chat in file name, and spaces, for unix (`?`) eg
	- https://www.npmjs.com/package/string-escape
	- or https://www.npmjs.com/package/sanitize-filename


### Nice to have (`?`)
- [ ] Revisit underlying `subtitlescomposer` module to support custom list of `HOMORIFICS`.
	- [ ] provide UI to give / add/edit list.

- [ ] Hypertranscript for text portion of text transcriptin (`?`) 

## Roadmap

TBC-->




## Issues
Feel free to get in touch if you have any issues, thoughts, questions, or ideas.

## Active Contributors 

- [Pietro](http://twitter.com/pietropassarell)


<!-- Initial requirements gathering and specification while at textAV with Joseph Polizzotto, Gideo, Marshal, and Jane -->


[aeneas]: https://github.com/readbeyond/aeneas