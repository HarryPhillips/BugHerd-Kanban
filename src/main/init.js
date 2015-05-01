/*
*   @type javascript
*   @name init.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*
*   TODO
*   + On the fly user configuration tool
      (maybe refactor config to use a class with setters/getters?)
*   + Related to config, style/theme preference changes?
*   + Add ability to set wallpapers
*   + Add a comments interface/modal (with a spellchecker?)
*/

define(
    [
        'config',
        'main/util',
        'main/ui/interactor',
        'main/components/events',
        'main/components/status',
        'main/components/cache',
        'main/components/http',
        'main/ui/gui',
        'test/main.test'
    ],
    function (
        config,
        util,
        Interactor,
        events,
        status,
        cache,
        http,
        GUI,
        tests
    ) {
        'use strict';

        // components
        var kanban, end, gui, interactor;

        // check if disabled
        if (!config.enabled) {
            return;
        }

        // subscribe to status updates
        events.subscribe("kbs/status", function (data) {
            status[data.component] = data.status;
        });

        // initialise gui first so log buffer is constructed
        if (config.gui.enabled) {
            gui = new GUI();
        }

        // initialise interactor
        if (config.interactor.enabled) {
            interactor = new Interactor();
        }
            
        // execute kanban
        end = function () {
            // get performance delta
            window.KBS_DELTA_TIME =
                (new Date().getTime() - window.KBS_START_TIME) + "ms";

            // log
            util.log(
                "okay",
                kanban,
                "Kanban initialised in " +
                    window.KBS_DELTA_TIME
            );

            // expose the api if in dev mode
            if (config.mode === "dev") {
                window[config.appName] = kanban;
            }

            // expose logging api to window.log
            if (typeof window.log === "undefined") {
                window.log = util.log;
            }

            // update app status
            events.publish("kbs/status", {
                component: "app",
                status: true
            });

            // tests
            if (config.test) {
                tests.execAll();
            }
        };

        // kbs data/api object
        kanban = {
            version: config.version,
            interactor: interactor,
            status: status,
            cache: cache,
            config: config,
            events: events,
            http: http,
            util: util,
            gui: gui
        };

        // wait for kbs loaded event
        events.subscribe("kbs/loaded", end);
    }
);
