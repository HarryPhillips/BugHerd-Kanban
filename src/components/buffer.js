/*
*   @type javascript
*   @name buffer.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(function () {
    'use strict';
    
    var outs = [];
    
    // buffer constructor
    function Buffer(predef) {
        // push to Buffer global 'outs'
        outs.push(predef || "");
        
        // set the index of our buffer
        this.index = outs.length - 1;
    }
    
    // write a value to buffer
    Buffer.prototype.writeToBuffer = function (value) {
        // get index
        var i = this.index;
        
        // add to string buffer
        if (typeof outs[i] === "string") {
            outs[i] += value;
            return;
        }
        
        // add to array buffer
        if (outs[i] instanceof Array) {
            outs[i].push(value);
            return;
        }
    };
    
    // remove a value from buffer
    Buffer.prototype.removeFromBuffer = function (value) {
        var i = this.index;
        
        // string buffer
        if (typeof outs[i] === "string") {
            outs[i] = outs[i].replace(value, "");
            return;
        }
        
        // array buffer
        if (outs[i] instanceof Array) {
            outs[i].splice(outs[i].indexOf(value), 1);
            return;
        }
    };
    
    // return the buffer
    Buffer.prototype.getBuffer = function () {
        return outs[this.index];
    };
    
    // clear the buffer
    Buffer.prototype.clearBuffer = function () {
        var i = this.index;
        
        // splice our buffer index from global buffer
        outs.splice(i, 1);
    };
    
    return Buffer;
});