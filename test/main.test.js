/*
*    @type javascript test
*    @name main.test.js
*    @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(['require', 'src/util'], function (require, util) {
    'use strict';
    
    return {
        exec: function (test) {
            util.log('context:test/' + test, 'test', 'executing test: "' + test + '"');
            require(['./' + test + '.test']);
        }
    };
});