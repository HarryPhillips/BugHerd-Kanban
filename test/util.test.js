/*
*    @type javascript test
*    @name util.test.js
*    @copy Harry Phillips
*/

/*global define: true */

define(['src/util'], function (util) {
    'use strict';
    
    var test = {};
    
    // util.log tests
    test.log = function () {
        util.log("context:test/util/log", "test", "running util.log tests");
        
        // undefined value
        util.log("context:test/util/log");

        // untyped log
        util.log("context:test/util/log", "default log");

        // info log
        util.log("context:test/util/log", "info", "info log");

        // debug log
        util.log("context:test/util/log", "debug", "debug log");

        // warning message
        util.log("context:test/util/log", "warn", "warning log");

        // error message
        util.log("context:test/util/log", "error", "error log");

        // okay / success message
        util.log("context:test/util/log", "okay", "okay/success log");

        // object log
        util.log("context:test/util/log",
                 {test: "object log"});

        // object log with description
        util.log("context:test/util/log",
                 {test: "object log with description"}, "test #8");

        // typed object log
        util.log("context:test/util/log", "error",
                 {test: "#9"}, "test #9");
    };
    
    // run tests
    test.log();
});