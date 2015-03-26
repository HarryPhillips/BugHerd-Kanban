/*
*   @type javascript
*   @name modal.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    ['config', './util', './events', './http', './status', './node'],
    function (config, util, events, Http, status, Node) {
        'use strict';

        function Modal(instance, params) {
            this.gui = instance;
            this.node = new Node("div", "kbs-modal");
            this.node.element.style.display = "none";
            this.message = params.message;
            this.init();
        }
        
        Modal.prototype.init = function () {
            this.gui.addChild(this.node.element);
            this.open();
        };
        
        Modal.prototype.open = function () {
            this.gui.tree.main.overlay.element.style.display = "";
            this.node.element.style.display = "";
            this.node.element.textContent = this.message;
        };

        return Modal;
    }
);