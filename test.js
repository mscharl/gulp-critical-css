import fs from 'fs';
import path from 'path';
import test from 'ava';
import gulpUtil from 'gulp-util';
import fn from './';

const Helper = {
	getFullFilename(_path) {
		const filePath = path.parse(_path);

		return filePath.name + filePath.ext;
	}
};

function prepareTest(cb, plugin, sourceDir) {
	const stream = plugin || fn();

	sourceDir = sourceDir || 'default';

	var files = [];

	stream.on('data', file => {
		files.push(file);
	});
	stream.on('end', () => cb(files));

	fs.readFile(path.join(__dirname, 'test', sourceDir, 'source.css'), function (err, data) {
		if (err) {
			throw err;
		}

		stream.write(new gulpUtil.File({
			base: __dirname,
			path: path.join(__dirname, 'test.css'),
			contents: data
		}));

		stream.end();
	});
}

/**
 * Test basic file handling
 */
test.serial.cb('Returns two files', t => {
	prepareTest((files) => {
		t.is(files.length, 2);
		t.end();
	});
});

test.serial.cb('Expect first file name to be original', t => {
	prepareTest((files) => {
		t.is(Helper.getFullFilename(files[0].path), 'test.css');
		t.end();
	});
});

test.serial.cb('Expect second file name to be critical', t => {
	prepareTest((files) => {
		t.is(Helper.getFullFilename(files[1].path), 'test.critical.css');
		t.end();
	});
});

/**
 * Test output of plugin with default options
 */
test.cb('Expect cleaned-file to be cleaned', t => {
	prepareTest((files) => {
		fs.readFile(path.join(__dirname, 'test', 'default', 'generated.css'), function (err, data) {
			if (err) {
				throw err;
			}

			const generatedContent = files[0].contents.toString();
			const expectedContent = data.toString();

			t.is(generatedContent, expectedContent);
			t.end();
		});
	});
});

test.cb('Expect critical-file to be critical only', t => {
	prepareTest((files) => {
		fs.readFile(path.join(__dirname, 'test', 'default', 'generated.critical.css'), function (err, data) {
			if (err) {
				throw err;
			}

			const generatedContent = files[1].contents.toString();
			const expectedContent = data.toString();

			t.is(generatedContent, expectedContent);
			t.end();
		});
	});
});

/**
 * Test output of plugin with custom options
 */
test('Fail when selectors-option is not an array', t => {
	t.throws(() => fn({
		selectors: {}
	}));
	t.throws(() => fn({
		selectors: ''
	}));

	t.notThrows(() => fn({
		selectors: []
	}));
});
test('Fail when selectors-option does contain elements that are not `String` or `RegEx`', t => {
	t.throws(() => fn({
		selectors: [Number(1)]
	}));
	t.throws(() => fn({
		selectors: [{}]
	}));

	t.notThrows(() => fn({
		selectors: ['.selector']
	}));
	t.notThrows(() => fn({
		selectors: [new RegExp('test', 'i')]
	}));
});

test.cb('Expect critical rules by string to be critical only', t => {
	const plugin = fn({
		selectors: ['.navbar-brand']
	});

	prepareTest((files) => {
		fs.readFile(path.join(__dirname, 'test', 'custom', 'generated-string.critical.css'), function (err, data) {
			if (err) {
				throw err;
			}

			const generatedContent = files[1].contents.toString();
			const expectedContent = data.toString();

			require('fs').writeFile('test.css', files[1].contents.toString());

			t.is(generatedContent, expectedContent);
			t.end();
		});
	}, plugin, 'custom');
});

test.cb('Expect cleaned rules by string to be cleaned', t => {
	const plugin = fn({
		selectors: ['.navbar-brand']
	});

	prepareTest((files) => {
		fs.readFile(path.join(__dirname, 'test', 'custom', 'generated-string.css'), function (err, data) {
			if (err) {
				throw err;
			}

			const generatedContent = files[0].contents.toString();
			const expectedContent = data.toString();

			t.is(generatedContent, expectedContent);
			t.end();
		});
	}, plugin, 'custom');
});

test.cb('Expect critical rules by RegExp to be critical only', t => {
	const plugin = fn({
		selectors: [/^\.navbar-brand/]
	});

	prepareTest((files) => {
		fs.readFile(path.join(__dirname, 'test', 'custom', 'generated-regexp.critical.css'), function (err, data) {
			if (err) {
				throw err;
			}

			const generatedContent = files[1].contents.toString();
			const expectedContent = data.toString();

			require('fs').writeFile('test.css', files[1].contents.toString());

			t.is(generatedContent, expectedContent);
			t.end();
		});
	}, plugin, 'custom');
});

test.cb('Expect cleaned rules by RegExp to be cleaned', t => {
	const plugin = fn({
		selectors: [/^\.navbar-brand/]
	});

	prepareTest((files) => {
		fs.readFile(path.join(__dirname, 'test', 'custom', 'generated-regexp.css'), function (err, data) {
			if (err) {
				throw err;
			}

			const generatedContent = files[0].contents.toString();
			const expectedContent = data.toString();

			t.is(generatedContent, expectedContent);
			t.end();
		});
	}, plugin, 'custom');
});
