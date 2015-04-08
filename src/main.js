/*
*   @type javascript
*   @name main.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(function (require) {
    'use strict';

    // declarations
    var
        // requirements
        config, events, util,
        status, http, cache,
        GUI, Interactor,
        tests,

        // components
        kanban, end, gui, interactor;

    
    // get config
    config = require('config');
    
    // check if disabled
    if (!config.enabled) {
        return;
    }
    
    // require calls
    events = require('./components/events');
    util = require('./util');
    status = require('./components/status');
    http = require('./components/http');
    cache = require('./components/cache');
    GUI = require('./ui/gui');
    Interactor = require('./interactor');
    tests = require('test/main.test');

    // subscribe to status updates
    events.subscribe("kbs/status", function (data) {
        status[data.component] = data.status;
    });

    // initialise gui
    if (config.gui.enabled) {
        gui = new GUI();
    }

    // initialise interactor
    interactor = new Interactor();

    // execute kanban
    end = function () {
        // get performance delta
        window.KBS_DELTA_TIME =
            (new Date().getTime() - window.KBS_START_TIME) + "ms";

        // log
        util.log(
            "okay",
            //kanban,
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
            tests.exec(['util']);
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
    
    // if gui is disabled - publish the load event
    if (!config.gui.enabled) {
        events.publish("kbs/loaded");
    }
});
