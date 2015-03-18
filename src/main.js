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
        var kanban = {
            version: 0.1,
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
        
        // test
        util.log(kanban, "Kanban initialised in " +
                window.KBS_END_TIME);
        
        // expose the api if in dev mode
        if (config.mode === "dev") {
            window[config.appName] = kanban;
        }
    });
}(window));