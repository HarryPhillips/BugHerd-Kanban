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
        var len, i,
            attach = function (topic, handler) {
                if (!this.topics[topic]) {
                    // create an event topic
                    this.topics[topic] = [];
                }

                // apply handler to event
                this.topics[topic].push(handler);
            }.bind(this);

        // if event is an array of topics
        if (event instanceof Array) {
            len = event.length;
            i = 0;

            for (i; i < len; i += 1) {
                attach(event[i], handler);
            }
        } else {
            attach(event, handler);
        }
    };

    // unsubscribe a handler from a topic
    Events.prototype.unsubscribe = function (event, handler) {
        var list,
            object = false,
            xlen,
            ylen,
            x = 0,
            y = 0;

        // not a name - we need to do object comparison
        // we shouldn't need to do deep comparison,
        // the handlers *should* refer to the same object
        // in memory
        if (typeof handler !== "string") {
            object = true;
        }

        // convert event to array
        if (!event instanceof Array) {
            event = [event];
        }

        // remove all matched handlers from event
        for (x, xlen = event.length; x < xlen; x += 1) {
            // get event
            list = this.topics[event[x]];

            // check names of all handlers
            for (y, ylen = list.length; y < ylen; y += 1) {
                // remove handler from array and return
                if (object) {
                    if (handler === list[y] ||
                            handler.toSource() === list[y].toSource()) {
                        list.splice(list.indexOf(y), 1);
                        return;
                    }
                } else {
                    if (list[y].name === handler) {
                        list[y].splice(list.indexOf(y), 1);
                        return;
                    }
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
    };

    return new Events();
});
