/*
*   @type javascript
*   @name modal.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*
*   TODO
*   + Handle element events
*/

define(
    [
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/http',
        'main/components/status',
        'main/components/node',
        'main/ui/viewloader'
    ],
    function (config, util,
               events, Http,
               status, Node,
               ViewLoader) {
        'use strict';
        
        // shared vars between instances
        var gui,
            self,
            vloader = new ViewLoader(),
            activeModals = [];
        
        // modal class
        function Modal(view, params) {
            self = this;
            
            // if already instantiated return
            if (util.contains(activeModals, view)) {
                return;
            }
            
            activeModals.push(view);
            
            // store props
            this.viewName = view;
            this.params = params;
            
            // create and hide node
            this.node = new Node("div", "kbs-modal kbs-" + view);
            this.node.hide();
            
            // view element
            this.view = null;
            
            // load view and initialise
            this.load((params.init) ? this.init : function () {});
        }
        
        // load modal view
        Modal.prototype.load = function (onload) {
            self = this;
            
            // load view from modals dir
            vloader.load(
                "modals/" + this.viewName,
                function (mod) {
                    // parse view into content
                    self.view = util.parseHTML(mod.view);
                    self.title = mod.title;
                    onload();
                }
            );
        };
        
        // init modal with content
        Modal.prototype.init = function () {
            // declarations
            var
                modal = self.node,
            
                title =
                modal.createChild("h2", "kbs-modal-title"),
                
                close =
                modal.createChild("i", "fa fa-times kbs-modal-close"),
                
                content =
                modal.createChild("p", "kbs-modal-content");
            
            // set title
            title.text(self.title);
            
            // close handler
            close.on("click", self.destroy);
            
            // append content from view
            content.addChild(self.view);
            
            // add modal to gui
            gui.addChild(modal);
            
            // open
            self.open();
        };
        
        // reveal modal and overlay
        Modal.prototype.open = function () {
            if (status.modal) {
                return;
            }
            
            status.modal = true;
            gui.tree.main.overlay.fadeIn();
            self.node.fadeIn();
        };
        
        // close modal and overlay
        Modal.prototype.close = function () {
            status.modal = false;
            gui.tree.main.overlay.hide();
            self.node.hide();
        };
        
        // destroy the modal
        Modal.prototype.destroy = function () {
            status.modal = false;
            gui.tree.main.overlay.hide();
            self.node.destroy();
            activeModals.splice(
                activeModals.indexOf(self.viewName),
                1
            );
        };
        
        // set gui instance
        Modal.prototype.setInstance = function (instance) {
            gui = instance;
        };

        return Modal;
    }
);

/**
*   LEGACY
*
define(
    [
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/http',
        'main/components/status',
        'main/components/node',
        'main/ui/viewloader'
    ],
    function (
        config,
        util,
        events,
        Http,
        status,
        Node,
        ViewLoader
    ) {
        'use strict';

        // instance references
        var gui,
            vloader = new ViewLoader();
        
        function Modal(view, instance, params) {
            // set pointer
            var self = this;
            
            if (view) {
                this.node.addClass("kbs-" + view);
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
                
                content =
                modal.createChild("p", "kbs-modal-content"),
                
                input,
                confirm,
                cancel,
                proceed;
            
            title.element.textContent = this.title;
            content.addChild(this.view);
            
            close.element.onclick = function () {
                self.destroy();
            };
            
            // add confirm/cancel buttons for prompt modals
            if (this.view === "prompt") {
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
            if (this.view === "input") {
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
            if (this.view === "input") {
                input.focus();
            }
            
            // open the modal
            this.open();
        };
    }
);*/