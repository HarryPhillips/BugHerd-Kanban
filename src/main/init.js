/*
*   @type javascript
*   @name init.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*
*   TODO
*   + Need to preserve user prefs and able to reset to defaults
*     (refactor config to monitor and cache states? Cookie parser?)
*
*   + Related to config, style/theme preference engine? Dynamic not preloaded?
*
*   + Add ability to set wallpapers (style/theme engine?)
*
*   + Add a comments interface/modal (with a spellchecker? Preview post?)
*
*   + A place for Kanban tools? Not attached to the console toolbar?
*
*   + Point base url to prodution cdn using source tag e.g
*     https://cdn.rawgit.com/HarryPhillips/BugHerd-Kanban/v1.3.0/
*
*   + Easier way to create complex elements like modals? View components?
*/

define(
    [
        'config',
        'main/components/util',
        'main/ui/interactor',
        'main/components/events',
        'main/components/status',
        'main/components/cache',
        'main/components/http',
        'main/components/configurator',
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
        Configurator,
        GUI,
        tests
    ) {
        'use strict';

        // components
        var kanban, end, gui, interactor, settings;

        // get a new configurator
        settings = new Configurator();
            
        // check and load existing user config data
        settings.loadExisting();
            
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
            gui: gui,
            configurator: settings
        };

        // wait for kbs loaded event
        events.subscribe("kbs/loaded", end);
    }
);
