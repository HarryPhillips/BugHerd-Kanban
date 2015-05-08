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
        'main/components/status',
        'main/components/http',
        'main/components/node',
        'main/ui/viewloader'
    ],
    function (
        config,
        util,
        events,
        status,
        Http,
        Node,
        ViewLoader
    ) {
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
            
            // add to the active modals array
            activeModals.push(view);
            
            // store props
            this.viewName = view;
            this.params = params;
            
            // create and hide node
            this.node = new Node("div", "kbs-modal kbs-" + view);
            this.node.hide();
            
            // view element
            this.view = null;
            
            // set modal event handlers
            this.applyHandlers(params);
            
            // load view and initialise
            this.load((params.init) ? this.init : function () {});
        }
        
        // load modal view
        Modal.prototype.load = function (onload) {
            self = this;
            
            var view;
            
            // load view from modals dir
            vloader.load(
                "modals/" + this.viewName,
                function (mod) {
                    view = mod.createView(self);
                    
                    self.view = view;
                    self.title = view.title;
                    
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
            
        // apply custom modal event handlers
        Modal.prototype.applyHandlers = function (params) {
            self = this;
            
            var err = function (event) {
                // warning
                util.log(
                    "warn",
                    "Modal '" +
                        self.viewName +
                        "' event '" +
                        event +
                        "' ran but didn't have a handler!"
                );
                
                // destroy modal
                self.destroy();
            }
            
            // confirmation
            this.onConfirm = params.confirm || function () {
                err("confirm");
            };
            
            // cancellation
            this.onCancel = params.cancel || function () {
                err("cancel");
            };
            
            // continuation
            this.onProceed = params.proceed || function () {
                err("proceed");
            };
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