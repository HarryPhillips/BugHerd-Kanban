/*
*    @type javascript test
*    @name util.test.js
*    @copy Harry Phillips
*/

window.define(['src/util'], function (util) {
    'use strict';
    
    // undefined value
    util.log();
    
    // untyped log
    util.log("default log");
    
    // info log
    util.log("info", "info log");
    
    // debug log
    util.log("debug", "debug log");
    
    // warning message
    util.log("warn", "warning log");
    
    // error message
    util.log("error", "error log");
    
    // okay / success message
    util.log("okay", "okay/success log");
    
    // object log
    util.log({test: "object log"});
    
    // object log with description
    util.log({test: "object log with description"}, "test #8");
    
    // typed object log
    util.log("error", {test: "#9"}, "test #9");
    
    // return results
    return true;
});