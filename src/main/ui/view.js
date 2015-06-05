/*
*   @type javascript
*   @name view.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(['main/components/util'], function (util) {
    'use strict';

    // view class
    function View(fn) {
        // convert to array
        if (!util.isArray(fn)) {
            fn = [fn];
        }
        
        // attach renderer(s)
        this.renderers = fn;
    }

    // draw the view using the constructor
    View.prototype.draw = function (params, page) {
        // assume literal page number
        // rather than an index number (page 1 === 0)
        page -= 1;
        
        return this.render(params, page);
    };
    
    // render a page from renderers
    View.prototype.render = function (params, page) {
        // make sure page is available
        if (!util.isDefined(page) || page < 0) {
            page = 0;
        } else {
            if (!util.isDefined(this.renderers[page])) {
                util.log("error", "Page " + page + " does not exist!");
                page = 0;
            }
        }
        
        // return output from page renderer
        return this.renderers[page](params);
    };

    return View;
});