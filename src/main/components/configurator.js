/*
*   @type javascript
*   @name configurator.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*
*   TODO:
*   + Find out why settings disabling logs via the configurator
*     breaks the GUI console...
*/

define(
    [
        "config",
        "main/components/util",
        "main/ui/modal"
    ],
    function (config, util, Modal) {
        "use strict";

        var self, modded = {};
        
        // configurator class
        function Configurator() {
            self = this;
            this.modal = null;
        }
        
        // check for and load existing user config data
        Configurator.prototype.loadExisting = function () {
            var settings = util.cookie.get("settings"),
                parsed;
            
            if (settings) {
                util.log("loading existing user config");
                parsed = util.unserialise(settings, true);
                util.merge(config, parsed, true);
                return;
            }
        };
        
        // return list of modified properties
        Configurator.prototype.modifiedProperties = function () {
            var list = [],
                prop;
            
            // form an array of prop names
            for (prop in modded) {
                if (modded.hasOwnProperty(prop)) {
                    list.push(prop);
                }
            }
            
            return list;
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
                parent,
                parentName;

            // if a simple selector
            if (segments.length === 1) {
                // update config
                config[selector] = value;
                
                // update mofified prop list
                modded[selector] = value;
                
                // update user prefs cookie
                util.cookie.set(
                    "settings",
                    util.serialise(modded)
                );
                
                return config[selector];
            }

            // more complex selector - let's get references
            for (i; i < len; i += 1) {
                // if second to last segment, set as parent ref
                if (i === len - 2) {
                    parent = got[segments[i]];
                    parentName = segments[i];
                }
                got = got[segments[i]];
            }

            // set values in config, modified
            // prop list and user cookie
            
            // set value to config config
            parent[segments[len - 1]] = value;
            
            // update modified prop list
            modded[parentName] = value;
            
            // update user prefs cookie
            util.cookie.set(
                "settings",
                util.serialise(modded)
            );
            
            return parent[segments[len - 1]];
        };

        // reset config to default state
        Configurator.prototype.reset = function () {
            // reset config object
            config.reset();
            
            // delete user settings cookie
            util.cookie.del("settings");
            
            // refresh page
            location.reload();
        };

        return Configurator;
    }
);
