/*
*   @type javascript
*   @name main.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'config',
        './components/events',
        './util',
        './components/status',
        './components/http',
        './components/cache',
        './ui/gui',
        'test/main.test'
    ],
    function (config, events, util, status, http, cache, GUI, tests) {
        'use strict';
        
        // declarations
        var kanban, exec, gui;

        // return if kanban is disabled
        if (!config.enabled) {
            return;
        }

        // subscribe to status updates
        events.subscribe("kbs/status", function (data) {
            status[data.component] = data.status;
        });

        // initialise gui
        if (config.gui.enabled) {
            gui = new GUI();
        }

        // execute kanban
        exec = function () {
            // get performance delta
            window.KBS_END_TIME =
                (new Date().getTime() - window.KBS_START_TIME) + "ms";

            // log
            util.log(
                "okay",
//                kanban,
                "Kanban initialised in " +
                    window.KBS_END_TIME
            );

            // expose the api if in dev mode
            if (config.mode === "dev") {
                window[config.appName] = kanban;
            }

            // update app status
            events.publish("kbs/status", {
                component: "app",
                status: true
            });

            // tests
            if (config.test) {
                tests.exec(['util']);
            }
        };

        // kbs data/api object
        kanban = {
            version: config.version,
            status: status,
            cache: cache,
            config: config,
            events: events,
            http: http,
            util: util,
            gui: gui
        };

        // wait for kbs loaded event
        events.subscribe("kbs/loaded", exec);
    }
);
