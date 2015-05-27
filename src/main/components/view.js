/*
*   @type javascript
*   @name view.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(function (util) {
    'use strict';

    // view class
    function View(renderer) {
        this.renderer = renderer;
    }

    // draw the view using the constructor
    View.prototype.draw = function (params) {
        if (typeof this.renderer === "function") {
            return this.renderer(params);
        }
    };

    return View;
});