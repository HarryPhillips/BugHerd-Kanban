/*
*	@type javascript test
*	@name main.test.js
*	@copy Copyright 2015 Harry Phillips
*/

window.define(['require', 'src/util'], function (require, util) {
	'use strict';
	
	return {
		exec: function (test) {
			util.log('test', 'executing test: "' + test + '"');
			require(['./' + test + '.test']);
		}
	};
});