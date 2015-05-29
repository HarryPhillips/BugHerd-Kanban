/*
*   @type javascript
*   @name init.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*
*   TODO
*   + Add a comments interface/modal (with a spellchecker? Preview post?)
*
*   + Monitor status of all components and defer kbs/loaded event until
*     all components have finished initialising, more reliable than hard coding
*     the event fire (maybe combine with the repository component?)
*
*   + Allow searching of tasks by meta data such as references, browser and
*     version etc.
*
*   + Possibly add more info about the task to expanded details? Such as
*     the last updated at and update by etc?
*
*   + Is it possible to add a setting to scale the entire KBS gui?
*
*   + Animated modal interface? When opening another popup, push other
*     modals into a stack at the side of the screen?
*
*   + Might want to add max length parameters for the console. *Might*.
*/

define(
    [
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/status',
        'main/components/cache',
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
        var kanban, end, gui,
            interactor, settings, bugherd,
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
            util.log(
                "error",
                "Configurator failed to initialise " +
                    "cleanly. Exception thrown in " +
                    configuratorException.fileName + " at line " +
                    configuratorException.lineNumber + ". Error: " +
                    configuratorException.message
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
            util.log(
                "error",
                "GUI failed to initialise " +
                    "cleanly. Exception thrown in " +
                    guiException.fileName + " at line " +
                    guiException.lineNumber + ". Error: " +
                    guiException.message
            );
        }

        // initialise interactor
        try {
            if (config.interactor.enabled) {
                interactor = new Interactor();
                repo.add("interactor", interactor);
            }
        } catch (interactorException) {
            util.log(
                "error",
                "Interactor failed to initialise " +
                    "cleanly. Exception thrown in " +
                    interactorException.fileName + " at line " +
                    interactorException.lineNumber + ". Error: " +
                    interactorException.message
            );
        }
            
        // initialise the bugherd api wrapper
        try {
            bugherd = new BugHerd();
            repo.add("bugherd", bugherd);
        } catch (bugherdException) {
            util.log(
                "error",
                "BugHerd API failed to initialise " +
                    "cleanly. Exception thrown in " +
                    bugherdException.fileName + " at line " +
                    bugherdException.lineNumber + ". Error: " +
                    bugherdException.message
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
            Api: {
                "Configurator": Configurator,
                "Interactor": Interactor,
                "GUI": GUI,
                "BugHerd": BugHerd,
                "Http": Http,
                "Node": Node,
                "Modal": Modal
            }
        };
    }
);
