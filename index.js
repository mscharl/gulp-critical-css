/**
 * Loading modules
 */
const path = require('path');
const gutil = require('gulp-util');
const through = require('through2');
const assign = require('lodash.assign');
const postcss = require('postcss');

/**
 * Loading internal plugins
 */
const cleanCritical = require('./plugins/cleanCritical.js');
const extractCritical = require('./plugins/extractCritical.js');

/**
 * Set defaults
 * @type {{selectors: Array}}
 */
const DEFAULT_OPTIONS = {
	selectors: []
};

/**
 * Exporting myself
 * @param opts
 */
module.exports = function (opts) {
	/**
	 * Set options
	 * @type {{selectors: Array}}
	 */
	opts = assign({}, DEFAULT_OPTIONS, opts || {});

	if (!Array.isArray(opts.selectors)) {
		throw new gutil.PluginError('gulp-critical-css', 'Option `selectors` is expected to be an array');
	}
	opts.selectors.every(function (selector) {
		if (typeof selector !== 'string' && !(selector instanceof RegExp)) {
			throw new gutil.PluginError('gulp-critical-css', 'Option `selectors` only supports `string` and `RegExp`');
		}

		return true;
	});

	/**
	 * The transformer
	 */
	return through.obj(function (file, enc, cb) {
		// no file - no work
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		// no streams!
		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-critical-css', 'Streaming not supported'));
			return;
		}

		// I do not like to use try-catch but at the moment i don't know if its really needed so I keep it like in the boilerplate.
		try {
			// Create a filepath object to modify the filenames
			var filePath = path.parse(file.path);

			// Let postcss generate our critical and cleaned stylesheets
			var cleanedCSS = postcss([cleanCritical(opts)]).process(file.contents.toString()).css;
			var criticalCSS = postcss([extractCritical(opts), cleanCritical(opts)]).process(file.contents.toString()).css;

			// Create the new files
			var cleanedFile = file.clone();
			var criticalFile = file.clone();

			// update the original file content with the generated
			cleanedFile.contents = new Buffer(cleanedCSS);
			criticalFile.contents = new Buffer(criticalCSS);

			// update the file paths/names
			cleanedFile.path = path.join(filePath.dir, filePath.name + filePath.ext);
			criticalFile.path = path.join(filePath.dir, filePath.name + ".critical" + filePath.ext);

			// Pass the files on to the next step
			this.push(cleanedFile);
			this.push(criticalFile);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-critical-css', err));
		}

		cb();
	});
};
