/*
*   @type javascript
*   @name gui.js
*   @copy Copyright 2015 Harry Phillips
*/

/*jslint devel: true */

/*global define: true */

define(function (require) {
    'use strict';

    // dependencies
    var
        config = require('config'),
        util = require('src/util'),
        events = require('src/components/events'),
        interactor = require('src/interactor'),
        Node = require('./node'),
        Counter = require('src/components/counter'),
        Console = require('./console'),
        Modal = require('./modal'),
        
        // instance pointer
        self;
    
    util.log("+ gui.js loaded");

    // gui constructor
    function GUI() {
        // set pointer
        self = this;

        // tree and console
        this.tree = this.buildNodeTree();
        this.console = new Console(this);
        
        // test modal!
        this.modal = new Modal(this, {
            init: false,
            title: "Test Modal - Title",
            message: "Test paragraph / modal content."
        });

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
                events.publish("kbs/gui/loaded");
            }),

            // create link elements
            mainlink = document.createElement("link"),
            themelink = document.createElement("link"),
            falink = document.createElement("link"),

            // create urls
            mainurl = window.KBS_BASE_URL +
            "css/main.css",
            
            themeurl = window.KBS_BASE_URL +
            "css/" + (config.theme || "theme") + ".css",

            faurl = "//maxcdn.bootstrapcdn.com/font-awesome/" +
            "4.3.0" +
            "/css/font-awesome.min.css",

            // attach gui element and publish loaded event
            publish = function () {
                // attach gui when styles have loaded
                document.body.appendChild(self.tree.main.element);
                util.log("context:gui/init", "debug", "+ attached gui tree");
                
                // run event listeners
                self.runEventListeners();
                util.log("context:gui/init", "debug", "+ running event listeners");

                // gui is always last to load - publish loaded event
                util.log("context:gui/init", "debug", "+ publishing 'kbs/loaded'");
                events.publish("kbs/loaded");
            };

        // events setup
        if (config.gui.enabled) {
            // auto refresh
            if (config.gui.autorefresh) {
                events.subscribe("gui/update", this.refresh);
            }

            // gui logging
            if (config.logs.gui) {
                events.subscribe("gui/log", this.console.write);
            }
        
            // gui load event listener
            events.subscribe("kbs/gui/loaded", publish);
        }

        // props
        mainlink.rel = "stylesheet";
        themelink.rel = "stylesheet";
        falink.rel = "stylesheet";

        mainlink.href = mainurl;
        themelink.href = themeurl;
        falink.href = faurl;
        
        // gui init log context
        util.log("context:gui/init", "info", "Initialising GUI...");

        // main css link events
        mainlink.onload = function () {
            util.log("context:gui/init", "debug", "+ main.css loaded");
            loader.count += 1;
        };
        
        mainlink.onerror = function () {
            loader.count += 1;
            throw new Error("main.css failed to load!");
        };

        // theme css link events
        themelink.onload = function () {
            util.log("context:gui/init", "debug", "+ theme.css loaded");
            loader.count += 1;
        };
        
        themelink.onerror = function () {
            loader.count += 1;
            throw new Error("theme.css failed to load!");
        };

        // font-awesome css link events
        falink.onload = function () {
            util.log("context:gui/init", "debug", "+ font-awesome.css loaded");
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
        // handle log node of type 'exec' clicks
        var out = this.console.wrapper.cons.out.element,
            current,
            togglables;
        
        // set togglables based on context state
        togglables = (config.logs.contexts) ? ["kbs-exec", "kbs-test"] : "";
        
        // bind a click handler to the console out
        out.onclick = function (event) {
            current = event.target;
            if (util.contains(current.className, togglables) !== false) {
                // we clicked on an exec block
                if (!util.contains(current.className, "kbs-log-close")) {
                    // we need to close the block
                    current.className += " kbs-log-close";
                } else {
                    // we need to open the block
                    current.className =
                        current.className.replace(" kbs-log-close", "");
                }
            }
        };
    };

    // refresh the gui and its child nodes
    GUI.prototype.refresh = function () {
        this.console.refresh();
    };


    // add a child node to the gui
    GUI.prototype.addChild = function (node) {
        this.tree.main.element.appendChild(node);
    };

    // create a child and add to the gui
    GUI.prototype.createChild = function (type, classes, id) {
        var node = new Node(type, classes, id);
        this.tree.main.element.appendChild(node.element);
        return node;
    };
    // benchmarks the generation of 10000 log nodes
    GUI.prototype.benchmark = function () {
        var cons = self.console.wrapper.cons.element,
            out = self.console.wrapper.cons.out.element,
            start = new Date().getTime(),
            end,
            i = 0;

        // detach
        cons.removeChild(out);

        while (i < 10000) {
            util.log("debug", "log #" + i);
            i += 1;
        }

        // reattach
        cons.appendChild(out);

        end = new Date().getTime() - start;
        util.log("debug", "opt: " + end + "ms");
    };
    
    // return the current gui instance
    GUI.prototype.getCurrentInstance = function () {
        return self;
    };

    // return gui
    return GUI;
});
    
