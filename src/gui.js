/*
*   @type javascript
*   @name gui.js
*   @auth Harry Phillips
*/

/*jslint devel: true */

window.define(['config', './util', './events'], function (config, util, events) {
    'use strict';
    
    util.log("gui.js initialised...");
    
    // declarations
    var build;

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
        this.node = build();
        this.childNodes = [];
    }
    
    GUI.prototype = {
        // initialise gui
        init: function () {
            // create stylesheet link
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = window.KBS_BASE_URL +
                window.KBS_SRC_DIR + "css/main.css";
            
            // write out to document
            document.head.appendChild(link);
            document.body.appendChild(this.node.element);
            
            // autorefresh
            if (config.gui.autorefresh) {
                events.subscribe("gui/update", this.refresh);
            }
        },
        
        // add a child node to the gui
        addChild: function (node) {
            this.childNodes.push(node);
            events.publish("gui/update");
        },
        
        // create a child and add to the gui
        createChild: function (type, classes, id) {
            var node = new Node(type, classes, id);
            this.childNodes.push(node);
            return node;
        },
        
        // refresh the gui and its child nodes
        refresh: function () {
            var element = this.node.element,
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
        }
    };
    
    // returns a built gui node tree
    build = function () {
        // declarations
        var main, console, consoleOut;
        
        // create main gui node
        main = new Node("div", "kbs-gui");
        
        // add the console node
        console = main.createChild("div", "kbs-cons");
        consoleOut = console.createChild("div", "kbs-cons-out");
        
        return main;
    };
    
    return new GUI();
});
