/*
*    @type javascript test
*    @name main.test.js
*    @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'require',
        'main/util'
    ],
    function (require, util) {
        'use strict';

        // instance pointer
        var self;

        // test controller constructor
        function TestController() {
            // modules
            this.modules = [
                "util",
                "components/events"
            ];
        }

        // executes a test
        TestController.prototype.exec = function (test) {
            // log
            util.log(
                "context:test/" + test,
                "exec",
                "executing test: \"" + test + "\"..."
            );

            // run
            require([window.KBS_BASE_URL + "test/" + test + ".test.js"]);
        };

        // executes all tests in the configured modules array
        TestController.prototype.execAll = function () {
            // declarations
            var len = this.modules.length,
                i = 0;

            // execute all
            for (i; i < len; i += 1) {
                this.exec(this.modules[i]);
            }
        };

        return new TestController();
    }
);