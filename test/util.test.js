/*
*    @type javascript test
*    @name util.test.js
*    @copy Harry Phillips
*/

/*global define: true */

define(['src/util'], function (util) {
    'use strict';
    
    // undefined value
    util.log("context:test/util");
    
    // untyped log
    util.log("context:test/util", "default log");
    
    // info log
    util.log("context:test/util", "info", "info log");
    
    // debug log
    util.log("context:test/util", "debug", "debug log");
    
    // warning message
    util.log("context:test/util", "warn", "warning log");
    
    // error message
    util.log("context:test/util", "error", "error log");
    
    // okay / success message
    util.log("context:test/util", "okay", "okay/success log");
    
    // object log
    util.log("context:test/util", {test: "object log"});
    
    // object log with description
    util.log("context:test/util", {test: "object log with description"}, "test #8");
    
    // typed object log
    util.log("context:test/util", "error", {test: "#9"}, "test #9");
    
    // return results
    return true;
});