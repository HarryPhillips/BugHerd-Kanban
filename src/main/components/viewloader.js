/*
*   @type javascript
*   @name viewloader.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(function (require) {
    'use strict';

    // view loader class
    function ViewLoader() {}

    // load and return a view
    ViewLoader.prototype.load = function (view, callback) {
        require(["main/views/" + view], function (mod) {
            callback(mod);
        });
    };

    return ViewLoader;
});
