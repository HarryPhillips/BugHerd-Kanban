/*
*   @type javascript
*   @name view.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(function (util) {
    'use strict';

    // view class
    function View(createFn) {
        this.createFn = createFn;
    }

    // create view
    View.prototype.createView = function (param) {
        if (typeof this.createFn === "function") {
            return this.createFn(param);
        }
    };

    return View;
});