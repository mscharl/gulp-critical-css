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

function prepareTest(cb) {
	const stream = fn({verbose: true});

	var files = [];

	stream.on('data', file => {
		files.push(file);
	});
	stream.on('end', () => cb(files));

	fs.readFile(path.join(__dirname, 'test', 'source.css'), function (err, data) {
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

test.cb('Returns two files', t => {
	prepareTest((files) => {
		t.is(files.length, 2);
		t.end();
	});
});

test.cb('Expect first file name to be original', t => {
	prepareTest((files) => {
		t.is(Helper.getFullFilename(files[0].path), 'test.css');
		t.end();
	});
});

test.cb('Expect second file name to be critical', t => {
	prepareTest((files) => {
		t.is(Helper.getFullFilename(files[1].path), 'test.critical.css');
		t.end();
	});
});

test.cb('Expect cleaned-file to be cleaned', t => {
	prepareTest((files) => {
		fs.readFile(path.join(__dirname, 'test', 'generated.css'), function (err, data) {
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
		fs.readFile(path.join(__dirname, 'test', 'generated.critical.css'), function (err, data) {
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
