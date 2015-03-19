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
    
    util.log("gui.js initialised...");

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
        var tree = {};

        // create nodes
        tree.main = new Node("div", "kbs-gui");
        tree.main.cons = tree.main.createChild("div", "kbs-cons");
        tree.main.cons.out = tree.main.cons.createChild("p", "kbs-cons-out");

        // return the tree
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

        // write out to document
        document.head.appendChild(link);
        document.body.appendChild(this.node.main.element);

        // autorefresh
        if (config.gui.autorefresh) {
            events.subscribe("gui/update", this.refresh);
        }

        // set the initialised flag
        this.inited = true;
        
        // events setup
        events.subscribe("gui/log", this.writeLog);
    };
    
    // write a log to console out
    GUI.prototype.writeLog = function (args) {
        // get nodes using the self pointer!
        var out = self.node.main.cons.out.element,
            logwrap = document.createElement("div"),
            log = document.createTextNode(args.msg),
            newline = document.createElement("br");

        // create the log element
        logwrap.className = "kbs-log-node kbs-" + args.type;
        logwrap.appendChild(log);

        // write
        out.appendChild(logwrap);
        //out.appendChild(newline);
    };
    
    // add a child node to the gui
    GUI.prototype.addChild = function (node) {
        this.childNodes.push(node);
        events.publish("gui/update");
    };
    
    // create a child and add to the gui
    GUI.prototype.createChild = function (type, classes, id) {
        var node = new Node(type, classes, id);
        this.childNodes.push(node);
        return node;
    };
    
    // refresh the gui and its child nodes
    GUI.prototype.refresh = function () {
        var element = this.node.main.element,
            i = 0;
        // unattach gui
        document.body.removeChild(element);

        // remove all nodes from gui
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

        // reattach all existing child nodes
        while (i < this.childNodes.length) {
            element.appendChild(this.childNodes[i].element);
            i += 1;
        }

        // reattach gui
        document.body.appendChild(element);
    };
    
    self = new GUI();
    
    return self;
});
