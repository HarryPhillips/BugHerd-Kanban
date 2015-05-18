/*
*   @type javascript
*   @name gui.js
*   @copy Copyright 2015 Harry Phillips
*/

/*jslint devel: true */

/*global define: true */

define(
    [
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/counter',
        'main/components/configurator',
        'main/components/node',
        'main/ui/console',
        'main/ui/modal'
    ],
    function (
        config,
        util,
        events,
        Counter,
        Configurator,
        Node,
        Console,
        Modal
    ) {
        'use strict';

        // instance pointer
        var self,
            configurator = new Configurator();

        util.log("+ gui.js loaded");

        // gui constructor
        function GUI() {
            // set pointer
            self = this;

            // pass our instance to Modal closure
            Modal.prototype.setInstance(this);
            
            // modals api
            this.setModalApi();
            
            // tree and console
            this.tree = this.buildNodeTree();
            this.console = new Console(this);

            // init
            this.init();

            // update gui status
            events.publish("kbs/status", {
                component: "gui",
                status: true
            });
        }

        // initialise gui
        GUI.prototype.init = function () {
            var
                // loader
                loader = new Counter((config.offline) ? 2 : 3, function () {
                    events.publish("gui/loaded");
                }),

                // create link elements
                mainlink = document.createElement("link"),
                themelink = document.createElement("link"),
                falink = document.createElement("link"),

                // create urls
                mainurl = window.KBS_BASE_URL +
                "css/main.css",

                themeurl = window.KBS_BASE_URL +
                "css/themes/" + (config.theme || "default") + ".css",

                faurl = "//maxcdn.bootstrapcdn.com/font-awesome/" +
                "4.3.0" +
                "/css/font-awesome.min.css",

                // attach gui element and publish loaded event
                publish = function () {
                    // attach gui when styles have loaded
                    document.body.appendChild(self.tree.main.element);
                    util.log("context:gui/init", "+ attached gui tree");

                    // run event listeners
                    self.runEventListeners();

                    // publish the loaded event
                    events.publish("kbs/loaded");
                };

            // events setup
            if (config.gui.enabled) {
                // gui logging
                if (config.logs.gui) {
                    events.subscribe("gui/log", this.console.write);
                }

                // gui load event listener
                events.subscribe("gui/loaded", publish);
            }

            // props
            mainlink.rel = "stylesheet";
            themelink.rel = "stylesheet";
            falink.rel = "stylesheet";

            mainlink.href = mainurl;
            themelink.href = themeurl;
            falink.href = faurl;
            
            themelink.id = "kbs-theme-link";

            // gui init log context
            util.log("context:gui/init", "info", "Initialising GUI...");

            // main css link events
            mainlink.onload = function () {
                util.log("context:gui/init", "+ main.css loaded");
                loader.count += 1;
            };

            mainlink.onerror = function () {
                loader.count += 1;
                throw new Error("main.css failed to load!");
            };

            // theme css link events
            themelink.onload = function () {
                var themename = self.getThemeName();
                
                util.log("context:gui/init", "+ theme '" + themename + "' loaded");
                loader.count += 1;
            };

            themelink.onerror = function () {
                loader.count += 1;
                util.log("error", "theme '" +
                                self.getThemeName() +
                                "' failed to load!");
            };

            // font-awesome css link events
            falink.onload = function () {
                util.log("context:gui/init", "+ font-awesome.css loaded");
                loader.count += 1;
            };

            falink.onerror = function () {
                loader.count += 1;
                throw new Error("font-awesome.css failed to load!");
            };

            // write out to document
            if (!config.offline) {
                document.head.appendChild(falink);
            }
            document.head.appendChild(mainlink);
            document.head.appendChild(themelink);
        };
            
        // return current theme name or theme name from url
        GUI.prototype.getThemeName = function (url) {
            var themelink = document.getElementById("kbs-theme-link"),
                name = url || themelink.href;
            
            name = name.replace(
                window.KBS_BASE_URL +
                    "css/themes/",
                ""
            );
            
            name = name.replace(".css", "");
            
            return name;
        };
            
        // return to configured theme
        GUI.prototype.resetTheme = function () {
            self.loadTheme(config.theme || "theme");
        };
            
        // set theme
        GUI.prototype.loadTheme = function (theme) {
            var themelink = document.getElementById("kbs-theme-link"),
                node = new Node(themelink);
            
            // remove .css if found
            theme = theme.replace(".css", "");
            
            // set theme
            node.attr(
                "href",
                window.KBS_BASE_URL +
                    "css/themes/" + theme + ".css"
            );
            
            // update config
            configurator.set("theme", theme);
        };
            
        // remove current theme
        GUI.prototype.unloadTheme = function () {
            var themelink = document.getElementById("kbs-theme-link"),
                node = new Node(themelink);
            
            node.attr("href", "");
        };

        // build gui node tree
        GUI.prototype.buildNodeTree = function () {
            // create tree and nodes
            var tree = {}, main;

            // create nodes
            tree.main = main = new Node("div", "kbs-gui");
            main.overlay = main.createChild("div", "kbs-overlay");

            return tree;
        };

        // run event listeners
        GUI.prototype.runEventListeners = function () {
            util.log("context:gui/init", "+ running event listeners");
            
            // handle log node of type 'exec' clicks
            var out = this.console.wrapper.cons.out.element,
                current,
                togglables;

            // set togglables based on context state
            togglables = (config.logs.contexts) ?
                    [
                        "kbs-exec",
                        "kbs-test",
                        "kbs-buffer"
                    ] : "";

            // bind a click handler to the console out
            out.onclick = function (event) {
                current = new Node(event.target);
                if (current.hasClass(togglables)) {
                    if (!current.hasClass("kbs-log-closed")) {
                        // we need to close the block
                        current.addClass("kbs-log-closed");
                    } else {
                        // we need to open the block
                        current.removeClass("kbs-log-closed");
                    }
                }
            };
        };
            
        // modal api / dynamic properties
        GUI.prototype.setModalApi = function () {
            this.modals = Modal.prototype.getController();
        };


        // add a child node to the gui
        GUI.prototype.addChild = function (node) {
            this.tree.main.addChild(node);
        };

        // create a child and add to the gui
        GUI.prototype.createChild = function (type, classes, id) {
            var node = new Node(type, classes, id);
            this.addChild(node);
            return node;
        };

        // return the current gui instance
        GUI.prototype.getCurrentInstance = function () {
            return self;
        };

        // return gui
        return GUI;
    }
);
    
