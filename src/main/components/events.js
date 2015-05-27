/*
*   @type javascript
*   @name events.js
*   @copy Copyright 2015 Harry Phillips
*/

/*jslint devel: true */

/*global define: true */

/*
*   TODO:
*   + Always pass the event name to the handler,
*     try to do this without disrupting passed parameters
*/

define(['config'], function (config) {
    'use strict';
    
    function Events() {
        this.topics = {};
    }
    
    // subscribe/create event topic
    Events.prototype.subscribe = function (event, handler) {
        if (!this.topics[event]) {
            // create a event topic
            this.topics[event] = [];
        }
        
        // apply handler to event
        this.topics[event].push(handler);
    };
    
    // unsubscribe a handler from a topic
    Events.prototype.unsubscribe = function (event, handler) {
        var list = this.topics[event],
            object = false,
            len = list.length,
            i = 0;
        
        // not a name - we need to do object comparison
        // we shouldn't need to do deep comparison,
        // the handlers *should* refer to the same object
        // in memory
        if (typeof handler !== "string") {
            object = true;
        }
        
        // check names of all handlers
        for (i; i < len; i += 1) {
            // remove handler from array and return
            if (object) {
                if (handler === list[i] ||
                        handler.toSource() === list[i].toSource()) {
                    list.splice(list.indexOf(i), 1);
                    return;
                }
            } else {
                if (list[i].name === handler) {
                    list[i].splice(list.indexOf(i), 1);
                    return;
                }
            }
        }
    };
    
    // publish event with data
    Events.prototype.publish = function (event, data) {
        if (!this.topics[event]) {
            if (!config.events.silent) {
                throw new Error("Event '" + event + "' does not exist!");
            }
            return;
        }
        
        // publish data to all event handlers
        var i;
        for (i = 0; i < this.topics[event].length; i += 1) {
            this.topics[event][i](data, event);
        }
        
        // make data an object if it isn't already so
        // so we can log it nicely
        if (typeof data !== "object") {
            data = {
                "data": data
            };
        }
    };
    
    return new Events();
});