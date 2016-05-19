var postcss = require('postcss');

module.exports = postcss.plugin('extractCritical', function (opts) {
	opts = opts || {};
	// Work with options here

	return function (css) {
		css.walkRules(function (rule) {
			var isCritical = opts.selectors.some(function (tester) {
				if (tester instanceof RegExp) {
					return tester.test(rule.selector);
				}

				return rule.selector.indexOf(tester) !== -1;
			});

			// If rule is already critical there is no need to check for declarations
			if (!isCritical) {
				rule.walkDecls(function (decl) {
					if (decl.prop === 'critical' && decl.value === 'this') {
						isCritical = true;
					}
				});
			}

			// If rule is still not critical it is removed
			if (!isCritical) {
				rule.remove();
			}
		});

		// Clean empty atRules
		css.walkAtRules(function (atRule) {
			if (atRule.nodes && atRule.nodes.length === 0) {
				atRule.remove();
			}
		});
	};
});
