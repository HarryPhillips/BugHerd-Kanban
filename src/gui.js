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
        this.node = document.createElement("div");
        this.node.className = "kbs-gui";
        this.childNodes = [];
    }
    
    GUI.prototype = {
        init: function () {
            // create stylesheet link
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = window.KBS_BASE_URL +
                window.KBS_SRC_DIR + "css/main.css";
            
            // write out to document
            document.head.appendChild(link);
            document.body.appendChild(this.node);
        },
        addChild: function (node) {
            this.childNodes.push(node);
        },
        createChild: function (type, classes, id) {
            var node = document.createElement(type);
            node.className = classes;
            node.id = id || "";
            this.childNodes.push(node);
        },
        refresh: function () {
            // unattach gui
            document.body.removeChild(this.node);
            
            // remove all nodes from gui
            while (this.node.firstChild) {
                this.node.removeChild(this.node.firstChild);
            }
            
            // reattach all existing child nodes
            var i = 0;
            while (i < this.childNodes.length) {
                this.node.appendChild(this.childNodes[i]);
                i += 1;
            }
            
            // reattach gui
            document.body.appendChild(this.node);
        }
    };
    
    return new GUI();
});
