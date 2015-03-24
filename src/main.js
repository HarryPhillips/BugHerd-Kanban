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
        'src/gui',
        'test/main.test.js'
    ];

    window.define(deps, function (config, events, util, gui, tests) {
        if (!config.enabled) {
            return;
        }
        
        // declarations
        var kanban, exec;

        // kbs data object
        kanban = {
            version: 0.6,
            config: config,
            events: events,
            util: util,
            gui: gui
        };

        // initialise gui
        if (config.gui.enabled) {
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
            
            // tests
            if (config.test) {
                tests.exec(['util']);
            }
        };
        
        // wait for kbs loaded event
        events.subscribe("kbs/loaded", exec);
    });
}(window));
