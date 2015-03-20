/*
*   @type javascript
*   @name main.js
*   @auth Harry Phillips
*/

(function (window) {
    'use strict';

    var deps = [
        'config',
        'src/events',
        'src/util',
        'src/gui'
    ];

    window.define(deps, function (config, events, util, gui) {
        if (!config.enabled) {
            return;
        }
        
        // declarations
        var kanban, exec;

        // kbs data object
        kanban = {
            version: 0.5,
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
            
            // test util.log
            util.log("info", "beginning log tests...");
            util.log();
            util.log("test #1");
            util.log("info", "test #2");
            util.log("debug", "test #3");
            util.log("warn", "test #4");
            util.log("error", "test #5");
            util.log("okay", "test #6");
            util.log({test: "#7"});
            util.log({test: "#8"}, "test #8");
            util.log("error", {test: "#9"}, "test #9");
        };
        
        // wait for kbs loaded event
        events.subscribe("kbs/loaded", exec);
    });
}(window));
