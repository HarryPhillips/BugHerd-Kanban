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

        var self, modded = {};

        // configurator class
        function Configurator() {
            // don't need multiple instances
            if (self) {
                return self;
            }

            self = this;
            this.def = util.clone(config);
            this.modal = null;
            this.launchModal = this.rLaunchModal.bind(this);
            this.reloadModal = this.rReloadModal.bind(this);
        }

        // get user config object from cookie
        Configurator.prototype.getUserData = function () {
            var cookie = util.cookie.get("settings"),
                data = util.unserialise(cookie);

            return data || {};
        };

        // get user config object string
        Configurator.prototype.getUserCookie = function () {
            return util.cookie.get("settings");
        };

        // get formatted user config object string
        Configurator.prototype.getFormattedUserCookie = function () {
            return JSON.stringify(modded, null, 4);
        };

        // check for and load existing user config data
        Configurator.prototype.loadExisting = function () {
            var data = this.getUserData(),
                parsed;

            if (data) {
                util.log("loading existing user config");
                modded = data;
                util.merge(config, data, true);
                return;
            } else {
                util.log("error", "no user data found!");
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
        Configurator.prototype.rLaunchModal = function () {
            // initialise the modal
            if (this.modal) {
                this.modal.init();
            } else {
                this.modal = new Modal("user-config", {init: true});
            }
        };

        // reload the configurator ui
        Configurator.prototype.rReloadModal = function () {
            if (this.modal) {
                this.modal.reload();
            }
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
        Configurator.prototype.set = function (selector, value, reload) {
            var segments = selector.split("/"),
                len = segments.length,
                got = config,
                i = 0,
                tree = modded,
                parent,
                parentName;

            reload = reload || false;

            // if a simple selector
            if (len === 1) {
                // update config
                config[selector] = value;

                // update mofified prop list
                modded[selector] = value;

                // update user prefs cookie
                util.cookie.set(
                    "settings",
                    util.serialise(modded)
                );

                // reload the modal
                if (reload) {
                    this.modal.reload(true);
                }

                return config[selector];
            }

            // more complex selector build tree to
            // target value and get reference to parent
            // config object
            for (i; i < len; i += 1) {
                // if second to last segment, set as parent ref
                if (i === len - 2) {
                    parent = got[segments[i]];
                    parentName = segments[i];
                }

                // set ref for next loop
                got = got[segments[i]];

                // build tree for merging with config
                if (i !== len - 1) {
                    tree[segments[i]] = tree[segments[i]] || {};
                    tree = tree[segments[i]];
                } else {
                    tree[segments[i]] = value;
                }
            }

            // set values in config, modified
            // prop list and user cookie

            // set value to config config
            parent[segments[len - 1]] = value;

            // update user prefs cookie
            util.cookie.set(
                "settings",
                util.serialise(modded)
            );

            // reload the modal
            if (reload) {
                this.modal.reload(true);
            }

            return parent[segments[len - 1]];
        };

        // reset config to default state
        Configurator.prototype.reset = function () {
            var i;
            
            // reset config object
            for (i in config) {
                if (config.hasOwnProperty(i)) {
                    // is a default prop?
                    if (!self.def[i]) {
                        // this is a new prop - unset it
                        delete config[i];
                    }
                    
                    // set to default
                    config[i] = self.def[i];
                }
            }

            // delete user settings cookie
            util.cookie.del("settings");

            // refresh page
            location.hash = "settings";
            location.reload();
        };

        return Configurator;
    }
);
