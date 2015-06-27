/*
*   @type javascript
*   @name router.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(['config'], function (config) {
    'use strict';

    // configured routes
    var
        routes = {
            "console/save": config.routes.console.save
        },
        url = window.KBS_BASE_URL;

    return {
        // return a route to a component controller
        getRoute: function (component, fn) {
            if (typeof fn === "undefined") {
                return url + routes[component];
            }

            return url + config.routes[component][fn];
        }
    };
});
