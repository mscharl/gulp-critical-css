var postcss = require('postcss');

module.exports = postcss.plugin('extractCritical', function (opts) {
	opts = opts || {};
	// Work with options here

	return function (css) {
		if (opts.clean === true) {
			css.walkRules(function (rule) {
				var critical = false;
				rule.walkDecls(function (decl) {
					if (decl.prop === 'critical') {
						critical = true;
					}
				});

				if (critical) {
					rule.remove();
				}
			});
		} else {
			css.walkDecls(function (decl) {
				if (decl.prop === 'critical') {
					decl.remove();
				}
			});
		}
	};
});
