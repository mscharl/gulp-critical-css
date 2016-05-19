var postcss = require('postcss');

module.exports = postcss.plugin('extractCritical', function (opts) {
	opts = opts || {};
	// Work with options here

	return function (css) {
		css.walkDecls(function (decl) {
			if (decl.prop === 'critical') {
				decl.remove();
			}
		});
	};
});
