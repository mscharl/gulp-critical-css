"use strict";

var _logLoadingTime = (function(startTime) {
    var prettyTime = require('pretty-hrtime'),
        gutil      = require('gulp-util');

    return function() {
        var time = prettyTime(process.hrtime(startTime));
        gutil.log(
            'Finished', '\'' + gutil.colors.yellow('Loading Tasks') + '\'',
            'after', gutil.colors.magenta(time)
        );
    };
})(process.hrtime());


/*******************************************
 * Load Modules
 *******************************************/
const gulp            = require('gulp'),
      gutil           = require('gulp-util'),
      fs              = require('fs'),
      assign          = require('lodash.assign'),
      rename          = require('gulp-rename'),
      sourcemaps      = require('gulp-sourcemaps'),
      clean           = require('gulp-clean'),

      imagemin        = require('gulp-imagemin'),
      svgSymbols      = require('gulp-svg-symbols'),

      sass            = require('gulp-sass'),
      postcss         = require('gulp-postcss'),
      autoprefixer    = require('autoprefixer'),
      cssnano         = require('cssnano'),
      discardComments = require('postcss-discard-comments'),

      uglify          = require('gulp-uglify'),
      concat          = require('gulp-concat'),
      browserify      = require('browserify'),
      watchify        = require('watchify'),
      source          = require('vinyl-source-stream'),
      buffer          = require('vinyl-buffer');

const POSTCSS_PLUGINS_DEV               = [autoprefixer(), cssnano()],
      POSTCSS_PLUGINS_PROD              = [discardComments({removeAll: true}), autoprefixer(), cssnano()],

      UGLIFY_OPTIONS                    = {
          compress: {
              drop_console : true,
              drop_debugger: true,
              screw_ie8    : true
          }
      },
      UGLIFY_OPTIONS_IE8                = {
          compress: {
              drop_console : true,
              drop_debugger: true
          }
      },

      SOURCES_IMAGES                    = 'src/img/**/*.{jpg,jpeg,png,svg}',
      SOURCES_STYLES_APP                = 'src/sass/app.scss',
      SOURCES_WATCH_STYLES_APP          = 'src/sass/**/*.scss',
      SOURCES_CLEAN_IMAGES              = ['./img/**/*.{jpg,jpeg,png,svg}', '!./img/svg-sprites/**/*.svg'],
      SOURCES_CLEAN_STYLES_APP          = ['./css/app.css', './css/app.css.map'],
      SOURCES_CLEAN_SCRIPTS_APP         = ['./js/app.js', './js/app.js.map'];


/*******************************************
 * Define Tasks
 *******************************************/



/**
 * Compile Images
 */
gulp.task('images', ['clean:images'], () =>
    gulp.src(SOURCES_IMAGES)
        .pipe(imagemin())
        .pipe(gulp.dest('./img'))
);

/**
 * Compile App Styles
 */
gulp.task('styles', ['clean:styles'], () =>
    gulp.src(SOURCES_STYLES_APP)
        .pipe(gutil.env.production ? gutil.noop() : sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(gutil.env.production ? POSTCSS_PLUGINS_PROD : POSTCSS_PLUGINS_DEV))
        .pipe(gutil.env.production ? gutil.noop() : sourcemaps.write('.'))
        .pipe(gulp.dest('./css'))
);

gulp.task('scripts', ['clean:scripts'], () => {
    const _defaultConfig = {
              entries  : 'src/js/app.js',
              debug    : true,
              plugins  : ['bundle-collapser/plugin'],
              fullPaths: false
          },
          isWatchTask    = gutil.env._.indexOf('watch') !== -1 || gutil.env._.indexOf('watch:scripts') !== -1;

    let _browserify, bundler;

    if(isWatchTask) {
        _browserify = watchify(browserify(assign({}, watchify.args, _defaultConfig)));
    }
    else {
        _browserify = browserify(_defaultConfig)
    }

    bundler = () =>
        _browserify.transform('babelify', {presets: ['es2015']})
                   .transform('browserify-shim')
                   .transform('stringify')
                   .bundle()
                   .on('error', gutil.log.bind(gutil, 'Browserify Error'))
                   .pipe(source('app.js'))
                   .pipe(buffer())
                   .pipe(gutil.env.production ? gutil.noop() : sourcemaps.init({loadMaps: true}))
                   .pipe(gutil.env.production ? uglify(UGLIFY_OPTIONS) : gutil.noop())
                   .pipe(gutil.env.production ? gutil.noop() : sourcemaps.write('.'))
                   .pipe(gulp.dest('./js'));

    if(isWatchTask) {
        _browserify.on('update', bundler);
        _browserify.on('log', gutil.log);
    }

    return bundler();
});

/**
 * Shortname to run all tasks
 */
gulp.task('default', ['images', 'styles', 'scripts']);

/**
 * Watch images
 */
gulp.task('watch:images', ['images'], () => {
    gulp.watch(SOURCES_IMAGES, ['images'])
});
/**
 * Watch all styles
 */
gulp.task('watch:styles', ['styles'], () => {
    gulp.watch(SOURCES_WATCH_STYLES_APP, ['styles']);
});
/**
 * Watch `app` script
 */
gulp.task('watch:scripts', ['scripts'], () => {
    //Watch is done by Watchify!
});

/**
 * Shortname to run all watchers
 */
gulp.task('watch', ['watch:images', 'watch:styles', 'watch:scripts']);


/**
 * Clean generated images
 */
gulp.task('clean:images', () =>
    gulp.src(SOURCES_CLEAN_IMAGES, {read: false})
        .pipe(clean())
);
gulp.task('clean:styles', () =>
    gulp.src(SOURCES_CLEAN_STYLES_APP, {read: false})
        .pipe(clean())
);
gulp.task('clean:scripts', () =>
    gulp.src(SOURCES_CLEAN_SCRIPTS_APP, {read: false})
        .pipe(clean())
);
/**
 * Shortname to clean everything
 */
gulp.task('clean', ['clean:images', 'clean:styles', 'clean:scripts']);


_logLoadingTime();
