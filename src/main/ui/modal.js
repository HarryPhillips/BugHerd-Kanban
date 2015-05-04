/*
*   @type javascript
*   @name modal.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(
    [
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/http',
        'main/components/status',
        'main/components/node'
    ],
    function (config, util, events, Http, status, Node) {
        'use strict';

        // instance references
        var gui;
        
        function Modal(type, instance, params) {
            // set pointer
            var self = this;
            
            // check if a type has been passed
            if (typeof type !== "string") {
                // adjust arguments
                params = instance;
                instance = type;
                type = null;
            }
            
            // check if gui instance has been passed
            if (instance.constructor.name !== "GUI") {
                // adjust arguments
                params = instance;
                instance = null;
            }
            
            if (!gui && !instance) {
                throw new Error("Modal has no GUI instance!");
            }
            
            // set props
            gui = gui || instance;
            this.type = type;
            this.node = new Node("div", "kbs-modal");
            this.node.hide();
            
            if (type) {
                this.node.addClass("kbs-" + type);
            }
            
            this.onConfirm = params.confirm || function () {};
            this.onCancel = params.cancel || function () {};
            this.onProceed = function () {};
            
            // wrap the on proceed event to pass args
            if (params.proceed) {
                this.onProceed = function (args) {
                    params.proceed(args);
                };
            }
            
            // text content
            this.title = params.title;
            this.message = params.message;
            
            // input
            this.inputType = params.input || "text";
            
            // initialise
            if (params.init) {
                this.init();
            }
        }
        
        // init and open modal
        Modal.prototype.init = function () {
            // declarations
            var
                self = this,
            
                modal = this.node,
            
                title =
                modal.createChild("h2", "kbs-modal-title"),
                
                close =
                modal.createChild("i", "fa fa-times kbs-modal-close"),
                
                message =
                modal.createChild("p", "kbs-modal-msg"),
                
                input,
                confirm,
                cancel,
                proceed;
            
            title.element.textContent = this.title;
            message.element.textContent = this.message;
            
            close.element.onclick = function () {
                self.destroy();
            };
            
            // add confirm/cancel buttons for prompt modals
            if (this.type === "prompt") {
                // confirm
                confirm = modal.createChild("span", "kbs-confirm");
                confirm.text("confirm");
                confirm.element.onclick = this.onConfirm;
                
                // cancel
                cancel = modal.createChild("span", "kbs-cancel");
                cancel.text("cancel");
                cancel.element.onclick = this.onCancel;
            }
            
            // add user input for input modals
            if (this.type === "input") {
                // input field
                input = this.node.createChild("input", "kbs-input-field");
                input.element.type = this.inputType;
                
                // continue button
                proceed = modal.createChild("div", "kbs-continue");
                proceed.text("Go");
                proceed.element.onclick = function () {
                    self.onProceed(input.element.value);
                };
                
            }
            
            // add our node to gui
            gui.addChild(modal);
            
            // focus on input
            if (this.type === "input") {
                input.focus();
            }
            
            // open the modal
            this.open();
        };
        
        // reveal modal and overlay
        Modal.prototype.open = function () {
            if (status.modal) {
                return;
            }
            
            status.modal = true;
            gui.tree.main.overlay.fadeIn();
            this.node.fadeIn();
        };
        
        // close modal and overlay
        Modal.prototype.close = function () {
            status.modal = false;
            gui.tree.main.overlay.hide();
            this.node.hide();
        };
        
        // destroy the modal
        Modal.prototype.destroy = function () {
            status.modal = false;
            gui.tree.main.overlay.hide();
            this.node.destroy();
        };
        
        // set gui instance
        Modal.prototype.setInstance = function (instance) {
            gui = instance;
        };

        return Modal;
    }
);