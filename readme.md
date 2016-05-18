# gulp-critical-css [![Build Status](https://travis-ci.org/mscharl/gulp-critical-css.svg?branch=master)](https://travis-ci.org/mscharl/gulp-critical-css)

> My spectacular gulp plugin


## Install

```
$ npm install --save-dev gulp-critical-css
```


## Usage

```js
const gulp = require('gulp');
const criticalCss = require('gulp-critical-css');

gulp.task('default', () => {
	gulp.src('src/file.ext')
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
