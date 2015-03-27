/*
*   @type javascript
*   @name modal.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'config',
        'src/util',
        'src/components/events',
        'src/components/http',
        'src/components/status',
        './node'
    ],
    function (config, util, events, Http, status, Node) {
        'use strict';

        // instance pointer
        var self, gui;
        
        function Modal(type, instance, params) {
            // set pointer
            self = this;
            
            // check if a type has been passed
            if (typeof type !== "string") {
                // adjust arguments
                params = instance;
                instance = type;
                type = null;
            }
            
            // set props
            gui = instance;
            this.type = type;
            this.node = new Node("div", "kbs-modal");
            this.node.element.style.display = "none";
            
            if (type) {
                this.node.element.className += " kbs-" + type;
            }
            
            this.onConfirm = params.confirm || function () {};
            this.onCancel = params.cancel || function () {};
            
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
                close = this.node.createChild("i", "fa fa-times kbs-modal-close"),
                confirm,
                cancel;
            
            title.element.textContent = this.title;
            message.element.textContent = this.message;
            
            close.element.onclick = function () {
                self.close();
            };
            
            // append components
            this.node.addChild(title);
            this.node.addChild(close);
            this.node.addChild(message);
            
            // add confirm/cancel buttons for prompt modals
            if (this.type === "prompt") {
                // confirm
                confirm = this.node.createChild("span", "kbs-confirm");
                confirm.element.textContent = "confirm";
                confirm.element.onclick = this.onConfirm;
                
                // cancel
                cancel = this.node.createChild("span", "kbs-cancel");
                cancel.element.textContent = "cancel";
                cancel.element.onclick = this.onCancel;
                
                // click event handlers
                
                this.node.addChild(confirm);
                this.node.addChild(cancel);
            }
            
            // add our node to gui
            gui.addChild(this.node.element);
            
            // open the modal
            this.open();
        };
        
        // reveal modal and overlay
        Modal.prototype.open = function () {
            gui.tree.main.overlay.element.style.display = "block";
            this.node.element.style.display = "block";
        };
        
        // close modal and overlay
        Modal.prototype.close = function () {
            gui.tree.main.overlay.element.style.display = "none";
            this.node.element.style.display = "none";
        };

        return Modal;
    }
);