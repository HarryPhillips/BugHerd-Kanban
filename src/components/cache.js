/*
*   @type javascript
*   @name cache.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(['./buffer'], function (Buffer) {
    'use strict';
    
    // cache object
    var cache = {
        kbs: new Buffer(),
        console: new Buffer()
    };
    
    return cache;
});