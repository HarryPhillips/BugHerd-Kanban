/*
*   @type javascript
*   @name gui.js
*   @auth Harry Phillips
*/

/*jslint devel: true */

window.define(['config', './util', './events'], function (config, util, events) {
    'use strict';

    util.log("gui.js initialised...");
    
    // gui constructor
    function GUI() {
        this.wrapper = document.createElement("div");
        this.wrapper.id = "kbs-gui";

        // get node controller
        var nodes = new GUI.NodeArray();

        // child node array
        Object.defineProperty(this, "nodes", {
            get: function () {
                return nodes;
            },
            set: function (value) {
                throw new Error("Cannot redefine gui.nodes");
            }
        });
    }

    // gui initialisation
    GUI.prototype.init = function () {
        // attach stylesheet
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
            window.KBS_BASE_URL + window.KBS_SRC_DIR + "css/main.css";

        // write
        document.head.appendChild(link);
        document.body.appendChild(this.wrapper);
    };

    // add a child node to gui
    GUI.prototype.createNode = function (type, className, attrs) {
        var node = document.createElement(type);
        node.className = className;

        // push to children
        this.nodes.add(node);

        // auto refresh if applicable
        if (config.gui.autorefresh) {
            this.refresh();
        }

        return node;
    };

    // refresh gui and its nodes
    GUI.prototype.refresh = function () {
        // unattach the wrapper
        var i = 0,
            wrapper = document.body.removeChild(this.wrapper);

        // start refreshing the gui
        while (wrapper.firstChild) {
            wrapper.removeChild(wrapper.firstChild);
        }

        while (i < this.nodes.array.length) {
            wrapper.appendChild(this.nodes.array[i]);
            i += 1;
        }

        // reattach the wrapper
        document.body.appendChild(wrapper);
    };

    // gui node object
    GUI.Node = function (type, className, extNodes) {
        this.node = document.createElement(type);
        this.node.className = className;
        
        // add extra nodes if given
        if (extNodes) {
            if (util.isArray(extNodes)) {
                var i = 0;
                while (i < extNodes.length) {
                    this.node.appendChild(extNodes[i]);
                }
            } else {
                this.node.appendChild(extNodes);
            }
        }
    };
    
    GUI.Node.prototype.addChild = function (child) {
        this.node = null;
    };
    
    // gui child node array controller
    GUI.NodeArray = function () {
        var array = [];
        Object.defineProperty(this, "array", {
            get: function () {
                return array;
            },
            set: function () {
                throw new Error("Cannot redefine the gui node array!");
            }
        });
    };

    // adds a value to node array
    GUI.NodeArray.prototype.add = function (value) {
        // push to array
        this.array.push(value);
    };

    return new GUI();
});
