/*
*   @type javascript
*   @name gui.js
*   @copy Copyright 2015 Harry Phillips
*/

/*jslint devel: true */

/*global define: true */

/*
    TODO:
    
    - Add an array to Node class to store child nodes
    - Add ability to remove child nodes
    - Re-write to support the new node tree structure
*/

define(function (require) {
    'use strict';

    // dependencies
    var
        config = require('config'),
        util = require('src/util'),
        events = require('src/events'),
        Node = require('src/node'),
        Counter = require('src/counter'),
        Console = require('src/console'),
        
        // instance pointer
        self;
    
    util.log("+ gui.js loaded");

    // gui constructor
    function GUI() {
        // set pointer
        self = this;

        this.tree = this.buildNodeTree();
        this.console = new Console(this);

        // update gui status
        events.publish("kbs/status", {
            component: "gui",
            status: true
        });
    }

    // build gui node tree
    GUI.prototype.buildNodeTree = function () {
        // create tree and nodes
        var tree = {}, main;

        // create nodes
        tree.main = main = new Node("div", "kbs-gui");
        main.overlay = tree.main.createChild("div", "kbs-overlay");

        return tree;
    };

    // initialise gui
    GUI.prototype.init = function () {
        var
            // loader
            loader = new Counter(3, function () {
                events.publish("kbs/gui/loaded");
            }),

            // create link elements
            mainlink = document.createElement("link"),
            themelink = document.createElement("link"),
            falink = document.createElement("link"),

            // create urls
            mainurl = window.KBS_BASE_URL + window.KBS_SRC_DIR +
            "css/main.css",

            themeurl = window.KBS_BASE_URL + window.KBS_SRC_DIR +
            "css/theme.css",

            faurl = "//maxcdn.bootstrapcdn.com/font-awesome/" +
            "4.3.0" +
            "/css/font-awesome.min.css",

            // attach gui element and publish loaded event
            publish = function () {
                // attach gui when styles have loaded
                document.body.appendChild(self.tree.main.element);
                util.log("debug", "+ attached gui tree");

                // gui is always last to load - publish loaded event
                util.log("debug", "+ publishing 'kbs/loaded'");
                events.publish("kbs/loaded");
            };

        // gui load event listener
        events.subscribe("kbs/gui/loaded", publish);

        // props
        mainlink.rel = "stylesheet";
        themelink.rel = "stylesheet";
        falink.rel = "stylesheet";

        mainlink.href = mainurl;
        themelink.href = themeurl;
        falink.href = faurl;

        mainlink.onload = function () {
            util.log("debug", "+ main.css loaded");
            loader.count += 1;
        };

        themelink.onload = function () {
            util.log("debug", "+ theme.css loaded");
            loader.count += 1;
        };

        falink.onload = function () {
            util.log("debug", "+ font-awesome.css loaded");
            loader.count += 1;
        };

        // write out to document
        if (!config.offline) {
            document.head.appendChild(falink);
        }
        document.head.appendChild(mainlink);
        document.head.appendChild(themelink);

        // events setup
        if (config.gui.enabled) {
            if (config.gui.autorefresh) {
                // auto refresh
                events.subscribe("gui/update", this.refresh);
            }

            if (config.logs.gui) {
                // gui logging
                events.subscribe("gui/log", this.console.write);
            }
        }
    };

    // benchmarks the generation of 10000 log nodes
    GUI.prototype.benchmark = function () {
        var cons = this.tree.main.conswrap.cons.element,
            out = this.tree.main.conswrap.cons.out.element,
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

    // refresh the gui and its child nodes
    GUI.prototype.refresh = function () {
        this.console.refresh();
    };

    // return gui
    return GUI;
});
    
