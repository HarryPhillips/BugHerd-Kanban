/*
*   @type javascript
*   @name gui.js
*   @auth Harry Phillips
*/

/*jslint devel: true */

/*
    TODO:
    
    - Add an array to Node class to store child nodes
    - Add ability to remove child nodes
    - Re-write to support the new node tree structure
*/

window.define(['config', './util', './events'], function (config, util, events) {
    'use strict';
    
    util.log("+ gui.js loaded");

    // points to the gui instance
    // used inside functions called externally
    // that need access to the the gui instance
    var self;
    
    // node constructor
    function Node(type, classes, id) {
        this.element = document.createElement(type);
        this.element.className = classes || "";
        this.element.id = id || "";
    }
    
    // add a child to node
    Node.prototype.addChild = function (node) {
        // add child to node
        this.element.appendChild(node);
    };
    
    // create and add child to node
    Node.prototype.createChild = function (type, classes, id) {
        var node = new Node(type, classes, id);
        this.addChild(node.element);
        return node;
    };
    
    // gui constructor
    function GUI() {
        this.inited = false;
        this.node = this.buildNodeTree();
    }
    
    // build gui node tree
    GUI.prototype.buildNodeTree = function () {
        // create tree and nodes
        var tree = {}, main;

        // create nodes
        tree.main = main = new Node("div", "kbs-gui");
        main.overlay = tree.main.createChild("div", "kbs-overlay");
        
        if (config.logs.gui) {
            main.cons = tree.main.createChild("div", "kbs-cons");
            main.cons.out = tree.main.cons.createChild("p", "kbs-cons-out");
        }

        return tree;
    };
    
    // initialise gui
    GUI.prototype.init = function () {
        // create stylesheet link
        var link = document.createElement("link"),
            url = window.KBS_BASE_URL + window.KBS_SRC_DIR +
                "css/main.css";

        // props
        link.rel = "stylesheet";
        link.href = url;

        link.onload = function () {
            util.log("+ main.css loaded");
            
            // attach gui when styles have loaded
            document.body.appendChild(self.node.main.element);
            
            // set the initialised flag
            this.inited = true;
            
            // gui is last to load - publish loaded event
            events.publish("kbs/loaded");
        };
        
        // write out to document
        document.head.appendChild(link);

        // events setup
        if (config.gui.enabled) {
            if (config.gui.autorefresh) {
                // auto refresh
                events.subscribe("gui/update", this.refresh);
            }
            if (config.logs.gui) {
                // gui logging
                events.subscribe("gui/log", this.writeLog);
            }
        }
    };
    
    // write a log to console out
    GUI.prototype.writeLog = function (args) {
        // get nodes using the self pointer!
        var out = self.node.main.cons.out.element,
            log = new Node("div", "kbs-log-node kbs-" + args.type),
            content = args.msg;
        
        if (args.obj) {
            content += "<pre><br /><br />";
            content += args.obj + "</pre>";
        }
        
        log.element.innerHTML = content;
        
        // write
        out.appendChild(log.element);
    };
    
    // add a child node to the gui
    GUI.prototype.addChild = function (node) {
        this.node.main.element.appendChild(node);
    };
    
    // create a child and add to the gui
    GUI.prototype.createChild = function (type, classes, id) {
        var node = new Node(type, classes, id);
        this.node.main.element.appendChild(node);
        return node;
    };
    
    // refresh the gui and its child nodes
    GUI.prototype.refresh = function () {};
    
    self = new GUI();
    
    return self;
});
