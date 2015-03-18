/*
*   @type javascript
*   @name events.js
*   @auth Harry Phillips
*/

window.define(['./util'], function (util) {
    'use strict';
    
    util.log("events.js initialised...");
    
    function Events() {
        this.topics = [];
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
    
    // publish event with data
    Events.prototype.publish = function (event, data) {
        if (!this.topics[event]) {
            throw new Error("Event '" + event + "' does not exist!");
        }
        
        // publish data to all event handlers
        var i;
        for (i = 0; i < this.topics[event].length; i += 1) {
            this.topics[event][i](data);
        }
        
        // make data an object if it isn't already so
        // so we can log it nicely
        if (typeof data !== "object") {
            data = {
                "data": data
            };
        }
        
        // write log
        util.log(data, "publishing event: '" + event + "' with data:");
    };
    
    return new Events();
});