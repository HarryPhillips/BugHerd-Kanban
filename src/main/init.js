/*
*   @type javascript
*   @name init.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/status',
        'main/components/cache',
        'main/components/exception',
        'main/components/repository',
        'main/components/http',
        'main/components/configurator',
        'main/components/bugherd',
        'main/ui/node',
        'main/ui/gui',
        'main/ui/modal',
        'main/ui/interactor',
        'test/main.test'
    ],
    function KanbanInitialise(
        config,
        util,
        events,
        status,
        cache,
        Exception,
        Repository,
        Http,
        Configurator,
        BugHerd,
        Node,
        GUI,
        Modal,
        Interactor,
        tests
    ) {
        'use strict';

        // components
        var kanban, end, gui, interactor,
            ehandle, settings, bugherd,
            repo = new Repository();

        /* end of init call
        ------------------------------------------------------*/
        end = function () {
            // get performance delta
            window.KBS_DELTA_TIME =
                (new Date().getTime() - window.KBS_START_TIME) + "ms";

            // log
            util.log(
                "okay",
                kanban,
                "Kanban initialised in " +
                    window.KBS_DELTA_TIME +
                    ". Approx. size: " + util.bytesFormat(util.sizeof(kanban))
            );

            // expose the api if in dev mode
            if (config.mode === "dev") {
                window[config.appName] = kanban;
                window[config.appName + "_REPO"] = repo;
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

        /* initialise
        ------------------------------------------------------*/
        // wait for kbs loaded event
        events.subscribe("kbs/loaded", end);

        // subscribe to status updates
        events.subscribe("kbs/status", function (data) {
            status[data.component] = data.status;
        });

        // get a new configurator and load data
        try {
            settings = new Configurator();
            settings.loadExisting();
            repo.add("settings", settings);
        } catch (configuratorException) {
            ehandle = new Exception(
                configuratorException,
                "Configurator failed to initialise cleanly."
            );
        }

        // check if disabled
        if (!config.enabled) {
            return;
        }

        // initialise gui first so log buffer is constructed
        try {
            if (config.gui.enabled) {
                gui = new GUI();
                repo.add("gui", gui);
            }
        } catch (guiException) {
            ehandle = new Exception(
                guiException,
                "GUI failed to initialise cleanly."
            );
        }

        // initialise interactor
        try {
            if (config.interactor.enabled) {
                interactor = new Interactor();
                repo.add("interactor", interactor);
            }
        } catch (interactorException) {
            ehandle = new Exception(
                interactorException,
                "Interactor failed to initialise cleanly."
            );
        }

        // initialise the bugherd api wrapper
        try {
            bugherd = new BugHerd();
            repo.add("bugherd", bugherd);
        } catch (bugherdException) {
            ehandle = new Exception(
                bugherdException,
                "BugHerd API failed to initialise cleanly."
            );
        }

        // kbs data/api object
        kanban = {
            version: config.version,
            interactor: interactor,
            status: status,
            cache: cache,
            config: config,
            events: events,
            util: util,
            gui: gui,
            configurator: settings,
            Constructor: {
                "Configurator": Configurator,
                "Interactor": Interactor,
                "GUI": GUI,
                "BugHerd": BugHerd,
                "Http": Http,
                "Node": Node,
                "Modal": Modal,
                "Exception": Exception
            }
        };
    }
);
