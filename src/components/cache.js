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
        console: new Buffer()
    };
    
    return cache;
});