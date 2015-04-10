/*
*    @type javascript test
*    @name util.test.js
*    @copy Harry Phillips
*/

/*global define: true */

define(['src/util'], function (util) {
    'use strict';
    
    // test object
    var test = {},
        f;
    
    // begin test/util logging context
    util.log.beginContext('test/util');
    
    // util.zerofy tests
    test.zerofy = function () {
        util.log(
            "context:test/util/zerofy",
            "test",
            "running 'util.zerofy' tests..."
        );
        
        f = util.zerofy;
        
        util.log(
            "context:test/util/zerofy",
            "debug",
            "12-4: " + f(12, 4)
        );

        util.log(
            "context:test/util/zerofy",
            "debug",
            "123-2: " + f(123, 2)
        );
        
        util.log(
            "context:test/util/zerofy",
            "debug",
            "5-21: " + f(5, 21)
        );
    };
    
    // util.spacify tests
    test.spacify = function () {
        util.log(
            "context:test/util/spacify",
            "test",
            "running 'util.spacify' tests..."
        );
        
        var result;
        
        f = util.spacify;
        
        result = f("test", 6).replace(" ", " ");
        util.log(
            "context:test/util/spacify",
            "debug",
            "'test' - 6: " + result
        );
        
        result = f("test", 2).replace(/\s/g, " ");
        util.log(
            "context:test/util/spacify",
            "debug",
            "'test' - 2: " + result
        );
        
        result = f("test", 21).replace(/\s/g, " ");
        util.log(
            "context:test/util/spacify",
            "debug",
            "'test' - 21: " + result
        );
    };
    
    // util.log tests
    test.log = function () {
        util.log(
            "context:test/util/log",
            "test",
            "running 'util.log' tests..."
        );
        
        f = util.log;
        
        // undefined value
        f("context:test/util/log");

        // untyped log
        f("context:test/util/log",
            "default log");

        // info log
        f("context:test/util/log",
            "info", "info log");

        // debug log
        f("context:test/util/log",
            "debug", "debug log");

        // warning message
        f("context:test/util/log",
            "warn", "warning log");

        // error message
        f("context:test/util/log",
            "error", "error log");

        // okay / success message
        f("context:test/util/log",
            "okay", "okay/success log");

        // object log
        f("context:test/util/log",
            {test: "object log"});

        // object log with description
        f("context:test/util/log",
            {test: "object log with description"},
            "test #8");

        // typed object log
        f("context:test/util/log", "error",
            {test: "#9"},
            "test #9");
    };
    
    // run tests
    test.zerofy();
    test.spacify();
    test.log();
    
    // end our logging context
    util.log.endContext();
});