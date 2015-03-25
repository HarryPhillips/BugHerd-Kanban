/*
*   @type javascript
*   @name main.js
*   @copy Copyright 2015 Harry Phillips
*/

(function (window) {
    'use strict';

    var deps = [
        'config',
        'src/events',
        'src/util',
        'src/status',
        'src/gui',
        'test/main.test'
    ];

    window.define(deps, function (config, events, util, status, GUI, tests) {
        if (!config.enabled) {
            return;
        }
        
        // declarations
        var kanban, exec, gui;
        
        // subscribe to status updates
        events.subscribe("kbs/status", function (data) {
            status[data.component] = data.status;
        });

        // initialise gui
        if (config.gui.enabled) {
            gui = new GUI();
            gui.init();
        }
        
        // execute kanban
        exec = function () {
            // get performance delta
            window.KBS_END_TIME =
                (new Date().getTime() - window.KBS_START_TIME) + "ms";
            
            // log
            util.log("okay", kanban, "Kanban initialised in " +
                window.KBS_END_TIME);
        
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

        // kbs data object
        kanban = {
            version: config.version,
            status: status,
            config: config,
            events: events,
            util: util,
            gui: gui
        };
        
        // wait for kbs loaded event
        events.subscribe("kbs/loaded", exec);
    });
}(window));
