/*
*   @type javascript
*   @name coutner.js
*   @copy Copyright 2015 Harry Phillips
*/

window.define(function () {
    'use strict';
    
    function Counter(target, callback) {
        var value = 0;
        
        this.target = target;
        this.exec = callback;
        
        Object.defineProperty(this, "count", {
            get: function () {
                return value;
            },
            set: function (newvalue) {
                value = newvalue;
                
                if (value >= target) {
                    this.exec();
                }
            }
        });
    }
    
    return Counter;
});