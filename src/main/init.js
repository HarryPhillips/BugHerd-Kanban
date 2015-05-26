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
*   + A place for Kanban tools? Not attached to the console toolbar?
*
*   + Add a repository/deposit component for storing instances of Kanban objects,
*     making them globally accessible within Kanban. Should remove the
*     need to pass instances between function calls.
*
*   + Add a modal to view screenshots instead of opening in a new tab
*
*   + Monitor status of all components and defer kbs/loaded event until
*     all components have finished initialising, more reliable than hard coding
*     the event fire (maybe combine with the repository/deposit component?)
*
*   + Allow searching of tasks by meta data such as references, browser and
*     version etc. Maybe allowing pulling into a local file?? Would require
*     local sourcing... possibly.
*
*   + Just discovered a very in-depth and exposed API under window.bugherd
*     this opens up a LOT of possibilities...
*
*   + Possibly add more info about the task to expanded details? Such as
*     the last updated at and update by etc?
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
        'main/ui/gui',
        'main/ui/interactor',
        'test/main.test'
    ],
    function KanbanInitialise(
        config,
        util,
        events,
        status,
        cache,
        repo,
        Http,
        Configurator,
        BugHerd,
        GUI,
        Interactor,
        tests
    ) {
        'use strict';

        // components
        var kanban, end, gui, interactor, settings, bugherd;

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
                    window.KBS_DELTA_TIME
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
            
        // get a new configurator and load data
        try {
            repo.settings = settings = new Configurator();
            settings.loadExisting();
        } catch (configuratorException) {
            util.log(
                "error",
                "Configurator failed to initialise " +
                    " cleanly. Exception thrown in " +
                    configuratorException.fileName + " at line " +
                    configuratorException.lineNumber + ". Error: " +
                    configuratorException.message
            );
        }

        // check if disabled
        if (!config.enabled) {
            return;
        }

        // subscribe to status updates
        events.subscribe("kbs/status", function (data) {
            status[data.component] = data.status;
        });

        // initialise gui first so log buffer is constructed
        try {
            if (config.gui.enabled) {
                repo.gui = gui = new GUI();
            }
        } catch (guiException) {
            util.log(
                "error",
                "GUI failed to initialise " +
                    " cleanly. Exception thrown in " +
                    guiException.fileName + " at line " +
                    guiException.lineNumber + ". Error: " +
                    guiException.message
            );
        }

        // initialise interactor
        try {
            if (config.interactor.enabled) {
                repo.interactor = interactor = new Interactor();
            }
        } catch (interactorException) {
            util.log(
                "error",
                "Interactor failed to initialise " +
                    " cleanly. Exception thrown in " +
                    interactorException.fileName + " at line " +
                    interactorException.lineNumber + ". Error: " +
                    interactorException.message
            );
        }
            
        // initialise the bugherd api wrapper
        try {
            repo.bugherd = bugherd = new BugHerd();
        } catch (bugherdException) {
            util.log(
                "error",
                "BugHerd API failed to initialise " +
                    " cleanly. Exception thrown in " +
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
                "Http": Http
            }
        };
    }
);
