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

        // instance pointer
        var self;
        
        function Modal(instance, params) {
            // set pointer
            self = this;
            
            // set props
            this.gui = instance;
            this.node = new Node("div", "kbs-modal");
            this.node.element.style.display = "none";
            
            // text content
            this.title = params.title;
            this.message = params.message;
            
            // initialise
            if (params.init) {
                this.init();
            }
        }
        
        // init and open modal
        Modal.prototype.init = function () {
            // declarations
            var title = this.node.createChild("h2", "kbs-modal-title"),
                message = this.node.createChild("p", "kbs-modal-msg"),
                close = this.node.createChild("i", "fa fa-times kbs-modal-close");
            
            title.element.textContent = this.title;
            message.element.textContent = this.message;
            
            close.element.onclick = function () {
                self.close();
            };
            
            // append components
            this.node.addChild(title.element);
            this.node.addChild(message.element);
            this.node.addChild(close.element);
            
            // add our node to gui
            this.gui.addChild(this.node.element);
            
            // open the modal
            this.open();
        };
        
        // reveal modal and overlay
        Modal.prototype.open = function () {
            this.gui.tree.main.overlay.element.style.display = "block";
            this.node.element.style.display = "block";
        };
        
        // close modal and overlay
        Modal.prototype.close = function () {
            this.gui.tree.main.overlay.element.style.display = "none";
            this.node.element.style.display = "none";
        };

        return Modal;
    }
);