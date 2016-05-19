# gulp-critical-css [![Build Status](https://travis-ci.org/mscharl/gulp-critical-css.svg?branch=master)](https://travis-ci.org/mscharl/gulp-critical-css) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)


> Extract critical css rules into a seperate stylesheet

This module allows to put a (blocking) lightweight CSS-File with critical style
information into the HTML-head and the full CSS at the end of the body.

This may increase loading and parsing time of your website and avoids a
[FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content).


## Install

```
$ npm install --save-dev gulp-critical-css
```


## Usage

```js
const gulp = require('gulp');
const criticalCss = require('gulp-critical-css');

gulp.task('default', () => {
	gulp.src('src/file.css')
		.pipe(criticalCss())
		.pipe(gulp.dest('dist'))
);
```


## API

### criticalCss([options])

#### options

##### foo

Type: `boolean`<br>
Default: `false`

Lorem ipsum.


## License

MIT © [Michael Scharl](https://michael.scharl.me)
