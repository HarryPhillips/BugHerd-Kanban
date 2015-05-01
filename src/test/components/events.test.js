/*
*    @type javascript test
*    @name events.test.js
*    @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'main/util',
        'main/components/events'
    ],
    function (util, events) {
        'use strict';
        
        // declarations
        var test = {},
            f,
            i;
        
        // begin test/events logging context
        util.log.beginContext("test/components/events");
        
        // events.subscribe tests
        test.subscribe = function () {
            util.log(
                "context:test/events/subscribe",
                "test",
                "running 'events.subscribe' tests..."
            );
        };
        
        // events.publish tests
        test.publish = function () {
            util.log(
                "context:test/events/publish",
                "test",
                "running 'events.publish' tests..."
            );
        };
        
        // run tests
        for (i in test) {
            if (test.hasOwnProperty(i)) {
                test[i]();
            }
        }
        
        // end logging context
        util.log.endContext();
    }
);