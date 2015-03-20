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
        var kanban;

        // kbs data object
        kanban = {
            version: 0.4,
            config: config,
            events: events,
            util: util,
            gui: gui
        };

        // initialise gui
        if (config.gui.enabled) {
            gui.init();
        }

        // get performance delta
        window.KBS_END_TIME =
            (new Date().getTime() - window.KBS_START_TIME) + "ms";

        // log on loaded
        events.subscribe("kbs/loaded", function () {
            util.log("okay", kanban, "Kanban initialised in " +
                window.KBS_END_TIME);
        });
        
        // expose the api if in dev mode
        if (config.mode === "dev") {
            window[config.appName] = kanban;
        }
    });
}(window));
