var postcss = require('postcss');

module.exports = postcss.plugin('extractCritical', function (opts) {
	opts = opts || {};
	// Work with options here

	return function (css) {
		css.walkRules(function (rule) {
			var isCritical = false;
			rule.walkDecls(function (decl) {
				if (decl.prop === 'critical' && decl.value === 'this') {
					isCritical = true;
				}
			});

			if (!isCritical) {
				rule.remove();
			}
		});
	};
});
