/*
*   @type javascript
*   @name configurator.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        "config",
        "main/components/util",
        "main/ui/modal"
    ],
    function (config, util, Modal) {
        "use strict";

        var self;
        
        // configurator class
        function Configurator() {
            self = this;
            this.modal = null;
        }
        
        // check for and load existing user config data
        Configurator.prototype.loadExisting = function () {
            if (util.cookie.exists("settings")) {
                // TODO
                return;
            } else {
                // TODO
                return;
            }
        };
        
        // launch the configurator ui
        Configurator.prototype.launchModal = function () {
            // initialise the modal
            self.modal = new Modal("userConfig", {init: true});
        };

        // finds a config setting from a selector string e.g. "gui/console/state"
        // will get config.gui.console.state
        Configurator.prototype.get = function (selector) {
            var i = 0,
                segments = selector.split("/"),
                value = config,
                len = segments.length;

            // iterate through segments
            for (i; i < len; i += 1) {
                // get segment value
                value = value[segments[i]];
            }

            return value;
        };

        // set/create a config value
        Configurator.prototype.set = function (selector, value) {
            var segments = selector.split("/"),
                len = segments.length,
                got = config,
                i = 0,
                parent;

            // if a simple selector
            if (segments.length === 1) {
                config[selector] = value;
                return config[selector];
            }

            // more complex selector - let's get references
            for (i; i < len; i += 1) {
                // if second to last segment, set as parent ref
                if (i === len - 2) {
                    parent = got[segments[i]];
                }
                got = got[segments[i]];
            }

            // set value
            parent[segments[len - 1]] = value;
            return parent[segments[len - 1]];
        };

        // reset config to default state
        Configurator.prototype.reset = function () {
            config.reset();
        };

        return Configurator;
    }
);
