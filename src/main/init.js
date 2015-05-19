/*
*   @type javascript
*   @name init.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*
*   TODO
*   + Add ability to set wallpapers (style/theme engine?)
*
*   + Add a comments interface/modal (with a spellchecker? Preview post?)
*
*   + A place for Kanban tools? Not attached to the console toolbar?
*
*   + Add a repository component for storing instances of Kanban objects,
*     making them globally accessible within Kanban. Should remove the
*     need to pass instances between function calls.
*
*   + Add a modal to view screenshots instead of opening in a new tab
*
*   + Monitor status of all components and defer kbs/loaded event until
*     all components have finished initialising, more reliable than hard coding
*     the event fire
*
*   + Allow searching of tasks by meta data such as references, browser and
*     version etc. Maybe allowing pulling into a local file?? Would require
*     local sourcing... possibly.
*
*   + Just discovered a very in-depth and exposed API under window.bugherd
*     this opens up a LOT of possibilities...
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
        'main/components/bugherd',
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
        BugHerd,
        GUI,
        tests
    ) {
        'use strict';

        // components
        var kanban, end, gui, interactor, settings, bugherd;

        // get a new configurator and load data
        settings = new Configurator();
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
            interactor = new Interactor(gui);
        }
            
        // initialise the bugherd api wrapper
        bugherd = new BugHerd();
        bugherd.init();
            
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
